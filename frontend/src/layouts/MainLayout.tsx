import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
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
import {
  SEARCH_DATA,
  FOOTER_CONTENT,
  type SearchItem,
} from '@/constants/layout'

type MobileMenuItem = {
  key: string
  label: string
  onClick: () => void
  className?: string
  show?: boolean
}

export function MainLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('main-theme') === 'light'
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null)

  const [chatOpen, setChatOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const chatSocketRef = useRef<Socket | null>(null)
  const conversationRef = useRef<string | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.classList.toggle('theme-light', isLight)
    window.localStorage.setItem('main-theme', isLight ? 'light' : 'dark')
  }, [isLight])

  // Check if current path matches nav item
  const isActivePath = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  const handleNavClick = useCallback(
    (path: string) => {
      setMobileMenuOpen(false)
      if (location.pathname === path) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      navigate(path)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    },
    [location.pathname, navigate]
  )

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    const lowerQuery = query.toLowerCase()
    const results = SEARCH_DATA.filter((item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.keywords.some((kw) => kw.includes(lowerQuery))
    )
    setSearchResults(results)
    setShowSearchDropdown(results.length > 0)
  }, [])

  // Handle search result click
  const handleSearchResultClick = useCallback(
    (item: SearchItem) => {
      setShowSearchDropdown(false)
      const keyword = item.title
      setSearchQuery('')

      if (item.section) {
        if (location.pathname !== '/') {
          navigate('/')
          setTimeout(() => {
            const element = document.getElementById(item.section!)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            if (keyword) {
              setTimeout(() => highlightKeyword(keyword), 300)
            }
          }, 100)
        } else {
          const element = document.getElementById(item.section)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          if (keyword) {
            setTimeout(() => highlightKeyword(keyword), 300)
          }
        }
      } else {
        navigate(item.path)
        if (keyword) {
          setTimeout(() => {
            highlightKeyword(keyword)
          }, 300)
        }
      }
    },
    [navigate, location.pathname]
  )

  // Function to highlight keyword on page
  const highlightKeyword = useCallback((keyword: string) => {
    if (!keyword) return

    document.querySelectorAll('.keyword-highlight').forEach((el) => {
      const parent = el.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el)
        parent.normalize()
      }
    })

    const lowerKeyword = keyword.toLowerCase()
    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const walker = document.createTreeWalker(
      mainContent,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.toLowerCase() || ''
          if (text.includes(lowerKeyword)) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        },
      }
    )

    const nodesToHighlight: { node: Text; startIndex: number }[] = []
    let currentNode = walker.nextNode()

    while (currentNode) {
      const text = currentNode.textContent?.toLowerCase() || ''
      const index = text.indexOf(lowerKeyword)
      if (index !== -1) {
        nodesToHighlight.push({ node: currentNode as Text, startIndex: index })
        break
      }
      currentNode = walker.nextNode()
    }

    if (nodesToHighlight.length > 0) {
      const { node, startIndex } = nodesToHighlight[0]
      const originalText = node.textContent || ''
      const matchedText = originalText.substring(startIndex, startIndex + keyword.length)

      const before = document.createTextNode(originalText.substring(0, startIndex))
      const after = document.createTextNode(originalText.substring(startIndex + keyword.length))

      const highlightSpan = document.createElement('span')
      highlightSpan.className = 'keyword-highlight'
      highlightSpan.textContent = matchedText

      const parent = node.parentNode
      if (parent) {
        parent.insertBefore(before, node)
        parent.insertBefore(highlightSpan, node)
        parent.insertBefore(after, node)
        parent.removeChild(node)

        highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' })

        const removeHighlight = (e: MouseEvent) => {
          const target = e.target as HTMLElement
          if (!target.closest('a, button, input, select, textarea')) {
            highlightSpan.classList.add('keyword-highlight-fade')
            setTimeout(() => {
              const parent2 = highlightSpan.parentNode
              if (parent2) {
                parent2.replaceChild(document.createTextNode(highlightSpan.textContent || ''), highlightSpan)
                parent2.normalize()
              }
            }, 1000)
            document.removeEventListener('click', removeHighlight)
          }
        }

        setTimeout(() => {
          document.addEventListener('click', removeHighlight)
        }, 500)
      }
    }
  }, [])

  // // Handle "Khám phá dự án" click - scroll to featured section
  // const handleExploreProjectsClick = useCallback(() => {
  //   setMobileMenuOpen(false)
  //   if (location.pathname !== '/') {
  //     navigate('/')
  //     setTimeout(() => {
  //       const element = document.getElementById('featured-projects')
  //       if (element) {
  //         element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  //       }
  //     }, 100)
  //   } else {
  //     const element = document.getElementById('featured-projects')
  //     if (element) {
  //       element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  //     }
  //   }
  // }, [navigate, location.pathname])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    if (!menuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (mobileMenuRef.current?.contains(target)) return
      if (mobileButtonRef.current?.contains(target)) return
      setMobileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!chatOpen || !user?.id) return
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
    if (!chatOpen || !user?.id) return
    if (!chatSocketRef.current) {
      chatSocketRef.current = io(chatSocketUrl, { transports: ['websocket'] })
      chatSocketRef.current.on('message:new', (payload: ChatMessage) => {
        if (payload.conversationId !== conversationRef.current) return
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
    setMobileMenuOpen(false)
    navigate('/login')
  }

  const handleSendMessage = () => {
    if (!activeConversationId || !user?.id || !messageInput.trim()) return
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

  /**
   * ✅ Refactor: mobile menu items (no duplication)
   */
  const mobileMenuBaseButtonClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/30 hover:text-white'

  const mobileMenuDangerButtonClass =
    'w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-rose-200 transition hover:border-rose-400 hover:text-white'

  const mobileMenuPrimaryButtonClass =
    'w-full rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] text-violet-200 transition hover:border-violet-400 hover:text-white'

  const mobileNavItems: MobileMenuItem[] = useMemo(() => {
    return [
      { key: 'home', label: 'Trang chủ', onClick: () => handleNavClick('/'), className: mobileMenuBaseButtonClass },
      { key: 'projects', label: 'Dự án', onClick: () => handleNavClick('/projects'), className: mobileMenuBaseButtonClass },
      { key: 'forum', label: 'Diễn đàn', onClick: () => handleNavClick('/forum'), className: mobileMenuBaseButtonClass },
      { key: 'hof', label: 'Sảnh danh vọng', onClick: () => handleNavClick('/hall-of-fame'), className: mobileMenuBaseButtonClass },
      { key: 'resources', label: 'Tài liệu', onClick: () => handleNavClick('/resources'), className: mobileMenuBaseButtonClass },
      { key: 'about', label: 'Về chúng tôi', onClick: () => handleNavClick('/about'), className: mobileMenuBaseButtonClass },
    ]
  }, [handleNavClick, mobileMenuBaseButtonClass]) 

  const mobileAuthItemsGuest: MobileMenuItem[] = useMemo(() => {
    return [
      { key: 'login', label: 'Đăng nhập', onClick: () => handleNavClick('/login'), className: mobileMenuBaseButtonClass },
      { key: 'register', label: 'Đăng ký', onClick: () => handleNavClick('/register'), className: mobileMenuPrimaryButtonClass },
    ]
  }, [handleNavClick, mobileMenuBaseButtonClass, mobileMenuPrimaryButtonClass])

  const mobileAuthItemsUser: MobileMenuItem[] = useMemo(() => {
    return [
      { key: 'profile', label: 'Hồ sơ', onClick: () => handleNavClick('/profile'), className: mobileMenuBaseButtonClass },
      { key: 'mine', label: 'Dự án của tôi', onClick: () => handleNavClick('/projects/mine'), className: mobileMenuBaseButtonClass },
      { key: 'ai-tools', label: 'Công cụ AI', onClick: () => handleNavClick('/ai'), className: mobileMenuBaseButtonClass },
      { key: 'pricing', label: 'Nâng cấp gói', onClick: () => handleNavClick('/pricing'), className: mobileMenuBaseButtonClass },
      {
        key: 'admin',
        label: 'Bảng quản trị',
        onClick: () => handleNavClick('/admin/overview'),
        className: mobileMenuBaseButtonClass,
        show: user?.role === 'ADMIN',
      },
      { key: 'logout', label: 'Đăng xuất', onClick: handleLogout, className: mobileMenuDangerButtonClass },
    ]
  }, [handleLogout, handleNavClick, mobileMenuBaseButtonClass, mobileMenuDangerButtonClass, user?.role])

  const renderMobileItems = useCallback((items: MobileMenuItem[]) => {
    return items
      .filter((item) => item.show !== false) // default show = true
      .map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className={item.className}
        >
          {item.label}
        </button>
      ))
  }, [])

  return (
    <div className="page-shell text-white">
      <div className="app-sheen" aria-hidden="true" />
      <header className="glass-bar relative z-50 theme-fixed">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-0.5">
          {/* Left side - Logo */}
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => handleNavClick('/')}
              className="flex items-center text-white"
            >
              <Logo size="sm" />
            </button>
          </div>

          {/* Combined nav container with all items */}
          <nav className="mx-4 hidden flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 lg:flex">
            <div className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.15em] text-white/70">
              <button
                onClick={() => handleNavClick('/projects')}
                className={`whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white ${
                  isActivePath('/projects') ? 'bg-white/10 text-white' : ''
                }`}
              >
                Dự án
              </button>
              <button
                onClick={() => handleNavClick('/forum')}
                className={`whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white ${
                  isActivePath('/forum') ? 'bg-white/10 text-white' : ''
                }`}
              >
                Diễn đàn
              </button>
              
              <button
                onClick={() => handleNavClick('/hall-of-fame')}
                className={`whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white ${
                  isActivePath('/hall-of-fame') ? 'bg-white/10 text-white' : ''
                }`}
              >
                Sảnh danh vọng
              </button>

              {/* Search input with dropdown */}
              <div className="relative mx-2" ref={searchRef}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex items-center justify-center text-white/60 transition hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                    className="w-28 bg-transparent px-2 py-1 text-sm text-white placeholder-white/40 outline-none xl:w-36"
                  />
                </div>

                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0a0d1d]/95 p-2 shadow-xl backdrop-blur-md">
                    {searchResults.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSearchResultClick(item)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-white/50">{item.path}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-white/30">|</span>
              <button
                onClick={() => handleNavClick('/news')}
                className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white ${
                  isActivePath('/news') ? 'bg-white/10 text-white' : ''
                }`}
              >
                Tin Tức
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => handleNavClick('/resources')}
                className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"
              >
                Tài liệu
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => handleNavClick('/about')}
                className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white ${
                  isActivePath('/about') ? 'bg-white/10 text-white' : ''
                }`}
              >
                Về chúng tôi
              </button>
            </div>
          </nav>

          {/* Mobile nav */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70 md:flex lg:hidden">
            <button
              onClick={() => handleNavClick('/projects')}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white ${
                isActivePath('/projects') ? 'bg-white/10 text-white' : ''
              }`}
            >
              Sản phẩm
            </button>
            <button
              onClick={() => handleNavClick('/forum')}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white ${
                isActivePath('/forum') ? 'bg-white/10 text-white' : ''
              }`}
            >
              Diễn đàn
            </button>
          </nav>

          {/* Right side - User menu */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLight((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
              aria-label="Đổi giao diện"
            >
              {isLight ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              )}
            </button>
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('/login')}
                  className="hidden whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/50 hover:text-white md:inline-flex"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('/register')}
                  className="hidden whitespace-nowrap rounded-full border border-violet-500/50 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 transition hover:bg-violet-500/20 md:inline-flex"
                >
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/50"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName ?? 'User'}
                      className="h-7 w-7 shrink-0 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white/80">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[80px] truncate text-xs uppercase tracking-[0.15em] text-white/80">
                    {user.fullName ?? 'User'}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-1/2 mt-3 w-56 translate-x-1/2 rounded-2xl border border-white/10 bg-[#0a0d1d]/80 p-2 shadow-xl backdrop-blur-md">
                    <div className="px-3 py-2 text-sm uppercase tracking-[0.3em] text-white/50">
                      {user.fullName ?? 'User'}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        handleNavClick('/profile')
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                    >
                      Hồ sơ
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        handleNavClick('/projects/mine')
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                    >
                      Dự án của tôi
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        handleNavClick('/ai')
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                    >
                      Công cụ AI
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        handleNavClick('/pricing')
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                    >
                      Nâng cấp gói
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          handleNavClick('/admin/overview')
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                      >
                        Bảng quản trị
                      </button>
                    )}

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
            )}

            <button
              type="button"
              ref={mobileButtonRef}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-white md:hidden"
              aria-label="Mở/đóng menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ✅ Refactored Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            ref={mobileMenuRef}
            className="w-full border-t border-white/10 bg-[#0a0d1d]/95 md:hidden"
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-4 pt-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Trình đơn</div>
              </div>

              <div className="mt-3 grid gap-2">
                {renderMobileItems(mobileNavItems)}
              </div>

              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
                {!user
                  ? renderMobileItems(mobileAuthItemsGuest)
                  : renderMobileItems(mobileAuthItemsUser)}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-16 border-t border-white/10 bg-black/30 backdrop-blur-md theme-fixed">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-base text-white/60">
                {FOOTER_CONTENT.description}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                {FOOTER_CONTENT.sections.explore.title}
              </p>
              <div className="mt-3 space-y-2 text-base text-white/70">
                {FOOTER_CONTENT.sections.explore.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="block text-left hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                {FOOTER_CONTENT.sections.menu.title}
              </p>
              <div className="mt-3 space-y-2 text-base text-white/70">
                {FOOTER_CONTENT.sections.menu.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="block text-left hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                {FOOTER_CONTENT.sections.office.title}
              </p>
              <p className="mt-3 text-base text-white/70">
                {FOOTER_CONTENT.sections.office.address}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <a
                  href={FOOTER_CONTENT.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a
                  href={FOOTER_CONTENT.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                <a
                  href={FOOTER_CONTENT.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm uppercase tracking-[0.2em] text-white/40">
            {FOOTER_CONTENT.copyright}
          </div>
        </div>
      </footer>

      {user && (
        <>
          {/* <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 btn-primary text-white shadow-lg transition hover:scale-105"
            aria-label="Trò chuyện"
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
          </button> */}

          {chatOpen && (
            <div
              className="fixed inset-0 z-[70] flex items-end justify-end bg-black/40 p-4"
              onClick={() => setChatOpen(false)}
            >
              <div
                className="flex h-[420px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d1d] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex w-1/3 flex-col border-r border-white/10 bg-white/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/50">Trò chuyện</div>
                    <button
                      type="button"
                      onClick={() => setChatOpen(false)}
                      className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-2 pb-3">
                    {conversations.length === 0 && (
                      <div className="px-3 py-4 text-xs text-white/50">Chưa có cuộc hội thoại.</div>
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
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">Cuộc hội thoại</div>
                        <div className="mt-1 font-semibold text-white">{conversation.id.slice(0, 8)}</div>
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
                    <div className="text-xs uppercase tracking-[0.3em] text-white/50">Hội thoại</div>
                      <div className="text-base font-semibold text-white">
                        {activeConversationId ? activeConversationId.slice(0, 8) : 'Chon cuoc hoi thoai'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChatOpen(false)}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      Đóng
                    </button>
                  </div>

                  <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.length === 0 && <div className="text-sm text-white/50">Chưa có tin nhắn.</div>}
                    {messages.map((message) => {
                      const isOwn = message.senderId === user.id
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isOwn ? 'ml-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white' : 'bg-black/40 text-white/80'
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
                        placeholder="Nhập tin nhắn"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleSendMessage()
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                      >
                        Gửi
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
