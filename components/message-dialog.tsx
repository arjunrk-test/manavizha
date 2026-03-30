"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MessageCircle, Send, Crown } from "lucide-react"

interface MessageDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    receiverId: string
    receiverName: string
    senderId: string
    isPremium: boolean
    onSuccess?: () => void
}

export function MessageDialog({
    isOpen,
    onOpenChange,
    receiverId,
    receiverName,
    senderId,
    isPremium,
    onSuccess
}: MessageDialogProps) {
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSend = async () => {
        if (!message.trim()) return

        if (!isPremium) {
            toast.error("Premium required to send messages", {
                description: "Upgrade your account to send personalized messages to your matches."
            })
            return
        }

        setIsSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId,
                    receiverId,
                    content: message
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to send message")
            }

            toast.success(`Message sent to ${receiverName}!`)
            setMessage("")
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-gray-900">
                <div className="bg-gradient-to-r from-[#4B0082] to-[#FF1493] p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Send Message to {receiverName}</DialogTitle>
                    <p className="text-white/80 text-xs mt-1">Express your interest with a personalized message</p>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Your Message</label>
                        <Textarea
                            placeholder="Type something thoughtful..."
                            className="min-h-[120px] rounded-2xl bg-gray-50 dark:bg-gray-800 border-none resize-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    {!isPremium && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                            <Crown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-amber-800 dark:text-amber-500 font-bold mb-1 uppercase tracking-wider">Premium Only</p>
                                <p className="text-[11px] text-amber-700 dark:text-amber-600 leading-relaxed">
                                    Only premium members can send personalized messages. Upgrade now to connect!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-6 font-bold text-gray-400">
                        CANCEL
                    </Button>
                    <Button 
                        onClick={handleSend} 
                        disabled={!message.trim() || isSending || !isPremium}
                        className="rounded-xl h-11 px-8 bg-gradient-to-r from-[#4B0082] to-[#FF1493] hover:opacity-90 text-white font-bold group"
                    >
                        {isSending ? "SENDING..." : (
                            <>
                                SEND <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
