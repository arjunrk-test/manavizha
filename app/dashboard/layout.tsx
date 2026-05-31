"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserDashboard } from "@/lib/auth"
import { LogOut, ArrowLeft, Edit, Settings, MessageSquare, User, Bell, Heart, Eye, Sparkles, ArrowRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DashboardScrollProgress } from "@/components/dashboard/dashboard-scroll-progress"
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen"
import { formatDistanceToNow } from "date-fns"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [whoViewedMe, setWhoViewedMe] = useState<any[]>([])
  const [whoExpressedInterest, setWhoExpressedInterest] = useState<any[]>([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          // If there's an auth error (like Invalid Refresh Token), sign out to clear stale data
          if (authError) {
             console.warn("Auth check error, signing out:", authError.message)
             await supabase.auth.signOut()
          }
          router.push("/")
          return
        }

        // Determine the correct dashboard for the user based on their specific role
        const dashboardPath = await getUserDashboard(authUser.id)
        
        if (dashboardPath !== "/dashboard") {
          router.push(dashboardPath)
          return
        }

        setUser(authUser)
        setIsLoading(false)

        // Check if account was deactivated — auto-reactivate on login and notify
        try {
          const settingsRes = await fetch(`/api/settings?userId=${authUser.id}`)
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json()
            if (settingsData.is_deactivated) {
              // Reactivate automatically on login
              await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: authUser.id,
                  updates: { is_deactivated: false, deactivated_until: null }
                })
              })
              // Short delay so the toast is visible after page load
              setTimeout(() => {
                import('sonner').then(({ toast }) => {
                  toast.success('Welcome back! Your profile has been reactivated and is now visible to all members.', {
                    duration: 6000,
                    description: 'You can deactivate again anytime from Profile Settings.'
                  })
                })
              }, 1200)
            }
          }
        } catch (err) {
          // Silent catch for secondary settings check
        }
      } catch (err) {
        console.error("Critical error in checkUser:", err)
        router.push("/")
      }
    }

    checkUser()

    // Add listener for auth state changes to handle logout across tabs or token errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESH_ERRORED' as any)) {
        router.push("/")
      }
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (!user?.id) return

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
      
      if (!error) setUnreadCount(count || 0)
    }

    const fetchNotifications = async () => {
      if (!user?.id) return
      setIsNotificationsLoading(true)
      try {
        const [vRes, lRes] = await Promise.all([
          fetch(`/api/views?userId=${user.id}`).catch(() => ({ ok: false, json: async () => ({}) } as any)),
          fetch(`/api/likes?userId=${user.id}`).catch(() => ({ ok: false, json: async () => ({}) } as any))
        ])

        if (vRes.ok && lRes.ok) {
          const viewsData = await vRes.json()
          const likesData = await lRes.json()
          
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          const recentViews = (viewsData.viewedMe || []).filter((v: any) => !v.is_read && new Date(v.created_at) > thirtyDaysAgo)
          const recentLikes = (likesData.received || []).filter((l: any) => !l.is_read && new Date(l.created_at) > thirtyDaysAgo)

          // Collect unique user IDs to fetch profiles for
          const viewerUserIds = recentViews.map((v: any) => v.viewer_user_id)
          const likerUserIds = recentLikes.map((l: any) => l.user_id)
          const uniqueUserIds = [...new Set([...viewerUserIds, ...likerUserIds])]

          if (uniqueUserIds.length > 0) {
            // Fetch relevant profiles directly from Supabase
            const { data: profiles, error: pError } = await supabase
              .from('personal_details')
              .select('user_id, name, age, photos, address, profession')
              .in('user_id', uniqueUserIds)

            if (!pError && profiles) {
              setWhoViewedMe(recentViews.map((rv: any) => {
                const p = profiles.find((c: any) => c.user_id === rv.viewer_user_id)
                return p ? { ...p, interaction_at: rv.created_at, interaction_type: 'view' } : null
              }).filter(Boolean))

              setWhoExpressedInterest(recentLikes.map((rl: any) => {
                const p = profiles.find((c: any) => c.user_id === rl.user_id)
                return p ? { ...p, interaction_at: rl.created_at, interaction_type: 'interest' } : null
              }).filter(Boolean))
            }
          } else {
             setWhoViewedMe([])
             setWhoExpressedInterest([])
          }
        }
      } catch (err) {
        console.error("Error fetching header notifications:", err)
      } finally {
        setIsNotificationsLoading(false)
      }
    }

    fetchUnreadCount()
    fetchNotifications()

    const channel = supabase
      .channel(`unread-messages-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => { fetchUnreadCount() }
      )
      .subscribe()

    // Listen for custom message read events from other tabs or components
    window.addEventListener('messagesRead', fetchUnreadCount)

    const notifInterval = setInterval(() => {
      fetchUnreadCount()
      fetchNotifications()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(notifInterval)
      window.removeEventListener('messagesRead', fetchUnreadCount)
    }
  }, [user?.id])

  const handleNotificationClick = async (type: 'view' | 'interest', targetUserId: string) => {
    if (!user?.id) return

    // Optimistic update
    if (type === 'view') {
      setWhoViewedMe(prev => prev.filter(p => p.user_id !== targetUserId))
    } else {
      setWhoExpressedInterest(prev => prev.filter(p => p.user_id !== targetUserId))
    }

    try {
      await fetch(`/api/${type === 'view' ? 'views' : 'likes'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, targetUserId, isRead: true })
      })
      router.push(`/dashboard/browse?userId=${targetUserId}`)
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push("/")
  }

  const getViewName = () => {
    if (pathname.includes("/setup")) return "Profile Setup"
    if (pathname.includes("/browse")) return "Browse Profiles"
    if (pathname.includes("/parents")) return "Manage Parents"
    if (pathname.includes("/selections")) return "Parent Selections"
    if (pathname.includes("/preferences")) return "Partner Preferences"
    if (pathname.includes("/likes")) return "My Likes"
    if (pathname.includes("/horoscope")) return "Horoscope Generator"
    if (pathname.includes("/messages")) return "Messages"
    if (pathname.includes("/settings")) return "Profile Settings"
    return ""
  }

  const isLanding = pathname === "/dashboard"
  const viewName = getViewName()

  if (isLoading) {
    return <DashboardLoadingScreen />
  }

  const notificationCount = whoViewedMe.length + whoExpressedInterest.length

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#faf8f4]">
      {/* Header */}
      <header className="relative z-50 shrink-0 bg-white border-b border-[#f0f0f0]">
        <div className="w-full px-5 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
            onClick={() => router.push("/dashboard")}
          >
            <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
            <h1 className="text-[22px] font-semibold text-[#e87898] tracking-tight shrink-0">
              Manavizha
            </h1>
            {!isLanding && viewName && (
              <>
                <span className="hidden sm:block w-px h-5 bg-gray-200 shrink-0" />
                <span className="hidden sm:block text-sm text-gray-500 truncate">{viewName}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isLanding && (
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-gray-600 hover:text-[#1F4068] hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Button>
            )}
            <Button
              onClick={() => user?.id && router.push(`/dashboard/profile/${user.id}`)}
              disabled={!user?.id}
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-[#e5e7eb] text-[#374151] hover:bg-[#faf8f4] text-[13px] font-medium disabled:opacity-50 rounded-[10px] bg-white"
            >
              <User className="h-4 w-4" />
              Preview Profile
            </Button>
            <Button
              onClick={() => router.push("/dashboard/setup")}
              disabled={!user?.id}
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-[#e5e7eb] text-[#374151] hover:bg-[#faf8f4] text-[13px] font-medium disabled:opacity-50 rounded-[10px] bg-white"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              onClick={() => router.push("/dashboard/messages")}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-[#1F4068] hover:bg-gray-50 relative rounded-xl"
              title="Messages"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-600 hover:text-[#1F4068] hover:bg-gray-50 relative rounded-xl"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-[#e87898] text-[10px] font-semibold text-white">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[340px] p-0 overflow-hidden rounded-[20px] border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_12px_40px_rgba(31,64,104,0.14)] z-[60]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#fce8ef] blur-2xl opacity-60"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-[#fdf6e3] blur-2xl opacity-50"
                />

                <div className="relative border-b border-[#f0ebe3]/80 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fce8ef] shadow-sm">
                        <Bell className="h-4 w-4 text-[#e87898]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-semibold text-[#1F4068]">Notifications</h4>
                        <p className="text-[11px] text-[#9ca3af]">Activity from the last 30 days</p>
                      </div>
                    </div>
                    {notificationCount > 0 && (
                      <span className="shrink-0 rounded-full bg-[#e87898] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {notificationCount} new
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative max-h-[380px] overflow-y-auto px-3 py-3 custom-scrollbar">
                  {isNotificationsLoading ? (
                    <div className="space-y-2 py-2">
                      {[0, 1, 2].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-[#f0ebe3]/80 bg-white/70 p-2.5 animate-pulse">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#faf8f4]" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/4 rounded bg-[#faf8f4]" />
                            <div className="h-2.5 w-1/2 rounded bg-[#faf8f4]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {whoExpressedInterest.length > 0 && (
                        <div className="mb-3 space-y-2">
                          <div className="flex items-center gap-1.5 px-1">
                            <Sparkles className="h-3.5 w-3.5 text-[#e87898]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#e87898]">
                              Interest received
                            </span>
                          </div>
                          {whoExpressedInterest.slice(0, 5).map((p) => (
                            <div
                              key={p.user_id}
                              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#f0ebe3]/80 bg-white/75 p-2.5 transition-all hover:border-[#e87898]/25 hover:bg-white hover:shadow-[0_2px_10px_rgba(232,120,152,0.08)]"
                              onClick={() => handleNotificationClick("interest", p.user_id)}
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#fce8ef] ring-2 ring-white">
                                <img
                                  src={p.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=fce8ef&color=e87898`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-[13px] font-medium text-[#374151]">
                                    <span className="text-[#1F4068]">{p.name || "Member"}</span> expressed interest
                                  </p>
                                  <span className="shrink-0 whitespace-nowrap text-[10px] text-[#9ca3af]">
                                    {formatDistanceToNow(new Date(p.interaction_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-[11px] text-[#6b7280]">
                                  {p.age} yrs · {p.profession?.split(" at ")[0]}
                                </p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#d1d5db] transition-colors group-hover:text-[#e87898]" />
                            </div>
                          ))}
                        </div>
                      )}

                      {whoViewedMe.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 px-1">
                            <Eye className="h-3.5 w-3.5 text-[#3bb9ac]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3bb9ac]">
                              Profile visitors
                            </span>
                          </div>
                          {whoViewedMe.slice(0, 5).map((p) => (
                            <div
                              key={p.user_id}
                              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#f0ebe3]/80 bg-white/75 p-2.5 transition-all hover:border-[#3bb9ac]/25 hover:bg-white hover:shadow-[0_2px_10px_rgba(59,185,172,0.08)]"
                              onClick={() => handleNotificationClick("view", p.user_id)}
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#e6f7f5] ring-2 ring-white">
                                <img
                                  src={p.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=e6f7f5&color=3bb9ac`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-[13px] font-medium text-[#374151]">
                                    <span className="text-[#1F4068]">{p.name || "Member"}</span> viewed you
                                  </p>
                                  <span className="shrink-0 whitespace-nowrap text-[10px] text-[#9ca3af]">
                                    {formatDistanceToNow(new Date(p.interaction_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-[11px] text-[#6b7280]">
                                  {p.age} yrs · {p.address?.split(",")[0]}
                                </p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#d1d5db] transition-colors group-hover:text-[#3bb9ac]" />
                            </div>
                          ))}
                        </div>
                      )}

                      {notificationCount === 0 && (
                        <div className="rounded-[16px] border border-dashed border-[#eadfce] bg-[#faf8f4]/80 px-4 py-8 text-center">
                          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#fce8ef]">
                            <Heart className="h-5 w-5 text-[#e87898]" />
                          </div>
                          <p className="text-[13px] font-medium text-[#374151]">No new activity yet</p>
                          <p className="mt-1 text-[11px] text-[#9ca3af]">When someone views or interests you, it will appear here.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="relative border-t border-[#f0ebe3]/80 bg-white/50 px-3 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-full rounded-[10px] bg-[#fce8ef]/60 text-[13px] font-medium text-[#e87898] hover:bg-[#fce8ef] hover:text-[#d66686]"
                    onClick={() => router.push("/dashboard/browse")}
                  >
                    See all activity
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => router.push("/dashboard/settings")}
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-gray-600 hover:text-[#1F4068] hover:bg-gray-50 rounded-xl"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleLogout}
              size="sm"
              className="h-9 bg-[#e87898] hover:bg-[#d66686] text-white text-[13px] font-medium px-5 rounded-[10px] shadow-none"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
        {scrollContainer && <DashboardScrollProgress scrollContainer={scrollContainer} />}
        {!scrollContainer && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[60] h-px bg-[#eadfce]"
          />
        )}
      </header>

      <main
        ref={setScrollContainer}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {user && children}
      </main>

      {!isLanding && (
      <footer className="mt-auto border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <span>© 2026 Manavizha. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="/privacy-policy" className="hover:text-[#3bb9ac] transition-colors">Privacy</a>
              <a href="/terms-of-service" className="hover:text-[#3bb9ac] transition-colors">Terms</a>
              <a href="/contact" className="hover:text-[#3bb9ac] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
