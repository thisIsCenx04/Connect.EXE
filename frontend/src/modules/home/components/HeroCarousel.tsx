import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_BANNERS, HERO_BANNER_IMAGE } from '@/constants/home'

export function HeroCarousel() {
  const navigate = useNavigate()
  const banners = HERO_BANNERS.length > 0 ? HERO_BANNERS : [
    { title: 'Made in Vietnam', subtitle: 'Hệ sinh thái khởi nghiệp kết nối', image: HERO_BANNER_IMAGE, cta: 'Khám phá', path: '/projects' },
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [banners.length])

  const active = banners[index]

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10">
      <div className="relative aspect-[21/9] w-full">
        <img
          src={active.image}
          alt={active.title}
          className="h-full w-full object-cover transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-16">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Highlights</p>
            <h1 className="display-font text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              {active.title}
            </h1>
            <p className="max-w-xl text-sm text-white/70 md:text-base">
              {active.subtitle}
            </p>
            <button
              type="button"
              onClick={() => navigate(active.path)}
              className="rounded-full btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              {active.cta}
            </button>
          </div>
        </div>
        <div className="absolute bottom-6 left-8 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full border transition ${
                idx === index ? 'border-white bg-white' : 'border-white/40 bg-white/20'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
