import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import {
  listForumCategories,
  listForumPosts,
  type ForumCategory,
  type ForumPost,
  type ForumSort,
} from '../../../services/forum'

const fallbackCategories: ForumCategory[] = [
  { id: 'news', name: 'Tin Tức', slug: 'tin-tuc', sortOrder: 1 },
  { id: 'new-posts', name: 'Bài Đăng Mới', slug: 'bai-dang-moi', sortOrder: 2 },
  { id: 'qa', name: 'Hỏi Đáp & Tư Vấn', slug: 'hoi-dap-tu-van', sortOrder: 3 },
  { id: 'team', name: 'Tìm Kiếm Nhóm & Thành Viên', slug: 'tim-kiem-nhom-thanh-vien', sortOrder: 4 },
  { id: 'resources', name: 'Học Liệu & Templates', slug: 'hoc-lieu-templates', sortOrder: 5 },
  { id: 'skills', name: 'Kỹ Năng & Học Tập', slug: 'ky-nang-hoc-tap', sortOrder: 6 },
]

const formatDate = (value: string) => new Date(value).toLocaleDateString()

export function ForumCategoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [categories, setCategories] = useState<ForumCategory[]>(fallbackCategories)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<ForumSort>('NEW')

  const category = useMemo(
    () => categories.find((item) => item.slug === slug),
    [categories, slug],
  )

  const loadPosts = async (activeSort: ForumSort) => {
    if (!slug) {
      return
    }
    setLoading(true)
    try {
      const data = await listForumPosts({ categorySlug: slug, sort: activeSort })
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listForumCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data)
        }
      })
      .catch(() => null)
  }, [])

  useEffect(() => {
    loadPosts(sort)
  }, [slug, sort])

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              {category?.name ?? 'Forum'}
            </p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">
              {category?.name ?? 'Bài viết cộng đồng'}
            </h1>
            <p className="max-w-2xl text-sm text-white/70">
              Các bài đăng được sắp xếp theo chủ đề, cho phép bạn theo dõi những nội dung mới nhất và nổi bật.
            </p>
          </div>
          <Link
            to="/forum"
            className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Quay lại danh mục
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login')
                return
              }
              navigate(`/forum/create?category=${slug}`)
            }}
            className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
          >
            Đăng bài viết
          </button>
          {!user && (
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              Đăng nhập để đăng bài
            </span>
          )}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">Sắp xếp</span>
        {(['NEW', 'TOP'] as ForumSort[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSort(option)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              sort === option
                ? 'border-sky-400/60 bg-sky-500/10 text-white'
                : 'border-white/20 text-white/70 hover:border-white/50'
            }`}
          >
            {option === 'NEW' ? 'Mới nhất' : 'Nổi bật'}
          </button>
        ))}
        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
          {posts.length} bài viết
        </span>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5">
        {posts.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-white/60">
            Chưa có bài viết trong danh mục này.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/posts/${post.id}`}
                className="flex flex-col gap-3 p-5 text-white/80 transition hover:bg-white/5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-white">{post.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {post.categoryName ?? category?.name ?? 'Forum'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      User {post.authorId.slice(0, 6)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {post.commentCount} bình luận
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
