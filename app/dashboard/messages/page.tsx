"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { User, Send, MessageSquare, ArrowLeft, MoreVertical, Phone, Video, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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
}

export default function MessagesPage() {
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
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                fetchUserStatus(user.id)
                fetchConversations(user.id)
            }
        }
        getUser()
    }, [])

    useEffect(() => {
        if (userId) {
            const channel = supabase
                .channel('realtime:messages')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages' },
                    (payload) => {
                        const msg = payload.new as Message
                        if (msg.sender_id === userId || msg.receiver_id === userId) {
                            if (activeConversation && (msg.sender_id === activeConversation.other_user_id || msg.receiver_id === activeConversation.other_user_id)) {
                                setMessages(prev => [...prev, msg])
                            }
                            fetchConversations(userId)
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
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
        // ALLOW FOR NOW: Default to true for testing if requested
        setIsPremium(data?.is_premium || true) 
    }

    const fetchConversations = async (uid: string) => {
        try {
            const res = await fetch(`/api/messages?userId=${uid}`)
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const msgs: Message[] = data.messages || []
            const map: Record<string, Message[]> = {}

            msgs.forEach(m => {
                const other = m.sender_id === uid ? m.receiver_id : m.sender_id
                if (!map[other]) map[other] = []
                map[other].push(m)
            })

            const convs: Conversation[] = await Promise.all(Object.keys(map).map(async (otherId) => {
                const { data: profile } = await supabase.from("personal_details").select("name").eq("user_id", otherId).single()
                const { data: photo } = await supabase.from("photos").select("user_photos").eq("user_id", otherId).single()
                
                const conversationMessages = map[otherId].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                const last = conversationMessages[0]
                
                return {
                    other_user_id: otherId,
                    other_user_name: profile?.name || "Unknown",
                    other_user_photo: photo?.user_photos?.[0] || null,
                    last_message: last.content,
                    last_message_at: last.created_at,
                    unread_count: conversationMessages.filter(m => m.receiver_id === uid && !m.is_read).length
                }
            }))

            setConversations(convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()))
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const loadMessages = async (targetId: string) => {
        if (!userId) return
        try {
            const res = await fetch(`/api/messages?userId=${userId}&targetUserId=${targetId}`)
            const data = await res.json()
            setMessages(data.messages || [])
            
            // Mark as read
            await supabase.from("messages").update({ is_read: true }).eq("receiver_id", userId).eq("sender_id", targetId)
        } catch (err) {
            toast.error("Failed to load messages")
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId || !activeConversation || !newMessage.trim() || isSending) return

        if (!isPremium) {
            toast.error("Sending messages is a premium feature", {
                description: "Upgrade your plan to reply and send personalized messages."
            })
            return
        }

        setIsSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: activeConversation.other_user_id,
                    content: newMessage
                })
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

    const filteredConversations = conversations.filter(conv => 
        conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return <div className="flex h-[calc(100vh-64px)] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B0082]"></div>
        </div>
    }

    return (
        <div className="flex h-[75vh] max-w-7xl mx-auto w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl m-4">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-[#4B0082]" />
                        Messages
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..." 
                            className="pl-10 bg-white/80 dark:bg-gray-800/80 border-none rounded-xl" 
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                                {searchQuery ? `No conversations found for "${searchQuery}"` : "No messages yet. Like profiles to start a conversation!"}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <button
                                key={conv.other_user_id}
                                onClick={() => {
                                    setActiveConversation(conv)
                                    loadMessages(conv.other_user_id)
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeConversation?.other_user_id === conv.other_user_id
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-1 ring-black/5'
                                    : 'hover:bg-white/60 dark:hover:bg-gray-800/60'
                                    }`}
                            >
                                <div className="relative">
                                    {conv.other_user_photo ? (
                                        <img src={conv.other_user_photo} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-900" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    {conv.unread_count > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#FF1493] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{conv.other_user_name}</h3>
                                        <span className="text-[10px] text-gray-400 uppercase font-medium whitespace-nowrap">
                                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="relative">
                                    {activeConversation.other_user_photo ? (
                                        <img src={activeConversation.other_user_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{activeConversation.other_user_name}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online Now</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-gray-500"><Phone className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-500"><Video className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-500"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                            {messages.map((m, i) => {
                                const isMe = m.sender_id === userId
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe
                                            ? 'bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{m.content}</p>
                                            <p className={`text-[9px] mt-1.5 opacity-60 font-bold uppercase tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                            {!isPremium ? (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center justify-between gap-4">
                                    <p className="text-xs text-amber-800 dark:text-amber-500 font-medium">
                                        Subscribe to Premium to reply to this conversation.
                                    </p>
                                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-[10px] font-bold">UPGRADE</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-11"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className="h-11 w-11 rounded-xl bg-[#4B0082] hover:bg-[#6A0DAD] text-white shrink-0 p-0"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center mb-6 animate-pulse">
                            <MessageSquare className="h-12 w-12 text-[#4B0082]/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to your Inbox</h2>
                        <p className="max-w-xs text-gray-500 text-sm leading-relaxed">
                            Connect with your mutual matches and find your perfect life partner. Select a conversation to start chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
