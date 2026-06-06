"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

const ADMINS_TABLE = "admins"

const authLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1.5 block"

const authInputClass =
  "h-11 rounded-xl border border-gray-200/90 bg-white px-4 text-sm text-[#1F4068] placeholder:text-gray-400 focus-visible:border-[#3bb9ac] focus-visible:ring-4 focus-visible:ring-[#3bb9ac]/10 shadow-sm w-full"

const authPrimaryButtonClass =
  "!bg-[#e87898] !text-white shadow-sm hover:!bg-[#d4567a] hover:!text-white"

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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (signInData.user) {
        const { data: adminData, error: adminError } = await supabase
          .from(ADMINS_TABLE)
          .select("user_id")
          .eq("user_id", signInData.user.id)
          .single()

        if (adminError || !adminData) {
          await supabase.auth.signOut()
          throw new Error("Access denied. This account is not registered as an admin.")
        }

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
      <DialogContent className="auth-dialog-content w-[95vw] max-w-5xl border-0 bg-transparent p-0 sm:p-0 overflow-hidden [&>button]:right-4 [&>button]:top-4 sm:[&>button]:right-5 sm:[&>button]:top-5 [&>button]:rounded-full [&>button]:h-9 [&>button]:w-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:bg-white [&>button]:shadow-[0_4px_20px_rgba(31,64,104,0.12)] [&>button]:text-[#1F4068] [&>button]:opacity-100 [&>button]:hover:bg-[#faf8f4] [&>button]:z-20 [&>button]:border [&>button]:border-gray-100/90">
        <div className="grid lg:grid-cols-[1.05fr,1fr] overflow-hidden rounded-2xl border border-gray-100/90 shadow-[0_24px_64px_rgba(31,64,104,0.14)]">
          {/* Brand panel */}
          <div className="relative hidden lg:flex flex-col gap-6 p-8 sm:p-10 overflow-hidden min-h-[32rem]">
            <div className="absolute inset-0 cta-petal-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_50%)]" />

            <div className="relative z-10 flex items-center gap-2.5">
              <Image src="/logo.png" alt="Manavizha" width={36} height={36} className="h-9 w-auto" />
              <span className="text-lg font-bold tracking-tight text-[#1F4068]">
                Manavizha <span className="text-brand-gold">Admin</span>
              </span>
            </div>

            <div className="relative z-10 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                Admin portal
              </p>
              <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#1F4068]">
                Secure access to manage your platform.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                Sign in to review profiles, manage users, and configure system settings — authorized
                personnel only.
              </p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="rounded-xl border border-gray-100/90 bg-white/80 backdrop-blur-sm p-5 shadow-[0_8px_32px_rgba(31,64,104,0.06)] space-y-3">
                {[
                  "User & profile management",
                  "Verification queue review",
                  "Analytics & system settings",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-[#1F4068]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#3bb9ac]" strokeWidth={2} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-auto flex items-center gap-3 text-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#1F4068] shadow-sm">
                <ShieldCheck className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-[#1F4068]">Authorized access only</p>
                <p className="text-xs text-gray-500">Secure · Role-based · Protected</p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="bg-[#faf8f4] text-[#1F4068] p-6 sm:p-8 lg:p-9 space-y-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-1.5 text-left pr-8">
              <DialogTitle className="font-display text-2xl sm:text-[1.65rem] font-semibold text-[#1F4068] leading-tight">
                Admin sign in
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Enter your admin credentials to open the dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <span className="h-px flex-1 bg-gray-200/90" />
              Credentials
              <span className="h-px flex-1 bg-gray-200/90" />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuthSubmit} autoComplete="off">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className={authLabelClass}>
                  Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@manavizha.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  className={authInputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className={authLabelClass}>
                  Password
                </Label>
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
                    className={`${authInputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1F4068]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className={`flex w-full h-11 items-center justify-center rounded-xl text-sm font-semibold text-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${authPrimaryButtonClass}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex w-full items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in to admin panel"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to our{" "}
              <a
                href="/terms-of-service"
                className="font-medium text-[#1F4068] underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                className="font-medium text-[#1F4068] underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
