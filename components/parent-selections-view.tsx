"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Loader2, ArrowLeft, UserCircle2, Info } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ParentSelectionsViewProps {
    userId: string
    onBack: () => void
}

export function ParentSelectionsView({ userId, onBack }: ParentSelectionsViewProps) {
    const router = useRouter()
    const [selections, setSelections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSelections = async () => {
            setIsLoading(true)

            const { data: selectionsData, error: selectionsError } = await supabase
                .from("parent_selections")
                .select("id, created_at, selected_profile_id, parent:parents(role, name)")
                .eq("child_user_id", userId)
                .order("created_at", { ascending: false })

            if (selectionsError) {
                console.error("Error fetching parent selections:", selectionsError)
                toast.error("Failed to load parent selections")
                setIsLoading(false)
                return
            }

            const profileIds = selectionsData?.map(s => s.selected_profile_id) || []

            if (profileIds.length === 0) {
                setSelections([])
                setIsLoading(false)
                return
            }

            const [
                { data: usersData },
                { data: personalData },
                { data: eduData },
                { data: empData },
                { data: busData },
                { data: stuData },
                { data: photosData }
            ] = await Promise.all([
                supabase.from("users").select("id, name").in("id", profileIds), // if users doesn't have name, it will just be null
                supabase.from("personal_details").select("*").in("user_id", profileIds),
                supabase.from("education_details").select("*").in("user_id", profileIds),
                supabase.from("profession_employee").select("*").in("user_id", profileIds),
                supabase.from("profession_business").select("*").in("user_id", profileIds),
                supabase.from("profession_student").select("*").in("user_id", profileIds),
                supabase.from("photos").select("*").in("user_id", profileIds)
            ])

            const formattedSelections = selectionsData.map(selection => {
                const profileId = selection.selected_profile_id
                return {
                    id: selection.id,
                    created_at: selection.created_at,
                    parent: selection.parent,
                    profile: {
                        id: profileId,
                        name: usersData?.find(u => u.id === profileId)?.name || personalData?.find(p => p.user_id === profileId)?.name || personalData?.find(p => p.user_id === profileId)?.first_name || "Unknown",
                        personal_details: personalData?.filter(p => p.user_id === profileId) || [],
                        education_details: eduData?.filter(e => e.user_id === profileId) || [],
                        profession_employee: empData?.filter(e => e.user_id === profileId) || [],
                        profession_business: busData?.filter(e => e.user_id === profileId) || [],
                        profession_student: stuData?.filter(e => e.user_id === profileId) || [],
                        photos: photosData?.filter(p => p.user_id === profileId) || []
                    }
                }
            })

            setSelections(formattedSelections)
            setIsLoading(false)
        }

        fetchSelections()
    }, [userId])

    const handleLikeProfile = async (profileId: string, parentRole: string) => {
        const toastId = toast.loading(`Liking profile selected by your ${parentRole}...`)

        const { error } = await supabase
            .from("likes")
            .insert({
                user_id: userId,
                liked_user_id: profileId,
            })

        if (error) {
            if (error.code === '23505') {
                toast.success("You have already liked this profile", { id: toastId })
            } else {
                toast.error("Failed to like profile", { id: toastId })
            }
        } else {
            toast.success("Profile liked successfully! We'll notify them.", { id: toastId })
        }
    }

    const getProfileImage = (profile: any) => {
        try {
            if (profile?.photos?.[0]?.user_photos?.length > 0) {
                return profile.photos[0].user_photos[0]
            }
        } catch (e) { }

        // Default fallback based on sex
        const sex = profile?.personal_details?.[0]?.sex
        if (sex === "Female") {
            return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60"
        } else if (sex === "Male") {
            return "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60"
        }
        return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60"
    }

    const getProfileMeta = (profile: any) => {
        const pDetails = profile?.personal_details?.[0] || {}
        const meta = []

        if (pDetails.age) meta.push(`${pDetails.age} Yrs`)
        if (pDetails.height) meta.push(`${pDetails.height} cm`)
        if (pDetails.marital_status) meta.push(pDetails.marital_status)

        return meta.join(" • ")
    }

    const getEducation = (profile: any) => {
        const edu = profile?.education_details?.[0]
        if (!edu) return "Education not specified"
        const parts = [edu.education, edu.degree, edu.branch].filter(Boolean)
        return parts.join(" • ") || "Education details pending"
    }

    const getProfession = (profile: any) => {
        const emp = profile?.profession_employee?.[0]
        const bus = profile?.profession_business?.[0]
        const stu = profile?.profession_student?.[0]

        let prof = "Profession not specified"
        if (emp && emp.designation) {
            prof = emp.company ? `${emp.designation} at ${emp.company}` : emp.designation
        } else if (bus && bus.designation) {
            prof = bus.business_name ? `${bus.designation} at ${bus.business_name}` : bus.designation
        } else if (stu && stu.course) {
            prof = stu.institution ? `Studying ${stu.course} at ${stu.institution}` : `Studying ${stu.course}`
        }
        return prof
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
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
                        <Heart className="h-8 w-8 text-[#FF1493]" fill="#FF1493" />
                        Selected By Parents
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Review the profiles that your mother or father have picked specifically for you.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#4B0082]" />
                </div>
            ) : selections.length === 0 ? (
                <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <UserCircle2 className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Selections Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            Your parents haven't selected any profiles for you yet. Once they pick someone, they will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selections.map((selection, index) => {
                        const profile = selection.profile
                        if (!profile) return null

                        return (
                            <motion.div
                                key={selection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="group relative"
                            >
                                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#FF1493]/30">
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-[#4B0082] rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm shadow-xl">
                                            Selected by {selection.parent?.role || "Parent"}
                                        </span>
                                    </div>

                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={getProfileImage(profile)}
                                            alt={profile.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

                                        <div className="absolute bottom-4 left-4 right-4 relative z-10">
                                            <h3 className="text-2xl font-bold text-white mb-1">
                                                {profile.name || "Unknown"}
                                            </h3>
                                            <p className="text-gray-200 text-sm font-medium">
                                                {getProfileMeta(profile)}
                                            </p>
                                        </div>
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="space-y-3 mb-6">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Education</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {getEducation(profile)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Profession</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {getProfession(profile)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-[#4B0082] text-[#4B0082] hover:bg-[#4B0082] hover:text-white group"
                                                onClick={() => router.push(`/dashboard/profiles/${profile.id}`)}
                                            >
                                                <Info className="h-4 w-4 mr-2" />
                                                View Full
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#FF1493] hover:bg-[#E01183] text-white"
                                                onClick={() => handleLikeProfile(profile.id, selection.parent?.role || 'Parent')}
                                            >
                                                <Heart className="h-4 w-4 mr-2" />
                                                Like
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
