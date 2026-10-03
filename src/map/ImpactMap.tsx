import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L, { type LatLngBoundsExpression, type Map as LeafletMap } from 'leaflet';
import { GeoJSON, MapContainer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { ArrowRight, User } from 'lucide-react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';

import countiesGeo from '../data/geo/counties.json';
import statesGeo from '../data/geo/states.json';
import outlineGeo from '../data/geo/outline.json';
import riversGeo from '../data/geo/rivers.json';
import { placeByCounty, places, sectorsForPlace, storiesForPlace } from '../data';
import { SECTORS } from '../data/sectors';
import type { Place, SectorId, Story } from '../data/types';
import { cn } from '../utils/cn';

const counties = countiesGeo as unknown as FeatureCollection<Geometry, { name: string; label: [number, number]; area: number }>;

/** County names as people write them (source data has a few lower-case quirks). */
const countyName = (n: string) => n.replace(/-([a-z])/g, (_, c: string) => `-${c.toUpperCase()}`);
const countiesBySize = [...counties.features].sort((a, b) => b.properties.area - a.properties.area);
const states = statesGeo as unknown as FeatureCollection<Geometry, { name: string; label: [number, number] }>;
const outline = outlineGeo as unknown as FeatureCollection;
const rivers = riversGeo as unknown as FeatureCollection<Geometry, { name: string; scalerank: number }>;

/** Nudge state names off PRDA markers so labels never collide. */
const STATE_LABEL_POS: Record<string, [number, number]> = {
  'Central Equatoria': [4.2, 30.75],
  Jonglei: [8.45, 31.85],
  'Upper Nile': [10.75, 33.35],
  Unity: [9.35, 29.35],
};

const rawBounds = L.geoJSON(outline as any).getBounds();
// Frame national bounds tightly around South Sudan and Kakuma cross-border post
export const NATIONAL_BOUNDS = rawBounds.extend([3.71, 34.86]).pad(0.02);

const PERSON_GLYPH =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

export const PRDA_ACCENT = '#008751';

/**
 * Each marker's DOM is built once. Selection, hover, filter and label visibility are then
 * toggled as classes on that element, so the marker is never swapped out mid-click.
 */
function placeIcon(place: Place, storyCount: number, sectors: SectorId[], portrait?: string) {
  const people = storyCount > 0;
  const color = people ? PRDA_ACCENT : SECTORS[sectors[0] ?? 'relief'].color;
  const body = people
    ? `<span class="pm-persona${portrait ? ' has-photo' : ''}">${portrait ? `<img src="${escapeHtml(portrait)}" alt="" />` : PERSON_GLYPH}<span class="pm-count">${storyCount}</span></span>`
    : '<span class="pm-dot"></span>';
  const size = people ? 30 : 16;
  return L.divIcon({
    className: 'place-icon',
    iconSize: [size, size],
    popupAnchor: [0, -size / 2],
    html: `<div class="pm ${people ? 'pm--people' : 'pm--quiet'}" style="--pm-color:${color}"><span class="pm-ping"></span>${body}<span class="pm-label pm-label--${place.labelSide} is-hidden">${escapeHtml(place.name)}</span></div>`,
  });
}

function labelIcon(text: string, kind: 'state' | 'country') {
  return L.divIcon({
    className: 'place-icon',
    iconSize: [0, 0],
    html: `<span class="map-label map-label--${kind}">${escapeHtml(text)}</span>`,
  });
}

function ViewWatcher({ onView }: { onView: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onView(map.getZoom()),
    moveend: () => onView(map.getZoom()),
    resize: () => onView(map.getZoom()),
  });
  return null;
}

type Rect = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Rect, b: Rect) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

interface Props {
  selectedPlaceId?: string;
  selectedStory?: Story;
  hoveredPlaceId?: string;
  sector: SectorId | null;
  onSelectPlace: (id: string, reveal?: boolean) => void;
  onOpenStory: (id: string) => void;
  onHoverPlace: (id?: string) => void;
  onMapReady: (map: LeafletMap) => void;
}

export default function ImpactMap({
  selectedPlaceId,
  selectedStory,
  hoveredPlaceId,
  sector,
  onSelectPlace,
  onOpenStory,
  onHoverPlace,
  onMapReady,
}: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [zoom, setZoom] = useState(6);
  const countiesRef = useRef<L.GeoJSON | null>(null);

  const placeInfo = useMemo(
    () =>
      places.map((p) => ({
        place: p,
        sectors: sectorsForPlace(p),
        storyCount: storiesForPlace(p.id).length,
      })),
    [],
  );
  const infoByCounty = useMemo(() => new Map(placeInfo.map((i) => [i.place.county, i])), [placeInfo]);
  const icons = useMemo(
    () => new Map(placeInfo.map((i) => [i.place.id, placeIcon(i.place, i.storyCount, i.sectors, storiesForPlace(i.place.id).find((x) => x.portrait)?.portrait?.src)])),
    [placeInfo],
  );
  const stateIcons = useMemo(() => new Map(states.features.map((f) => [f.properties.name, labelIcon(f.properties.name, 'state')])), []);
  const markerRefs = useRef(new Map<string, L.Marker>());
  const countyIcons = useMemo(
    () =>
      new Map(
        counties.features.map((f) => [
          f.properties.name,
          L.divIcon({
            className: 'place-icon',
            iconSize: [0, 0],
            html: `<span class="map-label map-label--county is-hidden">${escapeHtml(countyName(f.properties.name))}</span>`,
          }),
        ]),
      ),
    [],
  );
  const countyRefs = useRef(new Map<string, L.Marker>());
  const [viewTick, setViewTick] = useState(0);
  const onView = useCallback((z: number) => {
    setZoom(z);
    map?.getContainer().classList.toggle('is-far', z < 5.75);
    setViewTick((t) => t + 1);
  }, [map]);

  useEffect(() => {
    if (map) map.getContainer().classList.toggle('is-far', map.getZoom() < 5.75);
  }, [map]);

  // Label placement: most important places first; a label is dropped if it would collide.
  const { labels, countyLabels } = useMemo(() => {
    const show = new Set<string>();
    const countyShow = new Set<string>();
    if (!map) return { labels: show, countyLabels: countyShow };
    const z = map.getZoom();
    const markerRect = (i: (typeof placeInfo)[number]): Rect => {
      const p = map.latLngToContainerPoint(i.place.coords);
      const far = map.getZoom() < 5.75;
      const r = i.storyCount ? (far ? 12 : 16) : far ? 6 : 8;
      return { x1: p.x - r, y1: p.y - r, x2: p.x + r, y2: p.y + r };
    };
    const markers = placeInfo.map((i) => ({ id: i.place.id, rect: markerRect(i) }));
    const taken: Rect[] = [];
    const priority = (i: (typeof placeInfo)[number]) =>
      (i.place.id === selectedPlaceId ? 1000 : 0) + (i.place.id === hoveredPlaceId ? 500 : 0) + i.storyCount * 10;
    const ordered = [...placeInfo].sort((a, b) => priority(b) - priority(a));
    for (const i of ordered) {
      const forced = i.place.id === selectedPlaceId || i.place.id === hoveredPlaceId;
      const dim = !!sector && !i.sectors.includes(sector);
      if (!forced && dim) continue;
      const m = markerRect(i);
      const cx = (m.x1 + m.x2) / 2;
      const cy = (m.y1 + m.y2) / 2;
      const w = i.place.name.length * (i.storyCount ? 7.4 : 6.8) + 6;
      const h = 17;
      const gap = 9;
      const rect: Rect =
        i.place.labelSide === 'right'
          ? { x1: m.x2 + gap, y1: cy - h / 2, x2: m.x2 + gap + w, y2: cy + h / 2 }
          : i.place.labelSide === 'left'
            ? { x1: m.x1 - gap - w, y1: cy - h / 2, x2: m.x1 - gap, y2: cy + h / 2 }
            : i.place.labelSide === 'top'
              ? { x1: cx - w / 2, y1: m.y1 - 7 - h, x2: cx + w / 2, y2: m.y1 - 7 }
              : { x1: cx - w / 2, y1: m.y2 + 7, x2: cx + w / 2, y2: m.y2 + 7 + h };
      const clash =
        taken.some((t) => overlaps(t, rect)) || markers.some((mk) => mk.id !== i.place.id && overlaps(mk.rect, rect));
      if (forced || !clash) {
        show.add(i.place.id);
        taken.push(rect);
      }
    }

    // County names fill the remaining space, largest counties first
    if (z >= 5.9) {
      for (const f of countiesBySize) {
        if (placeByCounty.has(f.properties.name)) continue; // the PRDA place label covers it
        const p = map.latLngToContainerPoint(f.properties.label);
        const w = countyName(f.properties.name).length * 5.9 + 6;
        const h = 13;
        const rect: Rect = { x1: p.x - w / 2, y1: p.y - h / 2, x2: p.x + w / 2, y2: p.y + h / 2 };
        if (taken.some((t) => overlaps(t, rect)) || markers.some((mk) => overlaps(mk.rect, rect))) continue;
        countyShow.add(f.properties.name);
        taken.push(rect);
      }
    }
    return { labels: show, countyLabels: countyShow };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, viewTick, placeInfo, selectedPlaceId, hoveredPlaceId, sector]);

  useEffect(() => {
    if (map) onMapReady(map);
  }, [map, onMapReady]);

  // Never let the view zoom out past the whole of South Sudan
  useEffect(() => {
    if (!map) return;
    const fit = () => map.setMinZoom(Math.max(4, map.getBoundsZoom(NATIONAL_BOUNDS, false, L.point(32, 32)) - 0.3));
    fit();
    map.on('resize', fit);
    return () => {
      map.off('resize', fit);
    };
  }, [map]);

  // Sync marker state onto the existing marker elements
  useEffect(() => {
    placeInfo.forEach(({ place, sectors, storyCount }) => {
      const marker = markerRefs.current.get(place.id);
      const el = marker?.getElement()?.querySelector('.pm');
      if (!marker || !el) return;
      const selected = place.id === selectedPlaceId;
      el.classList.toggle('is-selected', selected);
      el.classList.toggle('is-hover', place.id === hoveredPlaceId);
      el.classList.toggle('is-dim', !!sector && !sectors.includes(sector));
      el.querySelector('.pm-label')?.classList.toggle('is-hidden', !labels.has(place.id));
      marker.setZIndexOffset(selected ? 1000 : storyCount ? 500 : 0);
    });
    countyRefs.current.forEach((m, name) => {
      m.getElement()?.querySelector('.map-label')?.classList.toggle('is-hidden', !countyLabels.has(name));
    });
  });

  // Keep callbacks fresh for Leaflet handlers that are bound once
  const selectRef = useRef(onSelectPlace);
  const hoverRef = useRef(onHoverPlace);
  selectRef.current = onSelectPlace;
  hoverRef.current = onHoverPlace;

  // County styling reacts to selection, hover and the sector filter
  const countyStyle = useCallback(
    (feature?: Feature<Geometry, { name: string }>): L.PathOptions => {
      const info = feature ? infoByCounty.get(feature.properties.name) : undefined;
      if (!info) return { fillColor: '#fff', fillOpacity: 0, color: '#e2d4c0', weight: 0.7, opacity: 1, interactive: false };
      const match = !sector || info.sectors.includes(sector);
      const selected = info.place.id === selectedPlaceId;
      const hovered = info.place.id === hoveredPlaceId;
      return {
        className: 'county-lit',
        fillColor: PRDA_ACCENT,
        fillOpacity: selected ? 0.22 : hovered ? 0.16 : match ? (info.storyCount ? 0.1 : 0.06) : 0.02,
        color: PRDA_ACCENT,
        weight: selected ? 2 : 1,
        opacity: selected ? 0.9 : match ? 0.4 : 0.1,
      };
    },
    [infoByCounty, sector, selectedPlaceId, hoveredPlaceId],
  );

  useEffect(() => {
    countiesRef.current?.setStyle(countyStyle as L.StyleFunction);
  }, [countyStyle, map]);

  const onEachCounty = (feature: Feature<Geometry, { name: string }>, layer: L.Layer) => {
    const place = placeByCounty.get(feature.properties.name);
    if (!place) return;
    const path = layer as L.Path;
    path.bindTooltip(`${feature.properties.name} County`, { sticky: true, className: 'county-tip', direction: 'top', offset: [0, -8] });
    path.on({
      click: () => selectRef.current(place.id),
      mouseover: () => hoverRef.current(place.id),
      mouseout: () => hoverRef.current(undefined),
    });
  };

  const maxBounds: LatLngBoundsExpression = NATIONAL_BOUNDS.pad(0.06);

  return (
    <MapContainer
      ref={setMap}
      bounds={NATIONAL_BOUNDS}
      boundsOptions={{ padding: [16, 16] }}
      zoomControl={false}
      // Leaflet's keyboard handler focuses the map on mousedown, which scrolls the page
      // mid-click (our scroll container is not the window) and makes marker clicks miss.
      keyboard={false}
      zoomSnap={0.1}
      zoomDelta={0.5}
      minZoom={4.5}
      maxZoom={10}
      maxBounds={maxBounds}
      maxBoundsViscosity={0.8}
      attributionControl
      className="absolute inset-0 h-full w-full"
    >
      <ViewWatcher onView={onView} />
      <GeoJSON
        data={outline}
        interactive={false}
        style={{ fillColor: '#fcfaf5', fillOpacity: 1, color: '#008751', weight: 2, opacity: 0.95 }}
        attribution='Boundaries <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0)'
      />
      <GeoJSON ref={countiesRef} data={counties} style={countyStyle as L.StyleFunction} onEachFeature={onEachCounty as any} />
      <GeoJSON data={states} interactive={false} style={{ fill: false, color: '#c4b6a3', weight: 1.1, opacity: 1 }} />
      <GeoJSON
        data={rivers}
        interactive={false}
        style={(f) => ({ color: '#7fb3cf', weight: (f?.properties?.scalerank ?? 9) <= 1 ? 2.4 : 1.3, opacity: 0.95 })}
      />

      {counties.features.map((f) => (
        <Marker
          key={`county-${f.properties.name}`}
          position={f.properties.label}
          icon={countyIcons.get(f.properties.name)!}
          interactive={false}
          keyboard={false}
          ref={(m) => {
            if (m) countyRefs.current.set(f.properties.name, m);
            else countyRefs.current.delete(f.properties.name);
          }}
        />
      ))}
      {zoom < 5.9 &&
        states.features.map((f) => (
          <Marker key={f.properties.name} position={STATE_LABEL_POS[f.properties.name] ?? f.properties.label} icon={stateIcons.get(f.properties.name)!} interactive={false} keyboard={false} />
        ))}

      {placeInfo.map(({ place, sectors, storyCount }) => {
        const people = storiesForPlace(place.id);
        return (
          <Marker
            key={place.id}
            position={place.coords}
            title={`${place.name}${storyCount ? `: ${storyCount} ${storyCount === 1 ? 'story' : 'stories'}` : ''}`}
            alt={place.name}
            ref={(m) => {
              if (m) markerRefs.current.set(place.id, m);
              else markerRefs.current.delete(place.id);
            }}
            icon={icons.get(place.id)!}
            eventHandlers={{
              click: () => selectRef.current(place.id),
              mouseover: () => hoverRef.current(place.id),
              mouseout: () => hoverRef.current(undefined),
              keypress: (e) => {
                if ((e.originalEvent as KeyboardEvent).key === 'Enter') selectRef.current(place.id);
              },
            }}
          >
            <Popup autoPan={false} closeButton={false}>
              <div className="min-w-[230px] max-w-[260px] p-3 font-body">
                <div className="mb-1 flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-1.5">
                  <span className="font-headline text-sm font-bold text-on-surface">{place.name}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                      storyCount ? 'bg-[#008751]/10 text-[#008751]' : 'bg-surface-container text-on-surface-variant',
                    )}
                  >
                    {storyCount ? `${storyCount} to meet` : 'Stories to come'}
                  </span>
                </div>
                <div className="mb-1 text-[11px] font-medium text-on-surface-variant">
                  {place.state}, South Sudan
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {sectors.map((s) => (
                    <span key={s} className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ color: SECTORS[s].color, background: `${SECTORS[s].color}1A` }}>
                      {SECTORS[s].short}
                    </span>
                  ))}
                </div>
                {people.length > 0 && (
                  <ul className="mb-2 flex flex-col gap-1">
                    {people.map((p: Story) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => onOpenStory(p.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface-container"
                        >
                          <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#008751]/10 text-[#008751]">
                            {p.portrait ? <img src={p.portrait.src} alt="" className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-on-surface">{p.name}</span>
                          {(p.status === 'demo' || p.status === 'test') && (
                            <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[8.5px] font-bold uppercase text-amber-700">{p.status === 'test' ? 'Test' : 'Demo'}</span>
                          )}
                          <ArrowRight className="h-3 w-3 text-on-surface-variant" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => selectRef.current(place.id, true)}
                  className="w-full rounded-lg bg-[#008751] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#007043]"
                >
                  {storyCount ? `Meet the people of ${place.name}` : 'See PRDA’s work here'}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

/** Bounds of a place's county, for flying the camera to it. */
export function countyBounds(place: Place) {
  const f = counties.features.find((c) => c.properties.name === place.county);
  return f ? L.geoJSON(f as any).getBounds() : L.latLngBounds([place.coords, place.coords]);
}
