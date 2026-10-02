import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import type { Map as LeafletMap } from 'leaflet';
import { ChevronRight, Home, Minus, Plus } from 'lucide-react';

import ImpactMap, { NATIONAL_BOUNDS, countyBounds } from './map/ImpactMap';
import NationalPanel from './ui/NationalPanel';
import PlacePanel from './ui/PlacePanel';
import StoryPanel from './ui/StoryPanel';
import { DemoTag } from './ui/bits';
import ErrorBoundary from './components/ErrorBoundary';
import { getPlace, getStory, places, stories, storiesForPlace } from './data';
import { SECTORS, SECTOR_ORDER } from './data/sectors';
import type { SectorId } from './data/types';
import { cn } from './utils/cn';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches;

function useRoute() {
  const { pathname } = useLocation();
  const [, kind, placeId, storyId] = pathname.split('/');
  const place = kind === 'place' ? getPlace(placeId) : undefined;
  const story = place && storyId ? getStory(storyId) : undefined;
  return { place, story: story && story.locationId === place?.id ? story : undefined };
}

function SectorFilter({ value, onChange }: { value: SectorId | null; onChange: (s: SectorId | null) => void }) {
  const chip = 'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors';
  return (
    <div role="group" aria-label="Filter by type of work" className="no-scrollbar flex gap-1.5 overflow-x-auto">
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
        className={cn(chip, value === null ? 'border-map-ink bg-map-ink text-night' : 'border-map-line text-map-ink hover:border-map-muted')}
      >
        All work
      </button>
      {SECTOR_ORDER.map((s) => {
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : s)}
            className={cn(chip, active ? 'border-transparent text-night' : 'border-map-line text-map-ink hover:border-map-muted')}
            style={active ? { background: SECTORS[s].color } : undefined}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: active ? 'var(--night)' : SECTORS[s].color }} aria-hidden="true" />
            {SECTORS[s].short}
          </button>
        );
      })}
    </div>
  );
}

function Shell() {
  const navigate = useNavigate();
  const { place, story } = useRoute();
  const [sector, setSector] = useState<SectorId | null>(null);
  const [hovered, setHovered] = useState<string | undefined>();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const asideRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  const openPlace = useCallback((id: string) => navigate(`/place/${id}`), [navigate]);
  const openStory = useCallback(
    (storyId: string) => {
      const s = getStory(storyId);
      if (s) navigate(`/place/${s.locationId}/${s.id}`);
    },
    [navigate],
  );

  // Camera follows the journey: country → county
  useEffect(() => {
    if (!map) return;
    const animate = !prefersReducedMotion();
    if (place) {
      map.flyToBounds(countyBounds(place), { padding: [48, 48], maxZoom: 8, duration: animate ? 0.9 : 0, animate });
    } else {
      map.flyToBounds(NATIONAL_BOUNDS, { padding: [24, 24], duration: animate ? 0.9 : 0, animate });
    }
  }, [map, place]);

  // Bring the story into view when the route changes
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (isDesktop()) {
      asideRef.current?.scrollTo({ top: 0 });
    } else if (place) {
      asideRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    } else {
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [place?.id, story?.id]);

  useEffect(() => {
    document.title = story ? `${story.name}, ${place?.name} · PRDA Impact Map` : place ? `${place.name} · PRDA Impact Map` : 'PRDA Impact Map';
  }, [place, story]);

  const allDemo = stories.every((s) => s.status === 'demo');
  const placesWithPeople = useMemo(() => places.filter((p) => storiesForPlace(p.id).length).length, []);
  const ctrl =
    'grid h-9 w-9 place-items-center rounded-md border border-map-line bg-map-glass text-map-ink backdrop-blur transition-colors hover:border-map-muted';

  return (
    <div className="flex h-full flex-col bg-night">
      <header className="z-20 flex flex-col gap-3 border-b border-map-line bg-night px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 text-map-ink lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-3" aria-label="PRDA Impact Map: back to all of South Sudan">
          <span className="font-mono text-[13px] font-semibold tracking-[0.2em] text-lit">PRDA</span>
          <span className="font-display text-[21px] leading-none">Impact Map</span>
          <span className="hidden text-[12px] text-map-muted sm:inline">South Sudan</span>
        </Link>
        <SectorFilter value={sector} onChange={setSector} />
      </header>

      <main ref={mainRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <section aria-label="Map of PRDA's work in South Sudan" className="relative h-[54svh] min-h-[340px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <ImpactMap
            selectedPlaceId={place?.id}
            selectedStory={story}
            hoveredPlaceId={hovered}
            sector={sector}
            onSelectPlace={openPlace}
            onHoverPlace={setHovered}
            onMapReady={setMap}
          />

          <div className="pointer-events-none absolute top-3 left-3 z-[500] max-w-[min(300px,calc(100%-72px))] lg:top-4 lg:left-4">
            <div className="pointer-events-auto rounded-md border border-map-line bg-map-glass px-3.5 py-2.5 text-map-ink backdrop-blur">
              {place ? (
                <>
                  <p className="eyebrow text-[10px] text-map-muted">{place.state}</p>
                  <p className="font-display text-[19px] leading-tight">
                    {story ? `${story.name} · ${place.name}` : place.name}
                  </p>
                  <Link to="/" className="mt-1 inline-block text-[12px] text-lit hover:underline">
                    ← All of South Sudan
                  </Link>
                </>
              ) : (
                <>
                  <p className="eyebrow text-[10px] text-map-muted">PRDA across South Sudan</p>
                  <p className="text-[13px] leading-snug">
                    <span className="font-semibold">{places.length} places</span> ·{' '}
                    <span className="font-semibold">{placesWithPeople}</span> with {allDemo ? 'demo stories' : 'stories'}
                  </p>
                  <p className="mt-0.5 hidden text-[12px] leading-snug text-map-muted sm:block">Select a place to meet the people there.</p>
                </>
              )}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5 lg:top-4 lg:right-4">
            <button type="button" className={ctrl} onClick={() => map?.zoomIn()} aria-label="Zoom in" title="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" className={ctrl} onClick={() => map?.zoomOut()} aria-label="Zoom out" title="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={cn(ctrl, 'mt-1')}
              onClick={() => (place ? navigate('/') : map?.flyToBounds(NATIONAL_BOUNDS, { padding: [24, 24] }))}
              aria-label="Show all of South Sudan"
              title="Show all of South Sudan"
            >
              <Home className="h-4 w-4" />
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-6 left-3 z-[500] hidden flex-col lg:flex gap-1.5 rounded-md border border-map-line bg-map-glass px-3 py-2 text-[11.5px] text-map-ink backdrop-blur lg:bottom-7 lg:left-4">
            <span className="flex items-center gap-2">
              <span className="grid h-4 w-4 place-items-center rounded-full border-[3px] border-lit" aria-hidden="true" />
              People's stories recorded here
            </span>
            <span className="flex items-center gap-2">
              <span className="ml-[3px] h-2.5 w-2.5 rounded-full border-2 border-lit bg-land" aria-hidden="true" />
              PRDA works here
            </span>
            <span className="text-[10.5px] text-map-muted">Ring colours show the type of work</span>
          </div>
        </section>

        <aside
          ref={asideRef}
          className="relative z-10 min-w-0 shrink-0 scroll-mt-0 bg-paper lg:w-[480px] lg:overflow-y-auto lg:border-l lg:border-map-line xl:w-[520px]"
        >
          <nav
            aria-label="Breadcrumb"
            className="sticky top-0 z-10 flex items-center gap-1 border-b border-line bg-paper/95 px-5 py-3 text-[12.5px] backdrop-blur sm:px-7"
          >
            <Link to="/" className={cn(place ? 'text-ink-2 hover:text-accent' : 'font-semibold text-ink')}>
              South Sudan
            </Link>
            {place && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
                <Link to={`/place/${place.id}`} className={cn('truncate', story ? 'text-ink-2 hover:text-accent' : 'font-semibold text-ink')}>
                  {place.name}
                </Link>
              </>
            )}
            {story && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-ink-2" aria-hidden="true" />
                <span className="truncate font-semibold text-ink">{story.name}</span>
                {story.status === 'demo' && <DemoTag className="ml-1" />}
              </>
            )}
          </nav>
          <div className="px-5 pt-6 sm:px-7">
            {story ? (
              <StoryPanel key={story.id} story={story} onOpenStory={openStory} onOpenPlace={openPlace} />
            ) : place ? (
              <PlacePanel key={place.id} place={place} sector={sector} onOpenStory={openStory} />
            ) : (
              <NationalPanel sector={sector} onOpenPlace={openPlace} onHoverPlace={setHovered} hoveredPlaceId={hovered} />
            )}
          </div>
        </aside>
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

