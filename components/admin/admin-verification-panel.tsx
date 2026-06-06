"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VerificationRequest {
  user_id: string
  name: string
  live_photo_url: string
  comparison_photo_url: string
  created_at: string
  verification_status: string
}

const DIALOG_CONTENT =
  "rounded-xl border border-[#f0ebe3] bg-white text-[#1F4068] shadow-xl p-0 overflow-hidden flex flex-col max-h-[90vh]"
const DIALOG_TITLE = "font-display text-base font-semibold text-[#1F4068]"

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function formatRelativeAge(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function AdminVerificationPanel() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchRequests = async (silent = false) => {
    if (silent) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select(`
          user_id,
          live_photo_url,
          comparison_photo_url,
          verification_status,
          created_at
        `)
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false })

      if (photosError) throw photosError

      if (!photosData || photosData.length === 0) {
        setRequests([])
        return
      }

      const userIds = photosData.map((p) => p.user_id)
      const { data: personalData } = await supabase
        .from("personal_details")
        .select("user_id, name")
        .in("user_id", userIds)

      const formatted = photosData.map((photo: any) => {
        const personal = personalData?.find((p) => p.user_id === photo.user_id)
        return {
          user_id: photo.user_id,
          name: personal?.name || "Unknown User",
          live_photo_url: photo.live_photo_url,
          comparison_photo_url: photo.comparison_photo_url,
          created_at: photo.created_at,
          verification_status: photo.verification_status,
        }
      })

      setRequests(formatted)
    } catch (err: any) {
      console.error("Error fetching verification requests:", err)
      toast.error("Failed to load verification queue")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (userId: string, status: "verified" | "rejected") => {
    setProcessingId(userId)
    try {
      const { error: photosError } = await supabase
        .from("photos")
        .update({ verification_status: status })
        .eq("user_id", userId)

      if (photosError) throw photosError

      if (status === "verified") {
        const { error: personalError } = await supabase
          .from("personal_details")
          .update({ photo_verified: true })
          .eq("user_id", userId)

        if (personalError) throw personalError
      } else {
        await supabase
          .from("personal_details")
          .update({ photo_verified: false })
          .eq("user_id", userId)
      }

      toast.success(`User ${status === "verified" ? "verified" : "rejected"} successfully`)
      setRequests((prev) => prev.filter((r) => r.user_id !== userId))
      setSelectedRequest(null)
    } catch (err) {
      console.error("Error processing verification:", err)
      toast.error("Failed to process request")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return requests
    return requests.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.user_id.toLowerCase().includes(q)
    )
  }, [requests, searchQuery])

  const oldestRequest = requests.length
    ? requests.reduce((oldest, r) =>
        new Date(r.created_at) < new Date(oldest.created_at) ? r : oldest
      )
    : null

  return (
    <>
      <ThemedPanel>
        <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f7f5]">
                <ShieldCheck className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                  Trust &amp; Safety
                </p>
                <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                  Verification Queue
                </h1>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Review pending photo verification requests from members
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(true)}
              disabled={isRefreshing}
              className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Pending reviews", value: requests.length },
              {
                label: "Showing",
                value: searchQuery ? filteredRequests.length : requests.length,
                sub: searchQuery ? "filtered results" : "all pending",
              },
              {
                label: "Oldest request",
                value: oldestRequest ? formatRelativeAge(oldestRequest.created_at) : "—",
                sub: oldestRequest ? "in queue" : "queue empty",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5"
              >
                <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
                <p className="font-display text-lg font-semibold text-[#1F4068]">{stat.value}</p>
                {stat.sub && <p className="text-[9px] text-gray-400">{stat.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-3 sm:px-5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or user ID..."
              className="h-9 rounded-lg border-[#c5d4e4] bg-white pl-9 pr-9 text-[12px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
            <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
              <h2 className="font-display text-base font-semibold text-[#1F4068]">Pending requests</h2>
              <p className="text-[11px] text-gray-500">
                Compare profile photos with live selfies before approving
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
                <p className="text-[12px] text-gray-500">Loading verification queue...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f7f5]">
                  <CheckCircle2 className="h-7 w-7 text-[#3bb9ac]" />
                </div>
                <h3 className="font-display text-base font-semibold text-[#1F4068]">All caught up</h3>
                <p className="mt-1 max-w-sm text-[12px] text-gray-500">
                  {searchQuery
                    ? "No pending requests match your search."
                    : "There are no pending verification requests at the moment."}
                </p>
                {searchQuery ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-[#3bb9ac]"
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchRequests(true)}
                    className="mt-4 rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
                  >
                    Refresh queue
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                      {["Member", "Submitted", "Waiting", "Actions"].map((head) => (
                        <th
                          key={head}
                          className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] ${
                            head === "Actions" ? "text-right" : "text-left"
                          }`}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.user_id}
                        className="border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4068]/10 text-[12px] font-semibold text-[#1F4068]">
                              {request.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-[#1F4068]">{request.name}</p>
                              <p className="font-mono text-[10px] text-gray-400">
                                {request.user_id.slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600">
                          {new Date(request.created_at).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          <span className="mx-1.5 text-gray-300">·</span>
                          {new Date(request.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold text-[#c9a227]">
                            {formatRelativeAge(request.created_at)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            title="Review photos"
                            aria-label="Review photos"
                            className="h-8 w-8 rounded-lg border-[#f0ebe3] bg-white p-0 text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ThemedPanel>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className={`${DIALOG_CONTENT} sm:max-w-4xl`}>
          {selectedRequest && (
            <>
              <DialogHeader className="border-b border-[#f0ebe3] bg-[#faf8f4] px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f0ebe3] bg-white text-[15px] font-semibold text-[#1F4068]">
                    {selectedRequest.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className={DIALOG_TITLE}>{selectedRequest.name}</DialogTitle>
                    <DialogDescription className="text-[11px] text-gray-500">
                      Identity verification · {selectedRequest.user_id}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid items-stretch gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                      <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1F4068]">
                        <ImageIcon className="h-3 w-3 text-[#3bb9ac]" />
                        Profile photo
                      </h4>
                      <a
                        href={selectedRequest.comparison_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium text-[#3bb9ac] hover:underline"
                      >
                        Full image <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl border-2 border-[#f0ebe3] bg-[#faf8f4]">
                      <img
                        src={selectedRequest.comparison_photo_url}
                        alt="Profile photo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                      <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c9a227]">
                        <ShieldCheck className="h-3 w-3" />
                        Live selfie
                      </h4>
                      <a
                        href={selectedRequest.live_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium text-[#c9a227] hover:underline"
                      >
                        Full image <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl border-2 border-[#c9a227]/25 bg-[#fdf6e3]">
                      <img
                        src={selectedRequest.live_photo_url}
                        alt="Live selfie"
                        className="h-full w-full scale-x-[-1] object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#c5d4e4] bg-[#e8eef5] px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1F4068]" />
                  <p className="text-[11px] leading-relaxed text-[#1F4068]/80">
                    Confirm the person in both photos is the same. Check facial features such as eyes,
                    nose, and jawline. The live selfie may appear mirrored.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-[#f0ebe3] bg-[#faf8f4] px-5 py-4 sm:justify-stretch">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-lg border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleAction(selectedRequest.user_id, "rejected")}
                  disabled={processingId === selectedRequest.user_id}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  type="button"
                  className="flex-[2] rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
                  onClick={() => handleAction(selectedRequest.user_id, "verified")}
                  disabled={processingId === selectedRequest.user_id}
                >
                  {processingId === selectedRequest.user_id ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Approve &amp; verify profile
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
