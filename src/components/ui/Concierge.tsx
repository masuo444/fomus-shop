'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import siteConfig from '@/site.config'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function parseProductLinks(text: string) {
  // Convert /shop/UUID patterns to clickable links
  const parts = text.split(/(\/shop\/[a-f0-9-]{36})/g)
  return parts.map((part, i) => {
    if (part.match(/^\/shop\/[a-f0-9-]{36}$/)) {
      return (
        <Link key={i} href={part} className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-70">
          商品を見る
        </Link>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function Concierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages([...newMessages, { role: 'assistant', content: data.message }])
      } else {
        const data = await res.json()
        setMessages([...newMessages, { role: 'assistant', content: data.error || 'エラーが発生しました。' }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '通信エラーが発生しました。' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-[var(--foreground)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="コンシェルジュに相談"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden" style={{ maxHeight: 'min(70vh, 500px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--foreground)]">
            <div>
              <p className="text-sm font-medium text-white">{siteConfig.name} コンシェルジュ</p>
              <p className="text-[10px] text-white/50">商品選びをお手伝いします</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: '200px' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--color-muted)] mb-4">何をお探しですか？</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['贈り物を探してる', '日本酒に合う枡がほしい', '予算3,000円くらいで'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        const userMsg: Message = { role: 'user', content: suggestion }
                        setMessages([userMsg])
                        setLoading(true)
                        fetch('/api/concierge', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ messages: [userMsg] }),
                        }).then(res => res.json()).then(data => {
                          setMessages([userMsg, { role: 'assistant', content: data.message || data.error }])
                        }).catch(() => {
                          setMessages([userMsg, { role: 'assistant', content: '通信エラーが発生しました。' }])
                        }).finally(() => setLoading(false))
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--foreground)] text-white rounded-br-md'
                    : 'bg-[var(--color-subtle)] text-[var(--foreground)] rounded-bl-md'
                }`}>
                  {msg.role === 'assistant' ? parseProductLinks(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-subtle)] px-4 py-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-muted)]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[var(--color-border)]">
            <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1 text-sm px-4 py-2.5 rounded-full border border-[var(--color-border)] focus:outline-none focus:border-[var(--foreground)] bg-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full bg-[var(--foreground)] text-white flex items-center justify-center disabled:opacity-30 hover:opacity-80 transition-opacity shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
