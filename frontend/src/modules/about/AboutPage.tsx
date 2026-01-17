import { Logo } from '../../components/Logo'

// Team members data
const teamMembers = [
  {
    name: 'Nghê Kim Ngân',
    role: 'CEO',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Nguyễn Hoàng Anh Tuấn',
    role: 'Chief Design Officer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lê Tô Thái An',
    role: 'Chief Product Officer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bùi Võ Trung Tín',
    role: 'Chief Technology Officer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Nguyễn Thùy Dung',
    role: 'Chief Communications Officer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
  },
]

export function AboutPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section with Logo */}
      <section className="card-neo overflow-hidden rounded-[32px] p-8 md:p-12">
        <div className="flex flex-col items-start gap-6">
          <Logo size="lg" />
          <p className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">Thành viên</h2>
          <p className="text-lg text-white/70">connect.exe</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {teamMembers.map((member) => (
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
      <section className="card-neo overflow-hidden rounded-[32px] p-8 md:p-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Tầm Nhìn và Sứ Mệnh</h2>
          
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
            non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </section>
    </div>
  )
}
