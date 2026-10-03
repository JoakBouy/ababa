import { useEffect, useState } from 'react';
import { 
  Building2, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Users, 
  Calendar,
  Globe2,
  BookmarkCheck
} from 'lucide-react';
import { places, programmes, stories } from '../data';

interface Props {
  onGoToMap: () => void;
}

function StatCounter({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm hover:border-[#008751]/50 transition-colors text-center">
      <span className="font-headline text-4xl sm:text-5xl font-extrabold text-[#008751]">
        {count}{suffix}
      </span>
      <span className="mt-2 text-xs sm:text-sm font-bold text-on-surface-variant max-w-[140px]">
        {label}
      </span>
    </div>
  );
}

export default function AboutImpactView({ onGoToMap }: Props) {
  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-gradient-to-br from-[#008751]/15 via-surface-container-lowest to-[#008751]/5 p-6 sm:p-12 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#008751]/15 px-3.5 py-1 text-xs font-bold text-[#008751]">
            <BookmarkCheck className="h-3.5 w-3.5" />
            <span>Serving South Sudan Since 1993</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
            Rooted in Faith, Focused on Impact
          </h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            The Presbyterian Relief and Development Agency (PRDA) is the humanitarian and development arm of the Presbyterian Church of South Sudan (PCOSS). For over 30 years, we have worked alongside local communities to heal, restore, and build resilient futures across Greater Upper Nile and Central Equatoria.
          </p>

          {/* Scripture Card */}
          <div className="rounded-2xl border border-[#008751]/20 bg-white/80 backdrop-blur-sm p-4 text-xs sm:text-sm italic text-on-surface flex items-start gap-3 shadow-xs">
            <span className="text-2xl leading-none text-[#008751]">“</span>
            <div>
              <p className="font-medium text-[#005a36]">
                Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.
              </p>
              <span className="mt-1 block font-bold text-[#008751] not-italic">— Isaiah 40:31</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="space-y-4">
        <h2 className="font-headline text-2xl font-bold text-on-surface text-center">
          Our Impact in Numbers
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCounter target={30} suffix="+" label="Years Serving South Sudan" />
          <StatCounter target={places.length} label="Counties & Centres Active" />
          <StatCounter target={programmes.length} label="Relief & Development Programmes" />
          <StatCounter target={75} suffix="+" label="Midwives & Nurses Deployed" />
        </div>
      </div>

      {/* Story of PRDA & PHSI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#008751]/10 text-[#008751]">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Who We Are & What Drives Us
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            PRDA was established in 1993 to alleviate human suffering during the protracted liberation struggle. Today, as South Sudan faces recurring climate disasters, flooding, and social displacement, PRDA remains an enduring pillar of hope.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Our approach prioritizes community leadership, conflict sensitivity, and sustainable rehabilitation—ensuring families receive not just emergency food, but seeds, tools, clean water, and access to trained health professionals.
          </p>
        </div>

        <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C2456A]/10 text-[#C2456A]">
            <Heart className="h-5 w-5" />
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Presbyterian Health Science Institute (PHSI)
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Located in Juba, PHSI is PRDA's flagship medical training institution. PHSI trains midwives and nurses through rigorous three-year diploma curricula recognized by the South Sudan Ministry of Health.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Graduates return to frontline clinics in remote areas such as Leer, Akobo, Pibor, and Pochalla, dramatically reducing maternal mortality and providing life-saving healthcare where doctors are rare.
          </p>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span className="font-label text-xs font-bold tracking-wider text-[#008751] uppercase">Leadership</span>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Board & Executive Team
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Rev. Orozu Lakine Daky', role: 'Chairman of the Board of Directors' },
            { name: 'Rev. Ustaz. Tut Mai Nguoth', role: 'Executive Director' },
            { name: 'Rev. Andrew Juth Kang', role: 'Deputy Director & Program Officer' },
            { name: 'Mr. Lim Lero Ochalla', role: 'Vice Chairman of the Board' },
          ].map((leader) => (
            <div key={leader.name} className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low/50">
              <span className="h-9 w-9 grid place-items-center rounded-full bg-[#008751]/15 text-[#008751] mb-3">
                <Users className="h-4 w-4" />
              </span>
              <h3 className="font-headline text-sm font-bold text-on-surface">{leader.name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{leader.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* International Partners */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span className="font-label text-xs font-bold tracking-wider text-[#008751] uppercase">Cooperation</span>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Our Trusted Partners
          </h2>
          <p className="text-sm text-on-surface-variant">
            PRDA works with international church agencies and humanitarian alliances to deliver verified, high-accountability programs:
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'ACT Alliance (Geneva)', desc: 'Global coalition of 150+ church organizations' },
            { name: 'PDA / PCUSA', desc: 'Presbyterian Disaster Assistance (USA)' },
            { name: 'Mission 21', desc: 'Protestant mission agency in Switzerland' },
            { name: 'Dutch Relief Alliance', desc: 'Netherlands humanitarian consortium' },
          ].map((partner) => (
            <div key={partner.name} className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-on-surface block">{partner.name}</span>
                <span className="text-[11px] text-on-surface-variant block mt-1">{partner.desc}</span>
              </div>
              <span className="mt-3 text-[10px] font-bold text-[#008751] flex items-center gap-1">
                Verified Partner <BookmarkCheck className="h-3 w-3" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connect & Donate Banner */}
      <div className="rounded-3xl border border-[#dc2626]/20 bg-gradient-to-r from-[#dc2626]/10 via-surface-container-lowest to-[#008751]/10 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-headline text-2xl font-bold text-on-surface">
            Together, We Can Make a Difference
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your gift provides food to the hungry, clean water to the thirsty, midwifery care for mothers, and education for children in South Sudan.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant pt-2">
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#008751]" /> +211 920 202 202</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#008751]" /> info@prda-ss.org</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#008751]" /> Juba, South Sudan</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.prda-ss.org/donate"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#dc2626] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b91c1c] transition-all hover:scale-105"
          >
            <Heart className="h-4 w-4 fill-white" />
            Make a Donation
          </a>
          <button
            type="button"
            onClick={onGoToMap}
            className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface shadow-sm hover:border-[#008751] hover:text-[#008751] transition-all"
          >
            Explore Impact Map
          </button>
        </div>
      </div>
    </div>
  );
}
