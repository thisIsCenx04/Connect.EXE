import { useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAppSelector } from '../../../app/hooks'
import { listMyProjects } from '../../../services/project'
import {
  type InvestorMatch,
  type InvestorPreference,
  type ProjectMatch,
  getInvestorPreferences,
  matchInvestors,
  matchProjects,
  upsertInvestorPreferences,
} from '../../../services/matching'
import { chatSocketUrl, createConversation, listMessages, type ChatMessage } from '../../../services/chat'

const emptyPreference: InvestorPreference = {
  industries: [],
  stages: [],
  minFundingUsd: null,
  maxFundingUsd: null,
  country: '',
  city: '',
}

export function ChatPage() {
  const user = useAppSelector((state) => state.auth.user)
  const socketRef = useRef<Socket | null>(null)
  const conversationRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [projects, setProjects] = useState<ProjectMatch['project'][]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [investorMatches, setInvestorMatches] = useState<InvestorMatch[]>([])
  const [projectMatches, setProjectMatches] = useState<ProjectMatch[]>([])
  const [activePeer, setActivePeer] = useState<{ id: string; name: string } | null>(null)
  const [preferenceForm, setPreferenceForm] = useState({
    industries: '',
    stages: '',
    minFundingUsd: '',
    maxFundingUsd: '',
    country: '',
    city: '',
  })

  const isFounder = user?.role === 'FOUNDER'
  const isInvestor = user?.role === 'INVESTOR'

  useEffect(() => {
    socketRef.current = io(chatSocketUrl, { transports: ['websocket'] })
    socketRef.current.on('message:new', (payload: ChatMessage) => {
      if (payload.conversationId !== conversationRef.current) {
        return
      }
      setMessages((prev) => [...prev, payload])
      if (payload.senderId !== user?.id) {
        socketRef.current?.emit('message:read', {
          conversationId: payload.conversationId,
          userId: user?.id,
        })
      }
    })
    return () => {
      socketRef.current?.disconnect()
    }
  }, [user?.id])

  useEffect(() => {
    if (!conversationId || !user?.id) {
      conversationRef.current = null
      return
    }
    conversationRef.current = conversationId
    listMessages(conversationId).then((response) => setMessages(response))
    socketRef.current?.emit('join', { conversationId, userId: user.id })
  }, [conversationId, user?.id])

  useEffect(() => {
    if (!user?.id) {
      return
    }
    if (isFounder) {
      listMyProjects()
        .then((data) => {
          setProjects(data)
          if (data.length > 0) {
            setSelectedProjectId(data[0].id)
          }
        })
        .catch(() => setProjects([]))
    }
    if (isInvestor) {
      getInvestorPreferences(user.id)
        .then((pref) => {
          setPreferenceForm({
            industries: pref.industries.join(', '),
            stages: pref.stages.join(', '),
            minFundingUsd: pref.minFundingUsd?.toString() ?? '',
            maxFundingUsd: pref.maxFundingUsd?.toString() ?? '',
            country: pref.country ?? '',
            city: pref.city ?? '',
          })
        })
        .catch(() => null)
    }
  }, [isFounder, isInvestor, user?.id])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  useEffect(() => {
    if (!selectedProject) {
      setInvestorMatches([])
      return
    }
    matchInvestors({
      industry: selectedProject.industry,
      stage: selectedProject.stage,
      minFundingUsd: selectedProject.fundingNeedUsd ?? undefined,
      maxFundingUsd: selectedProject.fundingTargetUsd ?? undefined,
      country: selectedProject.country ?? undefined,
    })
      .then((data) => setInvestorMatches(data))
      .catch(() => setInvestorMatches([]))
  }, [selectedProject])

  const refreshProjectMatches = () => {
    const industries = preferenceForm.industries.split(',').map((item) => item.trim()).filter(Boolean)
    const stages = preferenceForm.stages.split(',').map((item) => item.trim()).filter(Boolean)
    const payload: InvestorPreference = {
      industries,
      stages,
      minFundingUsd: preferenceForm.minFundingUsd ? Number(preferenceForm.minFundingUsd) : null,
      maxFundingUsd: preferenceForm.maxFundingUsd ? Number(preferenceForm.maxFundingUsd) : null,
      country: preferenceForm.country || null,
      city: preferenceForm.city || null,
    }
    if (user?.id) {
      upsertInvestorPreferences(user.id, payload).catch(() => null)
    }
    matchProjects({
      industry: industries[0],
      stage: stages[0],
      minFundingUsd: payload.minFundingUsd ?? undefined,
      maxFundingUsd: payload.maxFundingUsd ?? undefined,
      country: payload.country ?? undefined,
    })
      .then((data) => setProjectMatches(data))
      .catch(() => setProjectMatches([]))
  }

  const handleStartChat = async (targetId: string, targetName: string) => {
    if (!user?.id) {
      return
    }
    const response = await createConversation([user.id, targetId])
    setConversationId(response.conversationId)
    setActivePeer({ id: targetId, name: targetName })
  }

  const handleSendMessage = () => {
    if (!conversationId || !user?.id || !messageInput.trim()) {
      return
    }
    socketRef.current?.emit('message:send', {
      conversationId,
      senderId: user.id,
      content: messageInput.trim(),
    })
    setMessageInput('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-white/50">Matching</div>
        {isFounder && (
          <>
            <label className="text-xs text-white/60">Your project</label>
            <select
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <div className="mt-4 space-y-3">
              {investorMatches.map((match) => (
                <div key={match.userId} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{match.fullName || 'Investor'}</div>
                  <div className="text-xs text-white/50">Score {match.score}</div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    onClick={() => handleStartChat(match.userId, match.fullName || 'Investor')}
                  >
                    Chat
                  </button>
                </div>
              ))}
              {investorMatches.length === 0 && (
                <div className="text-xs text-white/50">No investors matched yet.</div>
              )}
            </div>
          </>
        )}
        {isInvestor && (
          <>
            <div className="space-y-3 text-xs text-white/60">
              <div>
                <label>Industries</label>
                <input
                  value={preferenceForm.industries}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, industries: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="Fintech, SaaS"
                />
              </div>
              <div>
                <label>Stages</label>
                <input
                  value={preferenceForm.stages}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, stages: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="MVP, REVENUE"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={preferenceForm.minFundingUsd}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, minFundingUsd: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="Min USD"
                />
                <input
                  value={preferenceForm.maxFundingUsd}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, maxFundingUsd: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="Max USD"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={preferenceForm.country}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, country: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="Country"
                />
                <input
                  value={preferenceForm.city}
                  onChange={(event) => setPreferenceForm((prev) => ({ ...prev, city: event.target.value }))}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="City"
                />
              </div>
              <button
                type="button"
                onClick={refreshProjectMatches}
                className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-black"
              >
                Refresh matches
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {projectMatches.map((match) => (
                <div key={match.project.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{match.project.title}</div>
                  <div className="text-xs text-white/50">Score {match.score}</div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    onClick={() => handleStartChat(match.project.ownerId, match.project.title)}
                  >
                    Chat
                  </button>
                </div>
              ))}
              {projectMatches.length === 0 && (
                <div className="text-xs text-white/50">Set preferences to see projects.</div>
              )}
            </div>
          </>
        )}
      </section>
      <section className="flex min-h-[480px] flex-col rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Chat</div>
            <div className="text-lg font-semibold text-white">
              {activePeer?.name ?? 'Select a match to start'}
            </div>
          </div>
          {conversationId && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
              Live
            </span>
          )}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((message) => {
            const isOwn = message.senderId === user?.id
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
          {messages.length === 0 && (
            <div className="text-sm text-white/50">No messages yet.</div>
          )}
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
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
      </section>
    </div>
  )
}
