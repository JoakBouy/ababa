import { AlertCircle, MapPin } from 'lucide-react';
import { programmesForPlace, sectorsForPlace, storiesForPlace, yearsLabel } from '../data';
import { SECTORS } from '../data/sectors';
import type { Place, Programme, SectorId } from '../data/types';
import { DemoTag, Portrait, SectionHeading, SectorDot, SectorList, SourceLinks } from './bits';
import { cn } from '../utils/cn';
import { sources } from '../data';

interface Props {
  place: Place;
  sector: SectorId | null;
  onOpenStory: (storyId: string) => void;
}

function statusLabel(p: Programme) {
  if (p.status === 'completed') return 'Completed';
  if (p.status === 'unconfirmed') return 'Dates to confirm';
  return 'Active';
}

export default function PlacePanel({ place, sector, onOpenStory }: Props) {
  const people = storiesForPlace(place.id);
  const progs = programmesForPlace(place);
  const sectors = sectorsForPlace(place);
  const work = progs.map((p) => SECTORS[p.sectors[0]].short.toLowerCase());

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-2xl leading-tight font-bold tracking-tight text-on-surface">{place.name}</h1>
        <p className="inline-flex items-center gap-1 text-sm text-on-surface-variant">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {place.state}, South Sudan
        </p>
        <SectorList sectors={sectors} className="pt-1" />
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="place-people">
        <SectionHeading>
          <span id="place-people">People from {place.name}</span>
        </SectionHeading>
        {people.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6">
            {people.map((s) => {
              const dim = !!sector && !s.sectors.includes(sector);
              return (
                <li key={s.id} className={cn('min-w-0 transition-opacity', dim && 'opacity-45')}>
                  <button type="button" onClick={() => onOpenStory(s.id)} className="group flex w-full flex-col gap-2.5 text-left">
                    <span className="block aspect-[4/5] w-full max-w-full overflow-hidden rounded-2xl border border-outline-variant/30 ring-[#A84A23] transition group-hover:ring-2">
                      <Portrait story={s} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <span className="font-headline text-base font-bold leading-tight text-on-surface group-hover:text-[#A84A23]">{s.name}</span>
                        <DemoTag status={s.status} />
                      </span>
                      <span className="text-[12.5px] leading-snug text-on-surface-variant">{s.role}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-outline-variant px-4 py-5">
            <p className="font-headline text-base font-bold text-on-surface">No stories from {place.name} yet</p>
            <p className="text-[13.5px] leading-snug text-on-surface-variant">
              PRDA's {Array.from(new Set(work)).join(' and ')} work here reaches people here. When someone is ready to share their
              story, with their consent, it will appear here.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-1" aria-labelledby="place-work">
        <SectionHeading>
          <span id="place-work">How PRDA helps here</span>
        </SectionHeading>
        <ul className="flex flex-col">
          {progs.map((p) => {
            const years = yearsLabel(p);
            const dim = !!sector && !p.sectors.includes(sector);
            return (
              <li key={p.id} className={cn('flex flex-col gap-2 border-b border-outline-variant/30 py-4 transition-opacity', dim && 'opacity-45')}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] leading-snug font-semibold text-on-surface">{p.name}</h3>
                  <span
                    className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap',
                      p.status === 'active'
                        ? 'bg-[#4E7A2C]/10 text-[#4E7A2C]'
                        : p.status === 'completed'
                          ? 'bg-surface-container text-on-surface-variant'
                          : 'bg-amber-500/10 text-amber-600',
                    )}
                  >
                    {years ?? statusLabel(p)}
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug text-on-surface-variant">{p.summary}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                  <span className="flex gap-1">
                    {p.sectors.map((s) => (
                      <SectorDot key={s} sector={s} size={7} />
                    ))}
                  </span>
                  {p.partners.length > 0 && <span>Alongside {p.partners.join(', ')}</span>}
                </div>
                {p.facts.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-1">
                    {p.facts.map((f) => (
                      <li key={f.text} className="text-[13px] leading-snug text-on-surface">
                        {f.text}{' '}
                        <a href={sources[f.sourceId]?.url} target="_blank" rel="noreferrer" className="text-[11.5px] text-[#A84A23] hover:underline">
                          {sources[f.sourceId]?.publisher}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {place.notes.length > 0 && (
        <section className="flex flex-col gap-2">
          {place.notes.map((n) => (
            <p key={n.text} className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs leading-snug text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold">To confirm with PRDA. </strong>
                {n.text}
              </span>
            </p>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3 pb-6">
        <SectionHeading>Where this comes from</SectionHeading>
        <SourceLinks ids={[...place.sourceIds, ...progs.flatMap((p) => p.sourceIds)]} />
      </section>
    </div>
  );
}
