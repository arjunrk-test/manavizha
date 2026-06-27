"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { authFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, UserCircle2, Loader2, Trash2, Users2, Mail, Phone, Shield } from "lucide-react"
import { toast } from "sonner"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { cn } from "@/lib/utils"
import {
  SETUP_SECTION_BODY,
  SETUP_SECTION_CARD,
  SetupSectionHeader,
} from "@/components/profile-steps/setup-section-header"

interface ManageParentsProps {
  userId: string
  onBack?: () => void
}

const fieldClass =
  "h-11 rounded-xl border border-[#f0ebe3] bg-white text-sm text-[#1F4068] placeholder:text-[#9ca3af] focus-visible:ring-[#e87898]/20 focus-visible:border-[#e87898]"

export function ManageParents({ userId }: ManageParentsProps) {
  const [parents, setParents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [role, setRole] = useState<"Father" | "Mother" | "">("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showForm, setShowForm] = useState(false)

  const fetchParents = async () => {
    setIsLoading(true)
    const { data: parentsData, error } = await supabase
      .from("parents")
      .select("*")
      .eq("child_user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching parents:", error)
      toast.error("Failed to load parents")
    } else {
      setParents(parentsData || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchParents()
  }, [userId])

  const resetForm = () => {
    setRole("")
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
  }

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role || !name || !email || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsCreating(true)

    try {
      const response = await authFetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          email,
          phone,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create parent account")
      }

      toast.success(`${role} account created successfully!`)
      setShowForm(false)
      resetForm()
      fetchParents()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteParent = async (parentId: string, parentRole: string) => {
    if (!confirm(`Are you sure you want to delete the ${parentRole} account? They will lose access.`)) {
      return
    }

    const toastId = toast.loading(`Deleting ${parentRole}...`)

    const { error } = await supabase
      .from("parents")
      .delete()
      .eq("id", parentId)
      .eq("child_user_id", userId)

    if (error) {
      toast.error("Failed to delete account", { id: toastId })
    } else {
      toast.success(`${parentRole} account deleted`, { id: toastId })
      fetchParents()
    }
  }

  const canAddParent = parents.length < 2

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce8ef]">
              <Users2 className="h-4 w-4 text-[#e87898]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F4068]">Manage Parents</h1>
          </div>
          <p className="text-sm text-[#6b7280] mt-1 max-w-xl">
            Create accounts for your parents so they can browse profiles and make selections on your behalf.
          </p>
        </div>
        {!showForm && canAddParent && (
          <Button
            onClick={() => setShowForm(true)}
            className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium shadow-sm gap-2 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Add Parent
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <div className={cn(SETUP_SECTION_CARD, "overflow-hidden")}>
              <SetupSectionHeader
                icon={UserPlus}
                title="Create parent account"
                description="They will use the email and password below to sign in to their portal."
              />
              <div className={cn(SETUP_SECTION_BODY, "p-4 sm:p-5")}>
                <form onSubmit={handleCreateParent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[#1F4068]/70">Role *</Label>
                      <SelectDropdown
                        id="parent-role"
                        label="Select role"
                        value={role}
                        options={[
                          { id: "Father", value: "Father" },
                          { id: "Mother", value: "Mother" },
                        ]}
                        onChange={(v) => setRole(v as "Father" | "Mother")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-medium text-[#1F4068]/70">
                        Full name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="E.g., Ramasamy"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={fieldClass}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-[#1F4068]/70">
                        Email address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="parent@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium text-[#1F4068]/70">
                        Mobile number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="password" className="text-xs font-medium text-[#1F4068]/70">
                        Login password *
                      </Label>
                      <Input
                        id="password"
                        type="text"
                        placeholder="Create a password for them"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={fieldClass}
                        required
                        minLength={6}
                      />
                      <p className="text-[11px] text-[#9ca3af]">Must be at least 6 characters.</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      disabled={isCreating}
                      className="h-10 px-5 rounded-xl border-[#f0ebe3] text-[#1F4068] hover:bg-[#faf8f4]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium shadow-sm"
                      disabled={isCreating || !role || !name || !email || !password}
                    >
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create account
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#1F4068]">Parent accounts</h2>
        <span className="text-xs font-medium text-[#6b7280] bg-[#faf8f4] px-3 py-1 rounded-full border border-[#f0ebe3]">
          {parents.length} / 2
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f0ebe3] border-t-[#e87898]" />
        </div>
      ) : parents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]"
        >
          <div className="mx-auto w-16 h-16 bg-[#fce8ef] rounded-full flex items-center justify-center mb-4">
            <UserCircle2 className="h-8 w-8 text-[#e87898]/60" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F4068] mb-2">No parent accounts yet</h3>
          <p className="text-[#6b7280] text-sm max-w-sm mx-auto mb-6">
            Add your mother or father so they can help you search and shortlist matches from their own portal.
          </p>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium shadow-sm gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add parent
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {parents.map((parent, index) => (
            <motion.article
              key={parent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="relative bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e87898] to-[#fce8ef]" />
              <div className="p-5">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fce8ef] text-[#e87898] text-[11px] font-semibold rounded-full mb-2">
                      <Shield className="h-3 w-3" />
                      {parent.role}
                    </span>
                    <h3 className="text-lg font-semibold text-[#1F4068] truncate">{parent.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteParent(parent.id, parent.role)}
                    className="h-9 w-9 shrink-0 text-[#9ca3af] hover:text-red-600 hover:bg-red-50 rounded-xl"
                    title={`Remove ${parent.role}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5 text-[#374151]">
                    <Mail className="h-4 w-4 text-[#e87898] shrink-0 mt-0.5" />
                    <span className="break-all">{parent.email}</span>
                  </div>
                  {parent.phone && (
                    <div className="flex items-center gap-2.5 text-[#374151]">
                      <Phone className="h-4 w-4 text-[#e87898] shrink-0" />
                      <span>{parent.phone}</span>
                    </div>
                  )}
                </div>

                <p className="mt-4 pt-3 border-t border-[#f0ebe3] text-[11px] text-[#9ca3af]">
                  Added {new Date(parent.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
