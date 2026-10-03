import { useState } from 'react';
import { MapPin, Quote, ArrowRight, Play, Filter, Search, Award } from 'lucide-react';
import { stories, getPlace } from '../data';
import { SECTORS, SECTOR_ORDER } from '../data/sectors';
import type { SectorId } from '../data/types';
import { DemoTag } from './bits';
import { cn } from '../utils/cn';

interface Props {
  onOpenStory: (storyId: string) => void;
  onGoToMap: () => void;
}

export default function StoriesGalleryView({ onOpenStory, onGoToMap }: Props) {
  const [filterSector, setFilterSector] = useState<SectorId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const filtered = stories.filter((s) => {
    const matchesSector = filterSector === 'all' || s.sectors.includes(filterSector);
    const place = getPlace(s.locationId);
    const text = `${s.name} ${s.role} ${s.headline} ${s.quote || ''} ${place?.name || ''}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.toLowerCase());
    return matchesSector && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Gallery Header */}
      <div className="rounded-3xl border border-outline-variant/40 bg-gradient-to-br from-[#008751]/10 via-surface-container-lowest to-[#008751]/5 p-6 md:p-10 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#008751]/15 px-3 py-1 text-xs font-bold text-[#008751]">
            <Award className="h-3.5 w-3.5" />
            <span>Community Testimony</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
            Voices from the Field
          </h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            The journey is South Sudan → Place → Person → Story → Impact. Meet the midwives, farmers, nurses, water committee leaders, and families whose resilience defines PRDA's mission.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          {/* Sector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterSector('all')}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                filterSector === 'all'
                  ? 'bg-[#008751] text-white ring-2 ring-[#008751]/30'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
              )}
            >
              Everyone ({stories.length})
            </button>
            {SECTOR_ORDER.map((s) => {
              const count = stories.filter((x) => x.sectors.includes(s)).length;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSector(s)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                    filterSector === s
                      ? 'text-white'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
                  )}
                  style={filterSector === s ? { backgroundColor: SECTORS[s].color } : {}}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SECTORS[s].color }} />
                  {SECTORS[s].short} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or place..."
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest py-2 pl-9 pr-3 text-xs text-on-surface focus:border-[#008751] focus:ring-1 focus:ring-[#008751] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Video Feature Spotlight */}
      <div className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest shadow-md grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative bg-black flex items-center justify-center aspect-video lg:aspect-auto min-h-[300px]">
          {isPlayingVideo ? (
            <video
              controls
              autoPlay
              className="h-full w-full object-cover"
              poster="media/people/phsi-training.jpg"
            >
              <source src="media/people/south-sudan-health.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="relative h-full w-full group cursor-pointer" onClick={() => setIsPlayingVideo(true)}>
              <img
                src="media/people/phsi-training.jpg"
                alt="Healthcare training at PHSI"
                className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Play video"
                  className="grid h-16 w-16 place-items-center rounded-full bg-[#008751] text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#007043]"
                >
                  <Play className="h-7 w-7 fill-white translate-x-0.5" />
                </button>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
                  Watch Field Report Video
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#008751]/15 px-2 py-0.5 text-[11px] font-bold text-[#008751] uppercase">
                Featured Document
              </span>
              <span className="text-xs text-on-surface-variant font-medium">Juba · PHSI</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Presbyterian Health Science Institute (PHSI)
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              In a nation with one of the world's highest maternal mortality rates, PRDA's training institute in Juba equips dedicated men and women with diplomas in midwifery and nursing, sending certified professionals back to clinics in Leer, Akobo, Pibor and remote counties.
            </p>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="media/people/achol-nurse.jpg" alt="Achol" className="h-full w-full object-cover" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-on-surface block">Achol</span>
                <span className="text-on-surface-variant block">PHSI Nurse Graduate</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenStory('juba-phsi-graduate');
                onGoToMap();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007043] transition-colors"
            >
              Read Achol's Journey <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((story) => {
          const home = getPlace(story.locationId);
          return (
            <div
              key={story.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                {/* Portrait Frame */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container">
                  {story.portrait ? (
                    <img
                      src={story.portrait.src}
                      alt={story.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#008751]/10 text-[#008751]">
                      <span className="font-bold">Portrait</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Sector Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {story.sectors.map((s) => (
                      <span
                        key={s}
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md"
                        style={{ backgroundColor: `${SECTORS[s].color}E6` }}
                      >
                        {SECTORS[s].short}
                      </span>
                    ))}
                  </div>

                  {/* Status tag */}
                  <div className="absolute top-3 right-3">
                    <DemoTag status={story.status} />
                  </div>

                  {/* Name & Role overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-headline text-xl font-bold">{story.name}</h3>
                    <p className="text-xs text-white/90 font-medium line-clamp-1">{story.role}</p>
                    {home && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                        <MapPin className="h-3 w-3 text-[#008751] fill-white" />
                        {home.name}, {home.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {story.quote && (
                    <div className="relative rounded-2xl bg-surface-container/40 p-3.5 border-l-3 border-[#008751]">
                      <Quote className="absolute right-2 top-2 h-4 w-4 text-[#008751]/30" />
                      <p className="text-xs italic text-on-surface leading-snug">
                        "{story.quote}"
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {story.headline}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    onOpenStory(story.id);
                    onGoToMap();
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-surface-container-low hover:bg-[#008751] hover:text-white px-3.5 py-2.5 text-xs font-bold text-on-surface transition-all group/btn"
                >
                  <span>Explore Story & Location</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
