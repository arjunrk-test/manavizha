"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X, LogOut, UserRound } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import { supabase } from "@/lib/supabase"
import { getUserDashboard } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollProgress } from "@/components/ui/scroll-progress"

const landingNavLinks = [
  { label: "Features", href: "#features" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Verification", href: "/admin/verification" },
]

const dashboardNavLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Profiles", href: "/admin/dashboard/profiles" },
  { label: "Accounts", href: "/admin/dashboard/accounts" },
  { label: "Verification", href: "/admin/verification" },
]

const logoutButtonClass =
  "!bg-red-500 hover:!bg-red-600 !text-white border border-red-500 hover:!text-white shadow-sm rounded-xl"

interface AdminNavbarProps {
  variant?: "landing" | "dashboard"
}

export function AdminNavbar({ variant = "landing" }: AdminNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = variant === "dashboard"
  const navLinks = isDashboard ? dashboardNavLinks : landingNavLinks
  const showBackToDashboard =
    isDashboard && pathname.startsWith("/admin/dashboard/") && pathname !== "/admin/dashboard"
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const syncAuth = async (userId: string | undefined, email?: string | null) => {
      if (!userId) {
        setIsAdmin(false)
        setAdminEmail(null)
        return
      }
      const path = await getUserDashboard(userId)
      const isAdminUser = path === "/admin/dashboard"
      setIsAdmin(isAdminUser)
      setAdminEmail(isAdminUser ? email ?? null : null)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncAuth(session?.user?.id, session?.user?.email)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuth(session?.user?.id, session?.user?.email)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      setIsLoggingOut(false)
      return
    }
    setIsOpen(false)
    router.push("/admin")
    setIsLoggingOut(false)
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDashboard
          ? "bg-white/98 backdrop-blur-md shadow-[0_4px_28px_rgba(31,64,104,0.09)] border-b border-gray-100/90"
          : scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-[#faf8f4]/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2">
          <Link href={isDashboard ? "/admin/dashboard" : "/admin"} className="flex items-center gap-2.5 shrink-0 min-w-0">
            <Image
              src="/logo.png"
              alt="Manavizha"
              width={40}
              height={40}
              className="h-9 w-auto object-contain shrink-0"
              priority
            />
            <div className="min-w-0">
              <span className="block text-xl font-bold tracking-tight text-[#1F4068] leading-tight">
                Manavizha <span className="text-brand-gold font-semibold">Admin</span>
              </span>
              {isAdmin && adminEmail && (
                <p className="text-xs text-gray-500 truncate max-w-[160px] sm:max-w-[220px]" title={adminEmail}>
                  {adminEmail}
                </p>
              )}
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = isDashboard && pathname === item.href
              const className = `text-sm font-medium transition-colors ${
                isActive
                  ? "text-[#1F4068] font-semibold"
                  : "text-gray-600 hover:text-[#1F4068]"
              }`

              return isDashboard ? (
                <Link key={item.label} href={item.href} className={className}>
                  {item.label}
                  {isActive && (
                    <span className="block h-0.5 mt-1 rounded-full bg-gradient-to-r from-[#c9a227] to-[#e87898]" />
                  )}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className={className}>
                  {item.label}
                </a>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {showBackToDashboard && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-[#f0ebe3] bg-white/80 text-[#1F4068] hover:bg-[#faf8f4] hover:text-[#1F4068]"
              >
                <Link href="/admin/dashboard" className="flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Back to dashboard</span>
                </Link>
              </Button>
            )}
            {isAdmin ? (
              <Button
                size="sm"
                className={`${logoutButtonClass} h-9 min-w-[7.5rem] px-5`}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                className="nav-login-btn rounded-xl btn-brand-gradient-outline h-9 min-w-[7.5rem] px-5"
                onClick={() => setIsLoginOpen(true)}
              >
                <UserRound className="h-4 w-4 shrink-0" aria-hidden />
                <span className="nav-login-btn__label">Login</span>
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-[#1F4068]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-100"
            >
              {showBackToDashboard && (
                <Link
                  href="/admin/dashboard"
                  className="mb-3 flex items-center gap-2 rounded-lg border border-[#f0ebe3] bg-[#faf8f4]/80 px-3 py-2.5 text-sm font-medium text-[#1F4068]"
                  onClick={() => setIsOpen(false)}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  Back to dashboard
                </Link>
              )}
              {navLinks.map((item) => {
                const isActive = isDashboard && pathname === item.href
                const className = `block py-2.5 text-sm font-medium ${
                  isActive ? "text-[#1F4068] font-semibold" : "text-gray-700"
                }`

                return isDashboard ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={className}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className={className}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              })}
              <div className="pt-4 flex flex-col gap-2">
                {isAdmin ? (
                  <Button
                    className={`${logoutButtonClass} w-full`}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
                  </Button>
                ) : (
                  <Button
                    className="nav-login-btn rounded-xl w-full btn-brand-gradient-outline"
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsOpen(false)
                    }}
                  >
                    <UserRound className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="nav-login-btn__label">Login</span>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[60] h-[2px] bg-[#f0ebe3]/90"
      >
        <ScrollProgress className="h-full w-full" />
      </div>

      <AdminAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </motion.nav>
  )
}
