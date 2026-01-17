import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { Logo } from '../components/Logo'
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
    <div className="page-shell text-white">
      <div className="app-sheen" aria-hidden="true" />
      <header className="glass-bar relative z-50">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8 px-8 py-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex shrink-0 items-center text-white"
          >
            <Logo size="sm" />
          </button>
          
          {/* Combined nav container with all items */}
          <nav className="hidden flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 lg:flex">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">
              <button onClick={() => navigate('/')} className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
                Trang chủ
              </button>
              <button onClick={() => navigate('/projects')} className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
                Sản phẩm
              </button>
              <button onClick={() => navigate('/forum')} className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
                Diễn đàn
              </button>
              <button onClick={() => navigate('/hall-of-fame')} className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
                Dự án
              </button>
              
              {/* Search input */}
              <div className="mx-2 flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-28 bg-transparent px-2 py-1 text-xs text-white placeholder-white/40 outline-none xl:w-36"
                />
                <button className="flex items-center justify-center text-white/60 transition hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </button>
              </div>
              
              <span className="text-white/30">|</span>
              <span className="whitespace-nowrap cursor-default px-3 py-2">Tin Tức</span>
              <span className="text-white/30">|</span>
              <button onClick={() => navigate('/projects')} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
                Khám phá dự án
              </button>
              <span className="text-white/30">|</span>
              <button onClick={() => navigate('/about')} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
                Về chúng tôi
              </button>
            </div>
          </nav>
          
          {/* Mobile nav */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 md:flex lg:hidden">
            <button onClick={() => navigate('/')} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
              Trang chủ
            </button>
            <button onClick={() => navigate('/projects')} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
              Sản phẩm
            </button>
            <button onClick={() => navigate('/forum')} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
              Diễn đàn
            </button>
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            {!user && (
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="hidden whitespace-nowrap rounded-full border border-violet-500/50 bg-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400 transition hover:bg-violet-500/20 md:inline-flex"
              >
                Sign Up
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName ?? 'User'}
                    className="h-7 w-7 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold text-white/80">
                    {initials}
                  </span>
                )}
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/80 sm:inline">
                  {user?.fullName ?? 'Guest'}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-1/2 mt-3 w-56 translate-x-1/2 rounded-2xl border border-white/10 bg-[#0a0d1d]/80 p-2 shadow-xl backdrop-blur-md">
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
                    Hồ sơ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/projects')
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                  >
                    Dự án
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      <footer className="relative z-10 mt-16 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-sm text-white/60">
                Nền tảng khởi nghiệp dành cho founders, mentors và nhà đầu tư.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Khám phá</p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <button onClick={() => navigate('/projects')} className="block text-left hover:text-white">Dự án</button>
                <button onClick={() => navigate('/hall-of-fame')} className="block text-left hover:text-white">Sảnh danh vọng</button>
                <button onClick={() => navigate('/forum')} className="block text-left hover:text-white">Diễn đàn</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Menu</p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <button onClick={() => navigate('/profile')} className="block text-left hover:text-white">Hồ sơ</button>
                <button onClick={() => navigate('/projects/mine')} className="block text-left hover:text-white">Dự án của tôi</button>
                <button onClick={() => navigate('/projects/new')} className="block text-left hover:text-white">Tạo dự án</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Địa chỉ văn phòng</p>
              <p className="mt-3 text-sm text-white/70">FPT University, Cần Thơ Campus</p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61581595885701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-xs uppercase tracking-[0.2em] text-white/40">© 2026 connect.exe</div>
        </div>
      </footer>
      {user && (
        <>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 btn-primary text-white shadow-lg transition hover:scale-105"
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
                className="flex h-[420px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d1d] shadow-2xl"
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
