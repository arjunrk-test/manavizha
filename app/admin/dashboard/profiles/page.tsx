"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { updateUserPremiumSubscription } from "@/app/actions/admin"
import { ArrowLeft, Users, User, UserCheck, Search, X, HeartHandshake, AlertTriangle, Crown, Star, Gem, Shield, MoreVertical } from "lucide-react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
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

type Filters = {
    name: string
    phone: string
    ageOp: string
    ageValue: string
    profession: string
    partnerName: string
    referralPartnerId: string
}

const EMPTY_FILTERS: Filters = { name: "", phone: "", ageOp: "=", ageValue: "", profession: "", partnerName: "", referralPartnerId: "" }

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

function getPremiumBadge(isPremium: boolean, plan: string | null, expiresAt: string | null = null) {
    if (!isPremium) return <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Free</span>
    
    const isExpired = expiresAt && new Date(expiresAt) < new Date()
    
    if (isExpired) return <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-sm"><AlertTriangle className="h-3 w-3"/> Expired</span>

    if (plan === 'till_you_marry') return <span className="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-md shadow-pink-200 dark:shadow-none"><Crown className="h-3 w-3"/> Lifetime</span>
    if (plan === 'elite') return <span className="bg-gradient-to-r from-[#4B0082] to-[#8A2BE2] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-md shadow-purple-200 dark:shadow-none"><Gem className="h-3 w-3"/> Elite</span>
    if (plan === 'prime_gold') return <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-md shadow-amber-200 dark:shadow-none"><Star className="h-3 w-3"/> Gold</span>
    if (plan === 'prime' || plan === '3_months') return <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-md shadow-blue-200 dark:shadow-none"><Shield className="h-3 w-3"/> Prime</span>
    
    return <span className="bg-[#4B0082] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 w-fit shadow-md shadow-purple-200 dark:shadow-none"><Crown className="h-3 w-3"/> Premium</span>
}

function AdminProfilesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const genderFilter = searchParams.get("gender")

    const [isLoading, setIsLoading] = useState(true)
    const [allProfiles, setAllProfiles] = useState<any[]>([])
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [selectedProfileForMarriage, setSelectedProfileForMarriage] = useState<string | null>(null)
    const [isUpdatingPremium, setIsUpdatingPremium] = useState<string | null>(null)
    const [isManageSubOpen, setIsManageSubOpen] = useState(false)
    const [manageSubUserId, setManageSubUserId] = useState<string | null>(null)
    const [subPlan, setSubPlan] = useState<string>('prime')
    const [subDuration, setSubDuration] = useState<string>('3')

    useEffect(() => {
        const fetchData = async () => {
            // 1. Auth check
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push("/admin"); return }

            // 2. Fetch personal_details
            let query = supabase.from("personal_details").select("user_id, name, age, sex, marital_status")
            if (genderFilter) { query = query.ilike("sex", genderFilter) }
            const { data: personalData, error: personalError } = await query
            if (personalError || !personalData) { setIsLoading(false); return }

            const userIds = personalData.map(p => p.user_id)
            if (userIds.length === 0) { setAllProfiles([]); setIsLoading(false); return }

            // 3. Contact, referral, profession, settings — parallel
            const [
                { data: contactData },
                { data: referralData },
                { data: partnersData },
                { data: settingsData },
                empRes, busRes, stuRes,
            ] = await Promise.all([
                supabase.from("contact_details").select("user_id, phone").in("user_id", userIds),
                supabase.from("referral_details").select("user_id, referral_partner_id").in("user_id", userIds),
                supabase.from("referral_partners").select("partner_id, name"),
                supabase.from("user_settings").select("user_id, is_premium, premium_plan, premium_expires_at").in("user_id", userIds),
                supabase.from("profession_employee").select("user_id, sector, company, designation").in("user_id", userIds),
                supabase.from("profession_business").select("user_id, business_name").in("user_id", userIds),
                supabase.from("profession_student").select("user_id, course").in("user_id", userIds),
            ])

            const contactMap: Record<string, string> = {}
            if (contactData) contactData.forEach(c => { contactMap[c.user_id] = c.phone || "" })

            const referralMap: Record<string, string> = {}
            if (referralData) referralData.forEach(r => { if (r.referral_partner_id) referralMap[r.user_id] = r.referral_partner_id })

            const partnerNameMap: Record<string, string> = {}
            if (partnersData) partnersData.forEach(p => { if (p.partner_id) partnerNameMap[p.partner_id] = p.name })

            const settingsMap: Record<string, { is_premium: boolean, premium_plan: string | null, premium_expires_at: string | null }> = {}
            if (settingsData) settingsData.forEach(s => { settingsMap[s.user_id] = { is_premium: s.is_premium, premium_plan: s.premium_plan, premium_expires_at: s.premium_expires_at } })

            const profMap: Record<string, string> = {}
            if (empRes.data) empRes.data.forEach((e: any) => { profMap[e.user_id] = e.designation || e.company || e.sector || "Employee" })
            if (busRes.data) busRes.data.forEach((b: any) => { profMap[b.user_id] = b.business_name || "Business" })
            if (stuRes.data) stuRes.data.forEach((s: any) => { profMap[s.user_id] = s.course || "Student" })

            const combined = personalData.map(p => {
                const partnerId = referralMap[p.user_id] || null
                return {
                    ...p,
                    phone: contactMap[p.user_id] || "N/A",
                    profession: profMap[p.user_id] || "Not Specified",
                    referralPartnerId: partnerId,
                    partnerName: partnerId ? (partnerNameMap[partnerId] || "Unknown Partner") : "None",
                    isPremium: settingsMap[p.user_id]?.is_premium || false,
                    premiumPlan: settingsMap[p.user_id]?.premium_plan || null,
                    premiumExpiresAt: settingsMap[p.user_id]?.premium_expires_at || null,
                }
            })

            setAllProfiles(combined)
            setIsLoading(false)
        }

        fetchData()
    }, [router, genderFilter])

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
                (!filters.profession || (p.profession || "") === filters.profession) &&
                (!filters.partnerName || (p.partnerName || "").toLowerCase().includes(filters.partnerName.toLowerCase())) &&
                (!filters.referralPartnerId || (p.referralPartnerId || "").toLowerCase().includes(filters.referralPartnerId.toLowerCase()))
            )
        })
    }, [allProfiles, filters])

    const activeProfiles = filteredProfiles.filter(p => (p.marital_status || "").toLowerCase() !== "married")
    const marriedProfiles = filteredProfiles.filter(p => (p.marital_status || "").toLowerCase() === "married")

    const uniqueProfessions = Array.from(new Set(allProfiles.map(p => p.profession).filter(p => p && p !== "Not Specified"))).sort() as string[]

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

    const handleSaveSubscription = async () => {
        if (!manageSubUserId) return
        
        setIsUpdatingPremium(manageSubUserId)
        setIsManageSubOpen(false)
        
        const isPremium = subPlan !== 'none'
        const plan = isPremium ? subPlan : null
        
        let expiresAt: string | null = null
        if (isPremium && subDuration !== 'lifetime') {
            const date = new Date()
            date.setMonth(date.getMonth() + parseInt(subDuration))
            expiresAt = date.toISOString()
        }
        
        const { success, error } = await updateUserPremiumSubscription({
            userId: manageSubUserId,
            isPremium,
            plan,
            expiresAt
        })
        
        if (success) {
            setAllProfiles(prev => prev.map(p => p.user_id === manageSubUserId ? { ...p, isPremium, premiumPlan: plan, premiumExpiresAt: expiresAt } : p))
        } else {
            console.error("Subscription update error:", error)
            alert("Failed to update premium status. " + (error || ""))
        }
        setIsUpdatingPremium(null)
        setManageSubUserId(null)
    }

    const openManageSubscription = (userId: string, currentPlan: string | null) => {
        setManageSubUserId(userId)
        setSubPlan(currentPlan || 'prime')
        setSubDuration('3')
        setIsManageSubOpen(true)
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        </div>
    )

    const title = genderFilter === "Male" ? "Men Profiles" : genderFilter === "Female" ? "Women Profiles" : "All Profiles"

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {genderFilter === "Male" ? <User className="h-6 w-6 text-blue-600" /> : genderFilter === "Female" ? <User className="h-6 w-6 text-pink-600" /> : <Users className="h-6 w-6 text-[#4B0082]" />}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-sm text-gray-500">
                                {filteredProfiles.length} of {allProfiles.length} profiles
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
                        <Button onClick={() => router.push("/admin/dashboard")} variant="outline" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 py-8">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Profession</label>
                                <FilterSelect value={filters.profession} onChange={v => setFilter("profession", v)} options={uniqueProfessions} placeholder="All Professions" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Partner Name</label>
                                <FilterInput value={filters.partnerName} onChange={v => setFilter("partnerName", v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-1">Referral Code</label>
                                <FilterInput value={filters.referralPartnerId} onChange={v => setFilter("referralPartnerId", v)} />
                            </div>
                        </div>
                    </div>

                    {/* Table with Tabs */}
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6">
                        <Tabs defaultValue="active" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                                <TabsTrigger value="active">
                                    Active Profiles ({activeProfiles.length})
                                </TabsTrigger>
                                <TabsTrigger value="married">
                                    <HeartHandshake className="w-4 h-4 mr-2" />
                                    Married Profiles ({marriedProfiles.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="active">
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
                                                <TableHead>Subscription</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeProfiles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                        {hasFilters ? "No active profiles match your filters." : "No active profiles found."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                activeProfiles.map((profile) => (
                                                    <TableRow
                                                        key={profile.user_id}
                                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                                        onClick={() => router.push(`/admin/dashboard/profiles/${profile.user_id}`)}
                                                    >
                                                        <TableCell className="font-medium text-[#4B0082] dark:text-purple-400">{profile.name || "Unknown"}</TableCell>
                                                        <TableCell>{profile.phone}</TableCell>
                                                        <TableCell>{profile.age || "N/A"}</TableCell>
                                                        <TableCell>{profile.profession}</TableCell>
                                                        <TableCell>{profile.partnerName}</TableCell>
                                                        <TableCell className="text-gray-500 font-mono text-sm">{profile.referralPartnerId || "N/A"}</TableCell>
                                                        <TableCell>{getPremiumBadge(profile.isPremium, profile.premiumPlan, profile.premiumExpiresAt)}</TableCell>
                                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={(e) => handleMarkAsMarriedClick(e, profile.user_id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border-2 border-[#FF1493]/40 text-[#FF1493] bg-[#FF1493]/10 hover:bg-[#FF1493]/20 hover:border-[#FF1493]/60 transition-colors cursor-pointer"
                                                            >
                                                                <HeartHandshake className="h-4 w-4" />
                                                                Mark as Married
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openManageSubscription(profile.user_id, profile.premiumPlan); }}
                                                                className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors border border-gray-200 dark:border-gray-700"
                                                                title="Manage Subscription"
                                                            >
                                                                {isUpdatingPremium === profile.user_id ? <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/> : <Star className="h-5 w-5 text-amber-500" />}
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="married">
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
                                                <TableHead>Subscription</TableHead>
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
                                                        onClick={() => router.push(`/admin/dashboard/profiles/${profile.user_id}`)}
                                                    >
                                                        <TableCell className="font-medium text-[#4B0082] dark:text-purple-400 flex items-center gap-2">
                                                            {profile.name || "Unknown"}
                                                            <span className="bg-[#FF1493]/10 text-[#FF1493] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Married</span>
                                                        </TableCell>
                                                        <TableCell>{profile.phone}</TableCell>
                                                        <TableCell>{profile.age || "N/A"}</TableCell>
                                                        <TableCell>{profile.profession}</TableCell>
                                                        <TableCell>{profile.partnerName}</TableCell>
                                                        <TableCell className="text-gray-500 font-mono text-sm">{profile.referralPartnerId || "N/A"}</TableCell>
                                                        <TableCell>{getPremiumBadge(profile.isPremium, profile.premiumPlan, profile.premiumExpiresAt)}</TableCell>
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

            {/* Manage Subscription Dialog */}
            <Dialog open={isManageSubOpen} onOpenChange={setIsManageSubOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Crown className="h-5 w-5 text-[#4B0082] dark:text-purple-400"/>
                            Manage Subscription
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Tier</label>
                            <select 
                                value={subPlan}
                                onChange={(e) => setSubPlan(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4B0082] focus:border-transparent transition-all"
                            >
                                <option value="none">Free (Revoke Premium)</option>
                                <option value="prime">Prime (₹2,000)</option>
                                <option value="prime_gold">Prime Gold (₹6,000)</option>
                                <option value="elite">Elite (₹10,000)</option>
                                <option value="till_you_marry">Till You Marry (₹10,000)</option>
                            </select>
                        </div>

                        {subPlan !== 'none' && subPlan !== 'till_you_marry' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration Limit</label>
                                <select 
                                    value={subDuration}
                                    onChange={(e) => setSubDuration(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4B0082] focus:border-transparent transition-all"
                                >
                                    <option value="1">1 Month</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">1 Year</option>
                                    <option value="lifetime">Lifetime Access</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="flex items-center gap-2 sm:justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                        <Button variant="ghost" onClick={() => setIsManageSubOpen(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSubscription} className="bg-gradient-to-r from-[#4B0082] to-[#FF1493] hover:opacity-90 text-white rounded-lg">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function AdminProfilesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
            </div>
        }>
            <AdminProfilesContent />
        </Suspense>
    )
}
