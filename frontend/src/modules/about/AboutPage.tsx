import { Logo } from '../../components/Logo'
import { TEAM_MEMBERS, ABOUT_SECTIONS } from '@/constants/about'

export function AboutPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section with Logo */}
      <section className="space-y-6">
        {/* Logo aligned left */}
        <Logo size="md" />
        
        {/* Description card with title inside */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-transparent p-8 backdrop-blur-sm md:p-12">
          <div className="absolute inset-0 bg-[rgba(15,18,35,0.7)]" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-bold text-white md:text-3xl">{ABOUT_SECTIONS.about.title}</h2>
            <p className="max-w-4xl text-base leading-relaxed text-white/90 md:text-lg">
              {ABOUT_SECTIONS.about.description[0]}
            </p>
            <p>
              {ABOUT_SECTIONS.about.description[1]}
            </p>
            <p>
              {ABOUT_SECTIONS.about.description[2]}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">{ABOUT_SECTIONS.team.title}</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.name} className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-white/50">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="card-neo overflow-hidden rounded-[20px] p-8 md:p-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white md:text-3xl">{ABOUT_SECTIONS.vision.title}</h2>
          
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            {ABOUT_SECTIONS.vision.content[0]}
          </p>
          
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            {ABOUT_SECTIONS.vision.content[1]}
          </p>
        </div>
      </section>
    </div>
  )
}
