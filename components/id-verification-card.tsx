"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ShieldCheck, Upload, Clock, CheckCircle2, XCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const DOC_TYPES = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
]

export function IdVerificationCard({ userId }: { userId: string }) {
    const [status, setStatus] = useState<string | null>(null)
    const [adminNote, setAdminNote] = useState<string | null>(null)
    const [docType, setDocType] = useState("aadhaar")
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await authFetch("/api/id-verification")
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data.verification?.status || null)
                    setAdminNote(data.verification?.admin_note || null)
                    if (data.verification?.document_type) setDocType(data.verification.document_type)
                }
            } catch { /* ignore */ } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const submit = async () => {
        if (!file) { toast.error("Please choose a document image or PDF"); return }
        if (file.size > 8 * 1024 * 1024) { toast.error("File must be under 8 MB"); return }

        setSubmitting(true)
        try {
            const ext = file.name.split(".").pop() || "jpg"
            const path = `${userId}/id_${docType}_${Date.now()}.${ext}`

            const { error: upErr } = await supabase.storage
                .from("id-documents")
                .upload(path, file, { upsert: true, contentType: file.type || undefined })

            if (upErr) throw upErr

            const res = await authFetch("/api/id-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentType: docType, documentPath: path }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                toast.success("Document submitted. Our team will review it shortly.")
                setStatus("pending")
                setAdminNote(null)
                setFile(null)
            } else {
                toast.error(data.error || "Submission failed")
            }
        } catch (e: any) {
            toast.error(e?.message || "Upload failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="animate-pulse h-40 rounded-2xl bg-[#faf8f4]" />
    }

    const statusBadge = () => {
        if (status === "approved") return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0] px-3 py-1 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
        )
        if (status === "pending") return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffbeb] text-[#c9a227] border border-[#fde68a] px-3 py-1 text-xs font-medium">
                <Clock className="h-3.5 w-3.5" /> Under review
            </span>
        )
        if (status === "rejected") return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef2f2] text-red-600 border border-red-100 px-3 py-1 text-xs font-medium">
                <XCircle className="h-3.5 w-3.5" /> Rejected
            </span>
        )
        return null
    }

    const canResubmit = status !== "approved" && status !== "pending"

    return (
        <div className="rounded-2xl border border-[#f0ebe3] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f7f5]">
                        <ShieldCheck className="h-4 w-4 text-[#3bb9ac]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#1F4068]">ID Verification</h3>
                        <p className="text-xs text-gray-500">Get a verified badge with a government ID</p>
                    </div>
                </div>
                {statusBadge()}
            </div>

            {status === "approved" ? (
                <p className="text-sm text-[#4b5563] bg-[#ecfdf5] rounded-xl px-3 py-2.5 border border-[#bbf7d0]">
                    Your identity has been verified. A verified badge now appears on your profile.
                </p>
            ) : status === "pending" ? (
                <p className="text-sm text-[#4b5563] bg-[#fffbeb] rounded-xl px-3 py-2.5 border border-[#fde68a]">
                    Your {DOC_TYPES.find(d => d.value === docType)?.label} is under review. This usually takes 1–2 days.
                </p>
            ) : (
                <>
                    {status === "rejected" && adminNote && (
                        <p className="text-sm text-red-600 bg-[#fef2f2] rounded-xl px-3 py-2.5 border border-red-100">
                            Rejected: {adminNote}. Please re-submit a clearer document.
                        </p>
                    )}

                    <div>
                        <label className="text-xs font-medium text-[#6b7280]">Document type</label>
                        <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {DOC_TYPES.map(d => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDocType(d.value)}
                                    className={cn(
                                        "px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                                        docType === d.value
                                            ? "border-[#3bb9ac] bg-[#e6f7f5] text-[#1F4068]"
                                            : "border-[#f0ebe3] bg-white text-[#6b7280] hover:bg-[#faf8f4]"
                                    )}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-dashed border-[#eadfce] bg-[#faf8f4]/60 px-4 py-3 cursor-pointer hover:bg-[#faf8f4]">
                        <FileText className="h-5 w-5 text-[#9ca3af] shrink-0" />
                        <span className="text-sm text-[#4b5563] truncate">
                            {file ? file.name : "Choose an image or PDF of your ID"}
                        </span>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>

                    <p className="text-[11px] text-gray-400">
                        Your document is stored privately and only used for verification. It is never shown on your profile.
                    </p>

                    <Button
                        onClick={submit}
                        disabled={submitting || !file}
                        className="rounded-xl bg-[#3bb9ac] hover:bg-[#33a396] text-white"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        {submitting ? "Submitting..." : canResubmit && status === "rejected" ? "Re-submit document" : "Submit for verification"}
                    </Button>
                </>
            )}
        </div>
    )
}
