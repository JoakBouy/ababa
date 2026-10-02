import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import type { Map as LeafletMap } from 'leaflet';
import { ArrowLeft, ChevronRight, Filter, Globe, MapPin, Maximize, Minimize, Minus, Plus, Search, User } from 'lucide-react';

import ImpactMap, { NATIONAL_BOUNDS } from './map/ImpactMap';
import NationalPanel from './ui/NationalPanel';
import PlacePanel from './ui/PlacePanel';
import StoryPanel from './ui/StoryPanel';
import { DemoTag, Portrait, SectorDot } from './ui/bits';
import ErrorBoundary from './components/ErrorBoundary';
import {
  getPlace,
  getStory,
  places,
  programmes,
  programmesForPlace,
  sectorsForPlace,
  stories,
  storiesForPlace,
} from './data';
import { SECTORS, SECTOR_ORDER } from './data/sectors';
import type { SectorId } from './data/types';
import { cn } from './utils/cn';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches;

function useRoute() {
  const { pathname } = useLocation();
  const [, kind, placeId, storyId] = pathname.split('/');
  const place = kind === 'place' ? getPlace(placeId) : undefined;
  const story = place && storyId ? getStory(storyId) : undefined;
  return { place, story: story && story.locationId === place?.id ? story : undefined };
}

/* ─── Search (top app bar), in the Ababa style ───────────────────────── */
type Hit = { key: string; label: string; sub: string; kind: 'Place' | 'Person' | 'Programme'; to: string };

function SearchBox() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const has = (...v: string[]) => v.some((x) => x.toLowerCase().includes(term));
    const out: Hit[] = [];
    places.forEach((p) => {
      if (has(p.name, p.county, p.state)) out.push({ key: `p-${p.id}`, label: p.name, sub: `${p.county} County • ${p.state}`, kind: 'Place', to: `/place/${p.id}` });
    });
    stories.forEach((s) => {
      const place = getPlace(s.locationId)!;
      if (has(s.name, s.role)) out.push({ key: `s-${s.id}`, label: s.name, sub: `${s.role} • ${place.name}`, kind: 'Person', to: `/place/${place.id}/${s.id}` });
    });
    programmes.forEach((p) => {
      if (p.locationIds.length && has(p.name, ...p.partners))
        out.push({ key: `g-${p.id}`, label: p.name, sub: p.locationIds.map((id) => getPlace(id)?.name).join(', '), kind: 'Programme', to: `/place/${p.locationIds[0]}` });
    });
    return out.slice(0, 8);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (h: Hit) => {
    navigate(h.to);
    setQ('');
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-low px-3.5 py-2 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
        <input
          id="impact-search"
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) go(hits[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Find a person or a place…"
          aria-label="Search places, people and programmes"
          className="w-full border-none bg-transparent text-xs text-on-surface outline-none placeholder:text-on-surface-variant"
        />
      </div>
      {open && q.trim() && (
        <div className="absolute right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-2xl">
          {hits.length === 0 ? (
            <p className="p-4 text-xs text-on-surface-variant">No places, people or programmes match “{q}”.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {hits.map((h) => (
                <li key={h.key}>
                  <button type="button" onClick={() => go(h)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-container/60">
                    <span className="w-16 shrink-0 text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">{h.kind}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-on-surface">{h.label}</span>
                      <span className="block truncate text-[11px] text-on-surface-variant">{h.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Shell() {
  const navigate = useNavigate();
  const { place, story } = useRoute();
  const [sector, setSector] = useState<SectorId | null>(null);
  const [hovered, setHovered] = useState<string | undefined>();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const revealPanel = useRef(false);
  const first = useRef(true);

  const openPlace = useCallback(
    (id: string, reveal?: boolean) => {
      revealPanel.current = !!reveal;
      navigate(`/place/${id}`);
    },
    [navigate],
  );
  const openStory = useCallback(
    (storyId: string) => {
      const s = getStory(storyId);
      if (!s) return;
      revealPanel.current = true;
      map?.closePopup();
      navigate(`/place/${s.locationId}/${s.id}`);
    },
    [navigate, map],
  );

  // Map movement, as in the Ababa command centre: fly to the selected location
  useEffect(() => {
    if (!map) return;
    const animate = !reducedMotion();
    if (place) {
      // Centre slightly above the place so its popup has room above the marker
      const zoom = place.coordsPrecision === 'county' ? 7.25 : 7.5;
      const target = map.unproject(map.project(place.coords, zoom).subtract([0, map.getSize().y * 0.18]), zoom);
      map.flyTo(target, zoom, { duration: animate ? 1.5 : 0, animate });
    } else {
      map.closePopup();
      map.flyToBounds(NATIONAL_BOUNDS, { padding: [16, 16], duration: animate ? 1.5 : 0, animate });
    }
  }, [map, place]);

  useEffect(() => {
    if (!map || place) return;
    const refit = () => map.fitBounds(NATIONAL_BOUNDS, { padding: [16, 16], animate: false });
    map.on('resize', refit);
    return () => {
      map.off('resize', refit);
    };
  }, [map, place]);

  // Keep the panel in step with the journey
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    panelRef.current?.scrollTo({ top: 0 });
    if (!isDesktop() && (story || revealPanel.current)) {
      panelRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
    revealPanel.current = false;
  }, [place?.id, story?.id]);

  useEffect(() => {
    document.title = story ? `${story.name}, ${place?.name} · PRDA Impact Map` : place ? `${place.name} · PRDA Impact Map` : 'PRDA Impact Map';
  }, [place, story]);

  // Fullscreen map, as in Ababa
  const toggleFullscreen = async () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await mapWrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      try {
        await document.exitFullscreen();
      } finally {
        setIsFullscreen(false);
      }
    }
  };
  useEffect(() => {
    const onFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => map?.invalidateSize(), 150);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [map]);
  useEffect(() => {
    if (map) setTimeout(() => map.invalidateSize(), 200);
  }, [isFullscreen, map]);

  const handleLocate = (id: string) => {
    openPlace(id);
    if (!isFullscreen) cardRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  const allDemo = stories.every((s) => s.status === 'demo');
  const placesWithPeople = places.filter((p) => storiesForPlace(p.id).length).length;
  const galleryStories = stories.filter((x) => !sector || x.sectors.includes(sector));
  const quietPlaces = places.filter((p) => storiesForPlace(p.id).length === 0 && (!sector || sectorsForPlace(p).includes(sector)));
  const ctrl =
    'w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow-md text-on-surface';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      {/* Top App Bar */}
      <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface-container-lowest px-4 md:px-8">
        <Link to="/" className="flex shrink-0 flex-col" aria-label="PRDA Impact Map home">
          <span className="font-headline text-xl font-black tracking-tight text-[#A84A23] sm:text-2xl">PRDA</span>
          <span className="-mt-0.5 hidden font-label text-[10px] font-bold tracking-wider text-on-surface-variant uppercase sm:block">
            Stories from South Sudan
          </span>
        </Link>
        <SearchBox />
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-label text-[10px] font-bold tracking-widest text-[#A84A23] uppercase">Presbyterian Relief and Development Agency</span>
                {allDemo && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">Demo stories</span>}
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                {story ? story.name : place ? `People of ${place.name}` : 'Meet the people behind PRDA’s work'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                {story
                  ? `${story.role}, ${place?.name}.`
                  : place
                    ? place.summary
                    : 'Across South Sudan, PRDA trains midwives and nurses, supports farming, water and schools, and stands with families when conflict and floods strike. Choose a place to meet the people there.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  id="sector-filter"
                  value={sector ?? 'all'}
                  onChange={(e) => setSector(e.target.value === 'all' ? null : (e.target.value as SectorId))}
                  aria-label="Show a type of work"
                  className="appearance-none rounded-xl border border-outline-variant/60 bg-surface-container-lowest py-3 pr-10 pl-4 text-sm font-semibold text-on-surface focus:border-transparent focus:ring-2 focus:ring-[#A84A23] focus:outline-none"
                >
                  <option value="all">All kinds of work</option>
                  {SECTOR_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {SECTORS[s].label}
                    </option>
                  ))}
                </select>
                <Filter className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
              {place && (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 rounded-xl bg-on-surface px-5 py-3 font-label text-sm font-semibold text-surface shadow-sm transition-colors hover:bg-on-surface/90"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All of South Sudan
                </button>
              )}
            </div>
          </div>

          {/* Map + story panel */}
          <div
            ref={cardRef}
            className="grid scroll-mt-4 grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm sm:rounded-3xl lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]"
          >
            <div
              ref={mapWrapperRef}
              className={cn('relative flex flex-col overflow-hidden transition-all duration-300', isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : '')}
            >
              {/* Top Left Focus Card */}
              <div className={cn("absolute top-4 left-4 z-[500] max-w-[calc(100%-80px)] rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 p-3.5 shadow-lg backdrop-blur-md sm:max-w-sm", "hidden sm:block")}>
                <p className="mb-1 font-label text-[10px] font-bold tracking-widest text-[#A84A23] uppercase">
                  {place ? `${place.state}, South Sudan` : 'Start here'}
                </p>
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  {story ? `${story.name} from ${place?.name}` : place ? place.name : 'Tap a face on the map'}
                </h3>
                <p className="mt-0.5 text-xs leading-snug text-on-surface-variant">
                  {story
                    ? 'Their story is open beside the map.'
                    : place
                      ? storiesForPlace(place.id).length
                        ? `${storiesForPlace(place.id).map((x) => x.name).join(' and ')} ${storiesForPlace(place.id).length === 1 ? 'is' : 'are'} waiting to share their story.`
                        : 'No one from here has shared their story yet.'
                      : `${placesWithPeople} places have someone you can meet.`}
                </p>
              </div>

              {/* Top Right Controls (Zoom, Reset, Fullscreen) */}
              <div className="absolute top-4 right-4 z-[500] flex flex-col gap-1.5">
                <button type="button" onClick={() => map?.zoomIn()} className={ctrl} title="Zoom In" aria-label="Zoom in">
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => map?.zoomOut()} className={ctrl} title="Zoom Out" aria-label="Zoom out">
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (place ? navigate('/') : map?.flyToBounds(NATIONAL_BOUNDS, { padding: [16, 16], duration: 1.5 }))}
                  className={ctrl}
                  title="Reset National View"
                  aria-label="Reset national view"
                >
                  <Globe className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className={cn(ctrl, 'mt-1')}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen map'}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4 text-primary" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>

              {/* Bottom Legend: doubles as a quick filter */}
              <div className="absolute bottom-6 left-4 z-[500] flex max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest/95 px-3 py-2 text-[10px] shadow-md backdrop-blur-md sm:gap-x-4 sm:px-4 sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-[#A84A23] bg-white text-[#A84A23]">
                    <User className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-on-surface-variant">Someone to meet</span>
                </span>
                {SECTOR_ORDER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(sector === s ? null : s)}
                    aria-pressed={sector === s}
                    className={cn('flex items-center gap-1.5 rounded transition-opacity', sector && sector !== s && 'opacity-40')}
                    title={`Show only ${SECTORS[s].label.toLowerCase()}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full border border-white" style={{ background: SECTORS[s].color }} />
                    <span className="font-bold text-on-surface-variant">{SECTORS[s].short}</span>
                  </button>
                ))}
              </div>

              <div className={cn('relative z-0 bg-surface-container-lowest', isFullscreen ? 'h-full w-full' : 'h-[400px] sm:h-[580px] lg:h-[700px]')}>
                <ImpactMap
                  selectedPlaceId={place?.id}
                  selectedStory={story}
                  hoveredPlaceId={hovered}
                  sector={sector}
                  onSelectPlace={openPlace}
                  onOpenStory={openStory}
                  onHoverPlace={setHovered}
                  onMapReady={setMap}
                />
              </div>
            </div>

            <aside ref={panelRef} className="min-w-0 scroll-mt-4 border-t border-outline-variant/30 lg:h-[700px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <nav
                aria-label="Breadcrumb"
                className="sticky top-0 z-10 flex items-center gap-1 border-b border-outline-variant/30 bg-surface-container-lowest/95 px-5 py-3 text-xs backdrop-blur-md sm:px-6"
              >
                <Link to="/" className={cn('font-label', place ? 'font-medium text-on-surface-variant hover:text-primary' : 'font-bold text-on-surface')}>
                  South Sudan
                </Link>
                {place && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden="true" />
                    <Link
                      to={`/place/${place.id}`}
                      className={cn('truncate font-label', story ? 'font-medium text-on-surface-variant hover:text-primary' : 'font-bold text-on-surface')}
                    >
                      {place.name}
                    </Link>
                  </>
                )}
                {story && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden="true" />
                    <span className="truncate font-label font-bold text-on-surface">{story.name}</span>
                    {story.status === 'demo' && <DemoTag className="ml-1" />}
                  </>
                )}
              </nav>
              <div className="p-5 sm:p-6">
                {story ? (
                  <StoryPanel key={story.id} story={story} onOpenStory={openStory} onOpenPlace={openPlace} />
                ) : place ? (
                  <PlacePanel key={place.id} place={place} sector={sector} onOpenStory={openStory} />
                ) : (
                  <NationalPanel sector={sector} onOpenPlace={(id) => openPlace(id, true)} onHoverPlace={setHovered} hoveredPlaceId={hovered} />
                )}
              </div>
            </aside>
          </div>

          {/* People gallery: selecting someone flies the map to them, as Ababa's rows did */}
          <section className="space-y-4" aria-labelledby="gallery-heading">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 id="gallery-heading" className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
                  People you can meet
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {sector ? `Stories about ${SECTORS[sector].label.toLowerCase()}. ` : ''}Choose someone to fly to their home on the map.
                </p>
              </div>
              {sector && (
                <button type="button" onClick={() => setSector(null)} className="text-sm font-semibold text-[#A84A23] hover:underline">
                  Show everyone
                </button>
              )}
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {galleryStories.map((s) => {
                const home = getPlace(s.locationId)!;
                return (
                  <li key={s.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        openStory(s.id);
                        cardRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
                      }}
                      onMouseEnter={() => setHovered(home.id)}
                      onMouseLeave={() => setHovered(undefined)}
                      className={cn(
                        'group flex w-full flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                        story?.id === s.id ? 'border-[#A84A23] ring-2 ring-[#A84A23]/30' : 'border-outline-variant/40',
                      )}
                    >
                      <span className="block aspect-[4/5] w-full max-w-full">
                        <Portrait story={s} />
                      </span>
                      <span className="flex flex-col gap-1 p-3">
                        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                          <span className="font-headline text-sm leading-tight font-bold text-on-surface group-hover:text-[#A84A23]">{s.name}</span>
                          {s.status === 'demo' && <DemoTag />}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {home.name}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm sm:rounded-3xl sm:p-6" aria-labelledby="others-heading">
            <h2 id="others-heading" className="font-headline text-lg font-bold text-on-surface">
              Places still waiting for their stories
            </h2>
            <p className="mb-4 text-sm text-on-surface-variant">
              PRDA works here too, but no one has shared their story yet. Choose a place to see the work.
            </p>
            <ul className="flex flex-wrap gap-2">
              {quietPlaces.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleLocate(p.id)}
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(undefined)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      place?.id === p.id
                        ? 'border-[#A84A23] bg-[#A84A23]/10 text-[#A84A23]'
                        : 'border-outline-variant/60 text-on-surface hover:border-[#A84A23] hover:text-[#A84A23]',
                    )}
                  >
                    <span className="flex gap-0.5">
                      {sectorsForPlace(p).map((sx) => (
                        <SectorDot key={sx} sector={sx} size={6} />
                      ))}
                    </span>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <p className="pb-4 text-center text-[11px] text-on-surface-variant">
            Places and programmes come from PRDA's published materials and partner reports. Map: geoBoundaries (CC BY 4.0), Natural Earth.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Shell />
      </HashRouter>
    </ErrorBoundary>
  );
}
