import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listForumCategories, type ForumCategory } from '../../../services/forum'

const fallbackCategories: ForumCategory[] = [
  { id: 'news', name: 'Tin Tuc', slug: 'tin-tuc', sortOrder: 1 },
  { id: 'new-posts', name: 'Bai Dang Moi', slug: 'bai-dang-moi', sortOrder: 2 },
  { id: 'qa', name: 'Hoi Dap & Tu Van', slug: 'hoi-dap-tu-van', sortOrder: 3 },
  { id: 'team', name: 'Tim Kiem Nhom & Thanh Vien', slug: 'tim-kiem-nhom-thanh-vien', sortOrder: 4 },
  { id: 'resources', name: 'Hoc Lieu & Templates', slug: 'hoc-lieu-templates', sortOrder: 5 },
  { id: 'skills', name: 'Ky Nang & Hoc Tap', slug: 'ky-nang-hoc-tap', sortOrder: 6 },
]

export function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategory[]>(fallbackCategories)

  useEffect(() => {
    listForumCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data)
        }
      })
      .catch(() => null)
  }, [])

  return (
    <div className="space-y-10">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Forum</p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">Dien dan ket noi cong dong</h1>
            <p className="max-w-2xl text-sm text-white/70">
              Kham pha cac chu de noi bat, dat cau hoi va chia se ki nang de ket noi voi cong dong startup.
            </p>
          </div>
          <div className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70">
            Cap nhat moi moi ngay
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl rounded-[28px] card-surface p-6 shadow-xl md:p-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Categories</p>
            <h2 className="display-font mt-2 text-2xl font-semibold text-white">Chu de noi bat</h2>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {categories.length} muc
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/forum/categories/${category.slug}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 transition hover:border-white/40 hover:bg-white/10"
            >
              <span className="text-base font-semibold text-white">{category.name}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                Xem bai viet
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
