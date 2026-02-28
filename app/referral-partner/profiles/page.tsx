"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { ArrowLeft, Users, User, Search, X, HeartHandshake, AlertTriangle } from "lucide-react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"

type Filters = {
    name: string
    phone: string
    ageOp: string
    ageValue: string
    sex: string
    profession: string
    zodiac: string
    star: string
}

const EMPTY_FILTERS: Filters = { name: "", phone: "", ageOp: "=", ageValue: "", sex: "", profession: "", zodiac: "", star: "" }

function FilterInput({ value, onChange, placeholder, icon: Icon = Search, type = "text", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: any; type?: string; className?: string }) {
    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />}
            <input
                type={type}
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || "Search..."}
                className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all ${className}`}
            />
        </div>
    )
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
        >
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    )
}

function ReferralPartnerProfilesListContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const genderFilter = searchParams.get("gender")

    const [isLoading, setIsLoading] = useState(true)
    const [allProfiles, setAllProfiles] = useState<any[]>([])
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [selectedProfileForMarriage, setSelectedProfileForMarriage] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push("/referral-partner"); return }

            const { data: partnerData, error } = await supabase
                .from("referral_partners")
                .select("partner_id, can_edit_profile")
                .eq("user_id", user.id)
                .single()

            if (error || !partnerData) {
                await supabase.auth.signOut()
                router.push("/referral-partner")
                return
            }

            await fetchProfiles(partnerData.partner_id)
            setIsLoading(false)
        }
        init()
    }, [router, genderFilter])

    const fetchProfiles = async (pid: string) => {
        const { data: referralData } = await supabase
            .from("referral_details")
            .select("user_id")
            .eq("referral_partner_id", pid)

        if (!referralData || referralData.length === 0) { setAllProfiles([]); return }

        const userIds = referralData.map((r: any) => r.user_id).filter(Boolean)

        let query = supabase.from("personal_details").select("user_id, name, age, sex, marital_status").in("user_id", userIds)
        if (genderFilter) { query = query.ilike("sex", genderFilter) }

        const { data: personalData } = await query
        if (!personalData || personalData.length === 0) { setAllProfiles([]); return }

        const filteredIds = personalData.map((p: any) => p.user_id)

        const [
            { data: contactData },
            { data: horoData },
            empRes, busRes, stuRes,
        ] = await Promise.all([
            supabase.from("contact_details").select("user_id, phone").in("user_id", filteredIds),
            supabase.from("horoscope_details").select("user_id, zodiac_sign, star").in("user_id", filteredIds),
            supabase.from("profession_employee").select("user_id, sector, company, designation").in("user_id", filteredIds),
            supabase.from("profession_business").select("user_id, business_name").in("user_id", filteredIds),
            supabase.from("profession_student").select("user_id, course").in("user_id", filteredIds),
        ])

        const contactMap: Record<string, string> = {}
        if (contactData) contactData.forEach((c: any) => { contactMap[c.user_id] = c.phone || "" })

        const horoMap: Record<string, { zodiac: string; star: string }> = {}
        if (horoData) horoData.forEach((h: any) => { horoMap[h.user_id] = { zodiac: h.zodiac_sign || "—", star: h.star || "—" } })

        const profMap: Record<string, string> = {}
        if (empRes.data) empRes.data.forEach((e: any) => { profMap[e.user_id] = e.designation || e.company || e.sector || "Employee" })
        if (busRes.data) busRes.data.forEach((b: any) => { profMap[b.user_id] = b.business_name || "Business" })
        if (stuRes.data) stuRes.data.forEach((s: any) => { profMap[s.user_id] = s.course || "Student" })

        setAllProfiles(personalData.map((p: any) => ({
            ...p,
            phone: contactMap[p.user_id] || "N/A",
            profession: profMap[p.user_id] || "—",
            zodiac: horoMap[p.user_id]?.zodiac || "—",
            star: horoMap[p.user_id]?.star || "—",
        })))
    }

    const setFilter = (key: keyof Filters, value: string) => setFilters(prev => ({ ...prev, [key]: value }))
    const hasFilters = Object.values(filters).some(v => v !== "")

    const filteredProfiles = useMemo(() => {
        return allProfiles.filter(p => {
            let ageMatches = true;
            if (filters.ageValue) {
                const profileAge = Number(p.age || 0);
                const targetAge = Number(filters.ageValue);
                if (filters.ageOp === "=") ageMatches = profileAge === targetAge;
                else if (filters.ageOp === ">") ageMatches = profileAge > targetAge;
                else if (filters.ageOp === "<") ageMatches = profileAge < targetAge;
                else if (filters.ageOp === ">=") ageMatches = profileAge >= targetAge;
                else if (filters.ageOp === "<=") ageMatches = profileAge <= targetAge;
            }

            return (
                (!filters.name || (p.name || "").toLowerCase().includes(filters.name.toLowerCase())) &&
                (!filters.phone || (p.phone || "").toLowerCase().includes(filters.phone.toLowerCase())) &&
                ageMatches &&
                (!filters.sex || (p.sex || "").toLowerCase() === filters.sex.toLowerCase()) &&
                (!filters.profession || (p.profession || "").toLowerCase().includes(filters.profession.toLowerCase())) &&
                (!filters.zodiac || (p.zodiac || "") === filters.zodiac) &&
                (!filters.star || (p.star || "") === filters.star)
            )
        })
    }, [allProfiles, filters])

    const activeProfiles = filteredProfiles.filter(p => (p.marital_status || "").toLowerCase() !== "married")
    const marriedProfiles = filteredProfiles.filter(p => (p.marital_status || "").toLowerCase() === "married")

    // Extract unique options derived from loaded data
    const uniqueZodiacs = Array.from(new Set(allProfiles.map(p => p.zodiac).filter(z => z && z !== "—"))).sort() as string[]
    const uniqueStars = Array.from(new Set(allProfiles.map(p => p.star).filter(s => s && s !== "—"))).sort() as string[]
    const uniqueProfessions = Array.from(new Set(allProfiles.map(p => p.profession).filter(p => p && p !== "—"))).sort() as string[]

    const title = genderFilter === "Male" ? "Men Profiles" : genderFilter === "Female" ? "Women Profiles" : "All Referred Profiles"

    const handleMarkAsMarriedClick = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation()
        setSelectedProfileForMarriage(userId)
    }

    const confirmMarkAsMarried = async () => {
        if (!selectedProfileForMarriage) return

        const { error } = await supabase
            .from("personal_details")
            .update({ marital_status: "Married" })
            .eq("user_id", selectedProfileForMarriage)

        if (!error) {
            setAllProfiles(prev => prev.map(p => p.user_id === selectedProfileForMarriage ? { ...p, marital_status: "Married" } : p))
            setSelectedProfileForMarriage(null)
        } else {
            alert("Failed to update status. Please try again.")
        }
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
        </div>
    )

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
            <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
            <div className="fixed inset-0 pointer-events-none">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
                <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {genderFilter === "Male" ? <User className="h-6 w-6 text-blue-600" /> : genderFilter === "Female" ? <User className="h-6 w-6 text-pink-600" /> : <Users className="h-6 w-6 text-[#4B0082]" />}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-xs text-gray-500">
                                {filteredProfiles.length} of {allProfiles.length} profile{allProfiles.length !== 1 ? "s" : ""}
                                {hasFilters && <span className="ml-1 text-[#4B0082]">(filtered)</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFilters && (
                            <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)} className="flex items-center gap-1 text-xs text-red-500 border-red-200 hover:bg-red-50">
                                <X className="h-3 w-3" /> Clear Filters
                            </Button>
                        )}
                        <Button onClick={() => router.push("/referral-partner/dashboard")} variant="outline" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 py-8 pb-8">
                <div className="max-w-7xl mx-auto px-4 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="h-5 w-5 text-[#4B0082]" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Profiles</h2>
                            {hasFilters && (
                                <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                                    {filteredProfiles.length} results
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Name</label>
                                <FilterInput value={filters.name} onChange={v => setFilter("name", v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Phone</label>
                                <FilterInput value={filters.phone} onChange={v => setFilter("phone", v)} />
                            </div>
                            <div className="space-y-1.5 min-w-[140px]">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Age</label>
                                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden focus-within:ring-2 focus-within:ring-[#4B0082]/20 focus-within:border-[#4B0082] transition-all">
                                    <select
                                        value={filters.ageOp}
                                        onChange={e => setFilter("ageOp", e.target.value)}
                                        className="h-9 px-2 text-sm bg-gray-50 dark:bg-gray-800 border-none text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer"
                                    >
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value=">=">&ge;</option>
                                        <option value="<=">&le;</option>
                                    </select>
                                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        value={filters.ageValue || ""}
                                        onChange={e => setFilter("ageValue", e.target.value)}
                                        className="w-full min-w-[60px] px-3 py-2 text-sm bg-transparent border-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Gender</label>
                                <FilterSelect value={filters.sex} onChange={v => setFilter("sex", v)} options={["Male", "Female"]} placeholder="All Genders" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Profession</label>
                                <FilterSelect value={filters.profession} onChange={v => setFilter("profession", v)} options={uniqueProfessions} placeholder="All Professions" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Zodiac Sign</label>
                                <FilterSelect value={filters.zodiac} onChange={v => setFilter("zodiac", v)} options={uniqueZodiacs} placeholder="All Zodiacs" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Star</label>
                                <FilterSelect value={filters.star} onChange={v => setFilter("star", v)} options={uniqueStars} placeholder="All Stars" />
                            </div>
                        </div>
                    </div>

                    {/* Table with Tabs */}
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
                        <Tabs defaultValue="active" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 relative z-20">
                                <TabsTrigger value="active">
                                    Active Profiles ({activeProfiles.length})
                                </TabsTrigger>
                                <TabsTrigger value="married">
                                    <HeartHandshake className="w-4 h-4 mr-2" />
                                    Married Profiles ({marriedProfiles.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active" className="relative z-10">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Age</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead>Profession</TableHead>
                                                <TableHead>Zodiac / Moon Sign</TableHead>
                                                <TableHead>Star</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeProfiles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                        {hasFilters ? "No active profiles match your filters." : "No active profiles found."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                activeProfiles.map((profile) => (
                                                    <TableRow
                                                        key={profile.user_id}
                                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                                        onClick={() => router.push(`/referral-partner/profiles/${profile.user_id}`)}
                                                    >
                                                        <TableCell className="font-medium text-[#4B0082] dark:text-purple-400">{profile.name || "Unknown"}</TableCell>
                                                        <TableCell>{profile.phone}</TableCell>
                                                        <TableCell>{profile.age || "N/A"}</TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${profile.sex?.toLowerCase().includes("female") ? "bg-[#FF1493]/10 text-[#FF1493]" : "bg-blue-100 text-blue-700"
                                                                }`}>
                                                                {profile.sex || "N/A"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{profile.profession}</TableCell>
                                                        <TableCell>{profile.zodiac}</TableCell>
                                                        <TableCell>{profile.star}</TableCell>
                                                        <TableCell className="text-right">
                                                            <button
                                                                onClick={(e) => handleMarkAsMarriedClick(e, profile.user_id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border-2 border-[#FF1493]/40 text-[#FF1493] bg-[#FF1493]/10 hover:bg-[#FF1493]/20 hover:border-[#FF1493]/60 transition-colors cursor-pointer"
                                                            >
                                                                <HeartHandshake className="h-4 w-4" />
                                                                Mark as Married
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="married" className="relative z-10">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Age</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead>Profession</TableHead>
                                                <TableHead>Zodiac / Moon Sign</TableHead>
                                                <TableHead>Star</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marriedProfiles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        {hasFilters ? "No married profiles match your filters." : "No married profiles found."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                marriedProfiles.map((profile) => (
                                                    <TableRow
                                                        key={profile.user_id}
                                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                        onClick={() => router.push(`/referral-partner/profiles/${profile.user_id}`)}
                                                    >
                                                        <TableCell className="font-medium text-[#4B0082] dark:text-purple-400 flex items-center gap-2">
                                                            {profile.name || "Unknown"}
                                                            <span className="bg-[#FF1493]/10 text-[#FF1493] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Married</span>
                                                        </TableCell>
                                                        <TableCell>{profile.phone}</TableCell>
                                                        <TableCell>{profile.age || "N/A"}</TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${profile.sex?.toLowerCase().includes("female") ? "bg-[#FF1493]/10 text-[#FF1493]" : "bg-blue-100 text-blue-700"
                                                                }`}>
                                                                {profile.sex || "N/A"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{profile.profession}</TableCell>
                                                        <TableCell>{profile.zodiac}</TableCell>
                                                        <TableCell>{profile.star}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!selectedProfileForMarriage} onOpenChange={(open) => !open && setSelectedProfileForMarriage(null)}>
                <AlertDialogContent className="bg-white dark:bg-gray-900 border-2 border-[#FF1493]/30 dark:border-[#FF1493]/60 shadow-2xl">
                    <AlertDialogHeader>
                        <div className="mx-auto w-12 h-12 bg-[#FF1493]/10 dark:bg-[#FF1493]/20 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-[#FF1493]" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl text-gray-900 dark:text-white">
                            Confirm Marriage Status
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
                            Are you sure you want to mark this profile as Married? <br /><br />
                            <strong className="text-gray-900 dark:text-gray-200">This action will:</strong>
                            <ul className="list-disc text-left pl-6 mt-2 space-y-1">
                                <li>Remove this profile from the public matching pool.</li>
                                <li>Hide this profile from active searches and general dashboard metrics.</li>
                                <li>Move this profile permanently to the "Married Profiles" tab.</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center mt-6 gap-3">
                        <AlertDialogCancel className="w-full sm:w-auto mt-0 border-2 border-gray-400 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmMarkAsMarried}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#FF1493] to-[#4B0082] hover:opacity-90 text-white border-0 font-semibold shadow-lg shadow-[#FF1493]/20"
                        >
                            Yes, Mark as Married
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default function ReferralPartnerProfilesListPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
            </div>
        }>
            <ReferralPartnerProfilesListContent />
        </Suspense>
    )
}
