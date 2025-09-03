import React from 'react';

// 1) Mono Minimal (sleek, neutral, dark-UI friendly)
export function PageTitle({title, subtitle}: {title:string; subtitle?:string}) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm md:text-base text-zinc-400">{subtitle}</p>
      )}
    </header>
  );
}

// 2) Glow Line (subtle energy, matches your accent color)
export function PageTitleGlow({title, subtitle}:{title:string; subtitle?:string}) {
  return (
    <header className="mb-9">
      <h1 className="relative inline-block text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-16 after:bg-[#4997D0]/90 after:blur-[1px]">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm md:text-base text-zinc-400">{subtitle}</p>}
    </header>
  );
}

// 3) Editorial Grid (structured, "dashboard pro" vibe)
export function PageTitleEditorial({
  eyebrow = "Overview",
  title,
  subtitle,
}: {eyebrow?:string; title:string; subtitle?:string}) {
  return (
    <header className="mb-8 border-b border-zinc-800/80 pb-5">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500">{eyebrow}</div>
      <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm md:text-base text-zinc-400">{subtitle}</p>}
    </header>
  );
}

// Section headers for consistency
export function SectionHeader({title, accent}: {title: string; accent?: boolean}) {
  return (
    <h2 className={`text-base md:text-lg font-medium text-zinc-200 ${accent ? 'relative after:block after:h-px after:w-10 after:bg-zinc-700 after:mt-3' : ''}`}>
      {title}
    </h2>
  );
}
