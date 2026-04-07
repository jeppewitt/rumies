'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { signOut } from '@/app/actions/auth'

export type ConvSummary = {
  id: string
  otherProfileId: string
  otherName: string
  otherEmoji: string
  score?: number
  online: boolean
  unread: number
  lastMsg: string
  lastTime: string
  sharedTraits: string[]
}

export type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  read: boolean
}

type Props = {
  conversations: ConvSummary[]
  initialMessages: ChatMessage[]
  initialConvId: string | null
  myUserId: string
}

const QUICK_REPLIES = [
  'Ja, det passer godt! 🙌',
  'Kan vi finde en anden tid?',
  'Hvad er huslejen inkl. forbrug?',
]

function fmtTime(iso: string): string {
  const now = new Date()
  const d = new Date(iso)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Nu'
  if (mins < 60) return `${mins} min`
  if (diff < 86400000) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diff < 172800000) return 'I går'
  const days = ['søn', 'man', 'tirs', 'ons', 'tors', 'fre', 'lør']
  return days[d.getDay()]
}

const CSS = `
  :root {
    --bg:#F7F4EF; --card:#FFFFFF;
    --primary:#D97757; --primary-hover:#C4633F; --primary-soft:#F5E6DF;
    --accent:#7B9E87; --accent-soft:#E3EEE7;
    --ink:#1A0F0A; --ink2:#4A3528; --ink3:#9C7B6E;
    --border:#E8E0D8;
    --gold:#C9A84C;
    --shadow-sm:0 1px 4px rgba(26,15,10,0.06);
  }
  .ch-root { font-family:var(--font-manrope),'Manrope',sans-serif; background:var(--bg); color:var(--ink); height:100vh; display:flex; flex-direction:column; overflow:hidden; }
  .ch-nav { flex-shrink:0; background:rgba(247,244,239,0.95); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 16px; height:64px; display:flex; align-items:center; justify-content:space-between; z-index:50; }
  .nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
  .nav-logo svg { width:28px; height:28px; }
  .nav-logo-text { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.3px; }
  .nav-links { display:none; align-items:center; gap:4px; }
  .nav-link { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer; border:none; background:none; font-family:var(--font-manrope),'Manrope',sans-serif; transition:all 0.2s; text-decoration:none; }
  .nav-link:hover { background:var(--border); color:var(--ink); }
  .nav-link.active { background:var(--primary); color:white; }
  .nav-link .material-symbols-rounded { font-size:18px; }
  .nav-avatar { width:36px; height:36px; border-radius:50%; background:var(--accent-soft); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .nav-right { display:flex; align-items:center; gap:8px; }
  .logout-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; border:1.5px solid var(--border); background:none; cursor:pointer; color:var(--ink3); transition:all 0.2s; }
  .logout-btn:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .logout-btn .material-symbols-rounded { font-size:18px; }
  .chat-layout { flex:1; display:grid; grid-template-columns:1fr; overflow:hidden; }
  .chat-sidebar { background:var(--card); border-right:1px solid var(--border); display:none; flex-direction:column; overflow:hidden; }
  .sidebar-header { padding:20px 20px 16px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .sidebar-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:22px; font-weight:700; color:var(--ink); margin-bottom:12px; }
  .search-wrap { position:relative; }
  .search-wrap .material-symbols-rounded { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:18px; color:var(--ink3); pointer-events:none; }
  .search-input { width:100%; padding:10px 14px 10px 38px; border-radius:999px; border:1.5px solid var(--border); background:var(--bg); font-size:14px; font-family:var(--font-manrope),'Manrope',sans-serif; color:var(--ink); outline:none; transition:border-color 0.2s; }
  .search-input:focus { border-color:var(--primary); }
  .search-input::placeholder { color:var(--ink3); }
  .conv-list { flex:1; overflow-y:auto; padding:8px 0; }
  .conv-list::-webkit-scrollbar { width:4px; }
  .conv-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  .conv-item { display:flex; align-items:center; gap:12px; padding:12px 20px; cursor:pointer; transition:background 0.15s; border-left:3px solid transparent; position:relative; }
  .conv-item:hover { background:var(--bg); }
  .conv-item.active { background:var(--primary-soft); border-left-color:var(--primary); }
  .conv-avatar { width:48px; height:48px; border-radius:50%; background:var(--bg); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:22px; border:2px solid var(--border); position:relative; }
  .online-dot { position:absolute; bottom:1px; right:1px; width:12px; height:12px; border-radius:50%; background:var(--accent); border:2px solid var(--card); }
  .conv-info { flex:1; min-width:0; }
  .conv-name-row { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:3px; }
  .conv-name { font-size:14px; font-weight:700; color:var(--ink); }
  .conv-time { font-size:11px; color:var(--ink3); flex-shrink:0; }
  .conv-time.unread { color:var(--primary); font-weight:700; }
  .conv-preview { font-size:13px; color:var(--ink3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .conv-preview.unread { color:var(--ink2); font-weight:600; }
  .match-chip { display:inline-flex; align-items:center; gap:3px; background:var(--accent-soft); color:var(--accent); font-size:10px; font-weight:700; padding:2px 7px; border-radius:999px; margin-top:4px; }
  .conv-unread-badge { width:20px; height:20px; border-radius:50%; background:var(--primary); color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .chat-main { display:flex; flex-direction:column; overflow:hidden; background:var(--bg); }
  .chat-header { background:var(--card); border-bottom:1px solid var(--border); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .chat-header-left { display:flex; align-items:center; gap:14px; }
  .chat-header-avatar { width:44px; height:44px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:22px; border:2px solid var(--border); flex-shrink:0; position:relative; }
  .chat-header-avatar .online-dot { width:11px; height:11px; }
  .chat-header-name { font-family:var(--font-fraunces),'Fraunces',serif; font-size:17px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:6px; }
  .chat-header-meta { font-size:12px; color:var(--ink3); margin-top:2px; display:flex; align-items:center; gap:8px; }
  .header-match-badge { background:var(--accent); color:white; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }
  .online-indicator { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--accent); font-weight:600; }
  .online-indicator .dot { width:7px; height:7px; border-radius:50%; background:var(--accent); display:inline-block; }
  .chat-header-actions { display:flex; align-items:center; gap:6px; }
  .header-btn { width:38px; height:38px; border-radius:10px; border:1.5px solid var(--border); background:var(--card); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; color:var(--ink2); }
  .header-btn:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .header-btn .material-symbols-rounded { font-size:19px; }
  .messages-area { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:4px; }
  .messages-area::-webkit-scrollbar { width:4px; }
  .messages-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  .date-divider { display:flex; align-items:center; gap:12px; margin:16px 0 12px; }
  .date-divider::before,.date-divider::after { content:''; flex:1; height:1px; background:var(--border); }
  .date-divider span { font-size:11px; font-weight:700; color:var(--ink3); text-transform:uppercase; letter-spacing:0.06em; white-space:nowrap; }
  @keyframes bubbleIn { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .msg-group { display:flex; flex-direction:column; gap:2px; margin-bottom:12px; }
  .msg-group.mine { align-items:flex-end; }
  .msg-group.theirs { align-items:flex-start; }
  .msg-bubble { max-width:85%; padding:12px 16px; font-size:14px; line-height:1.65; animation:bubbleIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
  .msg-group.theirs .msg-bubble { background:var(--card); color:var(--ink); border-radius:18px 18px 18px 4px; border:1px solid var(--border); box-shadow:var(--shadow-sm); }
  .msg-group.mine .msg-bubble { background:var(--primary); color:white; border-radius:18px 18px 4px 18px; }
  .msg-meta { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--ink3); padding:0 4px; margin-top:2px; }
  .msg-meta .material-symbols-rounded { font-size:14px; color:var(--primary); }
  @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
  .typing-indicator { display:flex; align-items:center; gap:10px; padding:4px 0; margin-bottom:8px; }
  .typing-avatar { width:32px; height:32px; border-radius:50%; background:var(--bg); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .typing-bubble { background:var(--card); border:1px solid var(--border); border-radius:18px 18px 18px 4px; padding:12px 16px; display:flex; gap:4px; align-items:center; box-shadow:var(--shadow-sm); }
  .typing-dot { width:7px; height:7px; border-radius:50%; background:var(--ink3); animation:typingBounce 1.2s infinite ease-in-out; }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  .match-banner { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:16px 20px; display:flex; align-items:center; gap:16px; margin-bottom:20px; box-shadow:var(--shadow-sm); flex-wrap:wrap; }
  .match-banner-score { width:48px; height:48px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:var(--accent); flex-shrink:0; }
  .match-banner-title { font-size:14px; font-weight:700; color:var(--ink); margin-bottom:2px; }
  .match-banner-sub   { font-size:12px; color:var(--ink3); }
  .match-banner-tags  { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
  .match-banner-tag   { font-size:11px; font-weight:600; color:var(--accent); background:var(--accent-soft); padding:3px 9px; border-radius:999px; }
  .match-banner-actions { margin-left:auto; display:flex; gap:8px; flex-shrink:0; }
  .banner-btn { padding:8px 14px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; display:flex; align-items:center; gap:5px; }
  .banner-btn.secondary { background:var(--card); color:var(--ink2); border:1.5px solid var(--border); text-decoration:none; }
  .banner-btn.secondary:hover { border-color:var(--ink2); }
  .banner-btn .material-symbols-rounded { font-size:15px; }
  .input-area { padding:12px 16px calc(72px + env(safe-area-inset-bottom,0px)); background:var(--card); border-top:1px solid var(--border); flex-shrink:0; }
  .quick-replies { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
  .quick-reply { padding:7px 14px; border-radius:999px; font-size:13px; font-weight:500; border:1.5px solid var(--border); background:var(--card); color:var(--ink2); cursor:pointer; transition:all 0.2s; font-family:var(--font-manrope),'Manrope',sans-serif; }
  .quick-reply:hover { border-color:var(--primary); color:var(--primary); background:var(--primary-soft); }
  .input-wrap { display:flex; align-items:flex-end; gap:10px; }
  .input-btn { width:40px; height:40px; border-radius:10px; border:1.5px solid var(--border); background:var(--bg); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; color:var(--ink3); flex-shrink:0; margin-bottom:1px; }
  .input-btn:hover { border-color:var(--primary); color:var(--primary); }
  .input-btn .material-symbols-rounded { font-size:20px; }
  .input-field-wrap { flex:1; position:relative; }
  .input-box { flex:1; width:100%; background:var(--bg); border:1.5px solid var(--border); border-radius:20px; padding:11px 52px 11px 18px; font-size:14px; font-family:var(--font-manrope),'Manrope',sans-serif; color:var(--ink); resize:none; outline:none; min-height:44px; max-height:120px; line-height:1.5; transition:border-color 0.2s; }
  .input-box:focus { border-color:var(--primary); background:var(--card); }
  .input-box::placeholder { color:var(--ink3); }
  .send-btn { position:absolute; right:6px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; background:var(--primary); color:white; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; }
  .send-btn:hover { background:var(--primary-hover); transform:scale(1.05); }
  .send-btn .material-symbols-rounded { font-size:18px; }
  .empty-chat { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:40px; }
  .empty-chat .material-symbols-rounded { font-size:48px; color:var(--border); }
  .empty-chat-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:600; color:var(--ink2); }
  .empty-chat-sub   { font-size:14px; color:var(--ink3); }
  .no-convs { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:40px; }
  .no-convs .material-symbols-rounded { font-size:48px; color:var(--border); }
  .no-convs-title { font-family:var(--font-fraunces),'Fraunces',serif; font-size:20px; font-weight:600; color:var(--ink2); }
  .no-convs-sub { font-size:14px; color:var(--ink3); }
  .bottomnav { display:flex; position:fixed; bottom:0; left:0; right:0; height:60px; background:var(--card); border-top:1px solid var(--border); z-index:200; box-shadow:0 -2px 16px rgba(26,15,10,0.07); padding-bottom:env(safe-area-inset-bottom,0px); }
  .bn-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; text-decoration:none; color:var(--ink3); font-size:10px; font-weight:600; font-family:var(--font-manrope),'Manrope',sans-serif; transition:color 0.2s; }
  .bn-item .material-symbols-rounded { font-size:22px; }
  .bn-item.active { color:var(--primary); }
  @media (min-width:768px) {
    .ch-nav { padding:0 32px; }
    .nav-links { display:flex; }
    .chat-layout { grid-template-columns:320px 1fr; }
    .chat-sidebar { display:flex; flex-direction:column; }
    .messages-area { padding:24px; }
    .chat-header { padding:14px 24px; }
    .input-area { padding:16px 24px 20px; }
    .msg-bubble { max-width:68%; }
    .bottomnav { display:none; }
  }
`

export default function ChatClient({ conversations, initialMessages, initialConvId, myUserId }: Props) {
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [convs, setConvs] = useState<ConvSummary[]>(conversations)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const activeConv = convs.find(c => c.id === activeConvId)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!activeConvId) return
    const channel = supabase
      .channel(`chat:${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConvId}`,
      }, payload => {
        const row = payload.new as { id: string; sender_id: string; content: string; created_at: string }
        if (row.sender_id === myUserId) return // Already added optimistically
        setMessages(prev => [
          ...prev,
          { id: row.id, from: 'them', text: row.content, time: fmtTime(row.created_at), read: false },
        ])
        // Update conversation preview
        setConvs(prev => prev.map(c =>
          c.id === activeConvId ? { ...c, lastMsg: row.content, lastTime: 'Nu', unread: 0 } : c
        ))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId])

  async function openConv(id: string) {
    // Clear unread
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
    setActiveConvId(id)
    setShowQuickReplies(true)
    setLoading(true)
    try {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, read_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
        .limit(50)
      setMessages((data ?? []).map(m => ({
        id: String(m.id),
        from: m.sender_id === myUserId ? 'me' : 'them',
        text: String(m.content),
        time: fmtTime(m.created_at),
        read: m.read_at != null,
      })))
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || !activeConvId) return
    const trimmed = text.trim()
    // Optimistic add
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, { id: tempId, from: 'me', text: trimmed, time: 'Nu', read: false }])
    setConvs(prev => prev.map(c => c.id === activeConvId ? { ...c, lastMsg: trimmed, lastTime: 'Nu' } : c))
    setInput('')
    setShowQuickReplies(false)
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: myUserId,
      content: trimmed,
    })
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const filteredConvs = search
    ? convs.filter(c => c.otherName.toLowerCase().includes(search.toLowerCase()))
    : convs

  // Group messages by sender for rendering
  type MsgGroup = { from: 'me' | 'them'; messages: ChatMessage[] }
  const groups: MsgGroup[] = []
  messages.forEach(msg => {
    const last = groups[groups.length - 1]
    if (last && last.from === msg.from) last.messages.push(msg)
    else groups.push({ from: msg.from, messages: [msg] })
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ch-root">

        <nav className="ch-nav">
          <a className="nav-logo" href="/matches">
            <svg viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,24 2,24" fill="#D97757" />
              <polygon points="14,7 23,22 5,22" fill="#F7F4EF" opacity="0.3" />
            </svg>
            <span className="nav-logo-text">Rumies</span>
          </a>
          <div className="nav-links">
            <a className="nav-link" href="/dashboard"><span className="material-symbols-rounded">home</span>Hjem</a>
            <a className="nav-link" href="/matches"><span className="material-symbols-rounded">favorite</span>Matches</a>
            <a className="nav-link active" href="/chat"><span className="material-symbols-rounded">chat_bubble</span>Beskeder</a>
          </div>
          <div className="nav-right">
            <form action={signOut}>
              <button type="submit" className="logout-btn" title="Log ud">
                <span className="material-symbols-rounded">logout</span>
              </button>
            </form>
            <a className="nav-avatar" href="/dashboard">
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--ink3)' }}>person</span>
            </a>
          </div>
        </nav>

        <div className="chat-layout">

          {/* SIDEBAR */}
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">Beskeder</div>
              <div className="search-wrap">
                <span className="material-symbols-rounded">search</span>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Søg i samtaler..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="conv-list">
              {filteredConvs.map(c => (
                <div
                  key={c.id}
                  className={'conv-item' + (c.id === activeConvId ? ' active' : '')}
                  onClick={() => openConv(c.id)}
                >
                  <div className="conv-avatar">
                    {c.otherEmoji}
                    {c.online && <div className="online-dot" />}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name-row">
                      <div className="conv-name">{c.otherName}</div>
                      <div className={'conv-time' + (c.unread > 0 ? ' unread' : '')}>{c.lastTime}</div>
                    </div>
                    <div className={'conv-preview' + (c.unread > 0 ? ' unread' : '')}>{c.lastMsg}</div>
                    {c.score && <div className="match-chip">⚡ {c.score}% match</div>}
                  </div>
                  {c.unread > 0 && <div className="conv-unread-badge">{c.unread}</div>}
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CHAT */}
          <main className="chat-main">
            {!activeConv ? (
              convs.length === 0 ? (
                <div className="no-convs">
                  <span className="material-symbols-rounded">chat_bubble</span>
                  <div className="no-convs-title">Ingen samtaler endnu</div>
                  <div className="no-convs-sub">Start en samtale fra matches-siden.</div>
                </div>
              ) : (
                <div className="empty-chat">
                  <span className="material-symbols-rounded">chat_bubble_outline</span>
                  <div className="empty-chat-title">Vælg en samtale</div>
                  <div className="empty-chat-sub">Vælg en samtale fra listen til venstre.</div>
                </div>
              )
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="chat-header">
                  <div className="chat-header-left">
                    <div className="chat-header-avatar">
                      {activeConv.otherEmoji}
                      {activeConv.online && <div className="online-dot" />}
                    </div>
                    <div>
                      <div className="chat-header-name">{activeConv.otherName}</div>
                      <div className="chat-header-meta">
                        {activeConv.score && (
                          <span className="header-match-badge">⚡ {activeConv.score}% Match</span>
                        )}
                        {activeConv.online
                          ? <span className="online-indicator"><span className="dot" />Online</span>
                          : <span>Offline</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <a className="header-btn" href={`/profil/${activeConv.otherProfileId}`} title="Se profil">
                      <span className="material-symbols-rounded">person</span>
                    </a>
                    <button className="header-btn" title="Flere muligheder">
                      <span className="material-symbols-rounded">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* MESSAGES */}
                <div className="messages-area">
                  {/* Match banner */}
                  {activeConv.score && (
                    <div className="match-banner">
                      <div className="match-banner-score">{activeConv.score}%</div>
                      <div>
                        <div className="match-banner-title">I har {activeConv.score}% livsstilsmatch</div>
                        {activeConv.sharedTraits.length > 0 && (
                          <>
                            <div className="match-banner-sub">Fælles træk:</div>
                            <div className="match-banner-tags">
                              {activeConv.sharedTraits.map(t => (
                                <span key={t} className="match-banner-tag">{t}</span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="match-banner-actions">
                        <a className="banner-btn secondary" href={`/profil/${activeConv.otherProfileId}`}>
                          <span className="material-symbols-rounded">person</span>Profil
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="date-divider"><span>I dag</span></div>

                  {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--ink3)', padding: 20 }}>Indlæser...</div>
                  ) : groups.map((group, gi) => (
                    <div key={gi} className={`msg-group ${group.from === 'me' ? 'mine' : 'theirs'}`}>
                      {group.messages.map((msg, mi) => (
                        <div key={msg.id} className="msg-bubble" style={{ animationDelay: `${mi * 0.04}s` }}>
                          {msg.text}
                        </div>
                      ))}
                      <div className="msg-meta">
                        <span>{group.messages[group.messages.length - 1].time}</span>
                        {group.from === 'me' && group.messages[group.messages.length - 1].read && (
                          <span className="material-symbols-rounded">done_all</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <div className="input-area">
                  <div className="input-wrap">
                    <div className="input-field-wrap">
                      <textarea
                        ref={textareaRef}
                        className="input-box"
                        rows={1}
                        placeholder={`Skriv en besked til ${activeConv.otherName}...`}
                        value={input}
                        onChange={e => { setInput(e.target.value); autoResize(e.target) }}
                        onKeyDown={handleKey}
                      />
                      <button className="send-btn" onClick={() => sendMessage(input)}>
                        <span className="material-symbols-rounded">send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* BOTTOM NAV */}
        <nav className="bottomnav">
          <a className="bn-item" href="/dashboard"><span className="material-symbols-rounded">home</span><span>Hjem</span></a>
          <a className="bn-item" href="/matches"><span className="material-symbols-rounded">favorite</span><span>Matches</span></a>
          <a className="bn-item active" href="/chat"><span className="material-symbols-rounded">chat_bubble</span><span>Beskeder</span></a>
        </nav>
      </div>
    </>
  )
}
