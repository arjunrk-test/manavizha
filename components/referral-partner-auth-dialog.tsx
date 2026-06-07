"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Eye, EyeOff, Handshake, IndianRupee, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

const REFERRAL_PARTNERS_TABLE = "referral_partners"

const authLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1.5 block"

const authInputClass =
  "h-11 rounded-xl border border-gray-200/90 bg-white px-4 text-sm text-[#1F4068] placeholder:text-gray-400 focus-visible:border-[#3bb9ac] focus-visible:ring-4 focus-visible:ring-[#3bb9ac]/10 shadow-sm w-full"

const authPrimaryButtonClass =
  "!bg-[#e87898] !text-white shadow-sm hover:!bg-[#d4567a] hover:!text-white"

interface ReferralPartnerAuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReferralPartnerAuthDialog({ open, onOpenChange }: ReferralPartnerAuthDialogProps) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setAuthMode("login")
      setError(null)
      setSuccessMessage(null)
    }
  }, [open])

  const passwordStrength = (() => {
    if (!password) return { label: "", value: 0, color: "bg-gray-200", isValid: false }
    const hasMinLength = password.length >= 11
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    const criteriaMet = [hasMinLength, hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length

    if (!hasMinLength || criteriaMet < 5) {
      return { label: "Does not meet requirements", value: 30, color: "bg-red-400", isValid: false }
    }

    if (password.length >= 14) {
      return { label: "Strong password", value: 100, color: "bg-[#3bb9ac]", isValid: true }
    }

    return { label: "Meets minimum requirements", value: 70, color: "bg-[#c9a227]", isValid: true }
  })()

  const passwordsMatch = authMode === "login" || !confirmPassword || password === confirmPassword

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (authMode === "signup") {
      if (!passwordsMatch || !passwordStrength.isValid) {
        setError("Please ensure your password meets all requirements and matches the confirmation.")
        return
      }
    }

    setIsLoading(true)

    try {
      if (authMode === "signup") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
          },
        })

        if (authError) throw authError

        if (authData.user) {
          try {
            const { data: insertData, error: insertError } = await supabase
              .from(REFERRAL_PARTNERS_TABLE)
              .upsert(
                {
                  user_id: authData.user.id,
                  email: authData.user.email,
                },
                {
                  onConflict: "user_id",
                }
              )
              .select()

            if (insertError) {
              const hasErrorDetails =
                insertError.message || insertError.code || insertError.details || insertError.hint
              const isDuplicateError =
                insertError.code === "23505" || insertError.message?.includes("duplicate")

              if (hasErrorDetails && !isDuplicateError) {
                console.error("Error adding referral partner to referral_partners table:", {
                  message: insertError.message,
                  code: insertError.code,
                  details: insertError.details,
                  hint: insertError.hint,
                })
              } else if (!hasErrorDetails) {
                console.warn("Warning: Empty error object returned from referral_partners table insert.")
              }
            } else if (insertData) {
              console.log("Referral partner added to referral_partners table:", insertData)
            }
          } catch (dbError: any) {
            console.error("Unexpected error during referral partner database operation:", dbError)
          }

          setAuthMode("login")
          setPassword("")
          setConfirmPassword("")
          setSuccessMessage("Account created successfully! Please sign in to continue.")
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (signInData.user) {
          const { data: partnerData, error: partnerError } = await supabase
            .from(REFERRAL_PARTNERS_TABLE)
            .select("user_id")
            .eq("user_id", signInData.user.id)
            .single()

          if (partnerError || !partnerData) {
            await supabase.auth.signOut()
            throw new Error("Access denied. This account is not registered as a referral partner.")
          }

          setSuccessMessage(null)
          onOpenChange(false)
          router.push("/referral-partner/dashboard")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setPassword("")
    setConfirmPassword("")
    setError(null)
    setSuccessMessage(null)
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
                Manavizha <span className="text-brand-gold">Partners</span>
              </span>
            </div>

            <div className="relative z-10 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                Partner program
              </p>
              <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#1F4068]">
                Grow with us and earn with every match.
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                Sign in to track referrals, view earnings, and manage your partner account from one
                dashboard.
              </p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <div className="rounded-xl border border-gray-100/90 bg-white/80 backdrop-blur-sm p-5 shadow-[0_8px_32px_rgba(31,64,104,0.06)] space-y-3">
                {[
                  { icon: Users, text: "Real-time referral tracking" },
                  { icon: IndianRupee, text: "Transparent commission earnings" },
                  { icon: Handshake, text: "Dedicated partner support" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-[#1F4068]">
                    <Icon className="h-4 w-4 shrink-0 text-[#3bb9ac]" strokeWidth={2} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-auto flex items-center gap-3 text-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#1F4068] shadow-sm">
                <Handshake className="h-5 w-5 text-[#3bb9ac]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-[#1F4068]">Trusted partner network</p>
                <p className="text-xs text-gray-500">Secure · Verified · Confidential</p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="bg-[#faf8f4] text-[#1F4068] p-6 sm:p-8 lg:p-9 space-y-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-1.5 text-left pr-8">
              <DialogTitle className="font-display text-2xl sm:text-[1.65rem] font-semibold text-[#1F4068] leading-tight">
                {authMode === "login" ? "Partner sign in" : "Become a partner"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {authMode === "login"
                  ? "Enter your credentials to open your partner dashboard."
                  : "Create an account to join the referral partner network."}
              </DialogDescription>
            </DialogHeader>

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
                onClick={() => switchMode("login")}
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
                onClick={() => switchMode("signup")}
              >
                Sign up
              </Button>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <span className="h-px flex-1 bg-gray-200/90" />
              {authMode === "login" ? "Credentials" : "Account details"}
              <span className="h-px flex-1 bg-gray-200/90" />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-[#3bb9ac]/30 bg-[#3bb9ac]/10 px-4 py-3 text-sm text-[#1F4068]">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuthSubmit} autoComplete="off">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className={authLabelClass}>
                  Email
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="partner@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  className={authInputClass}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="auth-password" className={authLabelClass}>
                    Password
                  </Label>
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

                {password && authMode === "signup" && (
                  <div className="space-y-2 rounded-xl border border-gray-200/90 bg-white p-4 text-sm shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Password strength</span>
                        <span className="font-medium text-[#1F4068]">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-200">
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
                      className={`${authInputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1F4068]"
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
                className={`flex w-full h-11 items-center justify-center rounded-xl text-sm font-semibold text-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${authPrimaryButtonClass}`}
                disabled={
                  isLoading ||
                  (authMode === "signup" && (!passwordsMatch || !passwordStrength.isValid))
                }
              >
                {isLoading ? (
                  <span className="flex w-full items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {authMode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : authMode === "login" ? (
                  "Sign in to partner dashboard"
                ) : (
                  "Create partner account"
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
