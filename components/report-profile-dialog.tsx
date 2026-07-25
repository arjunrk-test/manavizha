"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { authFetch } from "@/lib/api-client"
import { toast } from "sonner"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"

const REASONS = [
    { value: "fake_profile", label: "Fake profile" },
    { value: "harassment", label: "Harassment or abuse" },
    { value: "inappropriate_content", label: "Inappropriate content" },
    { value: "scam", label: "Scam / asking for money" },
    { value: "already_married", label: "Already married" },
    { value: "other", label: "Other" },
]

export function ReportProfileDialog({
    open,
    onOpenChange,
    reportedUserId,
    reportedName,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    reportedUserId: string
    reportedName?: string
}) {
    const [reason, setReason] = useState("fake_profile")
    const [details, setDetails] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const submit = async () => {
        setSubmitting(true)
        try {
            const res = await authFetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportedUserId, reason, details }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                toast.success("Report submitted. Our team will review it shortly.")
                onOpenChange(false)
                setDetails("")
                setReason("fake_profile")
            } else {
                toast.error(data.error || "Failed to submit report")
            }
        } catch {
            toast.error("Network error. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[20px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#1F4068]">
                        <Flag className="h-4 w-4 text-red-500" />
                        Report {reportedName || "this profile"}
                    </DialogTitle>
                    <DialogDescription>
                        Your report is confidential — the member will not know who reported them.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                    {REASONS.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setReason(r.value)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors",
                                reason === r.value
                                    ? "border-[#e87898] bg-[#fce8ef] text-[#1F4068] font-medium"
                                    : "border-[#f0ebe3] bg-white text-[#6b7280] hover:bg-[#faf8f4]"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <Textarea
                    placeholder="Additional details (optional)"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="rounded-xl border-[#f0ebe3] min-h-[80px]"
                    maxLength={2000}
                />

                <DialogFooter>
                    <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={submitting}
                        className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                    >
                        {submitting ? "Submitting..." : "Submit report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
