// Home module constants

// Hero Banner Image
export const HERO_BANNER_IMAGE = 'https://picsum.photos/seed/vietnam/1200/500'

// Partner logos
export const PARTNER_LOGOS: { name: string; logo: string }[] = [
  { name: 'FPT', logo: '🏢' },
  { name: 'VNG', logo: '🎮' },
  { name: 'VinGroup', logo: '🏛️' },
  { name: 'VNPT', logo: '📡' },
  { name: 'Viettel', logo: '📶' },
  { name: 'Momo', logo: '💳' },
]

// Stats data
export const STATS_DATA: { value: string; label: string }[] = [
  { value: '50+', label: 'Hệ thống workshop toàn quốc' },
  { value: '100+', label: 'Cố vấn chuyên gia' },
  { value: '20+', label: 'Đối tác doanh nghiệp' },
  { value: '500+', label: 'Dự án đã hỗ trợ' },
  { value: '50+', label: 'Sự kiện mỗi năm' },
  { value: '100+', label: 'Giải thưởng' },
]

// Featured projects 2025
export interface FeaturedProject {
  id: string
  title: string
  subtitle: string
  image: string
  featured?: boolean
  badge?: string
}

export const FEATURED_PROJECTS_2025: FeaturedProject[] = [
  {
    id: '1',
    title: 'DiMO',
    subtitle: 'Ứng dụng thanh toán thông minh',
    image: 'https://picsum.photos/seed/dimo/600/400',
    featured: true,
  },
  {
    id: '2',
    title: 'FPT Edu Experience Space',
    subtitle: 'Không gian trải nghiệm giáo dục',
    image: 'https://picsum.photos/seed/fptedu/600/400',
  },
  {
    id: '3',
    title: 'AITHENOS',
    subtitle: 'Giải nhất cuộc thi AI 2025',
    image: 'https://picsum.photos/seed/aithenos/600/400',
    badge: 'GIẢI NHẤT',
  },
  {
    id: '4',
    title: 'BizTalk',
    subtitle: 'Nền tảng kết nối doanh nghiệp',
    image: 'https://picsum.photos/seed/biztalk/600/400',
  },
]

// Other notable projects
export interface OtherProject {
  id: string
  title: string
  category: string
  image: string
}

export const OTHER_PROJECTS: OtherProject[] = [
  {
    id: '5',
    title: 'Best Forex Trading Platform',
    category: 'Fintech',
    image: 'https://picsum.photos/seed/forex/400/300',
  },
  {
    id: '6',
    title: 'Top 15 Innovation',
    category: 'Tech',
    image: 'https://picsum.photos/seed/innovation/400/300',
  },
  {
    id: '7',
    title: 'Smart City Solution',
    category: 'IoT',
    image: 'https://picsum.photos/seed/smartcity/400/300',
  },
]

// Startup products 2025
export interface StartupProduct {
  id: string
  title: string
  image: string
}

export const STARTUP_PRODUCTS: StartupProduct[] = [
  {
    id: '8',
    title: 'Nhóm sinh viên làm mường mưa sinh học từ vỏ quất',
    image: 'https://picsum.photos/seed/biotech/400/400',
  },
  {
    id: '9',
    title: 'Quản đội khởi nghiệp',
    image: 'https://picsum.photos/seed/team/400/400',
  },
  {
    id: '10',
    title: 'Top 12 Innovation Award',
    image: 'https://picsum.photos/seed/award/400/400',
  },
  {
    id: '11',
    title: 'AI Healthcare Solution',
    image: 'https://picsum.photos/seed/healthcare/400/400',
  },
]

// Hall of Fame stories
export interface HallOfFameStory {
  id: string
  title: string
  author: string
  description: string
  image: string
}

export const HALL_OF_FAME_STORIES: HallOfFameStory[] = [
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

// Section text content
export const HOME_SECTIONS = {
  featuredProject: {
    label: 'Dự án nổi bật',
    title: 'Dự án khởi nghiệp\ntiêu biểu năm 2025',
    description: 'Đội dự án đến từ Trường Đại học Khoa học Tự Nhiên – ĐHQG-HCM cùng các sinh viên KHTN, đóng góp đã được vinh danh là Top dự án khởi nghiệp tiêu biểu 2025.',
    buttonText: 'Xem chi tiết',
  },
  otherProjects: {
    label: 'Khám phá thêm',
    title: 'Một Số Dự Án Tiêu Biểu Khác',
    buttonText: 'Xem tất cả',
  },
  startupProducts: {
    label: 'Sản phẩm',
    title: 'Sản Phẩm Khởi Nghiệp\nTiêu Biểu 2025',
  },
  hallOfFame: {
    label: 'Sảnh danh vọng',
    title: 'Những Câu Chuyện Truyền Cảm Hứng',
    buttonText: 'Xem tất cả',
  },
  cta: {
    title: 'Đăng Ký Dự Án Của Bạn Ngay Bây Giờ',
    subtitle: 'Thử Nghiệm Đăng Ký Dự Án Khởi Nghiệp Tại Đây',
    primaryButton: 'Đăng ký tại đây',
    secondaryButton: 'Khám phá',
  },
  partners: {
    label: 'Đối tác đồng hành',
  },
} as const