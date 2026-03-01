"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BrowseProfiles } from "@/components/browse-profiles"
import { LogOut, ArrowLeft } from "lucide-react"

export default function ParentDashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [parentRecord, setParentRecord] = useState<any>(null)

    useEffect(() => {
        const checkParent = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/")
                return
            }

            // Verify user exists in the parents table
            const { data: parentData, error: parentError } = await supabase
                .from("parents")
                .select("*")
                .eq("id", user.id)
                .single()

            if (parentError || !parentData) {
                // Not a parent, redirect back to home
                await supabase.auth.signOut()
                router.push("/")
                return
            }

            setParentRecord(parentData)
            setIsLoading(false)
        }

        checkParent()
    }, [router])

    const handleLogout = async () => {
        setIsLoading(true)
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Error signing out:", error)
        } else {
            router.push("/")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082] mx-auto mb-4" />
                    <p className="text-gray-600">Loading Parent Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative bg-gray-50 dark:bg-[#121212]">
            {/* Header with Logout - Sticky */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#4B0082] text-white text-xs px-2 py-1 rounded-full uppercase tracking-widest">{parentRecord?.role}</span>
                            Parent Dashboard
                        </h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Viewing profiles on behalf of your child</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleLogout}
                            size="sm"
                            className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white border-0"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {parentRecord && (
                    <BrowseProfiles
                        userId={parentRecord.child_user_id}
                        parentViewer={{
                            isParent: true,
                            parentId: parentRecord.id,
                            parentRole: parentRecord.role
                        }}
                    />
                )}
            </div>
        </div>
    )
}
