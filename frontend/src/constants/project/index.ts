// Project module constants

// Project stages
export const PROJECT_STAGES = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY'] as const

// Deal types
export const DEAL_TYPES = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM'] as const

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
