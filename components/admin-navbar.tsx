"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import Image from "next/image"

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

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
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/60 dark:border-gray-800/60"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
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
              <span className="text-xl font-bold bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Manavizha Admin
              </span>
            </motion.div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Button
                size="sm"
                className="rounded-full bg-red-500 hover:bg-white text-white hover:text-black border-0 shadow-sm hover:shadow-md transition-all px-6 py-2"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
            </motion.div>
          </div>

          <button
            className="md:hidden p-2"
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
              className="md:hidden py-4 space-y-4 border-t border-gray-200 dark:border-gray-800 mt-4"
            >
              <div className="pt-2">
                <Button
                  size="sm"
                  className="w-full rounded-full bg-red-500 hover:bg-white text-white hover:text-black border-0 shadow-sm hover:shadow-md transition-all py-2"
                  onClick={() => {
                    setIsLoginOpen(true)
                    setIsOpen(false)
                  }}
                >
                  Login
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

