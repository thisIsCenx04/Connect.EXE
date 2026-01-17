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
  return <h3 className={`text-lg font-semibold text-white ${className ?? ''}`}>{children}</h3>
}

export function CardBody({ children, className }: CardBodyProps) {
  return <p className={`text-sm text-white/70 ${className ?? ''}`}>{children}</p>
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
