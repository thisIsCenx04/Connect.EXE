import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  fetchAiChatHistory,
  sendAiChat,
  uploadAiChatAttachment,
  type AiChatAttachment,
  type AiChatMessage,
} from '../../../services/ai'
import { useAppSelector } from '../../../app/hooks'
import { tokenStorage } from '../../../services/tokenStorage'

const MAX_STORED_MESSAGES = 500
const buildHistoryKey = (userId: string) => `connectexe_ai_chat_history_${userId}`
const isValidMessage = (value: unknown): value is AiChatMessage => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as { role?: string; content?: string }
  return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string'
}

export function AiChatPage() {
  const { accessToken, user } = useAppSelector((state) => state.auth)
  const userId = useMemo(() => {
    return user?.id ?? tokenStorage.getTokenSubject(accessToken)
  }, [accessToken, user?.id])
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<AiChatAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setMessages([])
      return () => {}
    }
    const raw = localStorage.getItem(buildHistoryKey(userId))
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setMessages(parsed.filter(isValidMessage).slice(-MAX_STORED_MESSAGES))
        }
      } catch {
        // ignore malformed cache
      }
    }

    fetchAiChatHistory(MAX_STORED_MESSAGES)
      .then((serverMessages) => {
        if (cancelled) {
          return
        }
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          setMessages(serverMessages.slice(-MAX_STORED_MESSAGES))
        }
      })
      .catch(() => null)

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      return
    }
    const payload = messages.slice(-MAX_STORED_MESSAGES)
    localStorage.setItem(buildHistoryKey(userId), JSON.stringify(payload))
  }, [messages, userId])

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      for (const file of files) {
        const uploaded = await uploadAiChatAttachment(file)
        setAttachments((prev) => [...prev, uploaded])
      }
    } catch {
      setUploadError('Tải lên thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleGửi = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) {
      return
    }
    setError(null)
    setUploadError(null)
    setInput('')
    const history = messages.slice(-12)
    const userMessage: AiChatMessage = { role: 'user', content: trimmed, attachments }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    try {
      const response = await sendAiChat({ message: trimmed, history, attachments })
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }])
    } catch {
      setError('Không thể nhận phản hồi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      setAttachments([])
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Trò chuyện AI</p>
        <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Trò chuyện trợ lý startup</h1>
        <p className="max-w-2xl text-sm text-white/70">Hỏi bất cứ điều gì về startup, sản phẩm hoặc thị trường của bạn. Trợ lý phân tích từng yêu cầu và phản hồi theo cấu trúc.</p>
      </header>

      <section className="card-surface flex h-[520px] flex-col rounded-3xl border border-white/10">
        <div ref={messagesRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.length === 0 && !loading && (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">Bắt đầu bằng câu hỏi như “Phân tích ý tưởng MVP cho ứng dụng giao hàng trong trường.”</div>
          )}
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
              <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                      : 'border border-white/10 bg-black/40 text-white/80'
                  }`}
                >
                  <div>{message.content}</div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className={`mt-3 space-y-2 ${isUser ? 'text-white' : 'text-white/80'}`}>
                      {message.attachments.map((attachment, attachmentIndex) => {
                        const isImage = attachment.contentType?.startsWith('image/')
                        return (
                          <div key={`${attachment.url}-${attachmentIndex}`} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2">
                            {isImage ? (
                              <a href={attachment.url} target="_blank" rel="noreferrer">
                                <img
                                  src={attachment.url}
                                  alt={attachment.name ?? 'tệp đính kèm'}
                                  className="h-24 w-24 rounded-lg object-cover"
                                />
                              </a>
                            ) : (
                              <a href={attachment.url} target="_blank" rel="noreferrer" className="text-xs underline">
                                {attachment.name ?? 'Tải tệp'}
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/60">
                Đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          {error && <div className="mb-2 text-sm text-rose-300">{error}</div>}
          {uploadError && <div className="mb-2 text-sm text-rose-300">{uploadError}</div>}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => {
                const isImage = attachment.contentType?.startsWith('image/')
                return (
                  <div
                    key={`${attachment.url}-${index}`}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80"
                  >
                    {isImage ? 'Ảnh' : 'Tệp'}
                    <span className="max-w-[140px] truncate">{attachment.name ?? 'tệp đính kèm'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white disabled:opacity-60"
              >
                {uploading ? 'Đang tải lên...' : 'Đính kèm'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-[56px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="Nhập yêu cầu..."
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleGửi()
                }
              }}
            />
            <button
              type="button"
              onClick={handleGửi}
              disabled={loading || uploading}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              Gửi
            </button>
          </div>
          <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">Nhấn Enter để gửi · Shift+Enter để xuống dòng</div>
        </div>
      </section>
    </div>
  )
}
