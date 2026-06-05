"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, ShieldCheck, UserRound } from "lucide-react"
import { useState, useEffect } from "react"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import Image from "next/image"
import Link from "next/link"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Verification", href: "/admin/verification" },
]

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-[#faf8f4]/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/logo.png"
              alt="Manavizha"
              width={40}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-[#1F4068]">
              Manavizha <span className="text-brand-gold font-semibold">Admin</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-[#1F4068] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-gray-200 text-[#1F4068] h-9 px-4 text-sm font-medium"
              asChild
            >
              <Link href="/">Main site</Link>
            </Button>
            <Button
              size="sm"
              className="nav-login-btn rounded-xl btn-brand-gradient-outline h-9 min-w-[7.5rem] px-5"
              onClick={() => setIsLoginOpen(true)}
            >
              <UserRound className="h-4 w-4 shrink-0" aria-hidden />
              <span className="nav-login-btn__label">Login</span>
            </Button>
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
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-2.5 text-sm font-medium text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl w-full border-gray-200 text-[#1F4068]"
                  asChild
                >
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    Main site
                  </Link>
                </Button>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </motion.nav>
  )
}
