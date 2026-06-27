"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import {
  User,
  Send,
  MessageSquare,
  ArrowLeft,
  Search,
  CheckCheck,
  Crown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatActivityTime } from "@/lib/utils/date-utils"
import { cn } from "@/lib/utils"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  other_user_id: string
  other_user_name: string
  other_user_photo: string | null
  last_message: string
  last_message_at: string
  unread_count: number
  last_active_at?: string | null
}

export default function MessagesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchUserStatus(user.id)
        const convs = await fetchConversations(user.id)

        if (convs.length > 0) {
          const firstUnread = convs.find((c) => c.unread_count > 0) || convs[0]
          setActiveConversation(firstUnread)
          loadMessages(user.id, firstUnread.other_user_id)
        }
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (userId) {
      const handlePayload = (payload: { eventType: string; new: Message }) => {
        const msg = payload.new as Message

        if (payload.eventType === "INSERT") {
          if (
            activeConversation &&
            (msg.sender_id === activeConversation.other_user_id ||
              msg.receiver_id === activeConversation.other_user_id)
          ) {
            setMessages((prev) => [...prev, msg])

            if (msg.receiver_id === userId) {
              authFetch("/api/messages", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId: msg.id }),
              }).then((res) => {
                if (res.ok) {
                  fetchConversations(userId)
                  window.dispatchEvent(new CustomEvent("messagesRead"))
                }
              })
            }
          } else {
            fetchConversations(userId)
          }
        }

        if (payload.eventType === "UPDATE") {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)))
          fetchConversations(userId)
        }
      }

      // Two filtered channels — one per user role — so only this user's messages
      // are broadcast over the WebSocket rather than the entire messages table.
      const inbound = supabase
        .channel("realtime:messages:inbound")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
          handlePayload,
        )
        .subscribe()

      const outbound = supabase
        .channel("realtime:messages:outbound")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${userId}` },
          handlePayload,
        )
        .subscribe()

      return () => {
        supabase.removeChannel(inbound)
        supabase.removeChannel(outbound)
      }
    }
  }, [userId, activeConversation])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchUserStatus = async (uid: string) => {
    const { data } = await supabase.from("user_settings").select("is_premium").eq("user_id", uid).single()
    setIsPremium(!!data?.is_premium)
  }

  const fetchConversations = async (uid: string) => {
    try {
      const res = await authFetch(`/api/messages?userId=${uid}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const msgs: Message[] = data.messages || []
      const map: Record<string, Message[]> = {}

      msgs.forEach((m) => {
        const other = m.sender_id === uid ? m.receiver_id : m.sender_id
        if (!map[other]) map[other] = []
        map[other].push(m)
      })

      const convs: Conversation[] = await Promise.all(
        Object.keys(map).map(async (otherId) => {
          const { data: profile } = await supabase
            .from("personal_details")
            .select("name, last_active_at")
            .eq("user_id", otherId)
            .single()
          const { data: photo } = await supabase.from("photos").select("user_photos").eq("user_id", otherId).single()

          const conversationMessages = map[otherId].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          const last = conversationMessages[0]

          return {
            other_user_id: otherId,
            other_user_name: profile?.name || "Unknown",
            other_user_photo: photo?.user_photos?.[0] || null,
            last_message: last.content,
            last_message_at: last.created_at,
            unread_count: conversationMessages.filter((m) => m.receiver_id === uid && !m.is_read).length,
            last_active_at: profile?.last_active_at,
          }
        })
      )
      const sortedConvs = convs.sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      )
      setConversations(sortedConvs)
      setIsLoading(false)
      return sortedConvs
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setIsLoading(false)
      return []
    }
  }

  const loadMessages = async (uid: string, targetId: string) => {
    try {
      const res = await authFetch(`/api/messages?userId=${uid}&targetUserId=${targetId}`)
      const data = await res.json()
      setMessages(data.messages || [])

      const res = await authFetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: targetId }),
      })

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.other_user_id === targetId ? { ...c, unread_count: 0 } : c))
        )
        window.dispatchEvent(new CustomEvent("messagesRead"))
      }
    } catch {
      toast.error("Failed to load messages")
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !activeConversation || !newMessage.trim() || isSending) return

    if (!isPremium) {
      toast.error("Sending messages is a premium feature", {
        description: "Upgrade your plan to reply and send personalized messages.",
      })
      return
    }

    setIsSending(true)
    try {
      const res = await authFetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeConversation.other_user_id,
          content: newMessage,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      setNewMessage("")
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avatarFallback = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=96&background=fce8ef&color=e87898`

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce8ef]">
              <MessageSquare className="h-4 w-4 text-[#e87898]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F4068]">Messages</h1>
          </div>
          <p className="text-sm text-[#6b7280]">Chat with your mutual matches</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/interests?tab=mutual")}
          variant="outline"
          className="h-10 px-5 rounded-xl border-[#f0ebe3] text-[#e87898] hover:bg-[#fce8ef] text-sm font-medium gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          View matches
        </Button>
      </div>

      <div className="flex h-[min(720px,calc(100dvh-14rem))] w-full bg-white rounded-[18px] overflow-hidden border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
        {/* Conversations sidebar */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-[22rem] border-r border-[#f0ebe3] flex flex-col bg-[#faf8f4]",
            activeConversation ? "hidden md:flex" : "flex"
          )}
        >
          <div className="p-4 border-b border-[#f0ebe3]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 h-10 rounded-xl border-[#f0ebe3] bg-white text-sm text-[#1F4068] placeholder:text-[#9ca3af] focus-visible:border-[#e87898] focus-visible:ring-[#e87898]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-[#fce8ef] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-[#e87898]/60" />
                </div>
                <p className="text-[#6b7280] text-sm leading-relaxed">
                  {searchQuery
                    ? `No conversations found for "${searchQuery}"`
                    : "No messages yet. Express mutual interest to start chatting!"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.other_user_id === conv.other_user_id
                const isOnline = formatActivityTime(conv.last_active_at) === "Online"

                return (
                  <button
                    key={conv.other_user_id}
                    type="button"
                    onClick={() => {
                      setActiveConversation(conv)
                      loadMessages(userId!, conv.other_user_id)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-white shadow-[0_2px_8px_rgba(31,64,104,0.06)] ring-1 ring-[#fce8ef]"
                        : "hover:bg-white/80"
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.other_user_photo || avatarFallback(conv.other_user_name)}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-white"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = avatarFallback(conv.other_user_name)
                        }}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                          isOnline ? "bg-emerald-500" : "bg-[#d1d5db]"
                        )}
                      />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#e87898] text-white text-[10px] font-semibold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <h3
                          className={cn(
                            "text-sm truncate",
                            conv.unread_count > 0 ? "font-semibold text-[#1F4068]" : "font-medium text-[#374151]"
                          )}
                        >
                          {conv.other_user_name}
                        </h3>
                        <span className="text-[10px] text-[#9ca3af] whitespace-nowrap shrink-0">
                          {new Date(conv.last_message_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs truncate",
                          conv.unread_count > 0 ? "text-[#1F4068] font-medium" : "text-[#6b7280]"
                        )}
                      >
                        {conv.last_message}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-white min-w-0",
            activeConversation ? "flex" : "hidden md:flex"
          )}
        >
          {activeConversation ? (
            <>
              <div className="px-4 py-3 border-b border-[#f0ebe3] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9 shrink-0 text-[#6b7280] hover:text-[#1F4068] hover:bg-[#faf8f4] rounded-xl"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative shrink-0">
                    <img
                      src={activeConversation.other_user_photo || avatarFallback(activeConversation.other_user_name)}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = avatarFallback(activeConversation.other_user_name)
                      }}
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                        formatActivityTime(activeConversation.last_active_at) === "Online"
                          ? "bg-emerald-500"
                          : "bg-[#d1d5db]"
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1F4068] text-sm truncate leading-tight">
                      {activeConversation.other_user_name}
                    </h3>
                    <p
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wide",
                        formatActivityTime(activeConversation.last_active_at) === "Online"
                          ? "text-emerald-600"
                          : "text-[#9ca3af]"
                      )}
                    >
                      {formatActivityTime(activeConversation.last_active_at) || "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#faf8f4]/60"
              >
                {messages.map((m) => {
                  const isMe = m.sender_id === userId
                  return (
                    <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                          isMe
                            ? "bg-[#e87898] text-white rounded-br-md"
                            : "bg-white text-[#374151] rounded-bl-md border border-[#f0ebe3]"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1.5",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <p
                            className={cn(
                              "text-[10px] font-medium",
                              isMe ? "text-white/75" : "text-[#9ca3af]"
                            )}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {isMe && (
                            <CheckCheck
                              className={cn(
                                "h-3.5 w-3.5",
                                m.is_read ? "text-white/90" : "text-white/50"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 bg-white border-t border-[#f0ebe3]">
                {!isPremium ? (
                  <div className="p-3 bg-[#fce8ef]/60 border border-[#f0ebe3] rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Crown className="h-4 w-4 text-[#e87898] shrink-0" />
                      <p className="text-xs text-[#1F4068] font-medium">
                        Subscribe to Premium to reply to this conversation.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push("/pricing")}
                      className="bg-[#e87898] hover:bg-[#d66686] text-white h-8 text-[11px] font-semibold rounded-lg shrink-0"
                    >
                      Upgrade
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="rounded-xl bg-[#faf8f4] border-[#f0ebe3] h-11 text-sm text-[#1F4068] placeholder:text-[#9ca3af] focus-visible:border-[#e87898] focus-visible:ring-[#e87898]/20"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="h-11 w-11 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white shrink-0 p-0 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#faf8f4]/40">
              <div className="w-20 h-20 bg-[#fce8ef] rounded-2xl flex items-center justify-center mb-5">
                <MessageSquare className="h-10 w-10 text-[#e87898]/50" />
              </div>
              <h2 className="text-xl font-semibold text-[#1F4068] mb-2">Your inbox</h2>
              <p className="max-w-xs text-[#6b7280] text-sm leading-relaxed">
                Select a conversation from the list to start chatting with your matches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
