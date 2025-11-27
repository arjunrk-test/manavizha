"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Menu, X, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = (() => {
    if (!password) return { label: "", value: 0, color: "bg-gray-200", isValid: false }

    const hasMinLength = password.length >= 11
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    const criteriaMet = [hasMinLength, hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length

    if (!hasMinLength || criteriaMet < 5) {
      return { label: "Does not meet requirements", value: 30, color: "bg-red-500", isValid: false }
    }

    if (password.length >= 14) {
      return { label: "Strong password", value: 100, color: "bg-green-500", isValid: true }
    }

    return { label: "Meets minimum requirements", value: 70, color: "bg-yellow-500", isValid: true }
  })()

  const passwordsMatch = authMode === "login" || !confirmPassword || password === confirmPassword

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (authMode === "signup" && !passwordsMatch) {
      return
    }
    setIsLoginOpen(false)
    setPassword("")
    setConfirmPassword("")
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
        <DialogContent className="w-[95vw] max-w-5xl border-0 bg-transparent p-0 sm:p-0">
          <div className="grid lg:grid-cols-[1.1fr,1fr] overflow-hidden rounded-2xl bg-[#080b16] text-white">
            <div className="relative flex flex-col gap-6 p-8 sm:p-10 overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
              
              {/* Overlay pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
              
              {/* Modern grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
              
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
                />
              </div>
              
              <div className="relative z-10 space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/90">Welcome back</p>
                <h3 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                  Find your perfect match with confidence.
                </h3>
                <p className="text-sm text-white/90">
                  Sign in to access personalized recommendations, connect with verified members, and
                  continue meaningful conversations.
                </p>
              </div>
              <div className="relative z-10 mt-auto flex items-center gap-4 text-sm text-white/90">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold backdrop-blur-sm">
                  M
                </div>
                <div>
                  <p className="font-medium text-white">Trusted by 10,000+ families</p>
                  <p className="text-xs text-white/70">Secure. Verified. Confidential.</p>
                </div>
              </div>
            </div>

            <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-200 p-6 sm:p-8 space-y-6">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {authMode === "login" ? "Welcome back" : "Create an account"}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  {authMode === "login"
                    ? "Sign in to continue building your story."
                    : "Join the community and start connecting with verified members."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-2 rounded-full bg-gray-100 dark:bg-gray-900/60 p-1 text-sm font-medium">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`flex-1 rounded-full transition-all ${
                    authMode === "login"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                onClick={() => {
                  setAuthMode("login")
                  setPassword("")
                  setConfirmPassword("")
                }}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`flex-1 rounded-full transition-all ${
                    authMode === "signup"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                onClick={() => {
                  setAuthMode("signup")
                  setPassword("")
                  setConfirmPassword("")
                }}
                >
                  Sign Up
                </Button>
              </div>

              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                Enter your details below
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              </div>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    className="rounded-2xl border-gray-200 bg-gray-50 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="auth-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-2xl border-gray-200 bg-gray-50 pr-12 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {password && (
                    <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Password strength</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${passwordStrength.value}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {password.length >= 11 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          Minimum 11 characters
                        </div>
                        <div className="flex items-center gap-2">
                          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          Lowercase & uppercase letters
                        </div>
                        <div className="flex items-center gap-2">
                          {/\d/.test(password) ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          At least one number
                        </div>
                        <div className="flex items-center gap-2">
                          {/[^A-Za-z0-9]/.test(password) ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          At least one symbol
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="auth-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-2xl border-gray-200 bg-gray-50 pr-12 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-2 text-sm">
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-full bg-gray-900 text-white hover:bg-white hover:text-gray-900 border-0 shadow-sm hover:shadow-md transition-all"
                  disabled={
                    authMode === "signup" && (!passwordsMatch || !passwordStrength.isValid)
                  }
                >
                  {authMode === "login" ? "Continue" : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <a href="#" className="font-medium text-gray-900 dark:text-white underline-offset-4 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-gray-900 dark:text-white underline-offset-4 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.nav>
  )
}
