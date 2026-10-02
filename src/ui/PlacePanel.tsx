import { AlertCircle, MapPin } from 'lucide-react';
import { programmesForPlace, sectorsForPlace, storiesForPlace, yearsLabel } from '../data';
import { SECTORS } from '../data/sectors';
import type { Place, Programme, SectorId } from '../data/types';
import { DemoTag, Portrait, SectionHeading, SectorDot, SectorList, SourceLinks, formatCoords } from './bits';
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
    <div className="flex flex-col gap-9">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[40px] leading-none font-medium text-ink sm:text-[46px]">{place.name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {place.county} County · {place.state}
          </span>
          <span className="font-mono text-[11.5px] tabular" title={place.coordsPrecision === 'county' ? 'County centre: exact sites to be added' : 'Town location'}>
            {formatCoords(place.coords)}
            {place.coordsPrecision === 'county' && ' (county centre)'}
          </span>
        </p>
        <p className="max-w-[60ch] text-[15.5px] leading-relaxed text-ink">{place.summary}</p>
        <SectorList sectors={sectors} />
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="place-people">
        <SectionHeading aside={people.length ? `${people.length} ${people.length === 1 ? 'person' : 'people'}` : undefined}>
          <span id="place-people">People from {place.name}</span>
        </SectionHeading>
        {people.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6">
            {people.map((s) => {
              const dim = !!sector && !s.sectors.includes(sector);
              return (
                <li key={s.id} className={cn('min-w-0 transition-opacity', dim && 'opacity-45')}>
                  <button type="button" onClick={() => onOpenStory(s.id)} className="group flex w-full flex-col gap-2.5 text-left">
                    <span className="block aspect-[4/5] w-full max-w-full overflow-hidden rounded-md ring-accent transition group-hover:ring-2">
                      <Portrait story={s} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <span className="font-display text-[19px] leading-tight text-ink group-hover:text-accent">{s.name}</span>
                        {s.status === 'demo' && <DemoTag />}
                      </span>
                      <span className="text-[12.5px] leading-snug text-ink-2">{s.role}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-line px-4 py-5">
            <p className="font-display text-[19px] text-ink">No stories from {place.name} yet</p>
            <p className="text-[13.5px] leading-snug text-ink-2">
              PRDA's {Array.from(new Set(work)).join(' and ')} work here has no recorded story. A person reached by this work, with
              their consent, belongs here.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-1" aria-labelledby="place-work">
        <SectionHeading aside={`${progs.length} ${progs.length === 1 ? 'programme' : 'programmes'}`}>
          <span id="place-work">What PRDA does here</span>
        </SectionHeading>
        <ul className="flex flex-col">
          {progs.map((p) => {
            const years = yearsLabel(p);
            const dim = !!sector && !p.sectors.includes(sector);
            return (
              <li key={p.id} className={cn('flex flex-col gap-2 border-b border-line py-4 transition-opacity', dim && 'opacity-45')}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] leading-snug font-semibold text-ink">{p.name}</h3>
                  <span
                    className={cn(
                      'eyebrow shrink-0 pt-0.5 text-[10px]',
                      p.status === 'active' ? 'text-accent' : p.status === 'completed' ? 'text-ink-2' : 'text-gold-ink',
                    )}
                  >
                    {years ?? statusLabel(p)}
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug text-ink-2">{p.summary}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-2">
                  <span className="flex gap-1">
                    {p.sectors.map((s) => (
                      <SectorDot key={s} sector={s} size={7} />
                    ))}
                  </span>
                  {p.partners.length > 0 && <span>With {p.partners.join(', ')}</span>}
                </div>
                {p.facts.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-1">
                    {p.facts.map((f) => (
                      <li key={f.text} className="text-[13px] leading-snug text-ink">
                        {f.text}{' '}
                        <a href={sources[f.sourceId]?.url} target="_blank" rel="noreferrer" className="text-[11.5px] text-accent hover:underline">
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
            <p key={n.text} className="flex gap-2.5 rounded-md bg-verify-bg px-3.5 py-3 text-[13px] leading-snug text-verify-ink">
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
        <SectionHeading>Sources</SectionHeading>
        <SourceLinks ids={[...place.sourceIds, ...progs.flatMap((p) => p.sourceIds)]} />
      </section>
    </div>
  );
}
