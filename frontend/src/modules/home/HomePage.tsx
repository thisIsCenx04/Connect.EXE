import { useAppSelector } from '../../app/hooks'
import { ContentCard } from './components/ContentCard'
import { HeroSection } from './components/HeroSection'
import { SectionHeading } from './components/SectionHeading'
import {
  featuredProjects,
  heroContent,
  hofStories,
  resourceHighlights,
  upcomingEvents,
} from './data'

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="space-y-16 pb-12">
      <HeroSection
        title={heroContent.title}
        subtitle={heroContent.subtitle}
        primaryLabel={heroContent.primaryLabel}
        secondaryLabel={heroContent.secondaryLabel}
        stats={heroContent.stats}
      />

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Overview"
          title={`Welcome back${user?.fullName ? `, ${user.fullName}` : ''}`}
          subtitle="Track milestones, publish projects, and unlock mentoring or funding opportunities in one place."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Profile Snapshot
            </p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Your founder space</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Email: {user?.email ?? 'N/A'}</p>
              <p>Role: {user?.role ?? 'USER'}</p>
              <p>Status: Verified when your KYC is approved.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Next Steps</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Launch your next move</h3>
            <p className="mt-3 text-sm text-slate-600">
              Publish a project, request review, and start building traction with curated feedback.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                New project
              </button>
              <button className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                View dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Marketplace"
          title="Featured projects"
          subtitle="Explore projects that are ready for feedback, mentorship, or funding conversations."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project) => (
            <ContentCard key={project.body} {...project} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Hall of Fame"
          title="Stories worth highlighting"
          subtitle="Curated journeys and standout founders approved by the admin team."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {hofStories.map((story) => (
            <ContentCard key={story.body} {...story} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Startup Hub"
          title="Events and competitions"
          subtitle="Join workshops, competitions, and ecosystem updates curated for founders."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => (
            <ContentCard key={event.body} {...event} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Resources"
          title="Founder playbooks"
          subtitle="Templates and learning materials to help you move faster."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {resourceHighlights.map((resource) => (
            <ContentCard key={resource.body} {...resource} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Contact</p>
            <h3 className="mt-3 text-2xl font-semibold">Need help from admin?</h3>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Reach the platform team via Facebook or Messenger for support, approvals, or content updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900">
              Facebook Page
            </button>
            <button className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Messenger
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
