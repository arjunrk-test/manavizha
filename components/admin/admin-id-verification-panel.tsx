"use client"

import { useEffect, useState, useCallback } from "react"
import { authFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"

const DOC_LABELS: Record<string, string> = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    passport: "Passport",
    driving_license: "Driving License",
    voter_id: "Voter ID",
}

export function AdminIdVerificationPanel() {
    const [rows, setRows] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [processingId, setProcessingId] = useState<string>("")

    const fetchRows = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await authFetch("/api/id-verification?admin=1&status=pending")
            if (res.ok) {
                const data = await res.json()
                setRows(data.verifications || [])
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Failed to load ID verifications")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchRows() }, [fetchRows])

    const review = async (userId: string, status: "approved" | "rejected") => {
        setProcessingId(userId)
        try {
            const res = await authFetch("/api/id-verification", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status, adminNote: notes[userId] || undefined }),
            })
            if (res.ok) {
                toast.success(status === "approved" ? "Approved" : "Rejected")
                setRows(prev => prev.filter(r => r.user_id !== userId))
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Failed")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setProcessingId("")
        }
    }

    return (
        <div className="rounded-[20px] border border-[#f0ebe3] bg-white/90 shadow-[0_2px_16px_rgba(31,64,104,0.05)] overflow-hidden">
            <div className="border-b border-[#f0ebe3] px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f7f5]">
                        <ShieldCheck className="h-4 w-4 text-[#3bb9ac]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#1F4068]">ID document verification</h2>
                        <p className="text-xs text-gray-500">Government IDs awaiting review</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-[#f0ebe3]" onClick={fetchRows}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                </Button>
            </div>

            <div className="p-5 space-y-3">
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#f0ebe3] border-t-[#3bb9ac]" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#faf8f4]/70 py-10 text-center text-sm text-gray-500">
                        No pending ID verifications.
                    </div>
                ) : (
                    rows.map(row => (
                        <div key={row.user_id} className="rounded-2xl border border-[#f0ebe3] bg-white p-4 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold text-[#1F4068]">
                                        {row.profile?.name || "Unknown member"}
                                        {row.profile?.profile_code && (
                                            <span className="ml-2 text-xs font-normal text-gray-400">{row.profile.profile_code}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {DOC_LABELS[row.document_type] || row.document_type} · submitted {formatToDDMMYYYY(row.created_at)}
                                    </p>
                                </div>
                                {row.signedUrl ? (
                                    <a
                                        href={row.signedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#f0ebe3] px-3 py-1.5 text-xs font-medium text-[#1F4068] hover:bg-[#faf8f4]"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" /> View document
                                    </a>
                                ) : (
                                    <span className="text-xs text-red-500">Document link unavailable</span>
                                )}
                            </div>

                            <Textarea
                                placeholder="Note (shown to member if rejected)"
                                value={notes[row.user_id] || ""}
                                onChange={(e) => setNotes(prev => ({ ...prev, [row.user_id]: e.target.value }))}
                                className="rounded-xl border-[#f0ebe3] min-h-[52px] text-sm"
                            />

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="rounded-xl bg-[#3bb9ac] hover:bg-[#33a396] text-white"
                                    disabled={processingId === row.user_id}
                                    onClick={() => review(row.user_id, "approved")}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                                    disabled={processingId === row.user_id}
                                    onClick={() => review(row.user_id, "rejected")}
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
