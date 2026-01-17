import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import {
  createForumPost,
  listForumCategories,
  type ForumCategory,
} from '../../../services/forum'
import { FALLBACK_CATEGORIES } from '@/constants/forum'

export function ForumCreatePostPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('category')
  const user = useAppSelector((state) => state.auth.user)

  const [categories, setCategories] = useState<ForumCategory[]>([...FALLBACK_CATEGORIES])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    listForumCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data)
          // Set default category from URL param
          if (categorySlug) {
            const found = data.find((c) => c.slug === categorySlug)
            if (found) {
              setSelectedCategoryId(found.id)
            }
          }
        } else if (categorySlug) {
          const found = FALLBACK_CATEGORIES.find((c) => c.slug === categorySlug)
          if (found) {
            setSelectedCategoryId(found.id)
          }
        }
      })
      .catch(() => {
        if (categorySlug) {
          const found = FALLBACK_CATEGORIES.find((c) => c.slug === categorySlug)
          if (found) {
            setSelectedCategoryId(found.id)
          }
        }
      })
  }, [categorySlug])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      setError('Vui lòng chọn danh mục.')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await createForumPost({
        categoryId: selectedCategoryId,
        title: title.trim(),
        content: content.trim(),
      })
      // Navigate back to category page
      const slug = selectedCategory?.slug ?? categorySlug
      if (slug) {
        navigate(`/forum/categories/${slug}`)
      } else {
        navigate('/forum')
      }
    } catch {
      setError('Không thể đăng bài viết. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (categorySlug) {
      navigate(`/forum/categories/${categorySlug}`)
    } else {
      navigate('/forum')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              Diễn đàn
            </p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">
              Đăng bài viết mới
            </h1>
            <p className="max-w-2xl text-sm text-white/70">
              Chia sẻ ý tưởng, câu hỏi hoặc thông tin hữu ích với cộng đồng.
            </p>
          </div>
          <Link
            to={categorySlug ? `/forum/categories/${categorySlug}` : '/forum'}
            className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Quay lại
          </Link>
        </div>
      </section>

      {/* Form */}
      <section className="card-surface rounded-3xl p-6 md:p-10">
        <div className="space-y-6">
          {/* Category Select */}
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Danh mục</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          {/* Title Input */}
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tiêu đề</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
              placeholder="Chia sẻ ý tưởng của bạn"
            />
          </label>

          {/* Content Textarea */}
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Nội dung</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-sky-400/60 focus:outline-none"
              placeholder="Viết thêm chi tiết về bài đăng..."
            />
          </label>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
            >
              {loading ? 'Đang gửi...' : 'Đăng bài viết'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-full btn-ghost px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
            >
              Hủy
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
