"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, User, ShieldCheck, AlertCircle, ExternalLink, Image as ImageIcon, Eye, Clock, Search, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface VerificationRequest {
  user_id: string
  name: string
  live_photo_url: string
  comparison_photo_url: string
  created_at: string
  verification_status: string
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      // Fetch photos first, then manually join with personal_details 
      // since there is no explicit FK relation for PostgREST to join automatically
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
          setIsLoading(false)
          return
      }

      // Fetch names from personal_details for these users
      const userIds = photosData.map(p => p.user_id)
      const { data: personalData, error: personalError } = await supabase
        .from("personal_details")
        .select("user_id, name")
        .in("user_id", userIds)

      const formatted = photosData.map((photo: any) => {
        const personal = personalData?.find(p => p.user_id === photo.user_id)
        return {
          user_id: photo.user_id,
          name: personal?.name || "Unknown User",
          live_photo_url: photo.live_photo_url,
          comparison_photo_url: photo.comparison_photo_url,
          created_at: photo.created_at,
          verification_status: photo.verification_status
        }
      })

      setRequests(formatted)
    } catch (err: any) {
      console.error("Error fetching verification requests:", {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        fullError: err
      })
      toast.error("Failed to load verification queue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (userId: string, status: "verified" | "rejected") => {
    setProcessingId(userId)
    try {
      // 1. Update photos table
      const { error: photosError } = await supabase
        .from("photos")
        .update({ verification_status: status })
        .eq("user_id", userId)

      if (photosError) throw photosError

      // 2. Update personal_details table if verified
      if (status === "verified") {
        const { error: personalError } = await supabase
          .from("personal_details")
          .update({ photo_verified: true })
          .eq("user_id", userId)

        if (personalError) throw personalError
      } else {
          // If rejected, maybe unset photo_verified
          await supabase
            .from("personal_details")
            .update({ photo_verified: false })
            .eq("user_id", userId)
      }

      toast.success(`User ${status === "verified" ? "verified" : "rejected"} successfully`)
      setRequests(prev => prev.filter(r => r.user_id !== userId))
      setSelectedRequest(null)
    } catch (err) {
      console.error("Error processing verification:", err)
      toast.error("Failed to process request")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <AdminNavbar />
      
      <div className="pt-24 container mx-auto px-4 max-w-6xl">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-[#4B0082]" />
                    Verification Queue
                </h1>
                <p className="text-gray-500 mt-1">Review pending photo verification requests from users.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or ID..." 
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 transition-all w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="bg-[#4B0082]/10 text-[#4B0082] dark:bg-[#4B0082]/20 dark:text-purple-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {requests.length} Pending
                </div>
            </div>
        </header>

        <Card className="border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B0082]"></div>
            <p className="text-gray-500 font-medium text-sm">Fetching verification queue...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Caught Up!</h3>
            <p className="text-gray-500 mt-2 max-w-md">There are no pending verification requests {searchQuery ? "matching your search" : "at the moment"}.</p>
            {searchQuery && (
                 <Button onClick={() => setSearchQuery("")} variant="link" className="mt-2 text-[#4B0082]">Clear Search</Button>
            )}
            {!searchQuery && (
                 <Button onClick={fetchRequests} variant="outline" className="mt-8 rounded-xl px-8">Refresh List</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <TableRow className="border-b border-gray-100 dark:border-gray-800">
                        <TableHead className="font-bold text-gray-700 dark:text-gray-300">User Details</TableHead>
                        <TableHead className="font-bold text-gray-700 dark:text-gray-300">Requested Date</TableHead>
                        <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRequests.map((request) => (
                        <TableRow key={request.user_id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800">
                            <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B0082] to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {request.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{request.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">ID: {request.user_id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(request.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    <span className="mx-2 opacity-30">•</span>
                                    {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                                <Button 
                                    onClick={() => setSelectedRequest(request)}
                                    variant="outline" 
                                    size="sm"
                                    className="rounded-lg h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#4B0082] hover:text-[#4B0082] group/btn transition-all"
                                >
                                    Review Photos
                                    <Eye className="h-3.5 w-3.5 ml-2 group-hover/btn:scale-110 transition-transform" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        )}
        </Card>
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-gray-900 shadow-2xl">
            {selectedRequest && (
                <>
                    <DialogHeader className="p-6 bg-gradient-to-r from-[#4B0082] to-[#6A5ACD] text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl border border-white/30">
                                    {selectedRequest.name.charAt(0)}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-white">{selectedRequest.name}</DialogTitle>
                                    <DialogDescription className="text-white/70 text-xs">
                                        Reviewing identity verification for user: {selectedRequest.user_id}
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-8">
                        {/* Horizontal Card for Comparison */}
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* Original Photo */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="h-3 w-3 text-blue-500" /> Original Profile
                                    </h4>
                                    <a href={selectedRequest.comparison_photo_url} target="_blank" rel="noreferrer" className="text-[10px] text-[#4B0082] hover:underline flex items-center gap-1 font-medium">
                                        Full Image <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                </div>
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-gray-100 dark:border-gray-800 bg-gray-50 shadow-inner">
                                    <img 
                                        src={selectedRequest.comparison_photo_url} 
                                        alt="Original" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </div>

                            {/* Live Selfie */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" /> Live Selfie
                                    </h4>
                                    <a href={selectedRequest.live_photo_url} target="_blank" rel="noreferrer" className="text-[10px] text-amber-500 hover:underline flex items-center gap-1 font-medium">
                                        Full Image <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                </div>
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-amber-50 dark:border-amber-900/20 bg-amber-50 shadow-inner">
                                    <img 
                                        src={selectedRequest.live_photo_url} 
                                        alt="Live Selfie" 
                                        className="w-full h-full object-cover scale-x-[-1]" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-start gap-3 border border-blue-100 dark:border-blue-800/50">
                            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                Please ensure the person in both photos is identical. Pay attention to facial features like eyes, nose, and jawline. The live selfie might be mirrored.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-900/10 font-bold rounded-xl"
                            onClick={() => handleAction(selectedRequest.user_id, "rejected")}
                            disabled={processingId === selectedRequest.user_id}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            className="flex-[2] h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 font-bold rounded-xl shadow-lg shadow-green-500/20"
                            onClick={() => handleAction(selectedRequest.user_id, "verified")}
                            disabled={processingId === selectedRequest.user_id}
                        >
                            {processingId === selectedRequest.user_id ? "Processing..." : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve & Verify Profile
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </main>
  )
}

