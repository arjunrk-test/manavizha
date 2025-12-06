"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export default function ReferralPartnerSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [generatedId, setGeneratedId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [partnerData, setPartnerData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and is a referral partner
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/referral-partner")
        return
      }

      // Verify user is a referral partner and load their data
      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (partnerError || !partnerData) {
        // User is not a referral partner, redirect to home
        await supabase.auth.signOut()
        router.push("/referral-partner")
        return
      }

      // Merge user data with partner data (including partner_id)
      setUser({
        ...user,
        partner_id: partnerData.partner_id
      })
      setPartnerData(partnerData)
      // Load existing partner_id if it exists
      if (partnerData.partner_id) {
        setGeneratedId(partnerData.partner_id)
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const generatePartnerId = async () => {
    setError("")
    setSuccess("")
    setIsGenerating(true)
    
    // Check if all required fields are present
    if (!partnerData || !user) {
      setError("Partner data not loaded. Please refresh the page.")
      setIsGenerating(false)
      return
    }

    const name = partnerData.name?.trim()
    const phone = partnerData.phone?.trim() || ""
    const pincode = partnerData.pincode?.trim() || ""
    const companyName = partnerData.company_name?.trim()

    // Validate required fields
    if (!name || name.length < 2) {
      setError("Please save your name in the profile (at least 2 characters required).")
      setIsGenerating(false)
      return
    }

    if (!phone || phone.length < 2) {
      setError("Please save your phone number in the profile.")
      setIsGenerating(false)
      return
    }

    if (!pincode || pincode.length < 2) {
      setError("Please save your pincode in the profile.")
      setIsGenerating(false)
      return
    }

    if (!companyName || companyName.length < 1) {
      setError("Please save your company name in the profile.")
      setIsGenerating(false)
      return
    }

    try {
      // Extract parts for ID generation
      // 1. First 2 letters of name (uppercase)
      const namePart = name.substring(0, 2).toUpperCase()
      
      // 2. Last 2 digits of phone (remove +91 prefix if present)
      const phoneDigits = phone.replace(/^\+91/, "").replace(/\D/g, "")
      const phonePart = phoneDigits.slice(-2)
      
      // 3. Last 2 digits of pincode
      const pincodePart = pincode.slice(-2)
      
      // 4. First letter of company name (uppercase)
      const companyFirst = companyName.charAt(0).toUpperCase()
      
      // 5. Last letter of company name (uppercase)
      const companyLast = companyName.charAt(companyName.length - 1).toUpperCase()
      
      // 6. Get serial number - count existing partners with IDs or use a sequence
      const { data: allPartners, error: countError } = await supabase
        .from("referral_partners")
        .select("id")
        .not("name", "is", null)
        .not("phone", "is", null)
        .not("pincode", "is", null)
        .not("company_name", "is", null)
        .order("created_at", { ascending: true })

      if (countError) {
        console.error("Error counting partners:", countError)
        setError("Failed to generate ID. Please try again.")
        setIsGenerating(false)
        return
      }

      // Find the current partner's position in the list
      const currentPartnerIndex = allPartners?.findIndex(p => p.id === partnerData.id) ?? -1
      const serialNumber = currentPartnerIndex >= 0 ? currentPartnerIndex + 1 : (allPartners?.length || 0) + 1
      const serialPart = serialNumber.toString().padStart(3, '0')

      // Generate the ID
      const newId = `${namePart}${phonePart}${pincodePart}${companyFirst}${companyLast}${serialPart}`
      
      // Save the generated ID to the database
      const { error: updateError } = await supabase
        .from("referral_partners")
        .update({ partner_id: newId })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("Error saving partner ID:", updateError)
        setError("Failed to save ID to database. Please try again.")
        setIsGenerating(false)
        return
      }

      // Update local state
      setGeneratedId(newId)
      setPartnerData((prev: any) => ({ ...prev, partner_id: newId }))
      setSuccess("Partner ID generated and saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error generating ID:", err)
      setError("Failed to generate ID. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten the gradient */}
      <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
      
      {/* Overlay pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      {/* Modern grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      
      {/* Decorative elements */}
      <div className="fixed inset-0">
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

      {/* Animated PNG Background Images */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          "/patterns/pattern1.png",
          "/patterns/pattern2.png",
          "/patterns/pattern3.png",
          "/patterns/pattern4.png",
          "/patterns/pattern5.png",
          "/patterns/pattern6.png",
          "/patterns/pattern7.png",
        ].map((imagePath, i) => {
          const baseX = 5 + (i * 13) % 82
          const baseY = 8 + (i * 15) % 75
          const size = 280 + (i % 3) * 80
          const fadeDuration = 8 + Math.random() * 4
          const rotateDuration = 60 + i * 8
          const moveDuration = 12 + Math.random() * 6
          
          return (
            <motion.div
              key={`bg-image-${i}`}
              className="absolute"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              initial={{ opacity: 0.15 }}
              animate={{
                opacity: [0.1, 0.25, 0.15, 0.25, 0.1],
                rotate: [0, 360],
                x: [-40, 40, -40],
              }}
              transition={{
                opacity: {
                  duration: fadeDuration,
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: rotateDuration,
                  repeat: Infinity,
                  ease: "linear",
                },
                x: {
                  duration: moveDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7,
                },
              }}
            >
              <img
                src={imagePath}
                alt={`Background pattern ${i + 1}`}
                className="w-full h-full object-contain"
                style={{
                  filter: "brightness(0) invert(1)",
                  mixBlendMode: "screen",
                }}
                onError={(e) => {
                  console.warn(`Image not found: ${imagePath}`)
                  e.currentTarget.style.display = "none"
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Header with Back Button - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={() => router.push("/referral-partner/dashboard")}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            {user?.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.partner_id ? `${user.partner_id} (${user.email})` : user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="partner-id">Partner ID</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="partner-id"
                    type="text"
                    value={generatedId}
                    readOnly
                    disabled
                    placeholder={partnerData?.partner_id ? "Partner ID has been generated" : "Click 'Generate ID' to create a new ID"}
                    className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <Button
                    onClick={generatePartnerId}
                    disabled={isGenerating || !!partnerData?.partner_id}
                    className="whitespace-nowrap bg-[#4B0082] hover:bg-[#5a0099] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? "Generating..." : "Generate ID"}
                  </Button>
                </div>
                {partnerData?.partner_id && (
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Partner ID has already been generated.</p>
                      <p>If there is a problem with the partner ID, feel free to contact the administrator through email <a href="mailto:arjun.rksaravanan@gmail.com" className="underline hover:text-amber-700 dark:hover:text-amber-300">arjun.rksaravanan@gmail.com</a> or phone number <a href="tel:+918072734996" className="underline hover:text-amber-700 dark:hover:text-amber-300">+91 8072734996</a>.</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>© 2024 Manavizha. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-[#4B0082] dark:hover:text-[#4B0082] transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

