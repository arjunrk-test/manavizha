"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react"

interface PostOffice {
  Name: string
  Taluk?: string
  Tehsil?: string
  Block?: string
  District: string
  Division: string
  Circle?: string
  Region?: string
  State: string
  Country: string
}

interface IFSCDetails {
  BANK: string
  IFSC: string
  BRANCH: string
  ADDRESS: string
  CONTACT: string
  CITY: string
  DISTRICT: string
  STATE: string
  RTGS: boolean
  BANKCODE: string
}

interface ReferralPartnerProfileFormProps {
  userId: string
  userEmail: string
}

interface FormData {
  name: string
  phone: string
  whatsapp_number: string
  company_name: string
  organization_type: string
  address_line1: string
  address_line2: string
  area: string
  taluk: string
  district: string
  division: string
  region: string
  city: string
  state: string
  pincode: string
  country: string
  account_number: string
  account_holder_name: string
  ifsc_code: string
  branch_name: string
  partner_photo: string
  aadhar_front: string
  aadhar_back: string
  pancard_front: string
  pancard_back: string
}

export function ReferralPartnerProfileForm({ userId, userEmail }: ReferralPartnerProfileFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "+91",
    whatsapp_number: "+91",
    company_name: "",
    organization_type: "",
    address_line1: "",
    address_line2: "",
    area: "",
    taluk: "",
    district: "",
    division: "",
    region: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    account_number: "",
    account_holder_name: "",
    ifsc_code: "",
    branch_name: "",
    partner_photo: "",
    aadhar_front: "",
    aadhar_back: "",
    pancard_front: "",
    pancard_back: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isWhatsappSameAsPhone, setIsWhatsappSameAsPhone] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [areas, setAreas] = useState<PostOffice[]>([])
  const [isAreaOpen, setIsAreaOpen] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const [isLoadingIFSC, setIsLoadingIFSC] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({}) // Cache for signed URLs

  // Helper function to get signed URL if public URL fails
  const getImageUrl = async (field: string, url: string): Promise<string> => {
    if (!url || !url.startsWith('http')) return url

    // Check cache first
    if (imageUrls[field]) return imageUrls[field]

    // Try to extract path from public URL
    const urlMatch = url.match(/\/storage\/v1\/object\/public\/referral-partners\/(.+)$/)
    if (urlMatch && urlMatch[1]) {
      const filePath = urlMatch[1]
      
      // Try to get signed URL as fallback (valid for 1 hour)
      const { data: signedUrlData, error } = await supabase.storage
        .from('referral-partners')
        .createSignedUrl(filePath, 3600)
      
      if (signedUrlData?.signedUrl) {
        setImageUrls(prev => ({ ...prev, [field]: signedUrlData.signedUrl }))
        return signedUrlData.signedUrl
      } else if (error) {
        console.warn(`Failed to get signed URL for ${field}:`, error)
      }
    }
    
    return url
  }

  // Load existing data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("referral_partners")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading profile:", error)
          return
        }

        if (data) {
          // Ensure phone and whatsapp have +91 prefix
          const phone = data.phone || ""
          const whatsapp = data.whatsapp_number || ""
          const phoneWithPrefix = phone && !phone.startsWith("+91") ? `+91${phone.replace(/^\+91/, "")}` : (phone || "+91")
          const whatsappWithPrefix = whatsapp && !whatsapp.startsWith("+91") ? `+91${whatsapp.replace(/^\+91/, "")}` : (whatsapp || "+91")
          const isSame = phoneWithPrefix && whatsappWithPrefix && phoneWithPrefix === whatsappWithPrefix
          
          setFormData({
            name: data.name || "",
            phone: phoneWithPrefix,
            whatsapp_number: whatsappWithPrefix,
            company_name: data.company_name || "",
            organization_type: data.organization_type || "",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            area: data.area || "",
            taluk: data.taluk || "",
            district: data.district || "",
            division: data.division || "",
            region: data.region || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            country: data.country || "India",
            account_number: data.account_number || "",
            account_holder_name: data.account_holder_name || "",
            ifsc_code: data.ifsc_code || "",
            branch_name: data.branch_name || "",
            partner_photo: data.partner_photo || "",
            aadhar_front: data.aadhar_front || "",
            aadhar_back: data.aadhar_back || "",
            pancard_front: data.pancard_front || "",
            pancard_back: data.pancard_back || "",
          })
          
          setIsWhatsappSameAsPhone(isSame)

          // Try to get signed URLs for images if they exist
          const imageFields = ['partner_photo', 'aadhar_front', 'aadhar_back', 'pancard_front', 'pancard_back']
          const urlPromises = imageFields.map(async (field) => {
            const url = data[field]
            if (url && url.startsWith('http')) {
              try {
                const signedUrl = await getImageUrl(field, url)
                return { field, url: signedUrl }
              } catch (err) {
                console.warn(`Failed to get signed URL for ${field}:`, err)
                return null
              }
            }
            return null
          })

          const urlResults = await Promise.all(urlPromises)
          const urlMap: Record<string, string> = {}
          urlResults.forEach(result => {
            if (result) {
              urlMap[result.field] = result.url
            }
          })
          if (Object.keys(urlMap).length > 0) {
            setImageUrls(urlMap)
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  // Function to fetch areas from pincode
  const fetchAreasFromPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setIsLoadingAddress(false)
      setAreas([])
      // Clear fields if pincode is incomplete
      handleInputChange("area", "")
      handleInputChange("taluk", "")
      handleInputChange("district", "")
      handleInputChange("division", "")
      handleInputChange("region", "")
      handleInputChange("state", "")
      handleInputChange("country", "")
      return
    }

    try {
      // Using PostPincode.in API - free API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice as PostOffice[]
        setAreas(postOffices)
        // Auto-select first area if only one area exists
        if (postOffices.length === 1) {
          const postOffice = postOffices[0]
          handleAreaSelect(postOffice)
        }
      } else {
        // No areas found
        setAreas([])
        handleInputChange("area", "")
        handleInputChange("taluk", "")
        handleInputChange("district", "")
        handleInputChange("division", "")
        handleInputChange("region", "")
        handleInputChange("state", "")
        handleInputChange("country", "")
      }
    } catch (error) {
      console.error("Error fetching address from pincode:", error)
      setAreas([])
    } finally {
      setIsLoadingAddress(false)
    }
  }

  // Function to handle area selection
  const handleAreaSelect = (postOffice: PostOffice) => {
    handleInputChange("area", postOffice.Name || "")
    handleInputChange("taluk", postOffice.Taluk || postOffice.Tehsil || postOffice.Block || "")
    handleInputChange("district", postOffice.District || "")
    handleInputChange("division", postOffice.Division || "")
    handleInputChange("region", postOffice.Circle || postOffice.Region || "")
    handleInputChange("state", postOffice.State || "")
    handleInputChange("country", postOffice.Country || "")
    // Use district as city if city is empty
    if (!formData.city) {
      handleInputChange("city", postOffice.District || "")
    }
    setIsAreaOpen(false)
  }

  // Auto-fetch areas when pincode is entered
  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      // Set loading immediately
      setIsLoadingAddress(true)
      // Small delay to show loading, then fetch
      const timeoutId = setTimeout(() => {
        fetchAreasFromPincode(formData.pincode)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setIsLoadingAddress(false)
      setAreas([])
    }
  }, [formData.pincode])

  // Handle click outside for area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setIsAreaOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Function to fetch IFSC details from Razorpay API
  const fetchIFSCDetails = async (ifscCode: string) => {
    if (!ifscCode || ifscCode.length !== 11) {
      setIsLoadingIFSC(false)
      return
    }

    try {
      setIsLoadingIFSC(true)
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`)
      
      if (!response.ok) {
        throw new Error("IFSC code not found")
      }

      const data: IFSCDetails = await response.json()

      if (data && data.BRANCH) {
        // Auto-fill branch name
        handleInputChange("branch_name", data.BRANCH)
      }
    } catch (error) {
      console.error("Error fetching IFSC details:", error)
      // Don't show error to user, just don't auto-fill
    } finally {
      setIsLoadingIFSC(false)
    }
  }

  // Auto-fetch IFSC details when IFSC code is entered
  useEffect(() => {
    if (formData.ifsc_code && formData.ifsc_code.length === 11) {
      // Small delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchIFSCDetails(formData.ifsc_code)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setIsLoadingIFSC(false)
    }
  }, [formData.ifsc_code])

  // Sync WhatsApp number with phone number when checkbox is checked
  useEffect(() => {
    if (isWhatsappSameAsPhone && formData.whatsapp_number !== formData.phone) {
      handleInputChange("whatsapp_number", formData.phone)
    }
  }, [formData.phone, isWhatsappSameAsPhone])

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file"
    }
    return null
  }

  const handleFileUpload = async (field: keyof FormData, file: File) => {
    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }))
      return
    }

    try {
      setUploadingField(field)
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${field}_${Date.now()}.${fileExt}`
      const filePath = fileName

      // Delete old file if exists
      const oldUrl = formData[field]
      if (oldUrl && oldUrl.startsWith('http')) {
        try {
          // Extract file path from old URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
          const urlMatch = oldUrl.match(/\/storage\/v1\/object\/public\/referral-partners\/(.+)$/)
          if (urlMatch && urlMatch[1]) {
            const oldPath = urlMatch[1]
            await supabase.storage
              .from('referral-partners')
              .remove([oldPath])
          }
        } catch (deleteError) {
          // Ignore delete errors (file might not exist)
          console.warn("Could not delete old file:", deleteError)
        }
      }

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('referral-partners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        setErrors((prev) => ({ 
          ...prev, 
          [field]: uploadError.message || "Failed to upload image. Please try again." 
        }))
        setUploadingField(null)
        return
      }

      if (!uploadData?.path) {
        console.error("Upload succeeded but no path returned:", uploadData)
        setErrors((prev) => ({ 
          ...prev, 
          [field]: "Upload succeeded but failed to get file path. Please try again." 
        }))
        setUploadingField(null)
        return
      }

      // Get public URL using the actual uploaded path
      const { data: urlData } = supabase.storage
        .from('referral-partners')
        .getPublicUrl(uploadData.path)

      if (urlData?.publicUrl) {
        console.log(`Successfully uploaded ${field} to:`, urlData.publicUrl)
        setFormData((prev) => ({ ...prev, [field]: urlData.publicUrl }))
      } else {
        console.error("Failed to get public URL. urlData:", urlData)
        throw new Error("Failed to get public URL for uploaded file")
      }
    } catch (err: any) {
      console.error("Error uploading file:", err)
      setErrors((prev) => ({ 
        ...prev, 
        [field]: err.message || "Failed to upload image. Please try again." 
      }))
    } finally {
      setUploadingField(null)
    }
  }

  const handleFileDelete = async (field: keyof FormData) => {
    const currentUrl = formData[field]
    
    if (currentUrl && currentUrl.startsWith('http')) {
      try {
        // Extract file path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        const urlMatch = currentUrl.match(/\/storage\/v1\/object\/public\/referral-partners\/(.+)$/)
        if (urlMatch && urlMatch[1]) {
          const filePath = urlMatch[1]
          const { error: deleteError } = await supabase.storage
            .from('referral-partners')
            .remove([filePath])

          if (deleteError) {
            console.error("Error deleting file:", deleteError)
          }
        }
      } catch (err) {
        console.error("Error deleting file:", err)
      }
    }

    handleInputChange(field, "")
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) newErrors.name = "Name is required"
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required"
    if (!formData.whatsapp_number?.trim()) newErrors.whatsapp_number = "WhatsApp number is required"
    if (!formData.company_name?.trim()) newErrors.company_name = "Company name is required"
    if (!formData.organization_type?.trim()) newErrors.organization_type = "Organization type is required"
    if (!formData.address_line1?.trim()) newErrors.address_line1 = "Address line 1 is required"
    if (!formData.area?.trim()) newErrors.area = "Area is required"
    if (!formData.taluk?.trim()) newErrors.taluk = "Taluk is required"
    if (!formData.district?.trim()) newErrors.district = "District is required"
    if (!formData.division?.trim()) newErrors.division = "Division is required"
    if (!formData.region?.trim()) newErrors.region = "Region is required"
    if (!formData.city?.trim()) newErrors.city = "City is required"
    if (!formData.state?.trim()) newErrors.state = "State is required"
    if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required"
    if (!formData.country?.trim()) newErrors.country = "Country is required"
    if (!formData.account_number?.trim()) newErrors.account_number = "Account number is required"
    if (!formData.account_holder_name?.trim()) newErrors.account_holder_name = "Account holder name is required"
    if (!formData.ifsc_code?.trim()) newErrors.ifsc_code = "IFSC code is required"
    if (!formData.branch_name?.trim()) newErrors.branch_name = "Branch name is required"
    if (!formData.partner_photo?.trim()) newErrors.partner_photo = "Partner photo is required"
    if (!formData.aadhar_front?.trim()) newErrors.aadhar_front = "Aadhar front is required"
    if (!formData.aadhar_back?.trim()) newErrors.aadhar_back = "Aadhar back is required"
    if (!formData.pancard_front?.trim()) newErrors.pancard_front = "PAN card front is required"
    if (!formData.pancard_back?.trim()) newErrors.pancard_back = "PAN card back is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    setErrors({})

    if (!validateForm()) {
      setIsSaving(false)
      return
    }

    try {
      const { error } = await supabase
        .from("referral_partners")
        .upsert(
          {
            user_id: userId,
            email: userEmail,
            ...formData,
          },
          {
            onConflict: "user_id",
          }
        )

      if (error) {
        console.error("Error saving profile:", error)
        setErrors({ submit: error.message || "Failed to save profile. Please try again." })
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err: any) {
      console.error("Error saving profile:", err)
      setErrors({ submit: err.message || "An unexpected error occurred." })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success Message */}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone.startsWith("+91") ? formData.phone.slice(3) : formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  // Limit to 10 digits
                  if (value.length <= 10) {
                    handleInputChange("phone", value ? `+91${value}` : "+91")
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && formData.phone === "+91") {
                    e.preventDefault()
                  }
                }}
                placeholder="Enter your phone number"
                maxLength={10}
                required
                className="pl-12"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isWhatsappSameAsPhone"
                  checked={isWhatsappSameAsPhone}
                  onChange={(e) => {
                    setIsWhatsappSameAsPhone(e.target.checked)
                    if (e.target.checked) {
                      handleInputChange("whatsapp_number", formData.phone)
                    } else {
                      handleInputChange("whatsapp_number", "")
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isWhatsappSameAsPhone" className="text-sm font-normal cursor-pointer">
                  Same as phone number
                </Label>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10">
                +91
              </div>
              <Input
                id="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number.startsWith("+91") ? formData.whatsapp_number.slice(3) : formData.whatsapp_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  // Limit to 10 digits
                  if (value.length <= 10) {
                    handleInputChange("whatsapp_number", value ? `+91${value}` : "+91")
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && formData.whatsapp_number === "+91") {
                    e.preventDefault()
                  }
                }}
                placeholder="Enter your WhatsApp number"
                maxLength={10}
                required
                disabled={isWhatsappSameAsPhone}
                className={`pl-12 ${isWhatsappSameAsPhone ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
              />
            </div>
            {errors.whatsapp_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.whatsapp_number}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              placeholder="Email address"
              required
              readOnly
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Company/Organization */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Company/Organization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="Enter company name"
              required
            />
            {errors.company_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.company_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization_type">Organization Type *</Label>
            <Select
              value={formData.organization_type}
              onValueChange={(value) => handleInputChange("organization_type", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Private Limited">Private Limited</SelectItem>
                <SelectItem value="Public Limited">Public Limited</SelectItem>
                <SelectItem value="LLP">LLP</SelectItem>
                <SelectItem value="Trust">Trust</SelectItem>
                <SelectItem value="Society">Society</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.organization_type && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.organization_type}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Address</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1 *</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => handleInputChange("address_line1", e.target.value)}
              placeholder="Enter address line 1"
              required
            />
            {errors.address_line1 && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.address_line1}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => handleInputChange("address_line2", e.target.value)}
              placeholder="Enter address line 2 (optional)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <div className="relative">
                <Input
                  id="pincode"
                  type="number"
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    if (value.length <= 6) {
                      handleInputChange("pincode", value)
                    }
                  }}
                  placeholder="Enter pincode"
                  maxLength={6}
                  required
                  className={isLoadingAddress ? "pr-10" : ""}
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.pincode && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.pincode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area Name *</Label>
              <div className="relative" ref={areaRef}>
                <button
                  type="button"
                  onClick={() => areas.length > 0 && setIsAreaOpen(!isAreaOpen)}
                  disabled={isLoadingAddress || areas.length === 0}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4B0082] dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between text-left min-h-[2.5rem] disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  <span className={formData.area ? "" : "text-gray-500"}>
                    {formData.area || (isLoadingAddress ? "Loading areas..." : areas.length === 0 ? "Enter pincode first" : "Select Area")}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAreaOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoadingAddress && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
                {isAreaOpen && areas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-y-auto language-dropdown-scroll" style={{ maxHeight: '250px' }}>
                      {areas.map((postOffice, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAreaSelect(postOffice)}
                          className={`w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors ${
                            formData.area === postOffice.Name ? "bg-gray-100 dark:bg-gray-800" : ""
                          }`}
                        >
                          {postOffice.Name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.area && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.area}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taluk">Taluk *</Label>
              <div className="relative">
                <Input
                  id="taluk"
                  value={formData.taluk || ""}
                  onChange={(e) => handleInputChange("taluk", e.target.value)}
                  placeholder="Taluk (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.taluk && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.taluk}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <div className="relative">
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="District (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.district && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.district}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division *</Label>
              <div className="relative">
                <Input
                  id="division"
                  value={formData.division}
                  onChange={(e) => handleInputChange("division", e.target.value)}
                  placeholder="Division (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.division && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.division}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <div className="relative">
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  placeholder="Region (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.region && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.region}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                required
              />
              {errors.city && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <div className="relative">
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.state && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <div className="relative">
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country (auto-filled)"
                  required
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                  </div>
                )}
              </div>
              {errors.country && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bank Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => handleInputChange("account_number", e.target.value)}
              placeholder="Enter account number"
              required
            />
            {errors.account_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.account_number}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name *</Label>
            <Input
              id="account_holder_name"
              value={formData.account_holder_name}
              onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
              placeholder="Enter account holder name"
              required
            />
            {errors.account_holder_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.account_holder_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifsc_code">IFSC Code *</Label>
            <div className="relative">
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => handleInputChange("ifsc_code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="Enter IFSC code"
                maxLength={11}
                required
                className={isLoadingIFSC ? "pr-10" : ""}
              />
              {isLoadingIFSC && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4B0082]"></div>
                </div>
              )}
            </div>
            {errors.ifsc_code && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.ifsc_code}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch_name">Branch Name *</Label>
            <Input
              id="branch_name"
              value={formData.branch_name}
              onChange={(e) => handleInputChange("branch_name", e.target.value)}
              placeholder="Enter branch name (auto-filled from IFSC)"
              required
            />
            {errors.branch_name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.branch_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Documents</h2>
        
        {/* Partner Photo */}
        <div className="space-y-4">
          <Label>Partner Photo *</Label>
          {errors.partner_photo && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.partner_photo}</span>
            </div>
          )}
          {formData.partner_photo && formData.partner_photo.trim() && formData.partner_photo.startsWith('http') ? (
            <div className="relative max-w-md">
              <img
                src={imageUrls.partner_photo || formData.partner_photo}
                alt="Partner photo"
                className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                onError={async (e) => {
                  const imgElement = e.currentTarget
                  if (!imgElement) return
                  
                  console.error("Error loading partner photo:", formData.partner_photo)
                  // Try to get signed URL as fallback
                  if (!imageUrls.partner_photo) {
                    try {
                      const signedUrl = await getImageUrl('partner_photo', formData.partner_photo)
                      if (signedUrl !== formData.partner_photo && imgElement) {
                        imgElement.src = signedUrl
                        return
                      }
                    } catch (err) {
                      console.error("Failed to get signed URL:", err)
                    }
                  }
                  if (imgElement) {
                    imgElement.style.display = 'none'
                  }
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById('partner-photo-upload') as HTMLInputElement
                    input?.click()
                  }}
                  className="bg-white/90 hover:bg-white"
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleFileDelete("partner_photo")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload("partner_photo", file)
                  e.target.value = ""
                }}
                className="hidden"
                id="partner-photo-upload"
              />
              <label
                htmlFor="partner-photo-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingField === "partner_photo" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploadingField === "partner_photo" ? (
                  <>
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Click to upload partner photo or drag and drop
                    </span>
                    <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Aadhar Card */}
        <div className="space-y-6">
          <Label className="text-lg">Aadhar Card *</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="aadhar-front">Aadhar Front *</Label>
              {errors.aadhar_front && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.aadhar_front}</span>
                </div>
              )}
              {formData.aadhar_front && formData.aadhar_front.trim() && formData.aadhar_front.startsWith('http') ? (
                <div className="relative">
                  <img
                    src={imageUrls.aadhar_front || formData.aadhar_front}
                    alt="Aadhar front"
                    className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    onError={async (e) => {
                      const imgElement = e.currentTarget
                      if (!imgElement) return
                      
                      console.error("Error loading aadhar front:", formData.aadhar_front)
                      // Try to get signed URL as fallback
                      if (!imageUrls.aadhar_front) {
                        try {
                          const signedUrl = await getImageUrl('aadhar_front', formData.aadhar_front)
                          if (signedUrl !== formData.aadhar_front && imgElement) {
                            imgElement.src = signedUrl
                            return
                          }
                        } catch (err) {
                          console.error("Failed to get signed URL:", err)
                        }
                      }
                      if (imgElement) {
                        imgElement.style.display = 'none'
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('aadhar-front-upload') as HTMLInputElement
                        input?.click()
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFileDelete("aadhar_front")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload("aadhar_front", file)
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="aadhar-front-upload"
                  />
                  <label
                    htmlFor="aadhar-front-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="aadhar-back">Aadhar Back *</Label>
              {errors.aadhar_back && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.aadhar_back}</span>
                </div>
              )}
              {formData.aadhar_back && formData.aadhar_back.trim() && formData.aadhar_back.startsWith('http') ? (
                <div className="relative">
                  <img
                    src={imageUrls.aadhar_back || formData.aadhar_back}
                    alt="Aadhar back"
                    className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    onError={async (e) => {
                      const imgElement = e.currentTarget
                      if (!imgElement) return
                      
                      console.error("Error loading aadhar back:", formData.aadhar_back)
                      // Try to get signed URL as fallback
                      if (!imageUrls.aadhar_back) {
                        try {
                          const signedUrl = await getImageUrl('aadhar_back', formData.aadhar_back)
                          if (signedUrl !== formData.aadhar_back && imgElement) {
                            imgElement.src = signedUrl
                            return
                          }
                        } catch (err) {
                          console.error("Failed to get signed URL:", err)
                        }
                      }
                      if (imgElement) {
                        imgElement.style.display = 'none'
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('aadhar-back-upload') as HTMLInputElement
                        input?.click()
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFileDelete("aadhar_back")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload("aadhar_back", file)
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="aadhar-back-upload"
                    disabled={uploadingField === "aadhar_back"}
                  />
                  <label
                    htmlFor="aadhar-back-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingField === "aadhar_back" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploadingField === "aadhar_back" ? (
                      <>
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAN Card */}
        <div className="space-y-6">
          <Label className="text-lg">PAN Card *</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="pancard-front">PAN Front *</Label>
              {errors.pancard_front && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.pancard_front}</span>
                </div>
              )}
              {formData.pancard_front && formData.pancard_front.trim() && formData.pancard_front.startsWith('http') ? (
                <div className="relative">
                  <img
                    src={imageUrls.pancard_front || formData.pancard_front}
                    alt="PAN front"
                    className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    onError={async (e) => {
                      const imgElement = e.currentTarget
                      if (!imgElement) return
                      
                      console.error("Error loading PAN front:", formData.pancard_front)
                      // Try to get signed URL as fallback
                      if (!imageUrls.pancard_front) {
                        try {
                          const signedUrl = await getImageUrl('pancard_front', formData.pancard_front)
                          if (signedUrl !== formData.pancard_front && imgElement) {
                            imgElement.src = signedUrl
                            return
                          }
                        } catch (err) {
                          console.error("Failed to get signed URL:", err)
                        }
                      }
                      if (imgElement) {
                        imgElement.style.display = 'none'
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('pancard-front-upload') as HTMLInputElement
                        input?.click()
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFileDelete("pancard_front")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload("pancard_front", file)
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="pancard-front-upload"
                    disabled={uploadingField === "pancard_front"}
                  />
                  <label
                    htmlFor="pancard-front-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingField === "pancard_front" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploadingField === "pancard_front" ? (
                      <>
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="pancard-back">PAN Back *</Label>
              {errors.pancard_back && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.pancard_back}</span>
                </div>
              )}
              {formData.pancard_back && formData.pancard_back.trim() && formData.pancard_back.startsWith('http') ? (
                <div className="relative">
                  <img
                    src={imageUrls.pancard_back || formData.pancard_back}
                    alt="PAN back"
                    className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    onError={async (e) => {
                      const imgElement = e.currentTarget
                      if (!imgElement) return
                      
                      console.error("Error loading PAN back:", formData.pancard_back)
                      // Try to get signed URL as fallback
                      if (!imageUrls.pancard_back) {
                        try {
                          const signedUrl = await getImageUrl('pancard_back', formData.pancard_back)
                          if (signedUrl !== formData.pancard_back && imgElement) {
                            imgElement.src = signedUrl
                            return
                          }
                        } catch (err) {
                          console.error("Failed to get signed URL:", err)
                        }
                      }
                      if (imgElement) {
                        imgElement.style.display = 'none'
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('pancard-back-upload') as HTMLInputElement
                        input?.click()
                      }}
                      className="bg-white/90 hover:bg-white"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFileDelete("pancard_back")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload("pancard_back", file)
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="pancard-back-upload"
                    disabled={uploadingField === "pancard_back"}
                  />
                  <label
                    htmlFor="pancard-back-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingField === "pancard_back" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploadingField === "pancard_back" ? (
                      <>
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  )
}

