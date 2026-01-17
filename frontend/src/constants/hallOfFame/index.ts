// Hall of Fame module constants

// Entry types
export const HALL_OF_FAME_TYPES = ['STARTUP', 'PERSON', 'PROJECT_STORY'] as const

// Hall of Fame page section content
export const HALL_OF_FAME_SECTIONS = {
  hero: {
    label: 'Sảnh Danh Vọng',
    title: 'Câu chuyện truyền cảm hứng',
    description: 'Bài viết nổi bật do admin tuyển chọn hoặc chuyển từ Sàn Dự Án.',
    createButton: 'Tạo bài viết',
  },
  stats: {
    posts: { label: 'Bài viết', suffix: '+' },
    people: { label: 'Nhân vật nổi bật', value: '12+' },
    projects: { label: 'Dự án truyền cảm hứng', value: '30+' },
  },
  filter: {
    label: 'Bộ lọc',
    allOption: 'Tất cả',
    applyButton: 'Áp dụng',
    loadingText: 'Đang tải...',
  },
  empty: {
    message: 'Chưa có bài viết Sảnh Danh Vọng.',
  },
  form: {
    title: 'Tạo bài viết mới',
    titleLabel: 'Tiêu đề',
    titlePlaceholder: 'Nhập tiêu đề bài viết',
    typeLabel: 'Loại bài viết',
    contentLabel: 'Nội dung',
    contentPlaceholder: 'Nhập nội dung bài viết...',
    submitButton: 'Đăng bài',
    cancelButton: 'Hủy',
  },
} as const

// Type display names
export const TYPE_DISPLAY_NAMES: Record<string, string> = {
  STARTUP: 'Startup',
  PERSON: 'Nhân vật',
  PROJECT_STORY: 'Câu chuyện dự án',
}
