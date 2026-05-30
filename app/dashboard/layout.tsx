"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserDashboard } from "@/lib/auth"
import { LogOut, ArrowLeft, Edit, Settings, MessageSquare, User, Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DashboardScrollProgress } from "@/components/dashboard/dashboard-scroll-progress"
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#3bb9ac] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
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
              <PopoverContent align="end" className="w-[320px] rounded-2xl p-4 bg-white shadow-[0_8px_32px_rgba(31,64,104,0.12)] border border-gray-100 z-[60]">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1F4068]">Notifications</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Activity from the last 30 days</p>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {whoExpressedInterest.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-1 text-xs font-semibold text-[#e87898]">Interest received</div>
                        {whoExpressedInterest.slice(0, 5).map(p => (
                          <div
                            key={p.user_id}
                            className="p-2.5 rounded-xl hover:bg-[#faf8f4] transition-colors flex items-center gap-3 cursor-pointer"
                            onClick={() => handleNotificationClick('interest', p.user_id)}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              <img src={p.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">{p.name || 'Member'} expressed interest</p>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{formatDistanceToNow(new Date(p.interaction_at), { addSuffix: true })}</span>
                              </div>
                              <p className="text-xs text-gray-500">{p.age} yrs · {p.profession?.split(' at ')[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {whoViewedMe.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-1 text-xs font-semibold text-[#3bb9ac]">Profile visitors</div>
                        {whoViewedMe.slice(0, 5).map(p => (
                          <div
                            key={p.user_id}
                            className="p-2.5 rounded-xl hover:bg-[#faf8f4] transition-colors flex items-center gap-3 cursor-pointer"
                            onClick={() => handleNotificationClick('view', p.user_id)}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              <img src={p.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">{p.name || 'Member'} viewed you</p>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{formatDistanceToNow(new Date(p.interaction_at), { addSuffix: true })}</span>
                              </div>
                              <p className="text-xs text-gray-500">{p.age} yrs · {p.address?.split(',')[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {notificationCount === 0 && (
                      <div className="py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No new activity</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-xl text-sm font-medium text-[#3bb9ac] hover:bg-[#3bb9ac]/5"
                    onClick={() => router.push("/dashboard/browse")}
                  >
                    See all activity
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
