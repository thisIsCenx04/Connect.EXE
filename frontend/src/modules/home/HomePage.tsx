import { Link } from 'react-router-dom'

// Hero Banner Images
const heroBanner = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop&q=80'

// Partner logos (placeholder)
const partnerLogos = [
  { name: 'FPT', logo: '🏢' },
  { name: 'VNG', logo: '🎮' },
  { name: 'VinGroup', logo: '🏛️' },
  { name: 'VNPT', logo: '📡' },
  { name: 'Viettel', logo: '📶' },
  { name: 'Momo', logo: '💳' },
]

// Stats data
const statsData = [
  { value: '50+', label: 'Hệ thống workshop toàn quốc' },
  { value: '100+', label: 'Cố vấn chuyên gia' },
  { value: '20+', label: 'Đối tác doanh nghiệp' },
  { value: '500+', label: 'Dự án đã hỗ trợ' },
  { value: '50+', label: 'Sự kiện mỗi năm' },
  { value: '100+', label: 'Giải thưởng' },
]

// Featured projects 2025
const featuredProjects2025 = [
  {
    id: '1',
    title: 'DiMO',
    subtitle: 'Ứng dụng thanh toán thông minh',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    id: '2',
    title: 'FPT Edu Experience Space',
    subtitle: 'Không gian trải nghiệm giáo dục',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'AITHENOS',
    subtitle: 'Giải nhất cuộc thi AI 2025',
    image: 'https://images.unsplash.com/photo-1677442135136-760c813dce39?w=600&auto=format&fit=crop&q=80',
    badge: 'GIẢI NHẤT',
  },
  {
    id: '4',
    title: 'BizTalk',
    subtitle: 'Nền tảng kết nối doanh nghiệp',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop&q=80',
  },
]

// Other notable projects
const otherProjects = [
  {
    id: '5',
    title: 'Best Forex Trading Platform',
    category: 'Fintech',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    title: 'Top 15 Innovation',
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '7',
    title: 'Smart City Solution',
    category: 'IoT',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&auto=format&fit=crop&q=80',
  },
]

// Startup products 2025
const startupProducts = [
  {
    id: '8',
    title: 'Nhóm sinh viên làm mường mưa sinh học từ vỏ quất',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '9',
    title: 'Quản đội khởi nghiệp',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '10',
    title: 'Top 12 Innovation Award',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '11',
    title: 'AI Healthcare Solution',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80',
  },
]

// Hall of Fame stories
const hallOfFameStories = [
  {
    id: '1',
    title: 'From dorm room to demo day',
    author: 'Nguyễn Văn A',
    description: 'Câu chuyện từ ký túc xá đến ngày demo - hành trình của một startup sinh viên.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'How a pivot unlocked traction',
    author: 'Trần Thị B',
    description: 'Bài học từ việc pivot sản phẩm và tìm ra product-market fit.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Building for impact',
    author: 'Lê Văn C',
    description: 'Xây dựng startup với mục tiêu tạo ra giá trị xã hội.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80',
  },
]

export function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10">
        <div className="relative aspect-[21/9] w-full">
          <img
            src={heroBanner}
            alt="Made in Vietnam"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 md:px-16">
            <div className="space-y-4">
              <h1 className="display-font text-4xl font-bold text-white md:text-6xl lg:text-7xl">
                MADE IN<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  VIETNAM
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statsData.map((stat, index) => (
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

      {/* Partner Logos */}
      <section className="space-y-4">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-white/50">
          Đối tác đồng hành
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {partnerLogos.map((partner) => (
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
              src={featuredProjects2025[0].image}
              alt={featuredProjects2025[0].title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="display-font text-4xl font-bold text-white md:text-5xl">
                {featuredProjects2025[0].title}
              </h2>
              <p className="mt-2 text-sm text-white/70">{featuredProjects2025[0].subtitle}</p>
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
          {featuredProjects2025.slice(1).map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
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
            </Link>
          ))}
        </div>
      </section>

      {/* Other Notable Projects */}
      <section className="space-y-6">
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
          {otherProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group card-surface overflow-hidden rounded-2xl"
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
            </Link>
          ))}
        </div>
      </section>

      {/* Startup Products 2025 */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
            Sản phẩm
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Sản Phẩm Khởi Nghiệp<br />Tiêu Biểu 2025
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {startupProducts.map((product) => (
            <Link
              key={product.id}
              to={`/projects/${product.id}`}
              className="group card-surface overflow-hidden rounded-2xl"
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
            </Link>
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
          {hallOfFameStories.map((story) => (
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
      <section className="card-neo overflow-hidden rounded-[32px]">
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
