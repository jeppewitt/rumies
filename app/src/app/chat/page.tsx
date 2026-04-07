import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient, { type ConvSummary, type ChatMessage } from './ChatClient'
import { calcScore } from '@/lib/calcScore'

const EMOJIS = ['👩‍🎓', '👨‍💻', '🎨', '🏋️', '🌿', '🎸', '📚', '🧑‍🍳', '🎯', '🌸']
function pick(arr: string[], id: string) { return arr[id.charCodeAt(0) % arr.length] }

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

type MsgRow = {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
}

type ConvRow = {
  id: string
  participant_a_id: string
  participant_b_id: string
  created_at: string
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>
}) {
  const { conv: convParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all conversations for this user
  const { data: convRows } = await supabase
    .from('conversations')
    .select('id, participant_a_id, participant_b_id, created_at')
    .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const convs = (convRows ?? []) as ConvRow[]

  // Get IDs of all other participants
  const otherUserIds = convs.map(c =>
    c.participant_a_id === user.id ? c.participant_b_id : c.participant_a_id
  )

  // Fetch min egen profil (til score-beregning)
  const { data: myProfileData } = await supabase
    .from('profiles')
    .select('quiz_answers(sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties)')
    .eq('user_id', user.id)
    .single()
  const myQuiz = ((myProfileData?.quiz_answers as Record<string, unknown>[] | null)?.[0] ?? {}) as Record<string, unknown>

  // Fetch profiles for other participants
  type OtherProfile = { id: string; user_id: string; display_name: string | null; quiz_answers: Record<string, unknown>[] | null }
  let otherProfiles: OtherProfile[] = []
  if (otherUserIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, quiz_answers(sleep_schedule, cleanliness, social_level, smoker, pet_friendly, parties)')
      .in('user_id', otherUserIds)
    otherProfiles = (data ?? []) as OtherProfile[]
  }

  const profileByUserId = Object.fromEntries(otherProfiles.map(p => [p.user_id, p]))

  // Fetch last message per conversation + unread count
  const conversations: ConvSummary[] = []
  const lastMsgByConvId: Record<string, MsgRow[]> = {}

  if (convs.length > 0) {
    const convIds = convs.map(c => c.id)

    // Fetch last 1 message per conversation (in batch)
    const { data: allMsgs } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read_at, conversation_id')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })

    // Group by conversation_id, keep last message per conv
    const lastMsgMap: Record<string, { id: string; sender_id: string; content: string; created_at: string; read_at: string | null }> = {}
    const unreadMap: Record<string, number> = {}

    for (const m of (allMsgs ?? []) as Array<{ id: string; sender_id: string; content: string; created_at: string; read_at: string | null; conversation_id: string }>) {
      if (!lastMsgMap[m.conversation_id]) {
        lastMsgMap[m.conversation_id] = m
      }
      // Count unread messages sent by others
      if (m.sender_id !== user.id && !m.read_at) {
        unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1
      }
    }

    for (const conv of convs) {
      const otherUserId = conv.participant_a_id === user.id ? conv.participant_b_id : conv.participant_a_id
      const otherProfile = profileByUserId[otherUserId]
      const lastMsg = lastMsgMap[conv.id]

      const theirQuiz = (otherProfile?.quiz_answers?.[0] ?? {}) as Record<string, unknown>
      const score = calcScore(myQuiz, theirQuiz)
      const sharedTraits: string[] = []
      if (myQuiz.sleep_schedule && myQuiz.sleep_schedule === theirQuiz.sleep_schedule)
        sharedTraits.push(myQuiz.sleep_schedule === 'early' ? 'A-menneske' : myQuiz.sleep_schedule === 'late' ? 'B-menneske' : 'Fleksibel rytme')
      if (myQuiz.smoker === false && theirQuiz.smoker === false) sharedTraits.push('Ikke-ryger')
      if (myQuiz.pet_friendly === true && theirQuiz.pet_friendly === true) sharedTraits.push('Dyrevenlig')
      if (myQuiz.parties === false && theirQuiz.parties === false) sharedTraits.push('Rolig hverdag')
      if (myQuiz.parties === true && theirQuiz.parties === true) sharedTraits.push('Festlig')

      conversations.push({
        id: conv.id,
        otherProfileId: otherProfile?.id ?? '',
        otherName: otherProfile?.display_name ?? 'Ukendt',
        otherEmoji: pick(EMOJIS, otherProfile?.id ?? conv.id),
        score,
        online: false,
        unread: unreadMap[conv.id] ?? 0,
        lastMsg: lastMsg?.content ?? '',
        lastTime: lastMsg ? fmtTime(lastMsg.created_at) : '',
        sharedTraits,
      })

      if (lastMsg) {
        if (!lastMsgByConvId[conv.id]) lastMsgByConvId[conv.id] = []
      }
    }
  }

  // Vælg aktiv samtale: ?conv= param hvis den eksisterer i listen, ellers første
  const initialConvId =
    (convParam && conversations.some(c => c.id === convParam))
      ? convParam
      : (conversations[0]?.id ?? null)

  let initialMessages: ChatMessage[] = []

  if (initialConvId) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read_at')
      .eq('conversation_id', initialConvId)
      .order('created_at', { ascending: true })
      .limit(50)

    initialMessages = (msgs ?? []).map(m => ({
      id: String(m.id),
      from: (m as { sender_id: string }).sender_id === user.id ? 'me' : 'them',
      text: String((m as { content: string }).content),
      time: fmtTime((m as { created_at: string }).created_at),
      read: Boolean((m as { read_at: string | null }).read_at),
    })) as ChatMessage[]
  }

  return (
    <ChatClient
      conversations={conversations}
      initialMessages={initialMessages}
      initialConvId={initialConvId}
      myUserId={user.id}
    />
  )
}
