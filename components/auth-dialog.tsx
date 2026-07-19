"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserDashboard } from "@/lib/auth"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "login" | "signup"
}

type AuthMode = "login" | "signup" | "reset"

const coupleStories = [
  {
    name: "Arjun & Priya",
    location: "Chennai • Married 2024",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Karthik & Divya",
    location: "Coimbatore • Married 2023",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Senthil & Kavitha",
    location: "Madurai • Married 2022",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Murugan & Meenakshi",
    location: "Trichy • Married 2024",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
]

import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@/lib/country-codes"

const authLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1.5 block"

const authInputClass =
  "h-11 rounded-xl border border-gray-200/90 bg-white px-4 text-sm text-[#1F4068] placeholder:text-gray-400 focus-visible:border-[#3bb9ac] focus-visible:ring-4 focus-visible:ring-[#3bb9ac]/10 shadow-sm w-full"

const authPrimaryButtonClass =
  "!bg-[#e87898] !text-white shadow-sm hover:!bg-[#d4567a] hover:!text-white"

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }: AuthDialogProps) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Clear all fields when dialog closes; apply mode when opening
  useEffect(() => {
    if (!open) {
      setEmail("")
      setName("")
      setPhone("")
      setCountryCode(DEFAULT_COUNTRY_CODE)
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setAuthMode("login")
      setError(null)
      setSuccessMessage(null)
    } else {
      setAuthMode(defaultMode)
    }
  }, [open, defaultMode])

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

  // Ensures a row exists in the users table without overwriting existing data
  // (name/phone come from signup metadata). Safe to call on every login.
  const ensureUserRow = async (user: { id: string; email?: string | null; user_metadata?: any }) => {
    try {
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name ?? null,
          phone: user.user_metadata?.phone ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
    } catch {
      // Non-fatal — the row may already exist or be created elsewhere
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Forgot-password: email-only, sends a reset link
    if (authMode === "reset") {
      setIsLoading(true)
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account/update-password`,
        })
        if (resetError) throw resetError
        setSuccessMessage(
          "If an account exists for this email, a password reset link is on its way. Please check your inbox."
        )
      } catch (err: any) {
        setError(err.message || "Could not send the reset email. Please try again.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (authMode === "signup") {
      if (!passwordsMatch || !passwordStrength.isValid) {
        setError("Please ensure your password meets all requirements and matches the confirmation.")
        return
      }
    }

    setIsLoading(true)

    try {
      if (authMode === "signup") {
        const phoneFull = phone.trim() ? `${countryCode} ${phone.trim()}` : null
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Where the confirmation link lands (when email confirmation is on)
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { name: name.trim() || null, phone: phoneFull },
          },
        })

        if (authError) throw authError

        if (authData.session && authData.user) {
          // Email confirmation is OFF in Supabase — the user is signed in now
          await ensureUserRow(authData.user)
          setSuccessMessage(null)
          onOpenChange(false)
          router.push(await getUserDashboard(authData.user.id))
          return
        }

        // Email confirmation is ON — the user must verify before signing in
        setAuthMode("login")
        setName("")
        setPhone("")
        setCountryCode(DEFAULT_COUNTRY_CODE)
        setPassword("")
        setConfirmPassword("")
        setSuccessMessage(
          `We've sent a verification link to ${email}. Please confirm your email, then sign in.`
        )
      } else {
        // Login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (signInData.user) {
          // Block unverified accounts from proceeding (only relevant when
          // confirmation is enabled; auto-confirmed users always pass)
          if (!signInData.user.email_confirmed_at) {
            await supabase.auth.signOut()
            setError("Please verify your email address first. Check your inbox for the confirmation link.")
            return
          }

          await ensureUserRow(signInData.user)
          const dashboardPath = await getUserDashboard(signInData.user.id)
          setSuccessMessage(null)
          onOpenChange(false)
          router.push(dashboardPath)
          return
        }
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
          {/* Story panel */}
          <div className="relative hidden lg:flex flex-col gap-6 p-8 sm:p-10 overflow-hidden min-h-[32rem]">
            <div className="absolute inset-0 cta-petal-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_50%)]" />

            <div className="relative z-10 space-y-3 text-black">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/65">
                {authMode === "login" ? "Welcome back" : "Join Manavizha"}
              </p>
              <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight">
                Find your perfect match with confidence.
              </h3>
              <p className="text-sm text-black/75 leading-relaxed max-w-md">
                {authMode === "login"
                  ? "Sign in to access personalized recommendations and connect with verified members."
                  : "Create your profile and start your journey with families who share your values."}
              </p>
            </div>

            <div className="relative z-10 mt-1 space-y-3 flex-1 flex flex-col min-h-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/60">
                Success stories
              </p>
              <div className="overflow-hidden rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-[0_8px_32px_rgba(31,64,104,0.08)]">
                <div className="flex gap-4 p-4 animate-scroll-couples">
                  {[...coupleStories, ...coupleStories, ...coupleStories].map((couple, index) => (
                    <div
                      key={`${couple.name}-${index}`}
                      className="relative min-w-[240px] h-[180px] overflow-hidden rounded-lg flex-shrink-0"
                    >
                      <img
                        src={couple.image}
                        alt={couple.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="font-semibold text-base mb-0.5">{couple.name}</p>
                        <p className="text-xs text-white/85">{couple.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto flex items-center gap-3 text-sm text-black/80">
              <div className="h-11 w-11 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-base font-bold text-[#1F4068] shadow-sm">
                M
              </div>
              <div>
                <p className="font-semibold text-[#1F4068]">Trusted by 10,000+ families</p>
                <p className="text-xs text-black/60">Secure · Verified · Confidential</p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="bg-[#faf8f4] text-[#1F4068] p-6 sm:p-8 lg:p-9 space-y-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-1.5 text-left pr-8">
              <DialogTitle className="font-display text-2xl sm:text-[1.65rem] font-semibold text-[#1F4068] leading-tight">
                {authMode === "login" ? "Sign in" : authMode === "reset" ? "Reset password" : "Create your profile"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {authMode === "login"
                  ? "Welcome back — continue building your story."
                  : authMode === "reset"
                    ? "Enter your email and we'll send you a link to reset your password."
                    : "Join the community and connect with verified members."}
              </DialogDescription>
            </DialogHeader>

            {authMode !== "reset" && (
              <div className="flex gap-1.5 rounded-xl bg-white border border-gray-100/90 p-1 shadow-sm">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`flex-1 rounded-lg h-10 text-sm font-semibold transition-all ${
                    authMode === "login"
                      ? authPrimaryButtonClass
                      : "text-gray-600 hover:text-[#1F4068] hover:bg-[#faf8f4]"
                  }`}
                  onClick={() => {
                    setAuthMode("login")
                    setPassword("")
                    setConfirmPassword("")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={`flex-1 rounded-lg h-10 text-sm font-semibold transition-all ${
                    authMode === "signup"
                      ? authPrimaryButtonClass
                      : "text-gray-600 hover:text-[#1F4068] hover:bg-[#faf8f4]"
                  }`}
                  onClick={() => {
                    setAuthMode("signup")
                    setName("")
                    setPhone("")
                    setCountryCode(DEFAULT_COUNTRY_CODE)
                    setPassword("")
                    setConfirmPassword("")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-[#3bb9ac]/25 bg-[#3bb9ac]/10 px-4 py-3 text-sm text-[#1F4068]">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuthSubmit} autoComplete="off">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className={authLabelClass}>
                  Email address
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  className={authInputClass}
                />
              </div>

              {authMode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-name" className={authLabelClass}>
                      Full name
                    </Label>
                    <Input
                      id="auth-name"
                      type="text"
                      placeholder="Your full name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      className={authInputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-phone" className={authLabelClass}>
                      Phone number
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="shrink-0 w-[5.5rem] h-11 rounded-xl border border-gray-200/90 bg-white px-2 text-xs font-medium text-[#1F4068] shadow-sm focus:outline-none focus:border-[#3bb9ac] focus:ring-4 focus:ring-[#3bb9ac]/10"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="auth-phone"
                        type="tel"
                        placeholder="98765 43210"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        className={`${authInputClass} flex-1`}
                      />
                    </div>
                  </div>
                </>
              )}

              {authMode !== "reset" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-password" className={authLabelClass}>
                      Password
                    </Label>
                    {authMode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("reset")
                          setPassword("")
                          setConfirmPassword("")
                          setError(null)
                          setSuccessMessage(null)
                        }}
                        className="mb-1.5 text-[11px] font-medium text-[#e87898] hover:underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      className={`${authInputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#1F4068]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {password && authMode === "signup" && (
                  <div className="space-y-2 rounded-xl border border-gray-100/90 bg-white p-4 text-sm shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Password strength</span>
                        <span className="font-medium text-[#1F4068]">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${passwordStrength.value}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {password.length >= 11 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3bb9ac]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        Minimum 11 characters
                      </div>
                      <div className="flex items-center gap-2">
                        {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3bb9ac]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        Lowercase & uppercase letters
                      </div>
                      <div className="flex items-center gap-2">
                        {/\d/.test(password) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3bb9ac]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        At least one number
                      </div>
                      <div className="flex items-center gap-2">
                        {/[^A-Za-z0-9]/.test(password) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3bb9ac]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        At least one symbol
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {authMode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-confirm" className={authLabelClass}>
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="auth-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      className={`${authInputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#1F4068]"
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
                          <CheckCircle2 className="h-4 w-4 text-[#3bb9ac]" />
                          <span className="text-[#1F4068]">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-400" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-11 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${authPrimaryButtonClass}`}
                disabled={
                  isLoading ||
                  (authMode === "signup" && (!passwordsMatch || !passwordStrength.isValid))
                }
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {authMode === "login" ? "Signing in..." : authMode === "reset" ? "Sending link..." : "Creating account..."}
                  </span>
                ) : authMode === "login" ? (
                  "Continue"
                ) : authMode === "reset" ? (
                  "Send reset link"
                ) : (
                  "Create account"
                )}
              </Button>

              {authMode === "reset" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="w-full text-center text-xs font-medium text-[#1F4068] hover:underline underline-offset-2"
                >
                  ← Back to sign in
                </button>
              )}
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

