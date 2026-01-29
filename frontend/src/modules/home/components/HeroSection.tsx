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
    <section className="hero-grid relative overflow-hidden rounded-[32px] border border-white/10 px-6 py-10 text-white shadow-2xl sm:px-10">
      <span className="neon-circle neon-circle--sky left-[-40px] top-6" />
      <span className="neon-circle neon-circle--violet right-[-60px] top-16" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Nền tảng Startup</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">2025</span>
          </div>
          <h1 className="display-font text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              {primaryLabel}
            </button>
            <button className="rounded-full btn-ghost px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
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
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_45%),linear-gradient(135deg,#0b1228,#111836)]">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.1),rgba(56,189,248,0.25))]" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Nổi bật</p>
              <p className="mt-2 text-sm text-white">Tự chiến trên không: Từ đời thực đến phim ảnh</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`glass-panel rounded-2xl px-4 py-5 fade-up ${index === 1 ? 'delay-1' : index === 2 ? 'delay-2' : ''}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
