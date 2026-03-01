"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCircle2, Loader2, ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SelectDropdown } from "@/components/ui/select-dropdown"

interface ManageParentsProps {
    userId: string
    onBack: () => void
}

export function ManageParents({ userId, onBack }: ManageParentsProps) {
    const [parents, setParents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    // Form states
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
            const response = await fetch('/api/parents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role,
                    name,
                    email,
                    phone,
                    password,
                    child_user_id: userId
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create parent account')
            }

            toast.success(`${role} account created successfully!`)
            setShowForm(false)
            // Reset form
            setRole("")
            setName("")
            setEmail("")
            setPhone("")
            setPassword("")

            // Refresh list
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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4 hover:bg-[#4B0082]/10"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <UserCircle2 className="h-8 w-8 text-[#4B0082]" />
                        Manage Parent Access
                    </h1>
                    {!showForm && parents.length < 2 && (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-[#1F4068] to-[#4B0082] hover:opacity-90"
                        >
                            <UserPlus className="h-4 w-4 mr-2" /> Add Parent
                        </Button>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Create accounts for your parents to browse and select profiles on your behalf securely.
                </p>
            </motion.div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8"
                >
                    <Card className="border-2 border-[#4B0082]/20">
                        <CardHeader className="bg-[#4B0082]/5 dark:bg-[#4B0082]/10 border-b border-[#4B0082]/10">
                            <CardTitle>Create Parent Account</CardTitle>
                            <CardDescription>
                                They will use the email and password below to login to their portal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreateParent} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role *</Label>
                                        <SelectDropdown
                                            id="parent-role"
                                            label="Select Role"
                                            value={role}
                                            options={[
                                                { id: "Father", value: "Father" },
                                                { id: "Mother", value: "Mother" }
                                            ]}
                                            onChange={(v) => setRole(v as any)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="E.g., Ramasamy"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="parent@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Mobile Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="password">Login Password *</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            placeholder="Create a password for them"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <p className="text-xs text-gray-500">Must be at least 6 characters long.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#4B0082] hover:bg-[#3a0066] text-white"
                                        disabled={isCreating || !role || !name || !email || !password}
                                    >
                                        {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Create Account
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#4B0082]" />
                </div>
            ) : parents.length === 0 ? (
                <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <UserCircle2 className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Parent Accounts Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                            You haven't granted access to your parents yet. Add an account to let them help you search for matches!
                        </p>
                        {!showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-[#1F4068] to-[#4B0082] hover:opacity-90"
                            >
                                <UserPlus className="h-4 w-4 mr-2" /> Add Parent Now
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parents.map((parent) => (
                        <Card key={parent.id} className="relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#4B0082]" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-block px-2 py-1 bg-[#4B0082]/10 text-[#4B0082] text-xs font-semibold rounded-full mb-2">
                                            {parent.role}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            {parent.name}
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteParent(parent.id, parent.role)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-200">Email:</span>
                                        {parent.email}
                                    </div>
                                    {parent.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-gray-200">Phone:</span>
                                            {parent.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                                    Added on {new Date(parent.created_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
