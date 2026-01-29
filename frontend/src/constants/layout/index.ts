// Layout constants (Header, Footer, Navigation)

// Search data for global search
export interface SearchItem {
  title: string
  path: string
  section?: string
  keywords: string[]
}

export const SEARCH_DATA: SearchItem[] = [
  { title: 'Trang chủ', path: '/', keywords: ['home', 'trang chu', 'main'] },
  { title: 'Dự án', path: '/projects', keywords: ['project', 'du an', 'startup'] },
  { title: 'Diễn đàn', path: '/forum', keywords: ['forum', 'dien dan', 'thao luan', 'bài viết'] },
  { title: 'Sảnh danh vọng', path: '/hall-of-fame', keywords: ['hall of fame', 'sanh danh vong', 'vinh danh'] },
  { title: 'Công cụ AI', path: '/ai', keywords: ['ai', 'tools', 'assistant', 'analysis'] },
  { title: 'AI Chat', path: '/ai/chat', keywords: ['chat', 'assistant', 'analysis', 'openai'] },
  { title: 'Market Analyzer', path: '/ai/market', keywords: ['market', 'analysis', 'research'] },
  { title: 'Pitchdeck Assistant', path: '/ai/pitchdeck', keywords: ['pitch', 'deck', 'slides'] },
  { title: 'Project Evaluator', path: '/ai/evaluate', keywords: ['evaluate', 'score', 'project'] },
  { title: 'AI History', path: '/ai/history', keywords: ['history', 'ai runs', 'usage'] },
  { title: 'Tin tuc', path: '/news', keywords: ['news', 'tin tuc', 'startup hub', 'su kien', 'cuoc thi', 'trend'] },
  { title: 'Hoc lieu', path: '/resources', keywords: ['resource', 'hoc lieu', 'template', 'library'] },
  { title: 'Bảng giá', path: '/pricing', keywords: ['pricing', 'bang gia', 'subscription', 'upgrade'] },
  { title: 'Thanh toán', path: '/billing', keywords: ['billing', 'thanh toan', 'subscription'] },
  { title: 'Về chúng tôi', path: '/about', keywords: ['about', 've chung toi', 'gioi thieu'] },
  { title: 'Hồ sơ', path: '/profile', keywords: ['profile', 'ho so', 'tai khoan'] },
  { title: 'Tạo dự án mới', path: '/projects/new', keywords: ['tao du an', 'create project', 'moi'] },
  { title: 'Dự án của tôi', path: '/projects/mine', keywords: ['my projects', 'du an cua toi'] },
  { title: 'Một Số Dự Án Tiêu Biểu Khác', path: '/#featured-projects', section: 'featured-projects', keywords: ['kham pha', 'tieu bieu', 'featured', 'du an khac'] },
  { title: 'Sản Phẩm Khởi Nghiệp Tiêu Biểu 2025', path: '/#startup-products', section: 'startup-products', keywords: ['san pham', 'khoi nghiep', 'startup', '2025'] },
  { title: 'Đăng ký dự án', path: '/#cta-section', section: 'cta-section', keywords: ['dang ky', 'register', 'bat dau'] },
]

// Navigation items
export interface NavItem {
  label: string
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Dự án', path: '/projects' },
  { label: 'Diễn đàn', path: '/forum' },
  { label: 'Bảng giá', path: '/pricing' },
  { label: 'Sảnh danh vọng', path: '/hall-of-fame' },
]

export interface NavSecondaryItem {
  label: string
  path?: string | null
  action?: string
}

export const NAV_SECONDARY: NavSecondaryItem[] = [
  { label: 'Tin Tức', path: null }, // Placeholder, no link
  { label: 'Khám phá dự án', action: 'scrollToFeatured' },
  { label: 'Về chúng tôi', path: '/about' },
]

// Header content
export const HEADER_CONTENT = {
  searchPlaceholder: 'Tìm kiếm...',
  signUpButton: 'Sign Up',
  guest: 'Guest',
}

// Footer link item
export interface FooterLinkItem {
  label: string
  path: string
}

// Footer content
export const FOOTER_CONTENT = {
  description: 'Nền tảng khởi nghiệp dành cho founders, mentors và nhà đầu tư.',
  sections: {
    explore: {
      title: 'Khám phá',
      items: [
        { label: 'Dự án', path: '/projects' },
        { label: 'Bảng giá', path: '/pricing' },
        { label: 'Thanh toán', path: '/billing' },
        { label: 'Sảnh danh vọng', path: '/hall-of-fame' },
        { label: 'Diễn đàn', path: '/forum' },
        { label: 'Công cụ AI', path: '/ai' },
      ] as FooterLinkItem[],
    },
    menu: {
      title: 'Menu',
      items: [
        { label: 'Hồ sơ', path: '/profile' },
        { label: 'Dự án của tôi', path: '/projects/mine' },
        { label: 'Tạo dự án', path: '/projects/new' },
      ] as FooterLinkItem[],
    },
    office: {
      title: 'Địa chỉ văn phòng',
      address: 'FPT University, Cần Thơ Campus',
    },
  },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61581595885701',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  copyright: '© 2026 connect.exe',
}

// User menu items
export interface UserMenuItem {
  label: string
  path?: string
  action?: string
}

export const USER_MENU_ITEMS: UserMenuItem[] = [
  { label: 'Hồ sơ', path: '/profile' },
  { label: 'Dự án', path: '/projects' },
  { label: 'Thanh toán', path: '/billing' },
  { label: 'Đăng xuất', action: 'logout' },
]
