// Forum module constants

import type { ForumCategory } from '../../services/forum'

// Fallback categories when API fails
export const FALLBACK_CATEGORIES: ForumCategory[] = [
  { id: 'news', name: 'Tin Tức', slug: 'tin-tuc', sortOrder: 1 },
  { id: 'new-posts', name: 'Bài Đăng Mới', slug: 'bai-dang-moi', sortOrder: 2 },
  { id: 'qa', name: 'Hỏi Đáp & Tư Vấn', slug: 'hoi-dap-tu-van', sortOrder: 3 },
  { id: 'team', name: 'Tìm Kiếm Nhóm & Thành Viên', slug: 'tim-kiem-nhom-thanh-vien', sortOrder: 4 },
  { id: 'resources', name: 'Học Liệu & Templates', slug: 'hoc-lieu-templates', sortOrder: 5 },
  { id: 'skills', name: 'Kỹ Năng & Học Tập', slug: 'ky-nang-hoc-tap', sortOrder: 6 },
]

// Forum page section content
export const FORUM_SECTIONS = {
  hero: {
    label: 'Forum',
    title: 'Diễn đàn kết nối cộng đồng',
    description: 'Khám phá các chủ đề nổi bật, đặt câu hỏi và chia sẻ kỹ năng để kết nối với cộng đồng startup.',
    badge: 'Cập nhật mới mỗi ngày',
  },
  categories: {
    label: 'Categories',
    title: 'Chủ đề nổi bật',
    viewButton: 'Xem bài viết',
    countSuffix: 'mục',
  },
  createPost: {
    title: 'Tạo bài viết mới',
    categoryLabel: 'Danh mục',
    categoryPlaceholder: 'Chọn danh mục',
    titleLabel: 'Tiêu đề',
    titlePlaceholder: 'Nhập tiêu đề bài viết',
    contentLabel: 'Nội dung',
    contentPlaceholder: 'Nhập nội dung bài viết...',
    submitButton: 'Đăng bài',
    cancelButton: 'Hủy',
  },
} as const
