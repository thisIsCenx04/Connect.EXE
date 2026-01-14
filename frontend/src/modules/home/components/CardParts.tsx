type CardTitleProps = {
  children: string
  className?: string
}

type CardBodyProps = {
  children: string
  className?: string
}

type TagListProps = {
  tags: string[]
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold text-slate-900 ${className ?? ''}`}>{children}</h3>
}

export function CardBody({ children, className }: CardBodyProps) {
  return <p className={`text-sm text-slate-600 ${className ?? ''}`}>{children}</p>
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
