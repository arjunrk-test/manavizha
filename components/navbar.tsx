"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import { useState, useEffect } from "react"
import { AuthDialog } from "@/components/auth-dialog"
import { supabase } from "@/lib/supabase"
import { getUserDashboard } from "@/lib/auth"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dashboardPath, setDashboardPath] = useState("/dashboard")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        const path = await getUserDashboard(authUser.id)
        setDashboardPath(path)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        const path = await getUserDashboard(authUser.id)
        setDashboardPath(path)
      } else {
        setDashboardPath("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/60 dark:border-gray-800/60"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <Image 
                src="/logo.png" 
                alt="Manavizha Logo" 
                width={48}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Manavizha
              </span>
            </motion.div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Testimonials", "Horoscope", "About", "Contact"].map((item, index) => (
              <motion.a
                key={item}
                href={item === "Horoscope" ? "/horoscope" : `#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-[#4B0082] transition-colors font-bold uppercase tracking-widest text-[10px] relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1F4068] to-[#4B0082] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center gap-3"
            >
              {user ? (
                <>
                  {dashboardPath === "/dashboard" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-indigo-500/20 bg-white/40 hover:bg-indigo-50 text-[#4B0082] font-bold text-[10px] uppercase tracking-widest px-6 h-9 backdrop-blur-sm"
                      onClick={() => window.location.href = `/dashboard/profile/${user.id}`}
                    >
                      Profile Preview
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="rounded-full bg-[#4B0082] hover:bg-[#1F4068] text-white shadow-lg hover:shadow-indigo-500/20 transition-all px-6 h-9 font-bold text-[10px] uppercase tracking-widest"
                    onClick={() => window.location.href = dashboardPath}
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full bg-[#4B0082] hover:bg-[#1F4068] text-white shadow-lg hover:shadow-indigo-500/20 transition-all px-8 h-9 font-bold text-[10px] uppercase tracking-widest"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Login
                </Button>
              )}
            </motion.div>
          </div>

          <button
            className="md:hidden p-2 text-[#4B0082]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-6 space-y-4 border-t border-gray-100 dark:border-gray-800 mt-2"
            >
              {["Features", "Testimonials", "Horoscope", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={item === "Horoscope" ? "/horoscope" : `#${item.toLowerCase()}`}
                  className="block text-[#4B0082] font-bold text-[10px] uppercase tracking-widest py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    {dashboardPath === "/dashboard" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-full border-indigo-500/20 text-[#4B0082] font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => {
                          window.location.href = `/dashboard/profile/${user.id}`
                          setIsOpen(false)
                        }}
                      >
                        Profile Preview
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-[#4B0082] text-white font-bold text-[10px] uppercase tracking-widest"
                      onClick={() => {
                        window.location.href = dashboardPath
                        setIsOpen(false)
                      }}
                    >
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-[#4B0082] text-white font-bold text-[10px] uppercase tracking-widest"
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsOpen(false)
                    }}
                  >
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </motion.nav>
  )
}
