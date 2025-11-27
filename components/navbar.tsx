"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoginOpen(false)
  }

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
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="h-5 w-5 text-[#1F4068] fill-[#1F4068]" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Manavizha
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Testimonials", "About", "Contact"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-gray-700 dark:text-gray-300 hover:text-[#1F4068] transition-colors font-medium relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1F4068] to-[#4B0082] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
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
              {["Features", "Testimonials", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 dark:text-gray-300 hover:text-[#1F4068] transition-colors font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
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

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === "login" ? "Login" : "Create an account"}</DialogTitle>
            <DialogDescription>
              {authMode === "login"
                ? "Sign in to access your account."
                : "Create a free account to get started."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-sm font-medium">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={`flex-1 rounded-full transition-all ${
                authMode === "login"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Login
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={`flex-1 rounded-full transition-all ${
                authMode === "signup"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" type="email" placeholder="you@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input id="auth-password" type="password" placeholder="••••••••" required />
            </div>
            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm">Confirm Password</Label>
                <Input id="auth-confirm" type="password" placeholder="Repeat password" required />
              </div>
            )}
            <Button
              type="submit"
              className="w-full rounded-full bg-red-500 hover:bg-white text-white hover:text-black border-0 shadow-sm hover:shadow-md transition-all"
            >
              {authMode === "login" ? "Continue" : "Create Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.nav>
  )
}
