import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import {
  createForumComment,
  forumStreamUrl,
  getForumPost,
  listForumComments,
  voteForumPost,
  type ForumComment,
  type ForumPost,
} from '../../../services/forum'

const formatDateTime = (value: string) => new Date(value).toLocaleString()

export function ForumPostDetailPage() {
  const { id } = useParams()
  const user = useAppSelector((state) => state.auth.user)
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const lastVoteAt = useRef(0)
  const voteCooldownMs = 600

  const authorLabel = useMemo(() => {
    if (!post) {
      return ''
    }
    return `User ${post.authorId.slice(0, 6)}`
  }, [post])

  const loadPost = async () => {
    if (!id) {
      return
    }
    setLoading(true)
    try {
      const data = await getForumPost(id)
      setPost(data)
      const commentData = await listForumComments(id)
      setComments(commentData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPost()
  }, [id])

  useEffect(() => {
    if (!id) {
      return
    }
    const source = new EventSource(forumStreamUrl(id))
    source.addEventListener('comment', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as ForumComment
        setComments((prev) => {
          if (prev.some((item) => item.id === payload.id)) {
            return prev
          }
          setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current))
          return [...prev, payload]
        })
      } catch {
        return
      }
    })
    source.addEventListener('vote', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as ForumPost
        setPost((prev) => {
          if (!prev) {
            return payload
          }
          return {
            ...prev,
            upvoteCount: payload.upvoteCount,
            downvoteCount: payload.downvoteCount,
            commentCount: payload.commentCount,
          }
        })
      } catch {
        return
      }
    })
    source.onerror = () => {
      source.close()
    }
    return () => source.close()
  }, [id])

  const handleCommentSubmit = async () => {
    if (!id || !commentInput.trim()) {
      return
    }
    setCommentLoading(true)
    try {
      const newComment = await createForumComment(id, { content: commentInput.trim() })
      setComments((prev) => {
        if (prev.some((item) => item.id === newComment.id)) {
          return prev
        }
        setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current))
        return [...prev, newComment]
      })
      setCommentInput('')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleVote = async (vote: 'UP' | 'DOWN') => {
    if (!id || voteLoading) {
      return
    }
    const now = Date.now()
    if (now - lastVoteAt.current < voteCooldownMs) {
      return
    }
    lastVoteAt.current = now
    setVoteLoading(true)
    try {
      const updated = await voteForumPost(id, vote)
      setPost(updated)
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status !== 429) {
        throw error
      }
    } finally {
      setVoteLoading(false)
    }
  }

  if (!post && loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
        Đang tải bài viết...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
        Bài viết không tồn tại.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              {post.categoryName ?? 'Forum'}
            </p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-white/50">
              <span>{authorLabel}</span>
              <span>{formatDateTime(post.createdAt)}</span>
              <span>{post.commentCount} bình luận</span>
            </div>
          </div>
          <Link
            to={post.categorySlug ? `/forum/categories/${post.categorySlug}` : '/forum'}
            className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Quay lại
          </Link>
        </div>
        <div className="mt-6 space-y-4 text-sm text-white/70">
          {post.content.split('\n').map((line, index) => (
            <p key={`${post.id}-line-${index}`}>{line}</p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleVote('UP')}
            disabled={voteLoading}
            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200"
          >
            Upvote {post.upvoteCount}
          </button>
          <button
            type="button"
            onClick={() => handleVote('DOWN')}
            disabled={voteLoading}
            className="rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200"
          >
            Downvote {post.downvoteCount}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="display-font text-xl font-semibold text-white">Bình luận</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {comments.length} bình luận
          </span>
        </div>
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện.
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
              >
                <div className="flex flex-wrap items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span>User {comment.authorId.slice(0, 6)}</span>
                  <span>{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-white/70">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
        {user ? (
          <div className="card-surface rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Viết bình luận mới</p>
            <textarea
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white"
              placeholder="Chia sẻ ý kiến của bạn..."
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={commentLoading}
                className="rounded-full btn-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Đăng nhập để bình luận bài viết.
          </div>
        )}
      </section>
    </div>
  )
}
