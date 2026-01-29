// Project module constants

// Project stages
export const PROJECT_STAGES = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY'] as const

// Deal types
export const DEAL_TYPES = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM'] as const

// Link types
export const LINK_TYPES = ['WEBSITE', 'PITCH_DECK', 'DEMO', 'REPO', 'SOCIAL', 'OTHER'] as const

// Media roles
export const MEDIA_ROLES = ['COVER', 'GALLERY', 'DOCUMENT'] as const

// Industries list
export const INDUSTRIES = [
  'Fintech',
  'Edtech',
  'Healthtech',
  'E-commerce',
  'SaaS',
  'AI / Machine Learning',
  'IoT / Hardware',
  'Gaming',
  'Social Media',
  'Logistics / Supply Chain',
  'Proptech / Real Estate',
  'Agritech',
  'Clean Energy / Greentech',
  'Travel / Hospitality',
  'Food & Beverage',
  'Entertainment / Media',
  'Cybersecurity',
  'HR Tech',
  'Legal Tech',
  'Blockchain / Web3',
  'Khác',
] as const

export const COUNTRIES = [
  { code: 'VN', name: 'Vietnam' },
  { code: 'US', name: 'United States' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'AU', name: 'Australia' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
] as const

// Tags grouped by industry
export const TAGS_BY_INDUSTRY: Record<string, string[]> = {
  Fintech: ['Mobile Banking', 'Digital Payment', 'P2P Lending', 'Insurance', 'Wealth Management', 'Cryptocurrency', 'Neobank', 'BNPL'],
  Edtech: ['E-learning', 'LMS', 'Online Course', 'Tutoring', 'STEM', 'Language Learning', 'Corporate Training', 'Gamification'],
  Healthtech: ['Telemedicine', 'Wearables', 'Mental Health', 'Medical Devices', 'Health Analytics', 'EHR', 'Drug Discovery', 'Fitness'],
  'E-commerce': ['B2C', 'B2B', 'Marketplace', 'D2C', 'Dropshipping', 'Social Commerce', 'Subscription', 'Cross-border'],
  SaaS: ['CRM', 'ERP', 'Project Management', 'Collaboration', 'Marketing Automation', 'Analytics', 'DevOps', 'No-code'],
  'AI / Machine Learning': ['NLP', 'Computer Vision', 'Predictive Analytics', 'Chatbot', 'Generative AI', 'MLOps', 'AutoML', 'Recommendation'],
  'IoT / Hardware': ['Smart Home', 'Wearables', 'Industrial IoT', 'Sensors', 'Robotics', 'Connected Devices', 'Edge Computing'],
  Gaming: ['Mobile Game', 'PC/Console', 'Esports', 'Game Studio', 'Metaverse', 'Play-to-Earn', 'Game Streaming', 'VR Gaming'],
  'Social Media': ['Content Platform', 'Community', 'Influencer Marketing', 'Short Video', 'Messaging', 'Dating', 'Professional Network'],
  'Logistics / Supply Chain': ['Last Mile Delivery', 'Warehouse', 'Fleet Management', 'Freight', 'Inventory', 'Cold Chain', 'Returns'],
  'Proptech / Real Estate': ['Property Listing', 'Property Management', 'Smart Building', 'Co-living', 'Construction Tech', 'Mortgage'],
  Agritech: ['Farm Management', 'Precision Agriculture', 'Agri Marketplace', 'Vertical Farming', 'Food Traceability', 'Livestock'],
  'Clean Energy / Greentech': ['Solar', 'Wind', 'EV Charging', 'Energy Storage', 'Carbon Offset', 'Sustainability', 'Waste Management'],
  'Travel / Hospitality': ['OTA', 'Hotel Management', 'Experience', 'Business Travel', 'Vacation Rental', 'Travel Insurance'],
  'Food & Beverage': ['Food Delivery', 'Cloud Kitchen', 'Restaurant Tech', 'Food Marketplace', 'Meal Kit', 'Beverage', 'FoodTech'],
  'Entertainment / Media': ['Streaming', 'Podcast', 'News', 'Creator Economy', 'Live Events', 'Music', 'Video Production'],
  Cybersecurity: ['Identity Management', 'Threat Detection', 'Data Protection', 'Network Security', 'Compliance', 'Penetration Testing'],
  'HR Tech': ['Recruitment', 'Payroll', 'Employee Engagement', 'Performance Management', 'Learning', 'Remote Work', 'Benefits'],
  'Legal Tech': ['Contract Management', 'Legal Research', 'Compliance', 'E-signature', 'IP Management', 'Dispute Resolution'],
  'Blockchain / Web3': ['DeFi', 'NFT', 'DAO', 'Crypto Exchange', 'Layer 2', 'Smart Contract', 'Tokenization', 'Web3 Infrastructure'],
  Khác: ['General', 'B2B', 'B2C', 'Marketplace', 'Platform', 'Service', 'Product', 'Subscription'],
}

// Common tags (can be used across industries)
export const COMMON_TAGS = [
  'B2B', 'B2C', 'B2B2C', 'Marketplace', 'Platform', 'Mobile First', 'API-first',
  'Subscription', 'Freemium', 'Enterprise', 'SMB', 'Consumer', 'Open Source',
  'Vietnam', 'SEA', 'Global', 'Social Impact', 'Sustainability',
] as const

// Project page section content
export const PROJECT_SECTIONS = {
  hero: {
    label: 'Sàn Dự Án',
    title: 'Dự án khởi nghiệp tiêu biểu 2025',
    description: 'Khám phá các dự án nổi bật, theo dõi traction và kết nối với mentor hoặc nhà đầu tư phù hợp.',
    myProjectsButton: 'Dự án của tôi',
    createButton: 'Tạo dự án',
  },
  stats: {
    featured: { label: 'Dự án nổi bật', suffix: '+' },
    mentors: { label: 'Mentor đồng hành', value: '20+' },
    funding: { label: 'Vòng gọi vốn', value: '$12.4M' },
  },
  filter: {
    label: 'Bộ lọc',
    stage: { label: 'Giai đoạn', placeholder: 'Tất cả' },
    dealType: { label: 'Nhu cầu', placeholder: 'Tất cả' },
    industry: { label: 'Lĩnh vực', placeholder: 'Fintech, AI, Edu...' },
    applyButton: 'Áp dụng',
    loadingText: 'Đang tải...',
  },
  form: {
    title: 'Tạo dự án mới',
    editTitle: 'Chỉnh sửa dự án',
    nameLabel: 'Tên dự án',
    namePlaceholder: 'Nhập tên dự án',
    descriptionLabel: 'Mô tả',
    descriptionPlaceholder: 'Mô tả chi tiết về dự án...',
    stageLabel: 'Giai đoạn',
    dealTypeLabel: 'Nhu cầu',
    industryLabel: 'Lĩnh vực',
    countryLabel: 'Quốc gia',
    submitButton: 'Tạo dự án',
    updateButton: 'Cập nhật',
    cancelButton: 'Hủy',
  },
  empty: {
    message: 'Chưa có dự án nào.',
    createPrompt: 'Hãy tạo dự án đầu tiên của bạn!',
  },
} as const

// Stage display names
export const STAGE_DISPLAY_NAMES: Record<string, string> = {
  IDEA: 'Ý tưởng',
  MVP: 'MVP',
  REVENUE: 'Doanh thu',
  EXIT_READY: 'Sẵn sàng thoái vốn',
}

// Deal type display names
export const DEAL_TYPE_DISPLAY_NAMES: Record<string, string> = {
  COFOUNDER: 'Tìm Co-founder',
  FUNDING: 'Gọi vốn',
  SELL_PROJECT: 'Bán dự án',
  HIRE_TEAM: 'Tuyển dụng',
}

// Stages that require funding fields
export const FUNDING_REQUIRED_STAGES = ['MVP', 'REVENUE', 'EXIT_READY'] as const

// Deal types that require funding fields
export const FUNDING_REQUIRED_DEAL_TYPES = ['FUNDING', 'SELL_PROJECT'] as const
