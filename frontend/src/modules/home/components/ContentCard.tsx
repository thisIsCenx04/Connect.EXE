import { CardBody, CardTitle, TagList } from './CardParts'

type ContentCardProps = {
  title: string
  body: string
  date?: string
  description: string
  tags: string[]
  tone?: 'light' | 'dark'
}

export function ContentCard({ title, body, date, description, tags, tone = 'light' }: ContentCardProps) {
  const toneClasses =
    tone === 'dark' ? 'card-neo text-white' : 'card-surface text-white'

  const textMuted = 'text-white/50'

  return (
    <article className={`h-full rounded-3xl p-5 shadow-xl ${toneClasses}`}>
      <div className="space-y-4">
        <div className="card-cover relative h-40 w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.4),transparent_45%),linear-gradient(135deg,#0b1228,#101632)]">
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
            {title}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
            <span className={textMuted}>{title}</span>
            {date ? <span className={textMuted}>{date}</span> : null}
          </div>
          <CardTitle>{body}</CardTitle>
          <CardBody>{description}</CardBody>
        </div>
        <TagList tags={tags} />
      </div>
    </article>
  )
}
