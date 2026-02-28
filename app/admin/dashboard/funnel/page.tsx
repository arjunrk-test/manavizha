"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Users } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Each stage shows users who STOPPED at that stage:
// They have data in `presentTable` but NOT in `absentTable` (next stage).
const STAGES = [
    { key: "signed_up", label: "Just Signed Up", presentTable: "users", absentTable: "personal_details", idCol: "id" },
    { key: "personal", label: "Personal Details", presentTable: "personal_details", absentTable: "contact_details", idCol: "user_id" },
    { key: "contact", label: "Contact Details", presentTable: "contact_details", absentTable: "education_details", idCol: "user_id" },
    { key: "education", label: "Educational Details", presentTable: "education_details", absentTable: "family_details", idCol: "user_id" },
    { key: "professional", label: "Professional Details", presentTable: "profession_employee", absentTable: "family_details", idCol: "user_id", isProfession: true },
    { key: "family", label: "Family Details", presentTable: "family_details", absentTable: "horoscope_details", idCol: "user_id" },
    { key: "horoscope", label: "Horoscope Details", presentTable: "horoscope_details", absentTable: "interests", idCol: "user_id" },
    { key: "interests", label: "Interests", presentTable: "interests", absentTable: "social_habits", idCol: "user_id" },
    { key: "social", label: "Social Habits", presentTable: "social_habits", absentTable: "photos", idCol: "user_id" },
    { key: "referral", label: "Photos (Referral Yet to be Given)", presentTable: "photos", absentTable: "referral_details", idCol: "user_id" },
]

export default function AdminFunnelSegmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const stage = searchParams.get("stage") || "personal"
    const stageConfig = STAGES.find(s => s.key === stage) || STAGES[1]

    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        const fetchSegment = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push("/admin"); return }

            let presentIds: Set<string> = new Set()
            let absentIds: Set<string> = new Set()

            // --- Fetch present IDs ---
            if (stageConfig.isProfession) {
                const [emp, bus, stu] = await Promise.all([
                    supabase.from("profession_employee").select("user_id"),
                    supabase.from("profession_business").select("user_id"),
                    supabase.from("profession_student").select("user_id"),
                ])
                    ;[...(emp.data || []), ...(bus.data || []), ...(stu.data || [])].forEach(r => presentIds.add(r.user_id))
            } else if (stageConfig.idCol === "id") {
                const { data } = await supabase.from(stageConfig.presentTable).select("id")
                if (data) data.forEach(r => presentIds.add(r.id))
            } else {
                const { data } = await supabase.from(stageConfig.presentTable).select("user_id")
                if (data) data.forEach(r => presentIds.add(r.user_id))
            }

            // --- Fetch absent IDs (those who already progressed further) ---
            if (stageConfig.absentTable) {
                const { data } = await supabase.from(stageConfig.absentTable).select("user_id")
                if (data) data.forEach(r => absentIds.add(r.user_id))
            }

            // Users in present stage but NOT in the next stage
            const stoppedIds = [...presentIds].filter(id => !absentIds.has(id))

            if (stoppedIds.length === 0) {
                setUsers([])
                setIsLoading(false)
                return
            }

            const { data: userData } = await supabase
                .from("users")
                .select("id, email, name, phone")
                .in("id", stoppedIds)

            setUsers(userData || [])
            setIsLoading(false)
        }

        fetchSegment()
    }, [router, stage, stageConfig])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto" />
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-[#4B0082]" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Profiles</h1>
                        <span className="text-sm text-gray-500 dark:text-gray-400">— {stageConfig.label}</span>
                    </div>
                    <Button onClick={() => router.push("/admin/dashboard")} variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 py-8">
                <div className="max-w-7xl mx-auto px-4">

                    {/* Stage breadcrumb */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                        {STAGES.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => router.push(`/admin/dashboard/funnel?stage=${s.key}`)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${s.key === stage
                                        ? "bg-gradient-to-r from-[#4B0082] to-[#FF1493] text-white shadow"
                                        : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                        }`}
                                >
                                    {i + 1}. {s.label}
                                </button>
                                {i < STAGES.length - 1 && <span className="text-gray-300 dark:text-gray-600">→</span>}
                            </div>
                        ))}
                    </div>

                    {/* Summary banner */}
                    <div className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 rounded-xl px-5 py-4 mb-5 flex items-center gap-3">
                        <span className="text-2xl font-bold text-[#4B0082] dark:text-purple-400">{users.length}</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                            user{users.length !== 1 ? "s" : ""} stopped at <span className="font-semibold text-gray-800 dark:text-gray-200">{stageConfig.label}</span> and haven't moved forward
                        </span>
                    </div>

                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Stopped At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No users stopped at this stage.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((u, i) => (
                                        <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell className="text-gray-400 text-sm">{i + 1}</TableCell>
                                            <TableCell className="font-medium text-gray-800 dark:text-gray-200">{u.name || "—"}</TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">{u.email}</TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">{u.phone || "—"}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                    {stageConfig.label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </div>
            </div>
        </div>
    )
}
