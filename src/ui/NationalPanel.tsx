import { ArrowRight, Users } from 'lucide-react';
import { places, programmes, sectorsForPlace, stories, storiesForPlace, unplacedProgrammes } from '../data';
import type { SectorId } from '../data/types';
import { DemoTag, Portrait, SectionHeading, SectorDot, SourceLinks } from './bits';
import { cn } from '../utils/cn';

interface Props {
  sector: SectorId | null;
  onOpenPlace: (id: string) => void;
  onHoverPlace: (id?: string) => void;
  hoveredPlaceId?: string;
}

export default function NationalPanel({ sector, onOpenPlace, onHoverPlace, hoveredPlaceId }: Props) {
  const matches = (sectors: SectorId[]) => !sector || sectors.includes(sector);
  const withPeople = places.filter((p) => storiesForPlace(p.id).length > 0 && matches(sectorsForPlace(p)));
  const others = places.filter((p) => storiesForPlace(p.id).length === 0 && matches(sectorsForPlace(p)));
  const unplaced = unplacedProgrammes.filter((p) => matches(p.sectors));
  const hasDemo = stories.some((s) => s.status === 'demo');
  const allSourceIds = programmes.flatMap((p) => p.sourceIds);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#005477]/10 text-[#005477]">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          Meet the people PRDA reaches
        </h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          PRDA is the relief and development arm of the Presbyterian Church of South Sudan, working since 1993. It trains
          midwives and nurses, supports farming, water and schools, and responds when conflict and floods force families
          from their homes. Choose a place on the map to meet the people there.
        </p>
        {hasDemo && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs leading-snug text-amber-800">
            Places and programmes come from PRDA's published materials and partner reports. The people are{' '}
            <strong className="font-semibold">demo profiles</strong> showing where PRDA's real stories will go.
          </p>
        )}
      </header>

      <section className="flex flex-col gap-1" aria-labelledby="people-heading">
        <SectionHeading aside={`${withPeople.length} places`}>
          <span id="people-heading">People on the map</span>
        </SectionHeading>
        {withPeople.length === 0 && <p className="py-4 text-[14px] text-on-surface-variant">No stories recorded for this sector yet.</p>}
        <ul className="flex flex-col">
          {withPeople.map((place) => {
            const people = storiesForPlace(place.id);
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onOpenPlace(place.id)}
                  onMouseEnter={() => onHoverPlace(place.id)}
                  onMouseLeave={() => onHoverPlace(undefined)}
                  onFocus={() => onHoverPlace(place.id)}
                  onBlur={() => onHoverPlace(undefined)}
                  className={cn(
                    'group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3.5 border-b border-outline-variant/30 py-3.5 text-left transition-colors',
                    hoveredPlaceId === place.id && 'bg-surface-container/50',
                  )}
                >
                  <span className="flex -space-x-2">
                    {people.slice(0, 3).map((s) => (
                      <span key={s.id} className="h-10 w-10 overflow-hidden rounded-full border-2 border-white">
                        <Portrait story={s} size="thumb" />
                      </span>
                    ))}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className="font-headline text-base font-bold leading-tight text-on-surface">{place.name}</span>
                      <span className="truncate text-[12px] text-on-surface-variant">{place.state}</span>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-on-surface-variant">
                      {people.map((s, i) => (
                        <span key={s.id} className="inline-flex items-center gap-1.5">
                          {s.name}
                          {s.status === 'demo' && i === people.length - 1 && <DemoTag />}
                          {i < people.length - 1 && <span aria-hidden="true">·</span>}
                        </span>
                      ))}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-[#005477]" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="others-heading">
        <SectionHeading aside="No stories recorded yet">
          <span id="others-heading">Also working in</span>
        </SectionHeading>
        <ul className="flex flex-wrap gap-2">
          {others.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => onOpenPlace(place.id)}
                onMouseEnter={() => onHoverPlace(place.id)}
                onMouseLeave={() => onHoverPlace(undefined)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-3 py-1.5 text-[13px] text-on-surface transition-colors hover:border-[#005477] hover:text-[#005477]',
                  hoveredPlaceId === place.id && 'border-[#005477] text-[#005477]',
                )}
              >
                <span className="flex gap-0.5">
                  {sectorsForPlace(place).map((s) => (
                    <SectorDot key={s} sector={s} size={6} />
                  ))}
                </span>
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {unplaced.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="unplaced-heading">
          <SectionHeading aside="Location not yet published">
            <span id="unplaced-heading">Not yet on the map</span>
          </SectionHeading>
          <ul className="flex flex-col gap-3">
            {unplaced.map((p) => (
              <li key={p.id} className="flex gap-3">
                <span className="mt-1.5 flex gap-0.5">
                  {p.sectors.map((s) => (
                    <SectorDot key={s} sector={s} size={6} />
                  ))}
                </span>
                <span className="min-w-0 text-[13.5px] leading-snug">
                  <span className="font-medium text-on-surface">{p.name}</span>
                  <span className="text-on-surface-variant"> · {p.summary}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3 pb-6">
        <details className="group">
          <summary className="eyebrow cursor-pointer list-none font-semibold text-on-surface marker:hidden">
            <span className="inline-flex items-center gap-2">
              Sources <span className="text-on-surface-variant group-open:hidden">+</span>
              <span className="hidden text-on-surface-variant group-open:inline">−</span>
            </span>
          </summary>
          <SourceLinks ids={allSourceIds} className="mt-3" />
        </details>
        <details className="group">
          <summary className="eyebrow cursor-pointer list-none font-semibold text-on-surface">
            <span className="inline-flex items-center gap-2">
              For PRDA staff: adding a real story <span className="text-on-surface-variant group-open:hidden">+</span>
              <span className="hidden text-on-surface-variant group-open:inline">−</span>
            </span>
          </summary>
          <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-[13.5px] leading-snug text-on-surface-variant">
            <li>Record the person's consent, including permission to show their photo, name and video.</li>
            <li>Add their portrait to <code className="font-mono text-[12px] text-on-surface">public/media/people/</code>.</li>
            <li>
              Add a record to <code className="font-mono text-[12px] text-on-surface">src/data/content/stories.json</code> with{' '}
              <code className="font-mono text-[12px] text-on-surface">"status": "published"</code>, linked to a place and programme.
            </li>
            <li>Back each impact with evidence: a record, survey, testimony or report.</li>
            <li>
              Run <code className="font-mono text-[12px] text-on-surface">npm run validate</code>, then remove the demo profiles.
            </li>
          </ol>
        </details>
      </section>
    </div>
  );
}
