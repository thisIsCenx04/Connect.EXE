import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import {
  createForumPost,
  listForumCategories,
  listForumPosts,
  type ForumCategory,
  type ForumPost,
  type ForumSort,
} from '../../../services/forum'

const fallbackCategories: ForumCategory[] = [
  { id: 'news', name: 'Tin Tuc', slug: 'tin-tuc', sortOrder: 1 },
  { id: 'new-posts', name: 'Bai Dang Moi', slug: 'bai-dang-moi', sortOrder: 2 },
  { id: 'qa', name: 'Hoi Dap & Tu Van', slug: 'hoi-dap-tu-van', sortOrder: 3 },
  { id: 'team', name: 'Tim Kiem Nhom & Thanh Vien', slug: 'tim-kiem-nhom-thanh-vien', sortOrder: 4 },
  { id: 'resources', name: 'Hoc Lieu & Templates', slug: 'hoc-lieu-templates', sortOrder: 5 },
  { id: 'skills', name: 'Ky Nang & Hoc Tap', slug: 'ky-nang-hoc-tap', sortOrder: 6 },
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
  const [createOpen, setCreateOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createContent, setCreateContent] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

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

  const handleCreatePost = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!category?.id) {
      setCreateError('Khong tim thay danh muc.')
      return
    }
    if (!createTitle.trim() || !createContent.trim()) {
      setCreateError('Vui long nhap tieu de va noi dung.')
      return
    }
    setCreateError(null)
    setCreateLoading(true)
    try {
      await createForumPost({
        categoryId: category.id,
        title: createTitle.trim(),
        content: createContent.trim(),
      })
      setCreateTitle('')
      setCreateContent('')
      setCreateOpen(false)
      setSort('NEW')
      await loadPosts('NEW')
    } catch {
      setCreateError('Khong the dang bai viet. Vui long thu lai.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#1b2746,transparent_65%)] from-[#10162b] via-[#171236] to-[#0c0f1f] p-6 shadow-xl md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              {category?.name ?? 'Forum'}
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              {category?.name ?? 'Bai viet cong dong'}
            </h1>
            <p className="max-w-2xl text-sm text-white/70">
              Cac bai dang duoc sap xep theo chu de, cho phep ban theo doi nhung noi dung moi nhat va noi bat.
            </p>
          </div>
          <Link
            to="/forum"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
          >
            Quay lai categories
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
              setCreateOpen((prev) => !prev)
            }}
            className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
          >
            Dang bai viet
          </button>
          {!user && (
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              Dang nhap de dang bai
            </span>
          )}
        </div>
      </section>

      {createOpen && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Dang bai moi</p>
              <h2 className="text-lg font-semibold text-white">Chia se cung cong dong</h2>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
            >
              Dong form
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tieu de</span>
              <input
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                placeholder="Chia se y tuong cua ban"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Noi dung</span>
              <textarea
                value={createContent}
                onChange={(event) => setCreateContent(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                placeholder="Viet them chi tiet ve bai dang..."
              />
            </label>
          </div>
          {createError && (
            <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {createError}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={createLoading}
              className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
            >
              {createLoading ? 'Dang gui...' : 'Dang bai viet'}
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={createLoading}
              className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
            >
              Huy
            </button>
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">Sap xep</span>
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
            {option === 'NEW' ? 'Moi nhat' : 'Noi bat'}
          </button>
        ))}
        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
          {posts.length} bai viet
        </span>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5">
        {posts.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-white/60">
            Chua co bai viet trong danh muc nay.
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
                  {post.commentCount} comments
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
