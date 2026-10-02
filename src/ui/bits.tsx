import React from 'react';
import { ExternalLink, Play, User } from 'lucide-react';
import { SECTORS } from '../data/sectors';
import { sources } from '../data';
import type { SectorId, Story } from '../data/types';
import { cn } from '../utils/cn';

export function DemoTag({ className, status = 'demo' }: { className?: string; status?: Story['status'] }) {
  if (status !== 'demo' && status !== 'test') return null;
  return (
    <span
      className={cn('inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 font-label text-[9px] font-bold tracking-wider text-amber-700 uppercase', className)}
      title={status === 'test' ? 'Test persona: fictional, for trying out the map' : 'Demo profile: not a real person'}
    >
      {status === 'test' ? 'Test' : 'Demo'}
    </span>
  );
}

export function SectorDot({ sector, size = 8 }: { sector: SectorId; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: SECTORS[sector].color }}
    />
  );
}

export function SectorList({ sectors, className }: { sectors: SectorId[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-on-surface-variant', className)}>
      {sectors.map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5">
          <SectorDot sector={s} />
          {SECTORS[s].label}
        </li>
      ))}
    </ul>
  );
}

/** Portrait, or a hatched frame that clearly says a photo is still to come. */
export function Portrait({
  story,
  className,
  size = 'tile',
}: {
  story: Story;
  className?: string;
  size?: 'tile' | 'hero' | 'thumb';
}) {
  if (story.portrait) {
    const illustration = story.portrait.src.endsWith('.svg');
    return (
      <img
        src={story.portrait.src}
        alt={story.portrait.alt}
        className={cn('h-full w-full object-cover', illustration ? 'object-[50%_20%]' : 'object-top', className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn('media-placeholder flex h-full w-full flex-col items-center justify-center gap-1.5 text-on-surface-variant', className)}
      role="img"
      aria-label={`Portrait of ${story.name} still to come`}
    >
      {size === 'thumb' ? (
        <User className="h-4 w-4 text-[#A84A23]" aria-hidden="true" />
      ) : (
        <>
          <span className={cn('grid place-items-center rounded-full border-2 border-[#A84A23] bg-white text-[#A84A23] shadow-md', size === 'hero' ? 'h-16 w-16' : 'h-12 w-12')}>
            <User className={size === 'hero' ? 'h-8 w-8' : 'h-6 w-6'} aria-hidden="true" />
          </span>
          <span className="mt-1 font-label text-[10px] font-bold tracking-wider uppercase">Portrait to come</span>
        </>
      )}
    </div>
  );
}

export function VideoBlock({ story }: { story: Story }) {
  const v = story.video;
  if (!v) {
    return (
      <div className="media-placeholder flex aspect-video w-full max-w-full flex-col items-center justify-center gap-2 rounded-2xl text-on-surface-variant">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-on-primary shadow-md">
          <Play className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="font-label text-[10px] font-bold tracking-wider uppercase">Video to come</span>
      </div>
    );
  }
  if (v.kind === 'file') {
    return (
      <figure className="flex flex-col gap-2">
        <video controls preload="metadata" poster={v.poster} className="aspect-video w-full max-w-full rounded-md bg-black">
          <source src={v.src} />
        </video>
        {v.caption && <figcaption className="text-[12.5px] text-on-surface-variant">{v.caption}</figcaption>}
      </figure>
    );
  }
  const src =
    v.kind === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${v.id}`
      : `https://player.vimeo.com/video/${v.id}`;
  const watch = v.kind === 'youtube' ? `https://www.youtube.com/watch?v=${v.id}` : `https://vimeo.com/${v.id}`;
  return (
    <figure className="flex flex-col gap-2">
      <iframe
        src={src}
        title={`Video: ${story.name}`}
        className="aspect-video w-full max-w-full rounded-md bg-black"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
      />
      <figcaption className="flex items-center justify-between gap-3 text-[12.5px] text-on-surface-variant">
        <span>{v.caption}</span>
        <a href={watch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#A84A23] hover:underline">
          Watch on {v.kind === 'youtube' ? 'YouTube' : 'Vimeo'} <ExternalLink className="h-3 w-3" />
        </a>
      </figcaption>
    </figure>
  );
}

export function SourceLinks({ ids, className }: { ids: string[]; className?: string }) {
  const unique = Array.from(new Set(ids)).filter((id) => sources[id]);
  if (!unique.length) return null;
  return (
    <ul className={cn('flex flex-col gap-1.5 text-[12.5px]', className)}>
      {unique.map((id) => (
        <li key={id}>
          <a
            href={sources[id].url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-baseline gap-1.5 text-on-surface-variant hover:text-[#A84A23]"
          >
            <ExternalLink className="h-3 w-3 shrink-0 translate-y-[1px]" aria-hidden="true" />
            <span>
              <span className="font-medium text-on-surface group-hover:text-[#A84A23]">{sources[id].publisher}</span>
              {' · '}
              {sources[id].title}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SectionHeading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-outline-variant/20 pb-2">
      <h2 className="font-label text-xs font-bold tracking-wider text-on-surface-variant uppercase">{children}</h2>
      {aside && <span className="text-[11px] font-bold text-on-surface-variant/80">{aside}</span>}
    </div>
  );
}

export function formatCoords([lat, lng]: [number, number]) {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
}
