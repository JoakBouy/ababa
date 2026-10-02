import type React from 'react';
import { ArrowRight, FileText, MapPin, Quote } from 'lucide-react';
import { getPlace, getProgramme, getStory, sources, storiesForPlace, yearsLabel } from '../data';
import type { EvidenceType, Story } from '../data/types';
import { DemoTag, Portrait, SectionHeading, SectorList, VideoBlock } from './bits';
import { cn } from '../utils/cn';

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  record: 'Records',
  survey: 'Survey',
  testimony: 'Testimony',
  observation: 'Observation',
  external: 'External report',
};

interface Props {
  story: Story;
  onOpenStory: (id: string) => void;
  onOpenPlace: (id: string) => void;
}

function Chapter({ index, title, text, demo, children }: { index: number; title: string; text: string; demo: boolean; children?: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[28px_1fr] gap-x-3">
      <span className="font-mono text-[12px] text-gold-ink tabular pt-1">0{index}</span>
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="font-display text-[22px] leading-tight text-ink">{title}</h3>
        <p className={cn('max-w-[60ch] text-[15px] leading-relaxed', demo ? 'placeholder-copy' : 'text-ink')}>{text}</p>
        {children}
      </div>
    </section>
  );
}

export default function StoryPanel({ story, onOpenStory, onOpenPlace }: Props) {
  const place = getPlace(story.locationId)!;
  const demo = story.status === 'demo';
  const progs = story.programmeIds.map(getProgramme).filter(Boolean);
  const related = story.relatedStoryIds.map((id) => getStory(id)).filter(Boolean) as Story[];
  const samePlace = storiesForPlace(place.id).filter((s) => s.id !== story.id && !story.relatedStoryIds.includes(s.id));
  const more = [...related, ...samePlace];

  return (
    <article className="flex flex-col gap-9">
      <header className="flex flex-col gap-5">
        <div className="relative -mx-5 overflow-hidden sm:-mx-7">
          <div className={cn('w-full max-w-full', story.portrait ? 'aspect-[4/3]' : 'aspect-[2/1]')}>
            <Portrait story={story} size="hero" />
          </div>
          {story.portrait?.credit && (
            <span className="absolute right-2 bottom-2 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] text-white">
              {story.portrait.credit}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-[38px] leading-none font-medium text-ink">{story.name}</h1>
            {demo && <DemoTag className="text-[11px]" />}
          </div>
          <p className="text-[14px] text-ink-2">{story.role}</p>
          <button
            type="button"
            onClick={() => onOpenPlace(place.id)}
            className="inline-flex w-fit items-center gap-1 text-[13px] text-accent hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {place.name}, {place.state}
          </button>
        </div>

        {demo && (
          <p className="rounded-md bg-demo-bg px-3.5 py-3 text-[13px] leading-snug text-demo-ink">
            <strong className="font-semibold">Demo profile.</strong> This is not a real person. It shows how a PRDA story
            from {place.name} will read once the real case, photo and consent are added.
          </p>
        )}

        <p className={cn('font-display text-[23px] leading-snug', demo ? 'text-ink-2 italic' : 'text-ink')}>{story.headline}</p>
      </header>

      <figure
        className={cn(
          'flex gap-3 border-l-2 pl-4',
          story.quote ? 'border-accent' : 'border-dashed border-line',
        )}
      >
        <Quote className={cn('h-5 w-5 shrink-0', story.quote ? 'text-accent' : 'text-ink-2')} aria-hidden="true" />
        <blockquote className={cn('font-display text-[21px] leading-snug', story.quote ? 'text-ink' : 'text-ink-2 italic')}>
          {story.quote ?? 'Their own words go here, in one or two sentences.'}
        </blockquote>
      </figure>

      <VideoBlock story={story} />

      <div className="flex flex-col gap-8">
        <Chapter index={1} title="Before" text={story.chapters.before} demo={demo} />
        <Chapter index={2} title="What PRDA supported" text={story.chapters.supported} demo={demo}>
          <ul className="flex flex-col gap-2">
            {story.support.map((s) => (
              <li key={s.label} className="flex flex-col rounded-md bg-paper-2 px-3.5 py-2.5">
                <span className="text-[13.5px] font-semibold text-ink">{s.label}</span>
                <span className={cn('text-[13px]', demo ? 'italic text-ink-2' : 'text-ink-2')}>{s.detail}</span>
              </li>
            ))}
          </ul>
          {progs.map(
            (p) =>
              p && (
                <p key={p.id} className="text-[13px] leading-snug text-ink-2">
                  Through <span className="font-medium text-ink">{p.name}</span>
                  {yearsLabel(p) && <span className="font-mono text-[11.5px]"> ({yearsLabel(p)})</span>}
                  {p.partners.length > 0 && <> with {p.partners.join(', ')}</>}.
                </p>
              ),
          )}
        </Chapter>
        <Chapter index={3} title="What changed" text={story.chapters.changed} demo={demo}>
          <ul className="flex flex-col border-t border-line">
            {story.impact.map((i) => {
              const src = i.evidence.sourceId ? sources[i.evidence.sourceId] : undefined;
              return (
                <li key={i.label} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-3">
                  <span className="text-[14px] text-ink">{i.label}</span>
                  {i.value !== null ? (
                    <span className="font-display text-[24px] leading-none text-ink tabular">
                      {i.value}
                      {i.unit && <span className="ml-1 text-[13px] text-ink-2">{i.unit}</span>}
                    </span>
                  ) : (
                    <span className="eyebrow text-[10px] text-gold-ink">Awaiting evidence</span>
                  )}
                  <span className="col-span-2 inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    {EVIDENCE_LABEL[i.evidence.type]} · {i.evidence.note}
                    {src && (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        {src.publisher}
                      </a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Chapter>
      </div>

      <section className="flex flex-col gap-3">
        <SectionHeading>About this record</SectionHeading>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
          <dt className="text-ink-2">Status</dt>
          <dd className="text-ink">{demo ? 'Demo profile' : story.status === 'draft' ? 'Draft, not yet approved' : 'Published'}</dd>
          <dt className="text-ink-2">Consent</dt>
          <dd className="text-ink">
            {story.consent.obtained ? `Recorded${story.consent.date ? ` ${story.consent.date}` : ''}${story.consent.scope ? ` · ${story.consent.scope}` : ''}` : 'Not recorded'}
          </dd>
          <dt className="text-ink-2">Recorded by</dt>
          <dd className="text-ink">{story.recordedBy ? `${story.recordedBy}${story.recordedOn ? `, ${story.recordedOn}` : ''}` : '—'}</dd>
          <dt className="text-ink-2">Sectors</dt>
          <dd>
            <SectorList sectors={story.sectors} className="text-[13px]" />
          </dd>
        </dl>
      </section>

      {more.length > 0 && (
        <section className="flex flex-col gap-3 pb-6">
          <SectionHeading>More from {place.name}</SectionHeading>
          <ul className="flex flex-col">
            {more.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpenStory(s.id)}
                  className="group grid w-full grid-cols-[48px_1fr_auto] items-center gap-3.5 border-b border-line py-3 text-left"
                >
                  <span className="h-12 w-12 overflow-hidden rounded-full">
                    <Portrait story={s} size="thumb" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-[18px] text-ink group-hover:text-accent">{s.name}</span>
                      {s.status === 'demo' && <DemoTag />}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-2">{s.role}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-2 group-hover:text-accent" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
