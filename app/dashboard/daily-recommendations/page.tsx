"use client"

import { Suspense, use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { fetchDailyRecommendations } from "@/lib/utils/match-utils"
import { ProfileDetailView } from "@/components/profile-detail-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Heart, Crown, Users2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"

function DailyRecommendationsContent({ urlId }: { urlId?: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileShowList, setMobileShowList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user?.id) {
        setUserId(data.session.user.id)
        const recs = await fetchDailyRecommendations(data.session.user.id)
        setRecommendations(recs)

        if (urlId) {
          setSelectedId(urlId)
        } else if (recs.length > 0) {
          setSelectedId(recs[0].user_id)
        }
      }
      setIsLoading(false)
    }
    getSession()
  }, [urlId])

  const selectProfile = (profileId: string) => {
    setSelectedId(profileId)
    setMobileShowList(false)
    const sequenceIds = recommendations.map((r) => r.user_id)
    sessionStorage.setItem("manavizha_browse_sequence", JSON.stringify(sequenceIds))
    router.replace(`/dashboard/daily-recommendations?id=${profileId}`, { scroll: false })
  }

  const avatarFallback = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=96&background=fce8ef&color=e87898`

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto w-16 h-16 bg-[#fce8ef] rounded-2xl flex items-center justify-center mb-5">
          <Sparkles className="h-8 w-8 text-[#e87898]/60" />
        </div>
        <h1 className="text-2xl font-semibold text-[#1F4068] mb-2">No more suggestions today</h1>
        <p className="text-sm text-[#6b7280] max-w-md mx-auto mb-6 leading-relaxed">
          You&apos;ve seen today&apos;s top matches. Check back tomorrow for a fresh batch of recommendations.
        </p>
        <Button
          onClick={() => router.push("/dashboard/browse")}
          className="h-10 px-5 rounded-xl bg-[#e87898] hover:bg-[#d66686] text-white text-sm font-medium gap-2"
        >
          <Users2 className="h-4 w-4" />
          Browse profiles
        </Button>
      </div>
    )
  }

  const showSidebar = mobileShowList || !selectedId
  const showMain = selectedId && !mobileShowList

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fce8ef]">
              <Sparkles className="h-4 w-4 text-[#e87898]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F4068]">Daily recommendations</h1>
            <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#fce8ef] text-[#e87898]">
              Top {recommendations.length}
            </span>
          </div>
          <p className="text-sm text-[#6b7280]">Handpicked profiles refreshed every 24 hours</p>
        </div>
      </div>

      <div className="relative flex h-[min(760px,calc(100dvh-15rem))] w-full overflow-hidden rounded-[18px] border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_12px_rgba(31,64,104,0.05)]">
        <DashboardJourneyPatterns />

        {/* Sidebar list */}
        <div
          className={cn(
            "relative z-10 w-full md:w-72 lg:w-80 border-r border-[#f0ebe3]/80 flex flex-col bg-white/50 backdrop-blur-[2px] shrink-0",
            showSidebar ? "flex" : "hidden md:flex"
          )}
        >
          <div className="p-4 border-b border-[#f0ebe3] bg-white/60">
            <p className="text-xs font-medium text-[#9ca3af]">
              {recommendations.length} profile{recommendations.length === 1 ? "" : "s"} for today
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {recommendations.map((rec, index) => {
              const isActive = selectedId === rec.user_id
              const matchScore =
                rec.lifestyleScore != null && rec.poruthamScore != null
                  ? Math.round((rec.lifestyleScore + rec.poruthamScore) / 2)
                  : rec.lifestyleScore ?? rec.poruthamScore ?? null

              return (
                <motion.button
                  key={rec.user_id}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => selectProfile(rec.user_id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left relative",
                    isActive
                      ? "bg-white shadow-[0_2px_8px_rgba(31,64,104,0.06)] ring-1 ring-[#fce8ef]"
                      : "hover:bg-white/80"
                  )}
                >
                  <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-[#fce8ef] ring-2 ring-white">
                    <img
                      src={rec.photos?.[0] || avatarFallback(rec.name || "User")}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = avatarFallback(rec.name || "User")
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={cn(
                          "text-sm truncate",
                          isActive ? "font-semibold text-[#1F4068]" : "font-medium text-[#374151]"
                        )}
                      >
                        {rec.name || "Unknown"}
                      </h3>
                      {rec.isPremium && (
                        <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6b7280] truncate mt-0.5">
                      {rec.age ? `${rec.age} yrs` : "Age N/A"}
                      {rec.location ? ` · ${rec.location.split(",")[0]}` : ""}
                    </p>
                    {matchScore != null && matchScore > 0 && (
                      <p className="text-[10px] font-semibold text-[#e87898] mt-0.5">{matchScore}% match</p>
                    )}
                  </div>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-[#e87898] shrink-0" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="p-4 border-t border-[#f0ebe3] bg-white/50">
            <p className="text-[10px] font-medium text-[#9ca3af] text-center uppercase tracking-wide">
              Refreshes every 24 hours
            </p>
          </div>
        </div>

        {/* Profile detail */}
        <div
          className={cn(
            "relative z-10 flex-1 flex flex-col min-w-0",
            showMain ? "flex" : "hidden md:flex"
          )}
        >
          {selectedId ? (
            <>
              <div className="md:hidden px-4 py-3 border-b border-[#f0ebe3] shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileShowList(true)}
                  className="h-9 gap-1.5 text-[#6b7280] hover:text-[#1F4068] hover:bg-[#faf8f4] -ml-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All picks
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="h-full"
                  >
                    <ProfileDetailView
                      targetUserId={selectedId}
                      currentUserId={userId}
                      isModal={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 bg-[#fce8ef] rounded-2xl flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-[#e87898]/50" />
              </div>
              <p className="text-sm text-[#6b7280]">Select a profile to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DailyRecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id: urlId } = use(searchParams)

  return (
    <Suspense fallback={<DashboardLoadingScreen />}>
      <DailyRecommendationsContent urlId={urlId} />
    </Suspense>
  )
}
