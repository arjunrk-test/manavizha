"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// Table name for admins - update this if your table has a different name
const ADMINS_TABLE = "admins"

interface AdminAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminAuthDialog({ open, onOpenChange }: AdminAuthDialogProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear all fields when dialog closes
  useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setShowPassword(false)
      setError(null)
    }
  }, [open])

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    setIsLoading(true)

    try {
      // Login - verify user is an admin
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (signInData.user) {
        // Check if user exists in admins table
        const { data: adminData, error: adminError } = await supabase
          .from(ADMINS_TABLE)
          .select("user_id")
          .eq("user_id", signInData.user.id)
          .single()

        if (adminError || !adminData) {
          // User is not an admin, sign them out
          await supabase.auth.signOut()
          throw new Error("Access denied. This account is not registered as an admin.")
        }

        // Clear error, close dialog, and navigate to admin dashboard
        setError(null)
        onOpenChange(false)
        router.push("/admin/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <p className="text-xs uppercase tracking-[0.4em] text-white/90">Admin Access</p>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Secure admin access to manage your platform.
              </h3>
              <p className="text-sm text-white/90">
                Sign in to access the admin dashboard, manage users, data, and system settings.
              </p>
            </div>

            <div className="relative z-10 mt-auto flex items-center gap-4 text-sm text-white/90">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold backdrop-blur-sm">
                A
              </div>
              <div>
                <p className="font-medium text-white">Admin Panel</p>
                <p className="text-xs text-white/70">Secure. Authorized. Protected.</p>
              </div>
            </div>
          </div>

          <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-200 p-6 sm:p-8 space-y-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Admin Login
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Sign in to access the admin dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              Enter your credentials
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuthSubmit} autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  className="rounded-2xl border-gray-200 bg-gray-50 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    data-1p-ignore
                    data-lpignore="true"
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
              <Button
                type="submit"
                className="w-full rounded-full bg-gray-900 text-white hover:bg-white hover:text-gray-900 border-0 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="/terms-of-service" className="font-medium text-gray-900 dark:text-white underline-offset-4 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy-policy" className="font-medium text-gray-900 dark:text-white underline-offset-4 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

