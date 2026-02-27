"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { AnimatedBackground } from "@/components/animated-background"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Users, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        // Fetch names for admins
        const adminsWithDetails = await Promise.all(adminData.map(async (admin: any) => {
          const { data: profile } = await supabase
            .from("personal_details")
            .select("name")
            .eq("user_id", admin.user_id)
            .single()
          const formattedRole = admin.role
            ? admin.role
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
            : "Admin"

          return { ...admin, name: profile?.name || "Unknown", role: formattedRole, rawRole: admin.role, status: "Active" }
        }))
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
            .single()

          // Get referral stats if available (mocking for now as table structure is unknown)
          const { count } = await supabase
            .from("personal_details")
            .select("*", { count: 'exact', head: true })
            .eq("referralPartnerId", partner.partner_id)

          return {
            ...partner,
            name: partner.name || profile?.name || "Unknown",
            email: partner.email || "N/A",
            referralCode: partner.partner_id,
            totalReferrals: count || 0,
            status: partner.is_active !== false ? "Active" : "Inactive"
          }
        }))
        setPartners(partnersWithDetails)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="partner">Referral Partners</TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-6">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
                <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Accounts</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage administrator access and permissions.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-8 text-gray-500" colSpan={5}>
                          No admin accounts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin.id || admin.user_id}>
                          <TableCell className="font-medium text-xs font-mono">{admin.user_id}</TableCell>
                          <TableCell>{admin.email || "N/A"}</TableCell>
                          <TableCell>{admin.role}</TableCell>
                          <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{admin.status}</span></TableCell>
                          <TableCell className="text-right">
                            {admin.rawRole !== "super_admin" && (
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
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
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
                <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Referral Partners</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage referral partner accounts and details.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Total Referrals</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center py-8 text-gray-500" colSpan={6}>
                          No referral partners found
                        </TableCell>
                      </TableRow>
                    ) : (
                      partners.map((partner) => (
                        <TableRow key={partner.id || partner.partner_id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>{partner.email || "N/A"}</TableCell>
                          <TableCell>{partner.referralCode}</TableCell>
                          <TableCell>{partner.totalReferrals}</TableCell>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Referral Partner</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Edit options for {selectedPartner?.name} will appear here.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
