import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../modules/auth/store/authSlice'
import {
  chatSocketUrl,
  listConversations,
  listMessages,
  type ChatMessage,
  type ConversationSummary,
} from '../services/chat'

export function MainLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const chatSocketRef = useRef<Socket | null>(null)
  const conversationRef = useRef<string | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const initials = useMemo(() => {
    const name = user?.fullName ?? 'Guest'
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [user?.fullName])

  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!chatOpen || !user?.id) {
      return
    }
    listConversations(user.id)
      .then((data) => {
        setConversations(data)
        if (!activeConversationId && data.length > 0) {
          setActiveConversationId(data[0].id)
        }
      })
      .catch(() => setConversations([]))
  }, [chatOpen, user?.id, activeConversationId])

  useEffect(() => {
    if (!chatOpen || !user?.id) {
      return
    }
    if (!chatSocketRef.current) {
      chatSocketRef.current = io(chatSocketUrl, { transports: ['websocket'] })
      chatSocketRef.current.on('message:new', (payload: ChatMessage) => {
        if (payload.conversationId !== conversationRef.current) {
          return
        }
        setMessages((prev) => [...prev, payload])
        if (payload.senderId !== user?.id) {
          chatSocketRef.current?.emit('message:read', {
            conversationId: payload.conversationId,
            userId: user?.id,
          })
        }
      })
    }
    return () => {
      chatSocketRef.current?.disconnect()
      chatSocketRef.current = null
    }
  }, [chatOpen, user?.id])

  useEffect(() => {
    if (!chatOpen || !activeConversationId || !user?.id) {
      conversationRef.current = null
      setMessages([])
      return
    }
    conversationRef.current = activeConversationId
    listMessages(activeConversationId).then((data) => setMessages(data))
    chatSocketRef.current?.emit('join', { conversationId: activeConversationId, userId: user.id })
  }, [chatOpen, activeConversationId, user?.id])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSendMessage = () => {
    if (!activeConversationId || !user?.id || !messageInput.trim()) {
      return
    }
    chatSocketRef.current?.emit('message:send', {
      conversationId: activeConversationId,
      senderId: user.id,
      content: messageInput.trim(),
    })
    setMessageInput('')
    setTimeout(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
    }, 0)
  }

  return (
    <div className="min-h-screen bg-[#0b0f1f] text-white">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(88,101,242,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_45%)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-lg font-semibold tracking-wide"
          >
            Connect.EXE
          </button>
          <div className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <button onClick={() => navigate('/hall-of-fame')} className="transition hover:text-white">
              Sanh danh du
            </button>
            <button onClick={() => navigate('/projects')} className="transition hover:text-white">
              Du an
            </button>
            <button onClick={() => navigate('/forum')} className="transition hover:text-white">
              Dien dan
            </button>
            <button onClick={() => navigate('/resources')} className="transition hover:text-white">
              Kho hoc lieu
            </button>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:border-white/60"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName ?? 'User'}
                  className="h-7 w-7 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[10px] font-semibold text-white/80">
                  {initials}
                </span>
              )}
              <span className="hidden text-xs uppercase tracking-[0.2em] text-white/80 sm:inline">
                {user?.fullName ?? 'Guest'}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0b0f1f] p-2 shadow-xl">
                <div className="px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/50">
                  {user?.fullName ?? 'Guest'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/profile')
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/projects')
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Projects
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      {user && (
        <>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg transition hover:scale-105"
            aria-label="Chat"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10.5h8m-8 3h5m-5.5 7.5 2.5-3h7a5 5 0 0 0 5-5v-3a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h.5Z"
              />
            </svg>
          </button>
          {chatOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4"
              onClick={() => setChatOpen(false)}
            >
              <div
                className="flex h-[420px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1f] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex w-1/3 flex-col border-r border-white/10 bg-white/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/50">Tro chuyen</div>
                    <button
                      type="button"
                      onClick={() => setChatOpen(false)}
                      className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      Dong
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 pb-3">
                    {conversations.length === 0 && (
                      <div className="px-3 py-4 text-xs text-white/50">Chua co cuoc hoi thoai.</div>
                    )}
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setActiveConversationId(conversation.id)}
                        className={`mb-2 w-full rounded-2xl border px-3 py-3 text-left text-sm transition ${
                          activeConversationId === conversation.id
                            ? 'border-sky-400/40 bg-sky-500/10 text-white'
                            : 'border-white/10 bg-black/30 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">Conversation</div>
                        <div className="mt-1 font-semibold text-white">
                          {conversation.id.slice(0, 8)}
                        </div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex w-2/3 flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-white/50">Hoi thoai</div>
                      <div className="text-base font-semibold text-white">
                        {activeConversationId ? activeConversationId.slice(0, 8) : 'Chon cuoc hoi thoai'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChatOpen(false)}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      Dong
                    </button>
                  </div>
                  <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.length === 0 && (
                      <div className="text-sm text-white/50">Chua co tin nhan.</div>
                    )}
                    {messages.map((message) => {
                      const isOwn = message.senderId === user.id
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isOwn
                              ? 'ml-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                              : 'bg-black/40 text-white/80'
                          }`}
                        >
                          <div>{message.content}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t border-white/10 p-4">
                    <div className="flex gap-3">
                      <input
                        value={messageInput}
                        onChange={(event) => setMessageInput(event.target.value)}
                        className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
                        placeholder="Type your message"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleSendMessage()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
