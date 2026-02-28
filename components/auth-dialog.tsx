"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const coupleStories = [
  {
    name: "Arjun & Priya",
    location: "Chennai • Married 2024",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Rahul & Meera",
    location: "Coimbatore • Married 2023",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Vikram & Aditi",
    location: "Hyderabad • Married 2022",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Naveen & Kavya",
    location: "Bengaluru • Married 2024",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
]

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+1", flag: "🇺🇸", country: "USA" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", country: "Qatar" },
  { code: "+968", flag: "🇴🇲", country: "Oman" },
  { code: "+973", flag: "🇧🇭", country: "Bahrain" },
  { code: "+64", flag: "🇳🇿", country: "New Zealand" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
]

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Clear all fields when dialog closes
  useEffect(() => {
    if (!open) {
      setEmail("")
      setName("")
      setPhone("")
      setCountryCode("+91")
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
      return { label: "Does not meet requirements", value: 30, color: "bg-red-500", isValid: false }
    }

    if (password.length >= 14) {
      return { label: "Strong password", value: 100, color: "bg-green-500", isValid: true }
    }

    return { label: "Meets minimum requirements", value: 70, color: "bg-yellow-500", isValid: true }
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
        // Sign up the user (email confirmation disabled in Supabase settings)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined, // No email confirmation needed
          },
        })

        if (authError) throw authError

        if (authData.user) {
          // Add user to users table using upsert to handle duplicates gracefully
          const { data: insertData, error: insertError } = await supabase
            .from("users")
            .upsert(
              {
                id: authData.user.id,
                email: authData.user.email,
                name: name.trim() || null,
                phone: phone.trim() ? `${countryCode} ${phone.trim()}` : null,
              },
              {
                onConflict: "id",
              }
            )
            .select()

          if (insertError) {
            // Only log meaningful errors (not empty objects or duplicate key errors)
            const hasErrorDetails = insertError.message || insertError.code || insertError.details || insertError.hint
            const isDuplicateError = insertError.code === "23505" || insertError.message?.includes("duplicate")

            if (hasErrorDetails && !isDuplicateError) {
              console.error("Error adding user to users table:", {
                message: insertError.message,
                code: insertError.code,
                details: insertError.details,
                hint: insertError.hint,
              })
            }
            // Don't throw here, as auth was successful
          } else if (insertData) {
            // Successfully added/updated user in users table
            console.log("User added to users table:", insertData)
          }

          // Switch to login mode with prefilled email
          setAuthMode("login")
          setName("")
          setPhone("")
          setCountryCode("+91")
          setPassword("")
          setConfirmPassword("")
          setSuccessMessage("Account created successfully! Please sign in to continue.")
          // Email is already set, so it will remain prefilled
        }
      } else {
        // Login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (signInData.user) {
          // Check if user is a referral partner - if so, deny access
          const { data: partnerData, error: partnerError } = await supabase
            .from("referral_partners")
            .select("user_id")
            .eq("user_id", signInData.user.id)
            .single()

          if (!partnerError && partnerData) {
            // User is a referral partner, sign them out and deny access
            await supabase.auth.signOut()
            throw new Error("Access denied. This account is registered as a referral partner. Please use the referral partner login.")
          }
        }

        // Clear success message, close dialog, and navigate to dashboard
        setSuccessMessage(null)
        onOpenChange(false)
        router.push("/dashboard")
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
              <p className="text-xs uppercase tracking-[0.4em] text-white/90">Welcome back</p>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Find your perfect match with confidence.
              </h3>
              <p className="text-sm text-white/90">
                Sign in to access personalized recommendations, connect with verified members, and
                continue meaningful conversations.
              </p>
            </div>

            <div className="relative z-10 mt-2 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">Success stories</p>
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="flex gap-4 p-4 animate-scroll-couples">
                  {[...coupleStories, ...coupleStories, ...coupleStories].map((couple, index) => (
                    <div
                      key={`${couple.name}-${index}`}
                      className="relative min-w-[280px] h-[200px] overflow-hidden rounded-xl flex-shrink-0"
                    >
                      <img
                        src={couple.image}
                        alt={couple.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="font-semibold text-lg mb-1">{couple.name}</p>
                        <p className="text-xs text-white/90">{couple.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                className={`flex-1 rounded-full transition-all ${authMode === "login"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                  : "text-gray-500 dark:text-gray-300"
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
                className={`flex-1 rounded-full transition-all ${authMode === "signup"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                  : "text-gray-500 dark:text-gray-300"
                  }`}
                onClick={() => {
                  setAuthMode("signup")
                  setName("")
                  setPhone("")
                  setCountryCode("+91")
                  setPassword("")
                  setConfirmPassword("")
                  setError(null)
                  setSuccessMessage(null)
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

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuthSubmit} autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
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
                  className="rounded-2xl border-gray-200 bg-gray-50 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                />
              </div>

              {authMode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="auth-name">Full Name</Label>
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
                      className="rounded-2xl border-gray-200 bg-gray-50 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="shrink-0 w-28 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
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
                        className="flex-1 rounded-2xl border-gray-200 bg-gray-50 focus-visible:ring-gray-900 dark:bg-gray-900 dark:border-gray-800"
                      />
                    </div>
                  </div>
                </>
              )}

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

                {password && authMode === "signup" && (
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
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
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
                className="w-full rounded-full bg-gray-900 text-white hover:bg-white hover:text-gray-900 border-0 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoading ||
                  (authMode === "signup" && (!passwordsMatch || !passwordStrength.isValid))
                }
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {authMode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  authMode === "login" ? "Continue" : "Create Account"
                )}
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
  )
}

