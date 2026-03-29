"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
    Bell, Lock, Phone, UserX, UserMinus, Shield, EyeOff, Save, Key, Mail, RefreshCw, AlertTriangle, Heart, CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

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
        is_deactivated: false,
        deactivated_until: null,
    })

    const [blockedProfiles, setBlockedProfiles] = useState<any[]>([])
    const [ignoredProfiles, setIgnoredProfiles] = useState<any[]>([])
    const [deactivateDays, setDeactivateDays] = useState("15")
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [isReactivating, setIsReactivating] = useState(false)

    // Mark as Married confirmation dialog state
    const [showMarriedConfirm, setShowMarriedConfirm] = useState(false)
    const [isMarkingMarried, setIsMarkingMarried] = useState(false)

    // Compute active status
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
                // Fetch Settings
                const setRes = await fetch(`/api/settings?userId=${session.user.id}`)
                if (setRes.ok) {
                    const setData = await setRes.json()
                    if (Object.keys(setData).length > 0) {
                        setSettings((prev: any) => ({ ...prev, ...setData }))
                    }
                }

                // Fetch Blocks
                const blockRes = await fetch(`/api/blocks?userId=${session.user.id}`)
                if (blockRes.ok) {
                    const blockData = await blockRes.json()
                    if (blockData.blockedIds && blockData.blockedIds.length > 0) {
                        const { data } = await supabase.from('personal_details').select('user_id, name').in('user_id', blockData.blockedIds)
                        setBlockedProfiles(data || [])
                    }
                }

                // Fetch Ignores
                const ignRes = await fetch(`/api/ignores?userId=${session.user.id}`)
                if (ignRes.ok) {
                    const ignData = await ignRes.json()
                    if (ignData.ignoredIds && ignData.ignoredIds.length > 0) {
                        const { data } = await supabase.from('personal_details').select('user_id, name').in('user_id', ignData.ignoredIds)
                        setIgnoredProfiles(data || [])
                    }
                }

            } catch (err) {
                console.error("Error loading settings:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadInitialData()
    }, [router])

    const handleSave = async (updates: any) => {
        if (!userId) return
        setIsSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, updates: { ...settings, ...updates } })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success("Settings updated successfully")
            } else {
                toast.error("Failed to update settings")
            }
        } catch (e) {
            toast.error("An error occurred while saving")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeactivate = async () => {
        if (!userId) return
        setIsDeactivating(true)
        try {
            const until = new Date()
            until.setDate(until.getDate() + parseInt(deactivateDays))
            const updates = {
                is_deactivated: true,
                deactivated_until: until.toISOString(),
            }
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, updates })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success(`Profile deactivated for ${deactivateDays} days. It is now hidden from all members.`)
            } else {
                toast.error("Failed to deactivate profile")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsDeactivating(false)
        }
    }

    const handleReactivate = async () => {
        if (!userId) return
        setIsReactivating(true)
        try {
            const updates = {
                is_deactivated: false,
                deactivated_until: null,
            }
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, updates })
            })
            if (res.ok) {
                setSettings((prev: any) => ({ ...prev, ...updates }))
                toast.success("Your profile is now Active again and visible to all members!")
            } else {
                toast.error("Failed to reactivate profile")
            }
        } catch (e) {
            toast.error("Something went wrong")
        } finally {
            setIsReactivating(false)
        }
    }

    const handleMarkAsMarried = async () => {
        if (!userId) return
        setIsMarkingMarried(true)
        try {
            // Update marital_status in personal_details to "Married"
            const { error } = await supabase
                .from('personal_details')
                .update({ marital_status: 'Married' })
                .eq('user_id', userId)

            if (error) throw error

            // Also deactivate the profile permanently
            const updates = {
                is_deactivated: true,
                deactivated_until: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 years
            }
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, updates })
            })

            setSettings((prev: any) => ({ ...prev, ...updates }))
            setShowMarriedConfirm(false)
            toast.success("🎉 Congratulations! Your profile has been marked as Married and removed from all match listings.")
        } catch (e) {
            toast.error("Failed to update status. Please try again.")
        } finally {
            setIsMarkingMarried(false)
        }
    }

    const unblockProfile = async (targetId: string) => {
        try {
            const res = await fetch("/api/blocks", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, targetUserId: targetId })
            })
            if (res.ok) {
                setBlockedProfiles(prev => prev.filter(p => p.user_id !== targetId))
                toast.success("Profile unblocked")
            }
        } catch (e) {
            toast.error("Failed to unblock")
        }
    }

    const unignoreProfile = async (targetId: string) => {
        try {
            const res = await fetch("/api/ignores", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, targetUserId: targetId })
            })
            if (res.ok) {
                setIgnoredProfiles(prev => prev.filter(p => p.user_id !== targetId))
                toast.success("Profile removed from ignored list")
            }
        } catch (e) {
            toast.error("Failed to unignore")
        }
    }

    const handleSendPasswordReset = async () => {
        if (!userEmail) return
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                redirectTo: `${window.location.origin}/dashboard`
            })
            if (error) {
                toast.error(error.message)
            } else {
                toast.success("A password reset link has been sent to your email!")
            }
        } catch (e) {
            toast.error("Failed to send reset email")
        }
    }

    const TABS = [
        { id: "alerts", icon: Bell, label: "Alerts & Updates" },
        { id: "call_prefs", icon: Phone, label: "Call Preferences" },
        { id: "privacy", icon: Shield, label: "Privacy Settings" },
        { id: "profile", icon: EyeOff, label: "Profile Visibility" },
        { id: "password", icon: Key, label: "Change Password" },
        { id: "ignored", icon: UserMinus, label: "Ignored Profiles" },
        { id: "blocked", icon: UserX, label: "Blocked Profiles" },
        { id: "deactivate", icon: AlertTriangle, label: "Deactivate Profile" }
    ]

    // Simple robust custom toggle
    const CustomToggle = ({ label, description, checked, onChange }: any) => (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="space-y-0.5">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{label}</p>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#4B0082]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    )

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#4B0082]" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0A0A0A]">
            
            {/* Mark as Married Confirmation Dialog */}
            {showMarriedConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMarriedConfirm(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full z-10">
                        <div className="text-center mb-6">
                            <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-10 w-10 text-green-500 fill-green-500" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Congratulations! 🎉</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                We're so happy for you! By confirming, your profile will be permanently marked as <strong>Married</strong> and removed from all match listings immediately.
                            </p>
                            <p className="text-xs text-rose-500 font-bold mt-3">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl font-bold"
                                onClick={() => setShowMarriedConfirm(false)}
                                disabled={isMarkingMarried}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-2xl font-black bg-green-500 hover:bg-green-600 text-white shadow-lg"
                                onClick={handleMarkAsMarried}
                                disabled={isMarkingMarried}
                            >
                                {isMarkingMarried ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" /> Yes, Mark as Married
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Profile Settings</h1>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24">
                            <div className="flex flex-col">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-[#4B0082]/5 text-[#4B0082] border-l-4 border-[#4B0082]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-l-4 border-transparent'}`}
                                    >
                                        <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-[#4B0082]' : 'text-gray-400'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[500px] p-6 lg:p-10">
                        
                        {/* ALERTS TAB */}
                        {activeTab === "alerts" && (
                            <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-blue-500" /> Email Alerts</h2>
                                    <p className="text-sm text-gray-500 mb-6">Choose what updates you receive directly to your primary email address.</p>
                                    
                                    <div className="space-y-3">
                                        <CustomToggle 
                                            label="Member Activity" description="When members view your phone number or shortlist you"
                                            checked={settings.email_alerts?.member_activity}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, member_activity: val } })}
                                        />
                                        <CustomToggle 
                                            label="Express Interest" description="When someone sends you a direct interest"
                                            checked={settings.email_alerts?.express_interest}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, express_interest: val } })}
                                        />
                                        <CustomToggle 
                                            label="Personalized Messages" description="When Premium members send you custom messages"
                                            checked={settings.email_alerts?.personalized_messages}
                                            onChange={(val: boolean) => handleSave({ email_alerts: { ...settings.email_alerts, personalized_messages: val } })}
                                        />
                                    </div>
                                </div>
                                <hr className="border-gray-100 dark:border-gray-800" />
                                <div>
                                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Phone className="h-5 w-5 text-green-500" /> SMS Alerts</h2>
                                    <p className="text-sm text-gray-500 mb-6">Receive text messages instantly when major activity happens on your profile.</p>
                                    
                                    <div className="space-y-3">
                                        <CustomToggle 
                                            label="Phone Number Views" description="When members view your verified mobile number"
                                            checked={settings.sms_alerts?.phone_views}
                                            onChange={(val: boolean) => handleSave({ sms_alerts: { ...settings.sms_alerts, phone_views: val } })}
                                        />
                                        <CustomToggle 
                                            label="Express Interest" description="Instant notifications for new interests"
                                            checked={settings.sms_alerts?.express_interest}
                                            onChange={(val: boolean) => handleSave({ sms_alerts: { ...settings.sms_alerts, express_interest: val } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CALL PREFERENCES TAB */}
                        {activeTab === "call_prefs" && (
                            <div className="space-y-6 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Call Preferences</h2>
                                    <p className="text-sm text-gray-500 mb-6">Let us know when our support or verification team can call you regarding updates.</p>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    {["Call when there are important updates", "Call after 1 month", "Call after 3 months", "Call after 6 months", "Never"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <input 
                                                type="radio" name="callPref"
                                                checked={settings.call_preference === opt}
                                                onChange={() => handleSave({ call_preference: opt })}
                                                className="h-4 w-4 text-[#4B0082] focus:ring-[#4B0082]"
                                            />
                                            <span className="text-sm font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PRIVACY TAB */}
                        {activeTab === "privacy" && (
                            <div className="space-y-10 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-bold mb-2 border-b pb-2">Mobile Privacy</h2>
                                    <p className="text-sm text-gray-500 mb-6 mt-2">Control who can view your verified mobile number.</p>
                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer">
                                            <input type="radio" checked={settings.mobile_privacy === 'show_all'} onChange={() => handleSave({ mobile_privacy: 'show_all' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                            <div>
                                                <span className="text-sm font-bold block">Let paid members view and contact me natively</span>
                                                <span className="text-xs text-gray-500">Recommended for 10x better responses.</span>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer">
                                            <input type="radio" checked={settings.mobile_privacy === 'hidden'} onChange={() => handleSave({ mobile_privacy: 'hidden' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                            <div>
                                                <span className="text-sm font-bold block">Don't show my mobile number</span>
                                                <span className="text-xs text-gray-500">Paid members can contact you only through secured messages.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold mb-2 border-b pb-2">Horoscope Privacy</h2>
                                    <p className="text-sm text-gray-500 mb-6 mt-2">Manage how your astrological charts are displayed.</p>
                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer">
                                            <input type="radio" checked={settings.horoscope_privacy === 'visible_all'} onChange={() => handleSave({ horoscope_privacy: 'visible_all' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                            <div>
                                                <span className="text-sm font-bold block">Visible to all (Recommended)</span>
                                                <span className="text-xs text-gray-500">Allows automatic compatibility matching to function properly across the platform.</span>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer">
                                            <input type="radio" checked={settings.horoscope_privacy === 'contacted_only'} onChange={() => handleSave({ horoscope_privacy: 'contacted_only' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                            <div>
                                                <span className="text-sm font-bold block">Visible only to active connections</span>
                                                <span className="text-xs text-gray-500">Only members whom you've contacted or responded to can view it.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PROFILE SETTINGS TAB */}
                        {activeTab === "profile" && (
                            <div className="space-y-6 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Profile Visibility</h2>
                                    <p className="text-sm text-gray-500 mb-6">Manage how you appear in search grids.</p>
                                </div>
                                <div className="space-y-4 max-w-lg">
                                    <label className="flex items-start gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <input type="radio" checked={settings.profile_privacy === 'show_all'} onChange={() => handleSave({ profile_privacy: 'show_all' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                        <div>
                                            <span className="text-sm font-bold block">Show my Profile to all including visitors <span className="text-[10px] ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Recommended</span></span>
                                            <span className="text-xs text-gray-500">This helps prospects share your profile securely with their family members who aren't registered.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <input type="radio" checked={settings.profile_privacy === 'registered_only'} onChange={() => handleSave({ profile_privacy: 'registered_only' })} className="mt-1 h-4 w-4 text-[#4B0082]" />
                                        <div>
                                            <span className="text-sm font-bold block">Show my Profile to registered members only.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* PASSWORD TAB */}
                        {activeTab === "password" && (
                            <div className="space-y-6 animate-in fade-in flex flex-col items-center justify-center py-10 text-center">
                                <div className="h-20 w-20 bg-[#4B0082]/10 rounded-full flex items-center justify-center mb-4">
                                    <Key className="h-10 w-10 text-[#4B0082]" />
                                </div>
                                <h2 className="text-2xl font-black">Change Your Password</h2>
                                <p className="text-gray-500 max-w-sm">For security reasons, we send a secure, one-time password reset link to your verified email address.</p>
                                <Button 
                                    onClick={handleSendPasswordReset} 
                                    className="h-14 px-8 mt-6 bg-[#4B0082] hover:bg-[#3a0066] rounded-full font-bold shadow-xl"
                                >
                                    <Mail className="h-5 w-5 mr-3" />
                                    Send Identity Reset Link
                                </Button>
                            </div>
                        )}

                        {/* IGNORED TAB */}
                        {activeTab === "ignored" && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-2">Ignored Profiles</h2>
                                <p className="text-sm text-gray-500 mb-6">Profiles that you have actively requested to hide from your Dashboard feed.</p>
                                {ignoredProfiles.length === 0 ? (
                                    <div className="text-center py-20 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <UserMinus className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <span className="text-gray-500 font-medium tracking-tight">You haven't ignored any profiles yet.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {ignoredProfiles.map(p => (
                                            <div key={p.user_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{p.name || "Unknown Profile"}</span>
                                                <Button variant="outline" size="sm" onClick={() => unignoreProfile(p.user_id)} className="h-8 text-xs font-bold rounded-lg border-gray-200">
                                                    Unignore
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BLOCKED TAB */}
                        {activeTab === "blocked" && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-2 text-rose-600">Blocked Profiles</h2>
                                <p className="text-sm text-gray-500 mb-6">Profiles blocked here are restricted from viewing your data completely, and you will not see them either. Mutual invisibility is strictly enforced.</p>
                                {blockedProfiles.length === 0 ? (
                                    <div className="text-center py-20 px-4 bg-rose-50/50 rounded-2xl border border-dashed border-rose-200">
                                        <UserX className="h-10 w-10 text-rose-300 mx-auto mb-3" />
                                        <span className="text-gray-500 font-medium tracking-tight">You haven't blocked any profiles yet.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {blockedProfiles.map(p => (
                                            <div key={p.user_id} className="flex items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100/50">
                                                <span className="font-bold text-rose-900 dark:text-rose-100">{p.name || "Unknown Profile"}</span>
                                                <Button variant="outline" size="sm" onClick={() => unblockProfile(p.user_id)} className="h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-100">
                                                    Unblock
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DEACTIVATE TAB */}
                        {activeTab === "deactivate" && (
                            <div className="space-y-6 animate-in fade-in">

                                {/* Account Status Banner */}
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border font-semibold text-sm ${isCurrentlyDeactivated ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                    <div className={`h-2.5 w-2.5 rounded-full ${isCurrentlyDeactivated ? 'bg-rose-500' : 'bg-green-500 animate-pulse'}`} />
                                    {isCurrentlyDeactivated
                                        ? `Your account is currently Deactivated — hidden from all members until ${new Date(settings.deactivated_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                        : 'Your account is currently Active and visible to members'}
                                </div>

                                {isCurrentlyDeactivated ? (
                                    /* Reactivate Card */
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200/50">
                                        <h2 className="text-xl font-bold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                            <RefreshCw className="h-6 w-6" /> Reactivate Your Profile
                                        </h2>
                                        <p className="text-sm text-blue-800/80 dark:text-blue-200/70 mb-6 leading-relaxed">
                                            Your profile is currently deactivated. Reactivating will immediately make your profile visible to all members again.
                                        </p>
                                        <Button
                                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg"
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
                                                    <RefreshCw className="h-5 w-5" /> Reactivate Now
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    /* Deactivate Card */
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200/50">
                                        <h2 className="text-xl font-bold mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                                            <AlertTriangle className="h-6 w-6" /> Deactivate Profile
                                        </h2>
                                        <p className="text-sm text-amber-800/80 dark:text-amber-200/70 mb-6 leading-relaxed">
                                            You can temporarily deactivate your profile if you need a break. Upon deactivation, your profile will be hidden globally from our members. You can reactivate at any time by logging back in.
                                        </p>
                                        
                                        <div className="space-y-4 max-w-sm">
                                            <label className="text-xs font-bold uppercase tracking-widest text-amber-900/60">Duration</label>
                                            <select 
                                                value={deactivateDays} 
                                                onChange={e => setDeactivateDays(e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-amber-200 bg-white/50 focus:ring-amber-500 text-sm font-bold"
                                            >
                                                <option value="15">15 Days</option>
                                                <option value="30">30 Days</option>
                                                <option value="60">2 Months</option>
                                                <option value="90">3 Months</option>
                                            </select>
                                            
                                            <Button 
                                                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg mt-4"
                                                onClick={handleDeactivate}
                                                disabled={isDeactivating}
                                            >
                                                {isDeactivating ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                        Deactivating...
                                                    </span>
                                                ) : 'Deactivate Now'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Mark as Married */}
                                <div className="text-center mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs text-gray-400 mb-4">Found your match?</p>
                                    <Button
                                        variant="ghost"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs font-bold tracking-wider uppercase h-8 px-6"
                                        onClick={() => setShowMarriedConfirm(true)}
                                    >
                                        <Heart className="h-3.5 w-3.5 mr-2 fill-green-500" />
                                        Mark as Married
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
