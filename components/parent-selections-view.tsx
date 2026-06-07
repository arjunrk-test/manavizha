"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Heart, UserCircle2, Info, Users2, Shield } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ParentSelectionsViewProps {
  userId: string
  onBack?: () => void
}

export function ParentSelectionsView({ userId }: ParentSelectionsViewProps) {
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

      const profileIds = selectionsData?.map((s) => s.selected_profile_id) || []

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
        { data: photosData },
      ] = await Promise.all([
        supabase.from("users").select("id, name").in("id", profileIds),
        supabase.from("personal_details").select("*").in("user_id", profileIds),
        supabase.from("education_details").select("*").in("user_id", profileIds),
        supabase.from("profession_employee").select("*").in("user_id", profileIds),
        supabase.from("profession_business").select("*").in("user_id", profileIds),
        supabase.from("profession_student").select("*").in("user_id", profileIds),
        supabase.from("photos").select("*").in("user_id", profileIds),
      ])

      const formattedSelections = selectionsData.map((selection) => {
        const profileId = selection.selected_profile_id
        return {
          id: selection.id,
          created_at: selection.created_at,
          parent: selection.parent,
          profile: {
            id: profileId,
            name:
              usersData?.find((u) => u.id === profileId)?.name ||
              personalData?.find((p) => p.user_id === profileId)?.name ||
              personalData?.find((p) => p.user_id === profileId)?.first_name ||
              "Unknown",
            personal_details: personalData?.filter((p) => p.user_id === profileId) || [],
            education_details: eduData?.filter((e) => e.user_id === profileId) || [],
            profession_employee: empData?.filter((e) => e.user_id === profileId) || [],
            profession_business: busData?.filter((e) => e.user_id === profileId) || [],
            profession_student: stuData?.filter((e) => e.user_id === profileId) || [],
            photos: photosData?.filter((p) => p.user_id === profileId) || [],
          },
        }
      })

      setSelections(formattedSelections)
      setIsLoading(false)
    }

    fetchSelections()
  }, [userId])

  const handleLikeProfile = async (profileId: string, parentRole: string) => {
    const toastId = toast.loading(`Liking profile selected by your ${parentRole}...`)

    const { error } = await supabase.from("likes").insert({
      user_id: userId,
      liked_user_id: profileId,
    })

    if (error) {
      if (error.code === "23505") {
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
    } catch {
      /* fallback below */
    }

    const sex = profile?.personal_details?.[0]?.sex
    const name = profile?.name || "User"
    const bg = sex === "Male" ? "e6f0f8" : "fce8ef"
    const color = sex === "Male" ? "1F4068" : "e87898"
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=${bg}&color=${color}`
  }

  const getProfileMeta = (profile: any) => {
    const pDetails = profile?.personal_details?.[0] || {}
    const meta = []

    if (pDetails.age) meta.push(`${pDetails.age} yrs`)
    if (pDetails.height) meta.push(`${pDetails.height} cm`)
    if (pDetails.marital_status) meta.push(pDetails.marital_status)

    return meta.join(" · ")
  }

  const getEducation = (profile: any) => {
    const edu = profile?.education_details?.[0]
    if (!edu) return "Education not specified"
    const parts = [edu.education, edu.degree, edu.branch].filter(Boolean)
    return parts.join(" · ") || "Education details pending"
  }

  const getProfession = (profile: any) => {
    const emp = profile?.profession_employee?.[0]
    const bus = profile?.profession_business?.[0]
    const stu = profile?.profession_student?.[0]

    if (emp?.designation) {
      return emp.company ? `${emp.designation} at ${emp.company}` : emp.designation
    }
    if (bus?.designation) {
      return bus.business_name ? `${bus.designation} at ${bus.business_name}` : bus.designation
    }
    if (stu?.course) {
      return stu.institution ? `Studying ${stu.course} at ${stu.institution}` : `Studying ${stu.course}`
    }
    return "Profession not specified"
  }

  const handleViewProfile = (profileId: string) => {
    const sequenceIds = selections.map((s) => s.profile?.id).filter(Boolean)
    sessionStorage.setItem("manavizha_browse_sequence", JSON.stringify(sequenceIds))
    router.push(`/dashboard/profile/${profileId}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce8ef]">
              <Shield className="h-4 w-4 text-[#e87898]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F4068]">Parent Selections</h1>
          </div>
          <p className="text-sm text-[#6b7280] mt-1 max-w-xl">
            Profiles your mother or father have picked for you. Review them and express interest when you&apos;re ready.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/browse")}
          className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium shadow-sm gap-2 shrink-0"
        >
          <Users2 className="h-4 w-4" />
          Browse Profiles
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#1F4068]">Selected for you</h2>
        <span className="text-xs font-medium text-[#6b7280] bg-[#faf8f4] px-3 py-1 rounded-full border border-[#f0ebe3]">
          {selections.length} {selections.length === 1 ? "profile" : "profiles"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#f0ebe3] border-t-[#e87898]" />
        </div>
      ) : selections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)]"
        >
          <div className="mx-auto w-16 h-16 bg-[#fce8ef] rounded-full flex items-center justify-center mb-4">
            <UserCircle2 className="h-8 w-8 text-[#e87898]/60" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F4068] mb-2">No selections yet</h3>
          <p className="text-[#6b7280] text-sm max-w-sm mx-auto mb-6">
            When your parents pick profiles for you, they&apos;ll show up here for you to review.
          </p>
          <Button
            onClick={() => router.push("/dashboard/parents")}
            variant="outline"
            className="h-10 px-5 rounded-xl border-[#f0ebe3] text-[#e87898] hover:bg-[#fce8ef] text-sm font-medium"
          >
            Manage Parents
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {selections.map((selection, index) => {
            const profile = selection.profile
            if (!profile) return null

            const parentRole = selection.parent?.role || "Parent"

            return (
              <motion.article
                key={selection.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group bg-white rounded-[18px] border border-[#f0ebe3] shadow-[0_2px_12px_rgba(31,64,104,0.05)] overflow-hidden hover:shadow-[0_6px_20px_rgba(31,64,104,0.08)] transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#faf8f4]">
                  <img
                    src={getProfileImage(profile)}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&size=400&background=fce8ef&color=e87898`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F4068]/75 via-[#1F4068]/20 to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#e87898] border border-[#fce8ef] shadow-sm backdrop-blur-sm">
                    Selected by {parentRole}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-semibold text-white truncate">{profile.name || "Unknown"}</h3>
                    {getProfileMeta(profile) && (
                      <p className="text-white/85 text-xs font-medium mt-0.5 truncate">{getProfileMeta(profile)}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af] mb-0.5">
                        Education
                      </p>
                      <p className="text-sm text-[#374151] line-clamp-2">{getEducation(profile)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af] mb-0.5">
                        Profession
                      </p>
                      <p className="text-sm text-[#374151] line-clamp-2">{getProfession(profile)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-xl border-[#f0ebe3] text-[#1F4068] hover:bg-[#faf8f4] text-sm font-medium"
                      onClick={() => handleViewProfile(profile.id)}
                    >
                      <Info className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button
                      className={cn(
                        "flex-1 h-10 rounded-xl text-sm font-medium shadow-sm gap-1.5",
                        "bg-[#e87898] hover:bg-[#d66686] text-white"
                      )}
                      onClick={() => handleLikeProfile(profile.id, parentRole)}
                    >
                      <Heart className="h-4 w-4" />
                      Like
                    </Button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
