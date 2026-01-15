type HeroStat = {
  label: string
  value: string
}

type HeroSectionProps = {
  title: string
  subtitle: string
  primaryLabel: string
  secondaryLabel: string
  stats: HeroStat[]
}

export function HeroSection({ title, subtitle, primaryLabel, secondaryLabel, stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.35),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(168,85,247,0.35),transparent_45%)] px-6 py-10 text-white shadow-xl sm:px-10">
      <span className="neon-circle neon-circle--sky left-[-40px] top-6" />
      <span className="neon-circle neon-circle--violet right-[-60px] top-16" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Startup Platform</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-sky-400">
              {primaryLabel}
            </button>
            <button className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              {secondaryLabel}
            </button>
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <div className="dot-nav">
                <span className="active" />
                <span />
                <span />
                <span />
              </div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/50">01</span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-2xl px-4 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
