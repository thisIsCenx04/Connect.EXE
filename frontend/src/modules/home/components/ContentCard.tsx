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
    <article className={`flip-card h-full rounded-3xl border shadow-sm ${toneClasses}`}>
      <div className="flip-card-inner h-full">
        <div className="flip-card-face flex h-full flex-col gap-4 p-5">
          <div className="card-cover h-40 w-full rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-white">
            <img src="/vite.svg" alt="" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
              <span className={textMuted}>{title}</span>
              {date ? <span className={textMuted}>{date}</span> : null}
            </div>
            <CardTitle className={textBody}>{body}</CardTitle>
            <CardBody className={textDescription}>{description}</CardBody>
          </div>
          <TagList tags={tags} />
        </div>
        <div className="flip-card-face flip-card-back flex h-full flex-col justify-between gap-4 p-5">
          <div className="space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${textMuted}`}>
              Card cover
            </p>
            <CardTitle className={textBody}>{body}</CardTitle>
            <CardBody className={textDescription}>
              {description}
            </CardBody>
          </div>
          <div>
            <p className={`text-xs uppercase tracking-[0.2em] ${textMuted}`}>Tags</p>
            <TagList tags={tags} />
          </div>
        </div>
      </div>
    </article>
  )
}
