import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L, { type LatLngBoundsExpression, type Map as LeafletMap } from 'leaflet';
import { GeoJSON, MapContainer, Marker, useMapEvents } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';

import countiesGeo from '../data/geo/counties.json';
import statesGeo from '../data/geo/states.json';
import outlineGeo from '../data/geo/outline.json';
import neighboursGeo from '../data/geo/neighbours.json';
import riversGeo from '../data/geo/rivers.json';
import { placeByCounty, places, sectorsForPlace, storiesForPlace } from '../data';
import { SECTORS } from '../data/sectors';
import type { Place, SectorId, Story } from '../data/types';

const counties = countiesGeo as unknown as FeatureCollection<Geometry, { name: string }>;
const states = statesGeo as unknown as FeatureCollection<Geometry, { name: string; label: [number, number] }>;
const outline = outlineGeo as unknown as FeatureCollection;
const neighbours = neighboursGeo as unknown as FeatureCollection;
const rivers = riversGeo as unknown as FeatureCollection<Geometry, { name: string; scalerank: number }>;

const COUNTRY_LABELS: [string, [number, number]][] = [
  ['Sudan', [12.9, 28.6]],
  ['Ethiopia', [8.6, 36.4]],
  ['Kenya', [3.0, 36.4]],
  ['Uganda', [2.7, 32.4]],
  ['DR Congo', [3.1, 26.4]],
  ['Central African Rep.', [7.4, 22.6]],
];

/** Nudge state names off PRDA markers so labels never collide. */
const STATE_LABEL_POS: Record<string, [number, number]> = {
  'Central Equatoria': [4.2, 30.75],
  Jonglei: [8.45, 31.85],
  'Upper Nile': [10.75, 33.35],
  Unity: [9.35, 29.35],
};

export const NATIONAL_BOUNDS = L.geoJSON(outline as any).getBounds();

/** Ring of sector colours around each marker, so the map doubles as a legend for what PRDA does where. */
function ringFor(sectors: SectorId[]): string {
  if (sectors.length === 0) return 'var(--lit)';
  const step = 360 / sectors.length;
  const stops = sectors.map((s, i) => `${SECTORS[s].color} ${i * step}deg ${(i + 1) * step}deg`);
  return `conic-gradient(${stops.join(', ')})`;
}

const PERSON_GLYPH =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function placeIcon(opts: {
  place: Place;
  storyCount: number;
  sectors: SectorId[];
  selected: boolean;
  hovered: boolean;
  dim: boolean;
  showLabel: boolean;
  story?: Story;
}) {
  const { place, storyCount, sectors, selected, hovered, dim, showLabel, story } = opts;
  const people = storyCount > 0;
  let core = people ? String(storyCount) : '';
  if (selected && story) {
    core = story.portrait
      ? `<img src="${escapeHtml(story.portrait.src)}" alt="" style="width:100%;height:100%;object-fit:cover" />`
      : PERSON_GLYPH;
  }
  const cls = ['pm', people ? 'pm--people' : 'pm--quiet', selected && 'is-selected', hovered && 'is-hover', dim && 'is-dim']
    .filter(Boolean)
    .join(' ');
  const label = showLabel ? `<span class="pm-label pm-label--${place.labelSide}">${escapeHtml(place.name)}</span>` : '';
  const size = people ? 32 : 16;
  return L.divIcon({
    className: 'place-icon',
    iconSize: [size, size],
    html: `<div class="${cls}" style="--pm-ring:${ringFor(sectors)}"><span class="pm-ring"></span><span class="pm-core">${core}</span>${label}</div>`,
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
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id?: string) => void;
  onMapReady: (map: LeafletMap) => void;
}

export default function ImpactMap({
  selectedPlaceId,
  selectedStory,
  hoveredPlaceId,
  sector,
  onSelectPlace,
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
  const labels = useMemo(() => {
    const show = new Set<string>();
    if (!map) return show;
    const z = map.getZoom();
    const markerRect = (i: (typeof placeInfo)[number]): Rect => {
      const p = map.latLngToContainerPoint(i.place.coords);
      const far = map.getZoom() < 5.75;
      const r = i.storyCount ? (far ? 12 : 17) : far ? 6 : 8;
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
      if (!forced && (dim || (!i.storyCount && z < 6.75))) continue;
      const m = markerRect(i);
      const cx = (m.x1 + m.x2) / 2;
      const cy = (m.y1 + m.y2) / 2;
      const w = i.place.name.length * 7.4 + 6;
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
    return show;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, viewTick, placeInfo, selectedPlaceId, hoveredPlaceId, sector]);

  useEffect(() => {
    if (map) onMapReady(map);
  }, [map, onMapReady]);

  // Keep callbacks fresh for Leaflet handlers that are bound once
  const selectRef = useRef(onSelectPlace);
  const hoverRef = useRef(onHoverPlace);
  selectRef.current = onSelectPlace;
  hoverRef.current = onHoverPlace;

  // County styling reacts to selection, hover and the sector filter
  const countyStyle = useCallback(
    (feature?: Feature<Geometry, { name: string }>): L.PathOptions => {
      const info = feature ? infoByCounty.get(feature.properties.name) : undefined;
      if (!info) return { fillColor: '#000', fillOpacity: 0, color: '#3b3229', weight: 0.6, opacity: 0.9, interactive: false };
      const match = !sector || info.sectors.includes(sector);
      const selected = info.place.id === selectedPlaceId;
      const hovered = info.place.id === hoveredPlaceId;
      return {
        className: 'county-lit',
        fillColor: '#d9a441',
        fillOpacity: selected ? 0.3 : hovered ? 0.24 : match ? (info.storyCount ? 0.16 : 0.1) : 0.03,
        color: '#d9a441',
        weight: selected ? 2 : 1,
        opacity: selected ? 0.95 : match ? 0.45 : 0.12,
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

  const maxBounds: LatLngBoundsExpression = [
    [-3, 17],
    [17, 43],
  ];

  return (
    <MapContainer
      ref={setMap}
      bounds={NATIONAL_BOUNDS}
      boundsOptions={{ padding: [24, 24] }}
      zoomControl={false}
      zoomSnap={0.25}
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
        data={neighbours}
        interactive={false}
        style={{ fillColor: '#161b1d', fillOpacity: 1, color: '#2a2e2f', weight: 1 }}
        attribution='Boundaries <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0) · <a href="https://www.naturalearthdata.com" target="_blank" rel="noreferrer">Natural Earth</a>'
      />
      <GeoJSON data={outline} interactive={false} style={{ fillColor: '#262019', fillOpacity: 1, color: '#6b5a48', weight: 1.4 }} />
      <GeoJSON ref={countiesRef} data={counties} style={countyStyle as L.StyleFunction} onEachFeature={onEachCounty as any} />
      <GeoJSON data={states} interactive={false} style={{ fill: false, color: '#5a4b3d', weight: 1, opacity: 0.8 }} />
      <GeoJSON
        data={rivers}
        interactive={false}
        style={(f) => ({ color: '#3f88aa', weight: (f?.properties?.scalerank ?? 9) <= 1 ? 2.2 : 1.2, opacity: 0.75 })}
      />

      {zoom < 7.25 &&
        states.features.map((f) => (
          <Marker key={f.properties.name} position={STATE_LABEL_POS[f.properties.name] ?? f.properties.label} icon={labelIcon(f.properties.name, 'state')} interactive={false} keyboard={false} />
        ))}
      {zoom < 6.75 &&
        COUNTRY_LABELS.map(([name, pos]) => (
          <Marker key={name} position={pos} icon={labelIcon(name, 'country')} interactive={false} keyboard={false} />
        ))}

      {placeInfo.map(({ place, sectors, storyCount }) => {
        const selected = place.id === selectedPlaceId;
        const hovered = place.id === hoveredPlaceId;
        const dim = !!sector && !sectors.includes(sector);
        const showLabel = labels.has(place.id);
        return (
          <Marker
            key={place.id}
            position={place.coords}
            title={`${place.name}${storyCount ? `: ${storyCount} ${storyCount === 1 ? 'story' : 'stories'}` : ''}`}
            alt={place.name}
            zIndexOffset={selected ? 1000 : storyCount ? 500 : 0}
            icon={placeIcon({ place, storyCount, sectors, selected, hovered, dim, showLabel, story: selected ? selectedStory : undefined })}
            eventHandlers={{
              click: () => selectRef.current(place.id),
              mouseover: () => hoverRef.current(place.id),
              mouseout: () => hoverRef.current(undefined),
              keypress: (e) => {
                if ((e.originalEvent as KeyboardEvent).key === 'Enter') selectRef.current(place.id);
              },
            }}
          />
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
