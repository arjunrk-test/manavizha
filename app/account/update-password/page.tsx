"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Supabase processes the recovery token from the URL hash and fires
    // onAuthStateChange with event "PASSWORD_RECOVERY" when valid
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setIsLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password updated successfully!")
      router.push("/dashboard")
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf8]">
        <div className="text-center space-y-3 max-w-sm px-4">
          <Lock className="h-8 w-8 text-[#e87898] mx-auto" />
          <h1 className="text-lg font-semibold text-[#1F4068]">Waiting for password reset link…</h1>
          <p className="text-sm text-gray-500">
            Please click the link in your email to activate this page. If you landed here by mistake,{" "}
            <button className="text-[#e87898] underline" onClick={() => router.push("/")}>go home</button>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf8]">
      <div className="w-full max-w-sm px-6 py-10 bg-white rounded-2xl shadow-md border border-[#eadfce] space-y-6">
        <div className="text-center space-y-1">
          <Lock className="h-8 w-8 text-[#e87898] mx-auto" />
          <h1 className="text-xl font-semibold text-[#1F4068]">Set a new password</h1>
          <p className="text-sm text-gray-500">Enter and confirm your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password" className="text-[13px] text-[#374151]">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-10 h-10 text-[13px] rounded-[8px] border-[#e5e7eb]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm" className="text-[13px] text-[#374151]">Confirm Password</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              className="h-10 text-[13px] rounded-[8px] border-[#e5e7eb]"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-[#e87898] hover:bg-[#d66686] text-white rounded-[10px] text-[13px] font-medium shadow-none"
          >
            {isLoading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
