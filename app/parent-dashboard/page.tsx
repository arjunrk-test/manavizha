"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BrowseProfiles } from "@/components/browse-profiles"
import { LogOut, ArrowLeft } from "lucide-react"
import { getUserDashboard } from "@/lib/auth"

export default function ParentDashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [parentRecord, setParentRecord] = useState<any>(null)

    useEffect(() => {
        const checkParent = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                router.push("/")
                return
            }

            const dashboardPath = await getUserDashboard(authUser.id)
            if (dashboardPath !== "/parent-dashboard") {
                router.push(dashboardPath)
                return
            }

            // Verify user exists in the parents table
            const { data: parentData, error: parentError } = await supabase
                .from("parents")
                .select("*")
                .eq("id", authUser.id)
                .single()

            if (parentError || !parentData) {
                // Safety net redirect
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
        <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-[#121212]">
            {/* Animated gradient background from homepage */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/10 via-[#4B0082]/10 via-[#FF1493]/10 to-[#FFA500]/10 bg-[length:200%_auto] animate-gradient pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none" />
            
            {/* Floating orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-[#1F4068]/20 to-[#4B0082]/20 rounded-full mix-blend-multiply filter blur-2xl" 
                    style={{ animation: 'float 20s ease-in-out infinite' }}
                />
                <div className="absolute top-40 right-[15%] w-72 h-72 bg-gradient-to-br from-[#FF1493]/20 to-[#FFA500]/20 rounded-full mix-blend-multiply filter blur-2xl"
                    style={{ animation: 'float 25s ease-in-out infinite 2s' }}
                />
            </div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            {/* Header with Logout - Sticky */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                Manavizha
                            </h1>
                            <span className="bg-[#4B0082] text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                {parentRecord?.role}
                            </span>
                        </div>
                        <p className="text-[10px] font-medium text-[#4B0082] dark:text-[#A855F7] mt-0.5">
                            find your perfect partner
                        </p>
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">• Parent Dashboard</span>
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
