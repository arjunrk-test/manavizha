"use client"

import { ReferralPartnerProfileForm } from "@/components/referral-partner-profile-form"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Ban,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  createAdminAccount,
  updateAdminRole,
  revokeAdminAccess,
  createReferralPartnerAccount,
  type AdminRole,
} from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SELECT_TRIGGER =
  "rounded-lg border-[#f0ebe3] bg-white text-[13px] text-[#1F4068] shadow-sm hover:bg-[#faf8f4]"
const SELECT_CONTENT =
  "z-[100] rounded-lg border border-[#f0ebe3] bg-white text-[#1F4068] shadow-lg"
const SELECT_ITEM =
  "text-[13px] text-[#1F4068] focus:bg-[#faf8f4] focus:text-[#1F4068] data-[highlighted]:bg-[#faf8f4] data-[highlighted]:text-[#1F4068]"
const DIALOG_CONTENT =
  "rounded-xl border border-[#f0ebe3] bg-white text-[#1F4068] shadow-xl"
const DIALOG_TITLE = "font-display text-base font-semibold text-[#1F4068]"
const FIELD_INPUT = "rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] placeholder:text-gray-400"

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function StatusPill({ active, label }: { active: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        active ? "bg-[#e6f7f5] text-[#3bb9ac]" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  )
}

function IconActionButton({
  onClick,
  icon: Icon,
  title,
  tone = "default",
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  title: string
  tone?: "default" | "danger" | "gold"
}) {
  const styles = {
    default: "border-[#f0ebe3] bg-white text-[#1F4068] hover:border-[#c9a227]/40 hover:bg-[#fdf6e3]",
    danger: "border-[#f0ebe3] bg-white text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
    gold: "border-[#c9a227]/30 bg-white text-[#c9a227] hover:border-[#c9a227]/50 hover:bg-[#fdf6e3]",
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`h-8 w-8 shrink-0 rounded-lg p-0 ${styles[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  )
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  tone = "default",
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone?: "default" | "danger" | "gold"
}) {
  const styles = {
    default: "border-[#f0ebe3] text-[#1F4068] hover:border-[#c9a227]/35 hover:bg-[#fdf6e3]",
    danger: "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50",
    gold: "border-[#c9a227]/30 text-[#c9a227] hover:border-[#c9a227]/50 hover:bg-[#fdf6e3]",
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`h-8 rounded-lg px-2.5 text-[11px] ${styles[tone]}`}
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

function matchesCurrentAdmin(
  admin: any,
  current: { id: string | null; email: string | null }
): boolean | null {
  if (!current.id && !current.email) return null

  const adminUserId = admin.user_id || admin.id
  if (current.id && adminUserId === current.id) return true

  if (
    current.email &&
    admin.email &&
    admin.email.toLowerCase() === current.email.toLowerCase()
  ) {
    return true
  }

  return false
}

async function getCurrentAuthUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return { id: user?.id ?? null, email: user?.email ?? null }
}

export function AdminAccountsPanel() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ id: string | null; email: string | null }>({
    id: null,
    email: null,
  })
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [admins, setAdmins] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"admin" | "partner">("admin")

  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [adminDialogMode, setAdminDialogMode] = useState<"add" | "edit" | "revoke">("add")
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "editor" as AdminRole,
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false)
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false)
  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [showPartnerPassword, setShowPartnerPassword] = useState(false)

  const q = searchQuery.toLowerCase()
  const filteredAdmins = useMemo(() => {
    if (!q) return admins
    return admins.filter(
      (a: any) =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        (a.phone || "").toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q)
    )
  }, [admins, q])

  const filteredPartners = useMemo(() => {
    if (!q) return partners
    return partners.filter(
      (p: any) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.area || "").toLowerCase().includes(q) ||
        (p.referralCode || "").toLowerCase().includes(q)
    )
  }, [partners, q])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const authUser = await getCurrentAuthUser()
      if (cancelled) return

      setCurrentUser(authUser)
      setIsSessionReady(true)
      await fetchData()
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  const isCurrentAdmin = (admin: any) => matchesCurrentAdmin(admin, currentUser) === true

  const assertCanModifyAdmin = async (admin: any) => {
    const authUser = await getCurrentAuthUser()
    const match = matchesCurrentAdmin(admin, authUser)

    if (match === true) {
      toast.error("You cannot change or revoke your own admin account")
      return false
    }

    if (match === null) {
      toast.error("Unable to verify your session. Please try again.")
      return false
    }

    return true
  }

  const fetchData = async () => {
    try {
      const { data: adminData } = await supabase.from("admins").select("*")

      if (adminData) {
        setAdmins(
          adminData.map((admin: any) => {
            const formattedRole = admin.role
              ? admin.role
                  .split("_")
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "Admin"
            return {
              ...admin,
              name: admin.name || "Unknown",
              phone: admin.phone || "N/A",
              role: formattedRole,
              rawRole: admin.role,
              status: "Active",
            }
          })
        )
      }

      const { data: partnerData } = await supabase.from("referral_partners").select("*")

      if (partnerData) {
        const partnersWithDetails = await Promise.all(
          partnerData.map(async (partner: any) => {
            const { data: profile } = await supabase
              .from("personal_details")
              .select("name")
              .eq("user_id", partner.user_id)
              .maybeSingle()

            let profiles: any[] | null = null
            if (partner.partner_id) {
              const { data: refData } = await supabase
                .from("referral_details")
                .select("user_id")
                .eq("referral_partner_id", partner.partner_id)

              if (refData && refData.length > 0) {
                const uids = refData.map((r: any) => r.user_id)
                const { data } = await supabase.from("personal_details").select("sex").in("user_id", uids)
                profiles = data
              } else {
                profiles = []
              }
            }

            const total = profiles ? profiles.length : 0
            const men = profiles ? profiles.filter((p) => p.sex === "Male").length : 0
            const women = profiles ? profiles.filter((p) => p.sex === "Female").length : 0

            return {
              ...partner,
              name: partner.name || profile?.name || "Unknown",
              email: partner.email || "N/A",
              phone: partner.phone || "N/A",
              area: partner.area || "N/A",
              referralCode: partner.partner_id,
              totalReferrals: total,
              menReferrals: men,
              womenReferrals: women,
              referralPercentage: partner.referral_percentage || 10,
              canEditProfile: !!partner.can_edit_profile,
              status: partner.is_active !== false ? "Active" : "Inactive",
            }
          })
        )
        setPartners(partnersWithDetails)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load accounts")
    }
  }

  const handleUpdatePartnerPercentage = async (id: string, value: string) => {
    try {
      const parsedValue = parseFloat(value)
      if (isNaN(parsedValue)) return

      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, referralPercentage: parsedValue } : p))
      )

      const { error } = await supabase
        .from("referral_partners")
        .update({ referral_percentage: parsedValue })
        .eq("id", id)

      if (error) {
        toast.error("Failed to update partner percentage")
        fetchData()
      } else {
        toast.success("Partner percentage updated")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    }
  }

  const handleToggleEditProfile = async (id: string, currentValue: boolean) => {
    const newValue = !currentValue
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, canEditProfile: newValue } : p)))
    const { error } = await supabase
      .from("referral_partners")
      .update({ can_edit_profile: newValue })
      .eq("id", id)
    if (error) {
      toast.error("Failed to update edit permission")
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, canEditProfile: currentValue } : p)))
    } else {
      toast.success(newValue ? "Edit access granted" : "Edit access revoked")
    }
  }

  const handleTogglePartnerStatus = async (partner: any) => {
    const isActive = partner.status === "Active"
    const newActive = !isActive

    setPartners((prev) =>
      prev.map((p) =>
        p.id === partner.id ? { ...p, status: newActive ? "Active" : "Inactive" } : p
      )
    )

    const { error } = await supabase
      .from("referral_partners")
      .update({ is_active: newActive })
      .eq("id", partner.id)

    if (error) {
      toast.error("Failed to update partner status")
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partner.id ? { ...p, status: isActive ? "Active" : "Inactive" } : p
        )
      )
    } else {
      toast.success(newActive ? "Partner activated" : "Partner deactivated")
    }
  }

  const handleCopyReferralCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Referral code copied")
    } catch {
      toast.error("Could not copy referral code")
    }
  }

  const handleOpenAdminDialog = async (mode: "add" | "edit" | "revoke", admin: any = null) => {
    if (admin && (mode === "edit" || mode === "revoke")) {
      if (!isSessionReady) {
        toast.error("Still loading your session. Please try again.")
        return
      }

      const canModify = await assertCanModifyAdmin(admin)
      if (!canModify) return
    }

    setAdminDialogMode(mode)
    setSelectedAdmin(admin)
    if (admin && mode === "edit") {
      setAdminFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        role: (admin.rawRole as AdminRole) || "editor",
        password: "",
      })
    } else {
      setAdminFormData({ name: "", email: "", phone: "", role: "editor", password: "" })
    }
    setIsAdminDialogOpen(true)
  }

  const handleAdminSubmit = async () => {
    setIsSubmittingAdmin(true)
    try {
      if (adminDialogMode === "add") {
        if (!adminFormData.name || !adminFormData.email || !adminFormData.password) {
          toast.error("Name, email, and password are required")
          return
        }
        const res = await createAdminAccount(adminFormData)
        if (!res.success) throw new Error(res.error)
        toast.success("Admin account created successfully")
      } else if (adminDialogMode === "edit" && selectedAdmin) {
        const canModify = await assertCanModifyAdmin(selectedAdmin)
        if (!canModify) return

        const res = await updateAdminRole(selectedAdmin.user_id, adminFormData.role)
        if (!res.success) throw new Error(res.error)
        toast.success("Admin role updated successfully")
      } else if (adminDialogMode === "revoke" && selectedAdmin) {
        const canModify = await assertCanModifyAdmin(selectedAdmin)
        if (!canModify) return

        const res = await revokeAdminAccess(selectedAdmin.user_id)
        if (!res.success) throw new Error(res.error)
        toast.success("Admin access revoked successfully")
      }

      setIsAdminDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmittingAdmin(false)
    }
  }

  const handlePartnerSubmit = async () => {
    setIsSubmittingPartner(true)
    try {
      if (!partnerFormData.name || !partnerFormData.email || !partnerFormData.password) {
        toast.error("Name, email, and password are required")
        return
      }
      const res = await createReferralPartnerAccount(partnerFormData)
      if (!res.success) throw new Error(res.error)
      toast.success("Referral partner account created successfully")
      setIsPartnerDialogOpen(false)
      setPartnerFormData({ name: "", email: "", phone: "", password: "" })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmittingPartner(false)
    }
  }

  const activePartnerCount = partners.filter((p) => p.status === "Active").length

  return (
    <>
      <ThemedPanel>
        <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F4068]/10">
                <Users className="h-5 w-5 text-[#1F4068]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">Operations</p>
                <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">Accounts</h1>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Manage admin access and referral partner accounts
                </p>
              </div>
            </div>

            <Button
              onClick={() =>
                activeTab === "admin" ? handleOpenAdminDialog("add") : setIsPartnerDialogOpen(true)
              }
              size="sm"
              className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f] shadow-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {activeTab === "admin" ? "Add admin" : "Add partner"}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Admins", value: admins.length },
              { label: "Partners", value: partners.length },
              { label: "Active partners", value: activePartnerCount },
              { label: "Total referrals", value: partners.reduce((sum, p) => sum + (p.totalReferrals || 0), 0) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5">
                <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
                <p className="font-display text-lg font-semibold text-[#1F4068]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-[#c5d4e4] bg-[#e8eef5] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap justify-center gap-1.5 lg:justify-start">
              {[
                { id: "admin" as const, label: "Admin accounts" },
                { id: "partner" as const, label: "Referral partners" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSearchQuery("")
                  }}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#1F4068] text-white shadow-sm"
                      : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "admin" ? "Search admins..." : "Search partners..."}
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
        </div>

        <div className="p-4 sm:p-5">
          {activeTab === "admin" ? (
            <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
              <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
                <h2 className="font-display text-base font-semibold text-[#1F4068]">Admin accounts</h2>
                <p className="text-[11px] text-gray-500">Control administrator roles and access levels</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                      {["Name", "Email", "Phone", "Role", "Status", "Actions"].map((head) => (
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
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-[12px] text-gray-500">
                          {searchQuery ? "No admins match your search" : "No admin accounts found"}
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <tr
                          key={admin.id || admin.user_id}
                          className="border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60"
                        >
                          <td className="px-4 py-3 text-[13px] font-medium text-[#1F4068]">{admin.name}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{admin.email || "N/A"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{admin.phone || "N/A"}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{admin.role}</td>
                          <td className="px-4 py-3">
                            <StatusPill active />
                          </td>
                          <td className="px-4 py-3">
                            {!isSessionReady ? (
                              <div className="flex justify-end">
                                <span className="text-[10px] text-gray-400">—</span>
                              </div>
                            ) : isCurrentAdmin(admin) ? (
                              <div className="flex justify-end">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8eef5] px-2 py-0.5 text-[10px] font-semibold text-[#1F4068]">
                                  Your account
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <IconActionButton
                                  onClick={() => handleOpenAdminDialog("edit", admin)}
                                  icon={Pencil}
                                  title="Edit role"
                                />
                                <IconActionButton
                                  onClick={() => handleOpenAdminDialog("revoke", admin)}
                                  icon={Trash2}
                                  title="Revoke access"
                                  tone="danger"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
              <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
                <h2 className="font-display text-base font-semibold text-[#1F4068]">Referral partners</h2>
                <p className="text-[11px] text-gray-500">
                  Manage partner accounts, referral share, and permissions
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                      {[
                        "Partner",
                        "Contact",
                        "Area",
                        "Code",
                        "Referrals",
                        "Share %",
                        "Can edit",
                        "Status",
                        "Actions",
                      ].map((head) => (
                        <th
                          key={head}
                          className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] ${
                            head === "Actions" ? "text-right" : "text-left"
                          }`}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-[12px] text-gray-500">
                          {searchQuery ? "No partners match your search" : "No referral partners found"}
                        </td>
                      </tr>
                    ) : (
                      filteredPartners.map((partner: any) => (
                        <tr
                          key={partner.id || partner.partner_id}
                          className="border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60"
                        >
                          <td className="px-4 py-3">
                            <p className="text-[13px] font-medium text-[#1F4068]">{partner.name}</p>
                            <p className="text-[10px] text-gray-500">{partner.email}</p>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{partner.phone}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-600">{partner.area}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-[#1F4068]">{partner.referralCode}</td>
                          <td className="px-4 py-3 text-[12px]">
                            <span className="font-medium text-[#1F4068]">{partner.totalReferrals}</span>
                            <span className="ml-1 text-[10px] text-gray-400">
                              ({partner.menReferrals}M / {partner.womenReferrals}F)
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex w-20 items-center overflow-hidden rounded-md border border-[#f0ebe3] bg-white focus-within:ring-2 focus-within:ring-[#c9a227]/30">
                              <input
                                type="number"
                                className="w-full bg-transparent px-2 py-1 text-right text-[12px] outline-none"
                                value={partner.referralPercentage}
                                onBlur={(e) => handleUpdatePartnerPercentage(partner.id, e.target.value)}
                                onChange={(e) => {
                                  setPartners((prev) =>
                                    prev.map((p) =>
                                      p.id === partner.id ? { ...p, referralPercentage: e.target.value } : p
                                    )
                                  )
                                }}
                                step="0.5"
                                min="0"
                                max="100"
                              />
                              <span className="pr-2 text-[10px] font-semibold text-gray-500">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`edit-profile-${partner.id}`}
                                checked={!!partner.canEditProfile}
                                onCheckedChange={() =>
                                  handleToggleEditProfile(partner.id, !!partner.canEditProfile)
                                }
                              />
                              <span
                                className={`text-[10px] font-medium ${
                                  partner.canEditProfile ? "text-[#3bb9ac]" : "text-gray-400"
                                }`}
                              >
                                {partner.canEditProfile ? "Yes" : "No"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill active={partner.status === "Active"} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <ActionButton
                                onClick={() => {
                                  setSelectedPartner(partner)
                                  setIsEditDialogOpen(true)
                                }}
                                icon={Pencil}
                                label="Edit"
                              />
                              <ActionButton
                                onClick={() => handleCopyReferralCode(partner.referralCode)}
                                icon={Copy}
                                label="Copy code"
                                tone="gold"
                              />
                              <ActionButton
                                onClick={() =>
                                  router.push(
                                    `/admin/dashboard/profiles?referralPartnerId=${encodeURIComponent(partner.referralCode)}`
                                  )
                                }
                                icon={Users}
                                label="Referrals"
                              />
                              <ActionButton
                                onClick={() => handleTogglePartnerStatus(partner)}
                                icon={partner.status === "Active" ? Ban : CheckCircle2}
                                label={partner.status === "Active" ? "Deactivate" : "Activate"}
                                tone={partner.status === "Active" ? "danger" : "default"}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ThemedPanel>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={`max-h-[90vh] max-w-4xl overflow-y-auto ${DIALOG_CONTENT}`}>
          <DialogHeader>
            <DialogTitle className={DIALOG_TITLE}>Edit profile: {selectedPartner?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedPartner && (
              <ReferralPartnerProfileForm
                userId={selectedPartner.user_id}
                userEmail={selectedPartner.email}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className={`${DIALOG_CONTENT} sm:max-w-[425px]`}>
          <DialogHeader>
            <DialogTitle className={DIALOG_TITLE}>
              {adminDialogMode === "add" && "Add new admin"}
              {adminDialogMode === "edit" && "Edit admin role"}
              {adminDialogMode === "revoke" && "Revoke admin access"}
            </DialogTitle>
          </DialogHeader>

          {adminDialogMode === "revoke" ? (
            <div className="py-4">
              <p className="text-[13px] text-gray-700">
                Are you sure you want to revoke access for{" "}
                <strong className="text-[#1F4068]">
                  {selectedAdmin?.name} ({selectedAdmin?.email})
                </strong>
                ?
              </p>
              <p className="mt-2 text-[12px] font-medium text-red-600">This action cannot be undone.</p>
            </div>
          ) : (
            <div className="grid gap-4 py-2">
              {adminDialogMode === "add" && (
                <>
                  <div className="grid gap-2">
                    <Label className="text-[12px] font-medium text-[#1F4068]">Name *</Label>
                    <Input
                      value={adminFormData.name}
                      onChange={(e) => setAdminFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[12px] font-medium text-[#1F4068]">Email *</Label>
                    <Input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[12px] font-medium text-[#1F4068]">Phone</Label>
                    <Input
                      value={adminFormData.phone}
                      onChange={(e) => setAdminFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[12px] font-medium text-[#1F4068]">Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className={`${FIELD_INPUT} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {adminDialogMode === "edit" && (
                <div className="rounded-lg border border-[#f0ebe3] bg-[#faf8f4] px-3 py-2.5">
                  <p className="text-[12px] text-gray-600">
                    Editing role for{" "}
                    <strong className="text-[#1F4068]">{selectedAdmin?.name}</strong>
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{selectedAdmin?.email}</p>
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-[12px] font-medium text-[#1F4068]">Role</Label>
                <Select
                  value={adminFormData.role}
                  onValueChange={(value) =>
                    setAdminFormData((prev) => ({ ...prev, role: value as AdminRole }))
                  }
                >
                  <SelectTrigger className={SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT}>
                    <SelectItem value="super_admin" className={SELECT_ITEM}>
                      Super Admin (Full Access)
                    </SelectItem>
                    <SelectItem value="admin" className={SELECT_ITEM}>
                      Admin (Manage users and settings)
                    </SelectItem>
                    <SelectItem value="editor" className={SELECT_ITEM}>
                      Editor (Can edit and manage users)
                    </SelectItem>
                    <SelectItem value="viewer" className={SELECT_ITEM}>
                      Viewer (Read-only access)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500">
                  {adminFormData.role === "super_admin" &&
                    "Can do everything, including creating and revoking other admins."}
                  {adminFormData.role === "admin" &&
                    "Can manage users and most platform settings."}
                  {adminFormData.role === "editor" &&
                    "Can edit profiles and standard settings, but cannot manage other admins."}
                  {adminFormData.role === "viewer" && "Can only view data. Edit actions will be hidden."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAdminDialogOpen(false)}
              disabled={isSubmittingAdmin}
              className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminSubmit}
              disabled={isSubmittingAdmin}
              className={
                adminDialogMode === "revoke"
                  ? "rounded-lg bg-red-600 text-white hover:bg-red-700"
                  : "rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]"
              }
            >
              {isSubmittingAdmin
                ? "Saving..."
                : adminDialogMode === "revoke"
                  ? "Revoke access"
                  : "Save admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent className={`${DIALOG_CONTENT} sm:max-w-[425px]`}>
          <DialogHeader>
            <DialogTitle className={DIALOG_TITLE}>Add new referral partner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label className="text-[12px] font-medium text-[#1F4068]">Name *</Label>
              <Input
                value={partnerFormData.name}
                onChange={(e) => setPartnerFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={FIELD_INPUT}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[12px] font-medium text-[#1F4068]">Email *</Label>
              <Input
                type="email"
                value={partnerFormData.email}
                onChange={(e) => setPartnerFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={FIELD_INPUT}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[12px] font-medium text-[#1F4068]">Phone</Label>
              <Input
                value={partnerFormData.phone}
                onChange={(e) => setPartnerFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className={FIELD_INPUT}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[12px] font-medium text-[#1F4068]">Password *</Label>
              <div className="relative">
                <Input
                  type={showPartnerPassword ? "text" : "password"}
                  value={partnerFormData.password}
                  onChange={(e) => setPartnerFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className={`${FIELD_INPUT} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPartnerPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPartnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsPartnerDialogOpen(false)}
              disabled={isSubmittingPartner}
              className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePartnerSubmit}
              disabled={isSubmittingPartner}
              className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]"
            >
              {isSubmittingPartner ? "Saving..." : "Save partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
