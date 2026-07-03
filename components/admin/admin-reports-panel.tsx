"use client"

import { useEffect, useState, useCallback } from "react"
import { authFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Flag, CheckCircle2, XCircle, Eye, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatToDDMMYYYY } from "@/lib/utils/date-utils"

const STATUS_TABS = [
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "action_taken", label: "Action taken" },
    { value: "dismissed", label: "Dismissed" },
]

const REASON_LABELS: Record<string, string> = {
    fake_profile: "Fake profile",
    harassment: "Harassment or abuse",
    inappropriate_content: "Inappropriate content",
    scam: "Scam / asking for money",
    already_married: "Already married",
    other: "Other",
}

export function AdminReportsPanel() {
    const [reports, setReports] = useState<any[]>([])
    const [activeStatus, setActiveStatus] = useState("pending")
    const [isLoading, setIsLoading] = useState(true)
    const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
    const [processingId, setProcessingId] = useState<string>("")

    const fetchReports = useCallback(async (status: string) => {
        setIsLoading(true)
        try {
            const res = await authFetch(`/api/reports?status=${status}`)
            if (res.ok) {
                const data = await res.json()
                setReports(data.reports || [])
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Failed to load reports")
            }
        } catch {
            toast.error("Network error loading reports")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchReports(activeStatus) }, [activeStatus, fetchReports])

    const resolve = async (reportId: string, status: string) => {
        setProcessingId(reportId)
        try {
            const res = await authFetch("/api/reports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId, status, adminNote: noteDrafts[reportId] || undefined }),
            })
            if (res.ok) {
                toast.success("Report updated")
                setReports(prev => prev.filter(r => r.id !== reportId))
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Failed to update report")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setProcessingId("")
        }
    }

    return (
        <div className="rounded-[20px] border border-[#f0ebe3] bg-white/90 shadow-[0_2px_16px_rgba(31,64,104,0.05)] overflow-hidden">
            <div className="border-b border-[#f0ebe3] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                        <Flag className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#1F4068]">Moderation queue</h2>
                        <p className="text-xs text-gray-500">Member reports against profiles</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#f0ebe3]"
                    onClick={() => fetchReports(activeStatus)}
                >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                </Button>
            </div>

            <div className="flex gap-1.5 px-5 pt-4 flex-wrap">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveStatus(tab.value)}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            activeStatus === tab.value
                                ? "bg-[#1F4068] text-white border-[#1F4068]"
                                : "bg-white text-[#6b7280] border-[#f0ebe3] hover:bg-[#faf8f4]"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-5 space-y-3">
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#f0ebe3] border-t-[#e87898]" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#faf8f4]/70 py-10 text-center text-sm text-gray-500">
                        No {STATUS_TABS.find(t => t.value === activeStatus)?.label.toLowerCase()} reports.
                    </div>
                ) : (
                    reports.map(report => (
                        <div key={report.id} className="rounded-2xl border border-[#f0ebe3] bg-white p-4 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#1F4068]">
                                        {report.reported?.name || "Unknown member"}
                                        {report.reported?.profile_code && (
                                            <span className="ml-2 text-xs font-normal text-gray-400">{report.reported.profile_code}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Reported by {report.reporter?.name || "Unknown"} on {formatToDDMMYYYY(report.created_at)}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 text-[11px] font-medium">
                                    {REASON_LABELS[report.reason] || report.reason}
                                </span>
                            </div>

                            {report.details && (
                                <p className="text-sm text-[#4b5563] bg-[#faf8f4] rounded-xl px-3 py-2 border-l-2 border-red-200">
                                    {report.details}
                                </p>
                            )}

                            {report.admin_note && activeStatus !== "pending" && (
                                <p className="text-xs text-gray-500 italic">Admin note: {report.admin_note}</p>
                            )}

                            {activeStatus === "pending" && (
                                <>
                                    <Textarea
                                        placeholder="Admin note (optional)"
                                        value={noteDrafts[report.id] || ""}
                                        onChange={(e) => setNoteDrafts(prev => ({ ...prev, [report.id]: e.target.value }))}
                                        className="rounded-xl border-[#f0ebe3] min-h-[56px] text-sm"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl border-[#f0ebe3] text-[#1F4068]"
                                            disabled={processingId === report.id}
                                            onClick={() => window.open(`/admin/dashboard/profiles/${report.reported_user_id}`, "_blank")}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1.5" /> View profile
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-xl bg-[#3bb9ac] hover:bg-[#33a396] text-white"
                                            disabled={processingId === report.id}
                                            onClick={() => resolve(report.id, "reviewed")}
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark reviewed
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                                            disabled={processingId === report.id}
                                            onClick={() => resolve(report.id, "action_taken")}
                                        >
                                            <Flag className="h-3.5 w-3.5 mr-1.5" /> Action taken
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl border-[#f0ebe3] text-gray-500"
                                            disabled={processingId === report.id}
                                            onClick={() => resolve(report.id, "dismissed")}
                                        >
                                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Dismiss
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
