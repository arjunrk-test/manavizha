"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Bell, Phone, UserX, UserMinus, Shield, EyeOff, Key, Mail, RefreshCw, AlertTriangle, Heart, Settings2, ShieldCheck
} from "lucide-react"
import { IdVerificationCard } from "@/components/id-verification-card"
import { toast } from "sonner"
import { MarriedConfirmationDialog } from "@/components/married-confirmation-dialog"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("alerts")

    const [settings, setSettings] = useState<any>({
        email_alerts: { member_activity: true, phone_views: true, express_interest: true, personalized_messages: true, shortlists: true },
        sms_alerts: { member_activity: true, phone_views: true, express_interest: true, personalized_messages: true },
        call_preference: "Call when there are important updates",
        contact_person: "Self",
        convenient_call_time: "Anytime",
        mobile_privacy: "show_all",
        horoscope_privacy: "visible_all",
        horoscope_password: "",
        profile_privacy: "show_all",
        photo_visibility: "everyone",
        is_deactivated: false,
        deactivated_until: null,
    })
    const [incomingPhotoRequests, setIncomingPhotoRequests] = useState<any[]>([])
    const [photoPasswordDraft, setPhotoPasswordDraft] = useState("")

    const [blockedProfiles, setBlockedProfiles] = useState<any[]>([])
    const [ignoredProfiles, setIgnoredProfiles] = useState<any[]>([])
    const [deactivateDays, setDeactivateDays] = useState("15")
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [isReactivating, setIsReactivating] = useState(false)
    const [showMarriedConfirm, setShowMarriedConfirm] = useState(false)
    const [isMarkingMarried, setIsMarkingMarried] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)

    const isCurrentlyDeactivated = settings.is_deactivated && settings.deactivated_until && new Date(settings.deactivated_until) > new Date()

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/")
                return
            }
            setUserId(session.user.id)
            setUserEmail(session.user.email || "")

            try {
                const setRes = await authFetch(`/api/settings?userId=${session.user.id}`)
                if (setRes.ok) {
                    const setData = await setRes.json()
                    if (Object.keys(setData).length > 0) {
                        setSettings((prev: any) => ({ ...prev, ...setData }))
                    }
                }

                const blockRes = await authFetch(`/api/blocks?userId=${session.user.id}`)
                if (blockRes.ok) {
                    const blockData = await blockRes.json()
                    if (blockData.blockedIds?.length > 0) {
                        const { data } = await supabase.from('personal_details').select('user_id, name').in('user_id', blockData.blockedIds)
                        setBlockedProfiles(data || [])
                    }
                }

                const ignRes = await authFetch(`/api/ignores?userId=${session.user.id}`)
                if (ignRes.ok) {
                    const ignData = await ignRes.json()
                    if (ignData.ignoredIds?.length > 0) {
                        const { data } = await supabase.from('personal_details').select('user_id, name').in('user_id', ignData.ignoredIds)
                        setIgnoredProfiles(data || [])
                    }
                }

                const prRes = await authFetch(`/api/photo-requests`).catch(() => null)
                if (prRes?.ok) {
                    const prData = await prRes.json()
                    setIncomingPhotoRequests(prData.requests || [])
                }
            } catch (err) {
                console.error("Error loading settings:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadInitialData()
    }, [router])

    const respondToPhotoRequest = async (requesterId: string, status: "approved" | "declined") => {
        try {
            const res = await authFetch("/api/photo-requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterId, status }),
            })
            if (res.ok) {
                setIncomingPhotoRequests((prev) => prev.filter((r) => r.requester_id !== requesterId))
                toast.success(status === "approved" ? "Photos shared" : "Request declined")
            } else {
                toast.error("Failed to update request")
            }
        } catch {
            toast.error("Network error")
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText.trim().toUpperCase() !== "DELETE") return
        setIsDeleting(true)
        try {
            const res = await authFetch("/api/account/delete", { method: "POST" })
            if (res.ok) {
                toast.success("Your account has been permanently deleted.")
                await supabase.auth.signOut()
                router.push("/")
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Failed to delete account. Please try again.")
                setIsDeleting(false)
            }
        } catch {
            toast.error("Network error. Please try again.")
            setIsDeleting(false)
        }
    }

    const handleLogoutAllDevices = async () => {
        setIsLoggingOutAll(true)
        try {
            await supabase.auth.signOut({ scope: "global" })
            toast.success("Signed out from all devices.")
            router.push("/")
        } catch {
            toast.error("Failed to sign out from all devices")
            setIsLoggingOutAll(false)
        }
    }

    const handleSave = async (updates: any) => {
        if (!userId) return
        setIsSaving(true)
        try {
            const res = await authFetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success("Settings updated successfully")
            } else {
                toast.error("Failed to update settings")
            }
        } catch {
            toast.error("An error occurred while saving")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeactivate = async () => {
        if (!userId) return
        const days = parseInt(deactivateDays, 10)
        if (!Number.isFinite(days) || days < 1 || days > 365) {
            toast.error("Invalid deactivation duration")
            return
        }
        setIsDeactivating(true)
        try {
            const until = new Date()
            until.setDate(until.getDate() + days)
            const updates = { is_deactivated: true, deactivated_until: until.toISOString() }
            const res = await authFetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success(`Profile deactivated for ${deactivateDays} days. It is now hidden from all members.`)
            } else {
                toast.error("Failed to deactivate profile")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setIsDeactivating(false)
        }
    }

    const handleReactivate = async () => {
        if (!userId) return
        setIsReactivating(true)
        try {
            const updates = { is_deactivated: false, deactivated_until: null }
            const res = await authFetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success("Your profile is now Active again and visible to all members!")
            } else {
                toast.error("Failed to reactivate profile")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setIsReactivating(false)
        }
    }

    const handleMarkAsMarried = async () => {
        if (!userId) return
        setIsMarkingMarried(true)
        try {
            const { error } = await supabase
                .from('personal_details')
                .update({ marital_status: 'Married' })
                .eq('user_id', userId)
            if (error) throw error

            const updates = {
                is_deactivated: true,
                deactivated_until: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString(),
            }
            await authFetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates })
            })

            setSettings((prev: any) => ({ ...prev, ...updates }))
            setShowMarriedConfirm(false)
            toast.success("Congratulations! Your profile has been marked as Married and removed from all match listings.")
        } catch {
            toast.error("Failed to update status. Please try again.")
        } finally {
            setIsMarkingMarried(false)
        }
    }

    const unblockProfile = async (targetId: string) => {
        try {
            const res = await authFetch("/api/blocks", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: targetId })
            })
            if (res.ok) {
                setBlockedProfiles(prev => prev.filter(p => p.user_id !== targetId))
                toast.success("Profile unblocked")
            }
        } catch {
            toast.error("Failed to unblock")
        }
    }

    const unignoreProfile = async (targetId: string) => {
        try {
            const res = await authFetch("/api/ignores", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: targetId })
            })
            if (res.ok) {
                setIgnoredProfiles(prev => prev.filter(p => p.user_id !== targetId))
                toast.success("Profile removed from ignored list")
            }
        } catch {
            toast.error("Failed to unignore")
        }
    }

    const handleSendPasswordReset = async () => {
        if (!userEmail) return
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                redirectTo: `${window.location.origin}/account/update-password`
            })
            if (error) {
                toast.error(error.message)
            } else {
                toast.success("A password reset link has been sent to your email!")
            }
        } catch {
            toast.error("Failed to send reset email")
        }
    }

    const TABS = [
        { id: "alerts", icon: Bell, label: "Alerts & Updates" },
        { id: "call_prefs", icon: Phone, label: "Call Preferences" },
        { id: "privacy", icon: Shield, label: "Privacy Settings" },
        { id: "profile", icon: EyeOff, label: "Profile Visibility" },
        { id: "verification", icon: ShieldCheck, label: "ID Verification" },
        { id: "password", icon: Key, label: "Change Password" },
        { id: "ignored", icon: UserMinus, label: "Ignored Profiles" },
        { id: "blocked", icon: UserX, label: "Blocked Profiles" },
        { id: "deactivate", icon: AlertTriangle, label: "Deactivate Profile", danger: true },
    ] as const

    const TAB_GROUPS = [
        { label: "Notifications", ids: ["alerts", "call_prefs"] as const },
        { label: "Privacy", ids: ["privacy", "profile", "verification"] as const },
        { label: "Account", ids: ["password", "ignored", "blocked", "deactivate"] as const },
    ]

    const tabById = Object.fromEntries(TABS.map(tab => [tab.id, tab]))

    const SettingsNavItem = ({
        tab,
        active,
        onClick,
    }: {
        tab: (typeof TABS)[number]
        active: boolean
        onClick: () => void
    }) => {
        const isDanger = "danger" in tab && tab.danger

        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-in-out text-left",
                    active && !isDanger && "bg-[#fce8ef] text-[#e87898] shadow-[0_1px_4px_rgba(232,120,152,0.12)]",
                    active && isDanger && "bg-[#fef2f2] text-[#dc2626] shadow-[0_1px_4px_rgba(220,38,38,0.08)]",
                    !active && "text-[#4b5563] hover:bg-[#faf8f4] hover:text-[#374151]"
                )}
            >
                <span
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ease-in-out",
                        active && !isDanger && "bg-[#e87898] text-white shadow-sm",
                        active && isDanger && "bg-[#dc2626] text-white shadow-sm",
                        !active && "bg-[#faf8f4] text-[#9ca3af] group-hover:bg-[#fce8ef]/50 group-hover:text-[#e87898]"
                    )}
                >
                    <tab.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{tab.label}</span>
                {active && (
                    <span
                        className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isDanger ? "bg-[#dc2626]" : "bg-[#e87898]"
                        )}
                    />
                )}
            </button>
        )
    }

    const CustomToggle = ({ label, description, checked, onChange }: any) => (
        <div className="flex items-center justify-between p-4 bg-[#faf8f4] rounded-xl border border-[#f0ebe3]">
            <div className="space-y-0.5 pr-4">
                <p className="text-[13px] font-medium text-[#374151]">{label}</p>
                {description && <p className="text-xs text-[#6b7280]">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                    checked ? "bg-[#e87898]" : "bg-[#e5e7eb]"
                )}
            >
                <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )} />
            </button>
        </div>
    )

    const RadioOption = ({ checked, onChange, title, description, badge }: {
        checked: boolean
        onChange: () => void
        title: string
        description?: string
        badge?: string
    }) => (
        <label className={cn(
            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
            checked
                ? "border-[#e87898]/40 bg-[#fce8ef]/40"
                : "border-[#f0f0f0] bg-white hover:bg-[#faf8f4]"
        )}>
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                className="mt-1 h-4 w-4 text-[#e87898] focus:ring-[#e87898]"
            />
            <div>
                <span className="text-[13px] font-medium text-[#374151] block">
                    {title}
                    {badge && (
                        <span className="text-[10px] ml-2 px-2 py-0.5 bg-[#fdf6e3] text-[#c9a227] rounded-full font-semibold">{badge}</span>
                    )}
                </span>
                {description && <span className="text-xs text-[#6b7280] mt-0.5 block">{description}</span>}
            </div>
        </label>
    )

    const SectionTitle = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => (
        <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1F4068] flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#e87898]" />
                {title}
            </h2>
            {description && <p className="text-[13px] text-[#6b7280] mt-1">{description}</p>}
        </div>
    )

    const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
        <div className="text-center py-16 px-4 bg-[#faf8f4] rounded-[16px] border border-dashed border-[#eadfce]">
            <Icon className="h-10 w-10 text-[#d1d5db] mx-auto mb-3" />
            <span className="text-[13px] text-[#6b7280] font-medium">{message}</span>
        </div>
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0f0f0] border-t-[#e87898]" />
            </div>
        )
    }

    return (
        <>
            <MarriedConfirmationDialog
                isOpen={showMarriedConfirm}
                onOpenChange={setShowMarriedConfirm}
                onConfirm={handleMarkAsMarried}
                isLoading={isMarkingMarried}
            />

            <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
                <div className="mb-5">
                    <h1 className="text-[22px] font-semibold text-[#1F4068] tracking-tight">Profile Settings</h1>
                    <p className="text-[13px] text-[#6b7280] mt-1">Manage your privacy, alerts, and account preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-[272px] shrink-0">
                        <nav className="relative overflow-hidden rounded-[20px] border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_12px_rgba(31,64,104,0.04)] lg:sticky lg:top-4">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full bg-[#fce8ef] blur-2xl opacity-60"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-[#fdf6e3] blur-2xl opacity-50"
                            />

                            <div className="relative border-b border-[#f0ebe3]/80 px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce8ef] shadow-sm">
                                        <Settings2 className="h-4 w-4 text-[#e87898]" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#1F4068]">Settings</p>
                                        <p className="text-[11px] text-[#9ca3af]">Manage preferences</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative space-y-1 p-2 pb-3">
                                {TAB_GROUPS.map((group, groupIndex) => (
                                    <div key={group.label}>
                                        {groupIndex > 0 && (
                                            <div className="mx-3 my-2 h-px bg-[#f0ebe3]" />
                                        )}
                                        <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-[0.12em]">
                                            {group.label}
                                        </p>
                                        <div className="space-y-0.5">
                                            {group.ids.map(id => {
                                                const tab = tabById[id]
                                                if (!tab) return null
                                                return (
                                                    <SettingsNavItem
                                                        key={tab.id}
                                                        tab={tab}
                                                        active={activeTab === tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] rounded-[20px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.04)] p-6 pb-4 lg:px-8 lg:pt-8 lg:pb-5 min-w-0">
                        <DashboardJourneyPatterns />

                        <div className="relative z-10">
                        {activeTab === "alerts" && (
                            <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <SectionTitle icon={Mail} title="Email Alerts" description="Choose what updates you receive directly to your primary email address." />
                                    <div className="space-y-3">
                                        <CustomToggle
                                            label="Member Activity"
                                            description="When members view your phone number or shortlist you"
                                            checked={settings.email_alerts?.member_activity}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, member_activity: val } })}
                                        />
                                        <CustomToggle
                                            label="Express Interest"
                                            description="When someone sends you a direct interest"
                                            checked={settings.email_alerts?.express_interest}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, express_interest: val } })}
                                        />
                                        <CustomToggle
                                            label="Personalized Messages"
                                            description="When Premium members send you custom messages"
                                            checked={settings.email_alerts?.personalized_messages}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, personalized_messages: val } })}
                                        />
                                    </div>
                                </div>
                                <div className="h-px bg-[#f0f0f0]" />
                                <div>
                                    <SectionTitle icon={Phone} title="SMS Alerts" description="Receive text messages instantly when major activity happens on your profile." />
                                    <div className="space-y-3">
                                        <CustomToggle
                                            label="Phone Number Views"
                                            description="When members view your verified mobile number"
                                            checked={settings.sms_alerts?.phone_views}
                                            onChange={(val: boolean) => handleSave({ sms_alerts: { ...settings.sms_alerts, phone_views: val } })}
                                        />
                                        <CustomToggle
                                            label="Express Interest"
                                            description="Instant notifications for new interests"
                                            checked={settings.sms_alerts?.express_interest}
                                            onChange={(val: boolean) => handleSave({ sms_alerts: { ...settings.sms_alerts, express_interest: val } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "call_prefs" && (
                            <div className="space-y-6 animate-in fade-in">
                                <SectionTitle icon={Phone} title="Call Preferences" description="Let us know when our support or verification team can call you regarding updates." />
                                <div className="space-y-3 max-w-md">
                                    {["Call when there are important updates", "Call after 1 month", "Call after 3 months", "Call after 6 months", "Never"].map(opt => (
                                        <RadioOption
                                            key={opt}
                                            checked={settings.call_preference === opt}
                                            onChange={() => handleSave({ call_preference: opt })}
                                            title={opt}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "privacy" && (
                            <div className="space-y-10 animate-in fade-in">
                                <div>
                                    <SectionTitle icon={Phone} title="Mobile Privacy" description="Control who can view your verified mobile number." />
                                    <div className="space-y-3">
                                        <RadioOption
                                            checked={settings.mobile_privacy === 'show_all'}
                                            onChange={() => handleSave({ mobile_privacy: 'show_all' })}
                                            title="Let paid members view and contact me natively"
                                            description="Recommended for 10x better responses."
                                        />
                                        <RadioOption
                                            checked={settings.mobile_privacy === 'hidden'}
                                            onChange={() => handleSave({ mobile_privacy: 'hidden' })}
                                            title="Don't show my mobile number"
                                            description="Paid members can contact you only through secured messages."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <SectionTitle icon={Shield} title="Horoscope Privacy" description="Manage how your astrological charts are displayed." />
                                    <div className="space-y-3">
                                        <RadioOption
                                            checked={settings.horoscope_privacy === 'visible_all'}
                                            onChange={() => handleSave({ horoscope_privacy: 'visible_all' })}
                                            title="Visible to all (Recommended)"
                                            description="Allows automatic compatibility matching to function properly across the platform."
                                        />
                                        <RadioOption
                                            checked={settings.horoscope_privacy === 'contacted_only'}
                                            onChange={() => handleSave({ horoscope_privacy: 'contacted_only' })}
                                            title="Visible only to active connections"
                                            description="Only members whom you've contacted or responded to can view it."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className="space-y-6 animate-in fade-in">
                                <SectionTitle icon={EyeOff} title="Profile Visibility" description="Manage how you appear in search grids." />
                                <div className="space-y-3 max-w-lg">
                                    <RadioOption
                                        checked={settings.profile_privacy === 'show_all'}
                                        onChange={() => handleSave({ profile_privacy: 'show_all' })}
                                        title="Show my Profile to all including visitors"
                                        description="This helps prospects share your profile securely with their family members who aren't registered."
                                        badge="Recommended"
                                    />
                                    <RadioOption
                                        checked={settings.profile_privacy === 'registered_only'}
                                        onChange={() => handleSave({ profile_privacy: 'registered_only' })}
                                        title="Show my Profile to registered members only."
                                    />
                                </div>

                                <SectionTitle icon={EyeOff} title="Photo Visibility" description="Control who can see your photos." />
                                <div className="space-y-3 max-w-lg">
                                    <RadioOption
                                        checked={(settings.photo_visibility || 'everyone') === 'everyone'}
                                        onChange={() => handleSave({ photo_visibility: 'everyone' })}
                                        title="Show my photos to everyone"
                                        description="All members who can view your profile can see your photos."
                                        badge="Default"
                                    />
                                    <RadioOption
                                        checked={settings.photo_visibility === 'on_accept'}
                                        onChange={() => handleSave({ photo_visibility: 'on_accept' })}
                                        title="Only after I accept interest or a photo request"
                                        description="Your photos stay blurred until you accept the member's interest or approve their photo request."
                                    />
                                    <RadioOption
                                        checked={settings.photo_visibility === 'password'}
                                        onChange={() => handleSave({ photo_visibility: 'password' })}
                                        title="Protect with a photo password"
                                        description="Photos stay blurred until a member enters the password you set and share privately."
                                    />
                                    {settings.photo_visibility === 'password' && (
                                        <div className="ml-1 space-y-2 rounded-2xl border border-[#f0ebe3] bg-[#faf8f4]/60 p-4">
                                            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">
                                                Photo password
                                            </label>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Input
                                                    type="text"
                                                    value={photoPasswordDraft}
                                                    onChange={(e) => setPhotoPasswordDraft(e.target.value)}
                                                    placeholder={settings.photo_password ? "Set — type to change" : "Choose a password to share"}
                                                    maxLength={100}
                                                    className="h-10 rounded-[10px] border-[#e5e7eb] text-[13px]"
                                                />
                                                <Button
                                                    className="h-10 px-5 rounded-[10px] bg-[#e87898] hover:bg-[#d66686] text-white text-[13px] font-medium shrink-0"
                                                    disabled={isSaving || photoPasswordDraft.trim().length < 1}
                                                    onClick={() => { handleSave({ photo_password: photoPasswordDraft.trim() }); setPhotoPasswordDraft("") }}
                                                >
                                                    Save password
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-gray-400">
                                                Share this password only with people you want to see your photos. It is never shown to other members.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {incomingPhotoRequests.length > 0 && (
                                    <div className="max-w-lg space-y-3">
                                        <SectionTitle icon={Bell} title="Photo requests" description="Members asking to view your photos." />
                                        {incomingPhotoRequests.map((r) => (
                                            <div key={r.requester_id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#f0ebe3] bg-white p-3.5">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-[#1F4068] truncate">
                                                        {r.requester?.name || "A member"}
                                                        {r.requester?.profile_code && (
                                                            <span className="ml-2 text-xs font-normal text-gray-400">{r.requester.profile_code}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">wants to view your photos</p>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button size="sm" className="rounded-xl bg-[#3bb9ac] hover:bg-[#33a396] text-white" onClick={() => respondToPhotoRequest(r.requester_id, "approved")}>
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="rounded-xl border-[#f0ebe3] text-gray-500" onClick={() => respondToPhotoRequest(r.requester_id, "declined")}>
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "verification" && userId && (
                            <div className="space-y-6 animate-in fade-in">
                                <SectionTitle icon={ShieldCheck} title="ID Verification" description="Verify your identity to earn a trusted badge on your profile." />
                                <div className="max-w-lg">
                                    <IdVerificationCard userId={userId} />
                                </div>
                            </div>
                        )}

                        {activeTab === "password" && (
                            <div className="space-y-6 animate-in fade-in flex flex-col items-center justify-center py-10 text-center">
                                <div className="h-20 w-20 bg-[#fce8ef] rounded-full flex items-center justify-center mb-4">
                                    <Key className="h-9 w-9 text-[#e87898]" />
                                </div>
                                <h2 className="text-xl font-semibold text-[#1F4068]">Change Your Password</h2>
                                <p className="text-[13px] text-[#6b7280] max-w-sm">For security reasons, we send a secure, one-time password reset link to your verified email address.</p>
                                <Button
                                    onClick={handleSendPasswordReset}
                                    className="h-11 px-8 mt-4 bg-[#e87898] hover:bg-[#d66686] text-white rounded-[10px] text-[13px] font-medium shadow-none"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Password Reset Email
                                </Button>
                            </div>
                        )}

                        {activeTab === "ignored" && (
                            <div className="space-y-6 animate-in fade-in">
                                <SectionTitle icon={UserMinus} title="Ignored Profiles" description="Profiles that you have actively requested to hide from your Dashboard feed." />
                                {ignoredProfiles.length === 0 ? (
                                    <EmptyState icon={UserMinus} message="You haven't ignored any profiles yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {ignoredProfiles.map(p => (
                                            <div key={p.user_id} className="flex items-center justify-between p-4 bg-[#faf8f4] rounded-xl border border-[#f0f0f0]">
                                                <span className="text-[13px] font-medium text-[#374151]">{p.name || "Unknown Profile"}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => unignoreProfile(p.user_id)}
                                                    className="h-8 text-xs font-medium rounded-[10px] border-[#e5e7eb] text-[#374151] hover:bg-white"
                                                >
                                                    Unignore
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "blocked" && (
                            <div className="space-y-6 animate-in fade-in">
                                <SectionTitle
                                    icon={UserX}
                                    title="Blocked Profiles"
                                    description="Profiles blocked here are restricted from viewing your data completely. Mutual invisibility is strictly enforced."
                                />
                                {blockedProfiles.length === 0 ? (
                                    <EmptyState icon={UserX} message="You haven't blocked any profiles yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {blockedProfiles.map(p => (
                                            <div key={p.user_id} className="flex items-center justify-between p-4 bg-[#fef2f2] rounded-xl border border-[#fecaca]/60">
                                                <span className="text-[13px] font-medium text-[#374151]">{p.name || "Unknown Profile"}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => unblockProfile(p.user_id)}
                                                    className="h-8 text-xs font-medium rounded-[10px] border-[#fca5a5] text-[#dc2626] hover:bg-white"
                                                >
                                                    Unblock
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "deactivate" && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className={cn(
                                    "flex items-center gap-3 p-4 rounded-[16px] border text-[13px] font-medium",
                                    isCurrentlyDeactivated
                                        ? "bg-[#fef2f2] border-[#fecaca]/60 text-[#dc2626]"
                                        : "bg-[#ecfdf5] border-[#a7f3d0]/60 text-[#059669]"
                                )}>
                                    <div className={cn(
                                        "h-2.5 w-2.5 rounded-full shrink-0",
                                        isCurrentlyDeactivated ? "bg-[#dc2626]" : "bg-[#059669] animate-pulse"
                                    )} />
                                    {isCurrentlyDeactivated
                                        ? `Your account is currently Deactivated — hidden from all members until ${new Date(settings.deactivated_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                        : "Your account is currently Active and visible to members"}
                                </div>

                                {isCurrentlyDeactivated ? (
                                    <div className="bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] p-5 rounded-[20px] border border-[#f0ebe3]">
                                        <h2 className="text-base font-semibold mb-2 text-[#1F4068] flex items-center gap-2">
                                            <RefreshCw className="h-5 w-5 text-[#3bb9ac]" /> Reactivate Your Profile
                                        </h2>
                                        <p className="text-[13px] text-[#6b7280] mb-4 leading-relaxed">
                                            Your profile is currently deactivated. Reactivating will immediately make your profile visible to all members again.
                                        </p>
                                        <Button
                                            className="h-11 px-8 bg-[#3bb9ac] hover:bg-[#2fa085] text-white font-medium rounded-[10px] shadow-none"
                                            onClick={handleReactivate}
                                            disabled={isReactivating}
                                        >
                                            {isReactivating ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Reactivating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <RefreshCw className="h-4 w-4" /> Reactivate Now
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] p-5 rounded-[20px] border border-[#f0ebe3]">
                                        <h2 className="text-base font-semibold mb-2 text-[#1F4068] flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-[#c9a227]" /> Deactivate Profile
                                        </h2>
                                        <p className="text-[13px] text-[#6b7280] mb-4 leading-relaxed">
                                            You can temporarily deactivate your profile if you need a break. Upon deactivation, your profile will be hidden globally from our members. You can reactivate at any time by logging back in.
                                        </p>
                                        <div className="space-y-4 max-w-sm">
                                            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">Duration</label>
                                            <select
                                                value={deactivateDays}
                                                onChange={e => setDeactivateDays(e.target.value)}
                                                className="w-full h-11 px-4 rounded-[10px] border border-[#e5e7eb] bg-white focus:ring-2 focus:ring-[#e87898]/20 focus:border-[#e87898] text-[13px] font-medium text-[#374151]"
                                            >
                                                <option value="15">15 Days</option>
                                                <option value="30">30 Days</option>
                                                <option value="60">2 Months</option>
                                                <option value="90">3 Months</option>
                                            </select>
                                            <Button
                                                className="w-full h-11 bg-[#ff3b30]/85 hover:bg-[#ff3b30]/95 text-white font-medium rounded-[10px] shadow-none"
                                                onClick={handleDeactivate}
                                                disabled={isDeactivating}
                                            >
                                                {isDeactivating ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        Deactivating...
                                                    </span>
                                                ) : "Deactivate Now"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-[16px] bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#ecfdf5] border border-[#a7f3d0]/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-full bg-white/90 border border-[#a7f3d0]/70 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(5,150,105,0.12)]">
                                            <Heart className="h-5 w-5 text-[#059669] fill-[#059669]" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#1F4068]">Found your match?</p>
                                            <p className="text-xs text-[#6b7280] mt-0.5 max-w-sm leading-relaxed">
                                                Congratulations! Mark your profile as married to remove it from all match listings.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        className="shrink-0 h-10 px-5 bg-[#059669]/90 hover:bg-[#047857] text-white text-[13px] font-medium rounded-[10px] shadow-none"
                                        onClick={() => setShowMarriedConfirm(true)}
                                    >
                                        <Heart className="h-4 w-4 mr-2 fill-white" />
                                        Mark as Married
                                    </Button>
                                </div>

                                {/* Session: log out everywhere */}
                                <div className="rounded-[16px] border border-[#f0ebe3] bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#1F4068]">Log out from all devices</p>
                                        <p className="text-xs text-[#6b7280] mt-0.5 max-w-md leading-relaxed">
                                            Ends your session on every device and browser where you're signed in. Useful if you used a shared or public device.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="shrink-0 h-10 px-5 rounded-[10px] border-[#f0ebe3] text-[#1F4068] text-[13px] font-medium"
                                        onClick={handleLogoutAllDevices}
                                        disabled={isLoggingOutAll}
                                    >
                                        {isLoggingOutAll ? "Signing out..." : "Log out everywhere"}
                                    </Button>
                                </div>

                                {/* Danger zone: permanent deletion */}
                                <div className="rounded-[16px] border border-[#fecaca]/70 bg-[#fef2f2] p-5">
                                    <h2 className="text-base font-semibold mb-1.5 text-[#dc2626] flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" /> Delete account permanently
                                    </h2>
                                    <p className="text-[13px] text-[#7f1d1d] mb-4 leading-relaxed">
                                        This erases your profile, photos, matches, messages and all activity, and cannot be undone.
                                        If you're just taking a break, use <span className="font-medium">Deactivate</span> instead.
                                        Type <span className="font-semibold">DELETE</span> to confirm.
                                    </p>
                                    <div className="space-y-3 max-w-sm">
                                        <Input
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            placeholder="Type DELETE"
                                            className="h-11 rounded-[10px] border-[#fca5a5] bg-white text-[13px]"
                                        />
                                        <Button
                                            className="w-full h-11 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-[10px] shadow-none disabled:opacity-50"
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                                        >
                                            {isDeleting ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Deleting...
                                                </span>
                                            ) : "Permanently delete my account"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isSaving && (
                            <p className="text-xs text-[#9ca3af] text-center mt-6">Saving changes...</p>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
