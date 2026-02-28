"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { ReferralPartnerProfileForm } from "@/components/referral-partner-profile-form"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { ArrowLeft, Users, Pencil, Search, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { createAdminAccount, updateAdminRole, revokeAdminAccess, AdminRole, createReferralPartnerAccount } from "@/app/actions/admin"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function AdminAccountsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [admins, setAdmins] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("admin")

  // Admin Management State
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [adminDialogMode, setAdminDialogMode] = useState<"add" | "edit" | "revoke">("add")
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "editor" as AdminRole,
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false)
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false)
  const [partnerFormData, setPartnerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  })
  const [showPartnerPassword, setShowPartnerPassword] = useState(false)

  const q = searchQuery.toLowerCase()
  const filteredAdmins = useMemo(() => {
    if (!q) return admins
    return admins.filter((a: any) =>
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q) ||
      (a.role || "").toLowerCase().includes(q)
    )
  }, [admins, q])

  const filteredPartners = useMemo(() => {
    if (!q) return partners
    return partners.filter((p: any) =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q) ||
      (p.area || "").toLowerCase().includes(q) ||
      (p.referralCode || "").toLowerCase().includes(q)
    )
  }, [partners, q])

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin")
        return
      }

      // TODO: Verify user is an admin (add admin check logic here)

      setUser(user)
      await fetchData()
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const fetchData = async () => {
    try {
      // Fetch Admins
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")

      if (adminData) {
        const adminsWithDetails = adminData.map((admin: any) => {
          const formattedRole = admin.role
            ? admin.role
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
            : "Admin"
          return { ...admin, name: admin.name || "Unknown", phone: admin.phone || "N/A", role: formattedRole, rawRole: admin.role, status: "Active" }
        })
        setAdmins(adminsWithDetails)
      }

      // Fetch Referral Partners
      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("*")

      if (partnerData) {
        // Fetch names for partners
        const partnersWithDetails = await Promise.all(partnerData.map(async (partner: any) => {
          const { data: profile } = await supabase
            .from("personal_details")
            .select("name")
            .eq("user_id", partner.user_id)
            .maybeSingle()

          // Get referral stats for Men, Women, and Total
          let profiles: any[] | null = null;
          if (partner.partner_id) {
            const { data: refData } = await supabase
              .from("referral_details")
              .select("user_id")
              .eq("referral_partner_id", partner.partner_id)

            if (refData && refData.length > 0) {
              const uids = refData.map((r: any) => r.user_id)
              const { data } = await supabase
                .from("personal_details")
                .select("sex")
                .in("user_id", uids)
              profiles = data;
            } else {
              profiles = []
            }
          }

          const total = profiles ? profiles.length : 0
          const men = profiles ? profiles.filter(p => p.sex === "Male").length : 0
          const women = profiles ? profiles.filter(p => p.sex === "Female").length : 0

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
            status: partner.is_active !== false ? "Active" : "Inactive"
          }
        }))
        setPartners(partnersWithDetails)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleUpdatePartnerPercentage = async (id: string, value: string) => {
    try {
      const parsedValue = parseFloat(value)
      if (isNaN(parsedValue)) return

      // Optimistically update the UI
      setPartners(prev => prev.map(p =>
        p.id === id
          ? { ...p, referralPercentage: parsedValue }
          : p
      ))

      const { error } = await supabase
        .from("referral_partners")
        .update({ referral_percentage: parsedValue })
        .eq("id", id)

      if (error) {
        toast.error("Failed to update partner percentage")
        fetchData() // Re-fetch to revert to actual db state on error
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
    // Optimistically update UI
    setPartners(prev => prev.map(p =>
      p.id === id ? { ...p, canEditProfile: newValue } : p
    ))
    const { error } = await supabase
      .from("referral_partners")
      .update({ can_edit_profile: newValue })
      .eq("id", id)
    if (error) {
      toast.error("Failed to update edit permission")
      setPartners(prev => prev.map(p =>
        p.id === id ? { ...p, canEditProfile: currentValue } : p
      ))
    } else {
      toast.success(newValue ? "Edit access granted" : "Edit access revoked")
    }
  }

  // --- Admin Handlers ---
  const handleOpenAdminDialog = (mode: "add" | "edit" | "revoke", admin: any = null) => {
    setAdminDialogMode(mode)
    setSelectedAdmin(admin)
    if (admin && mode === "edit") {
      setAdminFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        role: (admin.rawRole as AdminRole) || "editor",
        password: ""
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
        const res = await updateAdminRole(selectedAdmin.user_id, adminFormData.role)
        if (!res.success) throw new Error(res.error)
        toast.success("Admin role updated successfully")

      } else if (adminDialogMode === "revoke" && selectedAdmin) {
        const res = await revokeAdminAccess(selectedAdmin.user_id)
        if (!res.success) throw new Error(res.error)
        toast.success("Admin access revoked successfully")
      }

      setIsAdminDialogOpen(false)
      fetchData() // Refresh list
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
      fetchData() // Refresh list
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmittingPartner(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
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
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
          <Tabs defaultValue="admin" className="w-full" onValueChange={(v) => { setActiveTab(v); setSearchQuery("") }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="grid grid-cols-2 max-w-[400px]">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="partner">Referral Partners</TabsTrigger>
              </TabsList>
              {/* Global Search */}
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={activeTab === "admin" ? "Search admins..." : "Search partners..."}
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <TabsContent value="admin" className="mt-6">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
                <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Accounts</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage administrator access and permissions.</p>
                  </div>
                  <Button onClick={() => handleOpenAdminDialog("add")} className="bg-[#4B0082] hover:bg-[#4B0082]/90">
                    <Users className="h-4 w-4 mr-2" /> Add Admin
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-8 text-gray-500" colSpan={5}>
                          {searchQuery ? "No admins match your search" : "No admin accounts found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <TableRow key={admin.id || admin.user_id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email || "N/A"}</TableCell>
                          <TableCell>{admin.phone || "N/A"}</TableCell>
                          <TableCell>{admin.role}</TableCell>
                          <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{admin.status}</span></TableCell>
                          <TableCell className="text-right">
                            {admin.rawRole !== "super_admin" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAdminDialog("edit", admin)} className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                  Edit Role
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAdminDialog("revoke", admin)} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  Revoke
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="partner" className="mt-6">
              {/* Table */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
                <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Partners</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage referral partner accounts and their custom percentages.</p>
                  </div>
                  <Button onClick={() => setIsPartnerDialogOpen(true)} className="bg-[#4B0082] hover:bg-[#4B0082]/90">
                    <Users className="h-4 w-4 mr-2" /> Add Referral Partner
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Men</TableHead>
                        <TableHead>Women</TableHead>
                        <TableHead>Share %</TableHead>
                        <TableHead>Can Edit Profile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPartners.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-center py-8 text-gray-500" colSpan={12}>
                            {searchQuery ? "No partners match your search" : "No referral partners found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPartners.map((partner: any) => (
                          <TableRow key={partner.id || partner.partner_id}>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{partner.email || "N/A"}</TableCell>
                            <TableCell>{partner.phone}</TableCell>
                            <TableCell>{partner.area}</TableCell>
                            <TableCell>{partner.referralCode}</TableCell>
                            <TableCell>{partner.totalReferrals}</TableCell>
                            <TableCell className="text-blue-600 dark:text-blue-400 font-medium">{partner.menReferrals}</TableCell>
                            <TableCell className="text-pink-600 dark:text-pink-400 font-medium">{partner.womenReferrals}</TableCell>
                            <TableCell>
                              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-[#4B0082] overflow-hidden w-20">
                                <input
                                  type="number"
                                  className="w-full bg-transparent px-2 py-1 text-sm outline-none text-right"
                                  value={partner.referralPercentage}
                                  onBlur={(e) => handleUpdatePartnerPercentage(partner.id, e.target.value)}
                                  onChange={(e) => {
                                    // Update instantly in local state to allow typing
                                    setPartners(prev => prev.map(p =>
                                      p.id === partner.id ? { ...p, referralPercentage: e.target.value } : p
                                    ))
                                  }}
                                  step="0.5"
                                  min="0"
                                  max="100"
                                />
                                <span className="pr-2 text-gray-500 text-xs font-semibold select-none">%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`edit-profile-${partner.id}`}
                                  checked={!!partner.canEditProfile}
                                  onCheckedChange={() => handleToggleEditProfile(partner.id, !!partner.canEditProfile)}
                                />
                                <span className={`text-xs font-medium ${partner.canEditProfile ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                  {partner.canEditProfile ? "Yes" : "No"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {partner.status || "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedPartner(partner)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>© 2024 Manavizha. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="/privacy-policy" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile: {selectedPartner?.name}</DialogTitle>
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

        {/* Admin Management Dialog */}
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {adminDialogMode === "add" && "Add New Admin"}
                {adminDialogMode === "edit" && "Edit Admin Role"}
                {adminDialogMode === "revoke" && "Revoke Admin Access"}
              </DialogTitle>
            </DialogHeader>

            {adminDialogMode === "revoke" ? (
              <div className="py-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to revoke access for <strong>{selectedAdmin?.name} ({selectedAdmin?.email})</strong>?
                </p>
                <p className="text-sm text-red-500 mt-2 font-medium">This action cannot be undone.</p>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                {adminDialogMode === "add" && (
                  <>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                      <Input value={adminFormData.name} onChange={e => setAdminFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Admin Name" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                      <Input type="email" value={adminFormData.email} onChange={e => setAdminFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="admin@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input value={adminFormData.phone} onChange={e => setAdminFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 9876543210" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={adminFormData.password}
                          onChange={e => setAdminFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Secure password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {adminDialogMode === "edit" && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Editing role for <strong>{selectedAdmin?.name}</strong></p>
                  </div>
                )}

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={adminFormData.role}
                    onChange={e => setAdminFormData(prev => ({ ...prev, role: e.target.value as AdminRole }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082]"
                  >
                    <option value="super_admin">Super Admin (Full Access)</option>
                    <option value="editor">Editor (Can edit and manage users)</option>
                    <option value="viewer">Viewer (Read-only access)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminFormData.role === "super_admin" && "Can do everything, including creating and revoking other admins."}
                    {adminFormData.role === "editor" && "Can edit profiles and standard settings, but cannot manage other admins."}
                    {adminFormData.role === "viewer" && "Can only view data. Edit buttons will be hidden."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)} disabled={isSubmittingAdmin}>
                Cancel
              </Button>
              <Button
                onClick={handleAdminSubmit}
                disabled={isSubmittingAdmin}
                className={adminDialogMode === "revoke" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#4B0082] hover:bg-[#4B0082]/90"}
              >
                {isSubmittingAdmin ? "Saving..." : (adminDialogMode === "revoke" ? "Revoke Access" : "Save Admin")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Referral Partner Dialog */}
        <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Referral Partner</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <Input value={partnerFormData.name} onChange={e => setPartnerFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Partner Name" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <Input type="email" value={partnerFormData.email} onChange={e => setPartnerFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="partner@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={partnerFormData.phone} onChange={e => setPartnerFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 9876543210" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    type={showPartnerPassword ? "text" : "password"}
                    value={partnerFormData.password}
                    onChange={e => setPartnerFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Secure password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPartnerPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPartnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsPartnerDialogOpen(false)} disabled={isSubmittingPartner}>
                Cancel
              </Button>
              <Button
                onClick={handlePartnerSubmit}
                className="bg-[#4B0082] hover:bg-[#4B0082]/90"
                disabled={isSubmittingPartner}
              >
                {isSubmittingPartner ? "Saving..." : "Save Partner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  )
}
