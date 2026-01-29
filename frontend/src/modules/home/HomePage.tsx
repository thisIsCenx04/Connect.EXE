import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PARTNER_LOGOS,
  STATS_DATA,
  FEATURED_PROJECTS_2025,
  OTHER_PROJECTS,
  STARTUP_PRODUCTS,
  HALL_OF_FAME_STORIES,
} from '@/constants/home'
import { fetchContentList, fetchResourceList, type ContentItem, type ResourceItem } from '@/services/content'
import { HeroCarousel } from './components/HeroCarousel'
import { upcomingEvents, resourceHighlights } from './data'

const fallbackHubItems: ContentItem[] = upcomingEvents.map((item, index) => ({
  id: `fallback-event-${index}`,
  type: 'EVENT',
  status: 'PUBLISHED',
  title: item.title,
  summary: item.description,
  tags: item.tags,
  startAt: item.date,
}))

const fallbackResourceItems: ResourceItem[] = resourceHighlights.map((item, index) => ({
  id: `fallback-resource-${index}`,
  title: item.title,
  description: item.description,
  type: 'LINK',
  url: '/resources',
  tags: item.tags,
  status: 'PUBLISHED',
}))

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

export function HomePage() {
  const [hubItems, setHubItems] = useState<ContentItem[]>([])
  const [resourceItems, setResourceItems] = useState<ResourceItem[]>([])

  useEffect(() => {
    let active = true
    Promise.all([fetchContentList('EVENT'), fetchContentList('COMPETITION')])
      .then(([events, competitions]) => {
        if (!active) return
        setHubItems([...events, ...competitions])
      })
      .catch(() => {
        if (!active) return
        setHubItems([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchResourceList()
      .then((data) => {
        if (!active) return
        setResourceItems(data)
      })
      .catch(() => {
        if (!active) return
        setResourceItems([])
      })
    return () => {
      active = false
    }
  }, [])

  const hubHighlights = (hubItems.length > 0 ? hubItems : fallbackHubItems)
    .slice()
    .sort((a, b) => {
      const aDate = Date.parse(a.startAt ?? a.publishedAt ?? a.createdAt ?? '') || 0
      const bDate = Date.parse(b.startAt ?? b.publishedAt ?? b.createdAt ?? '') || 0
      return bDate - aDate
    })
    .slice(0, 3)

  const resourceHighlightsView = (resourceItems.length > 0 ? resourceItems : fallbackResourceItems)
    .slice(0, 3)

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner Section */}
      <HeroCarousel />

      {/* Stats Section */}
      <section className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {STATS_DATA.map((stat, index) => (
            <div
              key={index}
              className="card-surface rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Startup Hub Highlights */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Trung tâm Startup</p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Sự kiện & cuộc thi sắp tới
            </h2>
          </div>
          <Link
            to="/news"
            className="hidden rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 md:inline-flex"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {hubHighlights.map((item) => {
            const isFallback = item.id.startsWith('fallback-')
            return (
              <Link
                key={item.id}
                to={isFallback ? '/news' : `/news/${item.id}`}
                className="group card-surface overflow-hidden rounded-2xl border border-white/10 transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.coverUrl ?? 'https://picsum.photos/seed/startuphub/600/400'}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                    <span>{item.type}</span>
                    <span>- {formatDate(item.startAt ?? item.publishedAt)}</span>
                    {item.location ? <span>- {item.location}</span> : null}
                  </div>
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  {item.summary && <p className="text-sm text-white/60 line-clamp-2">{item.summary}</p>}
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Resource Library Highlights */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Thư viện tài nguyên</p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Tài nguyên mới nhất cho founder
            </h2>
          </div>
          <Link
            to="/resources"
            className="hidden rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 md:inline-flex"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {resourceHighlightsView.map((item) => {
            const isFallback = item.id.startsWith('fallback-')
            return (
              <Link
                key={item.id}
                to={isFallback ? '/resources' : `/resources/${item.id}`}
                className="card-neo rounded-3xl border border-white/10 p-5 transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                  <span>{item.type}</span>
                  <span>{item.tags?.[0] ?? 'Tài nguyên'}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm text-white/60 line-clamp-2">{item.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Partner Logos */}
      <section className="space-y-4">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-white/50">
          Đối tác đồng hành
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {PARTNER_LOGOS.map((partner) => (
            <div
              key={partner.name}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl"
              title={partner.name}
            >
              {partner.logo}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Project - DiMO */}
      <section className="card-neo overflow-hidden rounded-[32px]">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-video lg:aspect-auto">
            <img
              src={FEATURED_PROJECTS_2025[0].image}
              alt={FEATURED_PROJECTS_2025[0].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="display-font text-4xl font-bold text-white md:text-5xl">
                {FEATURED_PROJECTS_2025[0].title}
              </h2>
              <p className="mt-2 text-sm text-white/70">{FEATURED_PROJECTS_2025[0].subtitle}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
          <div className="space-y-6 p-8 lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
                Dự án nổi bật
              </p>
              <h3 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                Dự án khởi nghiệp<br />tiêu biểu năm 2025
              </h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Đội dự án đến từ Trường Đại học Khoa học Tự Nhiên – ĐHQG-HCM cùng các sinh viên KHTN, đóng góp đã được vinh danh là Top dự án khởi nghiệp tiêu biểu 2025.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Xem chi tiết
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROJECTS_2025.slice(1).map((project) => (
            <div
              key={project.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {project.badge && (
                <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                  {project.badge}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <p className="mt-1 text-sm text-white/60">{project.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Notable Projects */}
      <section id="featured-projects" className="space-y-6 scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              Khám phá thêm
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Một Số Dự Án Tiêu Biểu Khác
            </h2>
          </div>
          <Link
            to="/projects"
            className="hidden rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 md:inline-flex"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {OTHER_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer card-surface overflow-hidden rounded-2xl transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {project.category}
                </span>
                <h3 className="mt-1 font-semibold text-white">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Startup Products 2025 */}
      <section id="startup-products" className="space-y-6 scroll-mt-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
            Sản phẩm
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Sản Phẩm Khởi Nghiệp<br />Tiêu Biểu 2025
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STARTUP_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer card-surface overflow-hidden rounded-2xl transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-white line-clamp-2">{product.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hall of Fame Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              Sảnh danh vọng
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Những Câu Chuyện Truyền Cảm Hứng
            </h2>
          </div>
          <Link
            to="/hall-of-fame"
            className="hidden rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 md:inline-flex"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HALL_OF_FAME_STORIES.map((story) => (
            <Link
              key={story.id}
              to={`/hall-of-fame/${story.id}`}
              className="group card-neo overflow-hidden rounded-2xl"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-white">{story.title}</h3>
                <p className="text-sm text-white/60 line-clamp-2">{story.description}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-400">{story.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="card-neo overflow-hidden rounded-[32px] scroll-mt-24">
        <div className="relative px-8 py-12 text-center md:px-16 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20" />
          <div className="relative space-y-6">
            <h2 className="display-font text-3xl font-bold text-white md:text-4xl">
              Đăng Ký Dự Án Của Bạn Ngay Bây Giờ
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-white/70">
              Thử Nghiệm Đăng Ký Dự Án Khởi Nghiệp Tại Đây
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/projects/new"
                className="rounded-full btn-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
              >
                Đăng ký tại đây
              </Link>
              <Link
                to="/projects"
                className="rounded-full btn-ghost px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
              >
                Khám phá
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
