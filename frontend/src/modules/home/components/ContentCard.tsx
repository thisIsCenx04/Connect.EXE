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
    tone === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-200 bg-white text-slate-900'

  const textMuted = tone === 'dark' ? 'text-slate-300' : 'text-slate-500'
  const textBody = tone === 'dark' ? 'text-slate-100' : 'text-slate-800'
  const textDescription = tone === 'dark' ? 'text-slate-300' : 'text-slate-600'

  return (
    <article className={`flex h-full flex-col gap-4 rounded-3xl border p-5 shadow-sm ${toneClasses}`}>
      <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-white" />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
          <span className={textMuted}>{title}</span>
          {date ? <span className={textMuted}>{date}</span> : null}
        </div>
        <CardTitle className={textBody}>{body}</CardTitle>
        <CardBody className={textDescription}>{description}</CardBody>
      </div>
      <TagList tags={tags} />
    </article>
  )
}
