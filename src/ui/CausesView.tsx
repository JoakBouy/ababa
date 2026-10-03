import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sprout, 
  GraduationCap, 
  Droplets, 
  Handshake, 
  ShieldAlert, 
  MapPin, 
  User, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { places, programmes, stories, getPlace } from '../data';
import { SECTORS } from '../data/sectors';
import type { SectorId } from '../data/types';
import { cn } from '../utils/cn';

interface Props {
  onSelectPlace: (placeId: string) => void;
  onOpenStory: (storyId: string) => void;
  onGoToMap: () => void;
}

interface CausePillar {
  id: SectorId;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  officialUrl: string;
  photoUrl: string;
}

const PILLARS: CausePillar[] = [
  {
    id: 'food',
    title: 'Food Security & Livelihoods',
    tagline: 'Empowering smallholder farmers & building resilient rural economies',
    description: 'Farming tools, quality seeds, and training for smallholder farmers, plus income-generating activities like poultry farming and small-scale business development to combat chronic food shortages.',
    icon: <Sprout className="h-6 w-6" />,
    color: '#5E8A2F',
    officialUrl: 'https://www.prda-ss.org/causes/food-security-livelihoods',
    photoUrl: 'media/people/fangak-farming.jpg',
  },
  {
    id: 'health',
    title: 'Health & Nutrition (PHSI)',
    tagline: 'Training healthcare workers & delivering life-saving maternal care',
    description: 'Operating community health facilities, training midwives and nurses through the Presbyterian Health Science Institute (PHSI) in Juba, and providing maternal, newborn and nutrition services across remote counties.',
    icon: <HeartPulse className="h-6 w-6" />,
    color: '#C2456A',
    officialUrl: 'https://www.prda-ss.org/causes/health-nutrition-midwifery-nursing-training',
    photoUrl: 'media/people/phsi-training.jpg',
  },
  {
    id: 'education',
    title: 'Education & Schools',
    tagline: 'Safe classrooms, trained teachers & opportunities for girls',
    description: 'Rehabilitating war-damaged and flood-affected schools, equipping classrooms with learning materials, and training teachers, with affirmative support for vulnerable children and girls.',
    icon: <GraduationCap className="h-6 w-6" />,
    color: '#C2851A',
    officialUrl: 'https://www.prda-ss.org/causes/education',
    photoUrl: 'media/people/ayod-school.jpg',
  },
  {
    id: 'water',
    title: 'Water, Sanitation & Hygiene (WASH)',
    tagline: 'Clean water boreholes & community health protection',
    description: 'Drilling and rehabilitating boreholes, constructing sanitation facilities, distributing family hygiene kits, and training local water management committees to maintain water security.',
    icon: <Droplets className="h-6 w-6" />,
    color: '#2E7DA3',
    officialUrl: 'https://www.prda-ss.org/causes/water-sanitation-hygiene-wash',
    photoUrl: 'media/people/nyabol-water.jpg',
  },
  {
    id: 'protection',
    title: 'Peacebuilding & Reconciliation',
    tagline: 'Healing trauma & uniting divided communities',
    description: 'Facilitating grassroots peace forums, trauma healing workshops, and cross-clan community dialogues that restore social cohesion and resolve resource disputes peacefully.',
    icon: <Handshake className="h-6 w-6" />,
    color: '#7A5AA0',
    officialUrl: 'https://www.prda-ss.org/causes/peacebuilding-reconciliation',
    photoUrl: 'media/people/akobo-peace.jpg',
  },
  {
    id: 'relief',
    title: 'Emergency Response & Relief',
    tagline: 'Rapid humanitarian assistance in floods and displacement',
    description: 'Providing food, emergency shelter, non-food household kits, and cash-voucher assistance (CVA) to vulnerable families displaced by sudden conflict and severe climate flooding.',
    icon: <ShieldAlert className="h-6 w-6" />,
    color: '#DC2626',
    officialUrl: 'https://www.prda-ss.org/causes/emergency-response-relief',
    photoUrl: 'media/people/nasir-cva.jpg',
  },
];

export default function CausesView({ onSelectPlace, onOpenStory, onGoToMap }: Props) {
  const [selectedPillar, setSelectedPillar] = useState<SectorId | 'all'>('all');

  const filteredPillars = selectedPillar === 'all' 
    ? PILLARS 
    : PILLARS.filter((p) => p.id === selectedPillar);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl border border-outline-variant/40 bg-gradient-to-br from-[#008751]/10 via-surface-container-lowest to-[#008751]/5 p-6 md:p-10 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#008751]/15 px-3 py-1 text-xs font-bold text-[#008751]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PRDA Core Program Pillars</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
            What We Do Across South Sudan
          </h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Six program pillars guide our community-based relief, rehabilitation, and long-term development work. 
            Rooted in faith since 1993, PRDA delivers hands-on change directly in the communities that need it most.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() => setSelectedPillar('all')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm',
              selectedPillar === 'all'
                ? 'bg-[#008751] text-white ring-2 ring-[#008751]/30'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
            )}
          >
            All 6 Pillars
          </button>
          {PILLARS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPillar(p.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm',
                selectedPillar === p.id
                  ? 'text-white ring-2 ring-black/20'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
              )}
              style={selectedPillar === p.id ? { backgroundColor: p.color } : {}}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredPillars.map((pillar) => {
          // Find matching places and programs
          const matchingProgs = programmes.filter((pr) => pr.sectors.includes(pillar.id));
          const placeIds = Array.from(new Set(matchingProgs.flatMap((pr) => pr.locationIds)));
          const activePlaces = placeIds.map(getPlace).filter(Boolean);
          const matchingStories = stories.filter((s) => s.sectors.includes(pillar.id));

          return (
            <div
              key={pillar.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container">
                  <img
                    src={pillar.photoUrl}
                    alt={pillar.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 shadow-sm">
                    <span style={{ color: pillar.color }}>{pillar.icon}</span>
                    <span className="font-headline text-xs font-bold text-on-surface">{pillar.title}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-medium text-white/90 line-clamp-1">{pillar.tagline}</p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-5">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Active Counties */}
                  {activePlaces.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-label text-[10px] font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#008751]" />
                        Active Locations ({activePlaces.length} counties)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activePlaces.slice(0, 6).map((pl) => (
                          <button
                            key={pl!.id}
                            type="button"
                            onClick={() => {
                              onSelectPlace(pl!.id);
                              onGoToMap();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-low px-2 py-1 text-xs font-semibold text-on-surface hover:border-[#008751] hover:text-[#008751] transition-colors"
                          >
                            {pl!.name}
                          </button>
                        ))}
                        {activePlaces.length > 6 && (
                          <span className="rounded-lg bg-surface-container-low px-2 py-1 text-xs text-on-surface-variant">
                            +{activePlaces.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connected People */}
                  {matchingStories.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-outline-variant/30">
                      <span className="font-label text-[10px] font-bold tracking-wider text-on-surface-variant uppercase flex items-center gap-1">
                        <User className="h-3 w-3 text-[#008751]" />
                        Stories in this pillar
                      </span>
                      <div className="space-y-1.5">
                        {matchingStories.slice(0, 2).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              onOpenStory(st.id);
                              onGoToMap();
                            }}
                            className="flex items-center justify-between w-full rounded-xl bg-surface-container/40 p-2 text-left hover:bg-[#008751]/10 transition-colors group/item"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-outline-variant/50">
                                {st.portrait ? (
                                  <img src={st.portrait.src} alt={st.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="grid h-full w-full place-items-center bg-[#008751]/15 text-[#008751]">
                                    <User className="h-3.5 w-3.5" />
                                  </span>
                                )}
                              </span>
                              <div className="min-w-0 truncate">
                                <span className="block truncate text-xs font-bold text-on-surface group-hover/item:text-[#008751]">{st.name}</span>
                                <span className="block truncate text-[10px] text-on-surface-variant">{st.role}</span>
                              </div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-on-surface-variant group-hover/item:translate-x-0.5 group-hover/item:text-[#008751] transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-outline-variant/20 mt-4">
                <a
                  href={pillar.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#008751] hover:underline"
                >
                  PRDA-SS.org info <ExternalLink className="h-3 w-3" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (activePlaces[0]) onSelectPlace(activePlaces[0]!.id);
                    onGoToMap();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#008751] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#007043] transition-colors"
                >
                  Explore on Map <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
