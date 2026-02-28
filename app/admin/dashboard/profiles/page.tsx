"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Users, User, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminProfilesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const genderFilter = searchParams.get("gender")

    const [isLoading, setIsLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            // 1. Auth check
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/admin")
                return
            }

            // 2. Fetch personal_details (filtered by gender if provided)
            let query = supabase.from("personal_details").select("user_id, name, age, sex")
            if (genderFilter) {
                query = query.ilike("sex", genderFilter)
            }
            const { data: personalData, error: personalError } = await query
            if (personalError || !personalData) {
                console.error("Error fetching personal_details:", personalError)
                setIsLoading(false)
                return
            }

            const userIds = personalData.map(p => p.user_id)
            if (userIds.length === 0) {
                setProfiles([])
                setIsLoading(false)
                return
            }

            // 3. Fetch contact details for phone numbers
            const { data: contactData } = await supabase
                .from("contact_details")
                .select("user_id, phone")
                .in("user_id", userIds)
            const contactMap: Record<string, string> = {}
            if (contactData) {
                contactData.forEach(c => { contactMap[c.user_id] = c.phone || "" })
            }

            // 4. Fetch referral info from referral_details table
            const { data: referralData } = await supabase
                .from("referral_details")
                .select("user_id, referral_partner_id")
                .in("user_id", userIds)
            const referralMap: Record<string, string> = {}
            if (referralData) {
                referralData.forEach(r => { if (r.referral_partner_id) referralMap[r.user_id] = r.referral_partner_id })
            }

            // 5. Fetch partner names from referral_partners
            const { data: partnersData } = await supabase
                .from("referral_partners")
                .select("partner_id, name")
            const partnerNameMap: Record<string, string> = {}
            if (partnersData) {
                partnersData.forEach(p => { if (p.partner_id) partnerNameMap[p.partner_id] = p.name })
            }

            // 6. Fetch profession data from all 3 profession tables
            const [empRes, busRes, stuRes] = await Promise.all([
                supabase.from("profession_employee").select("user_id, sector, company, designation").in("user_id", userIds),
                supabase.from("profession_business").select("user_id, business_name").in("user_id", userIds),
                supabase.from("profession_student").select("user_id, course").in("user_id", userIds),
            ])
            const profMap: Record<string, string> = {}
            if (empRes.data) empRes.data.forEach(e => { profMap[e.user_id] = e.designation || e.company || e.sector || "Employee" })
            if (busRes.data) busRes.data.forEach(b => { profMap[b.user_id] = b.business_name || "Business" })
            if (stuRes.data) stuRes.data.forEach(s => { profMap[s.user_id] = s.course || "Student" })

            // 7. Combine all data
            const combined = personalData.map(p => {
                const partnerId = referralMap[p.user_id] || null
                return {
                    ...p,
                    phone: contactMap[p.user_id] || "N/A",
                    profession: profMap[p.user_id] || "Not Specified",
                    referralPartnerId: partnerId,
                    partnerName: partnerId ? (partnerNameMap[partnerId] || "Unknown Partner") : "None",
                }
            })

            setProfiles(combined)
            setIsLoading(false)
        }

        fetchData()
    }, [router, genderFilter])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
                    <p className="text-gray-600">Loading profiles...</p>
                </div>
            </div>
        )
    }

    const title = genderFilter === "Male" ? "Men Profiles" : genderFilter === "Female" ? "Women Profiles" : "All Profiles"

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {genderFilter === "Male" ? <User className="h-6 w-6 text-blue-600" /> : genderFilter === "Female" ? <User className="h-6 w-6 text-pink-600" /> : <Users className="h-6 w-6 text-[#4B0082]" />}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({profiles.length} profiles)</span>
                    </div>
                    <Button
                        onClick={() => router.push("/admin/dashboard")}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Profession</TableHead>
                                        <TableHead>Referral Partner</TableHead>
                                        <TableHead>Referral Code</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profiles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No profiles found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        profiles.map((profile) => (
                                            <TableRow
                                                key={profile.user_id}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                onClick={() => router.push(`/admin/dashboard/profiles/${profile.user_id}`)}
                                            >
                                                <TableCell className="font-medium text-[#4B0082] dark:text-purple-400">
                                                    {profile.name || "Unknown"}
                                                </TableCell>
                                                <TableCell>{profile.phone}</TableCell>
                                                <TableCell>{profile.age || "N/A"}</TableCell>
                                                <TableCell>{profile.profession}</TableCell>
                                                <TableCell>{profile.partnerName}</TableCell>
                                                <TableCell className="text-gray-500 font-mono text-sm">{profile.referralPartnerId || "N/A"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
