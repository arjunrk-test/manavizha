"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { authFetch } from "@/lib/api-client"
import { MessageCircle, Send, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getOrCreatePrivateKey, canEncryptFor, encryptMessage } from "@/lib/e2e"

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
            let body: any = { receiverId, content: message }

            // Encrypt end-to-end when the recipient has a published key
            try {
                const priv = senderId ? await getOrCreatePrivateKey(senderId) : null
                if (priv && (await canEncryptFor(receiverId))) {
                    const enc = await encryptMessage(message, priv, receiverId)
                    if (enc) body = { receiverId, content: enc.ciphertext, iv: enc.iv, isEncrypted: true }
                }
            } catch { /* fall back to plaintext */ }

            const res = await authFetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
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
            <DialogContent className="sm:max-w-[425px] rounded-[18px] border border-[#f0ebe3] shadow-[0_8px_30px_rgba(31,64,104,0.12)] p-0 overflow-hidden bg-white gap-0">
                <div className="px-6 pt-6 pb-4 border-b border-[#f0ebe3]">
                    <div className="flex items-start gap-3 pr-6">
                        <div className="h-10 w-10 rounded-xl bg-[#fce8ef] flex items-center justify-center shrink-0">
                            <MessageCircle className="h-5 w-5 text-[#e87898]" />
                        </div>
                        <div className="min-w-0 text-left">
                            <DialogTitle className="text-lg font-semibold text-[#1F4068] leading-snug">
                                Message {receiverName}
                            </DialogTitle>
                            <p className="text-sm text-[#6b7280] mt-1">
                                Send a thoughtful note to express your interest
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="message-body" className="text-sm font-medium text-[#1F4068]">
                            Your message
                        </label>
                        <Textarea
                            id="message-body"
                            placeholder="Write something personal…"
                            className="min-h-[120px] rounded-xl bg-[#faf8f4] border border-[#f0ebe3] resize-none text-sm text-[#1F4068] placeholder:text-[#9ca3af] focus-visible:ring-[#e87898]/30 focus-visible:border-[#e87898]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    {!isPremium && (
                        <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                            <Crown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-900 font-medium mb-0.5">Premium only</p>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Upgrade to send personalized messages to your matches.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-[#faf8f4] border-t border-[#f0ebe3] sm:justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-10 px-4 border-[#f0ebe3] bg-white text-[#6b7280] hover:bg-white hover:text-[#1F4068] text-sm font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isSending || !isPremium}
                        className={cn(
                            "rounded-xl h-10 px-5 text-sm font-medium gap-2",
                            "bg-[#e87898] hover:bg-[#d66686] text-white",
                            "disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:hover:bg-[#f3f4f6]"
                        )}
                    >
                        {isSending ? "Sending…" : (
                            <>
                                Send
                                <Send className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
