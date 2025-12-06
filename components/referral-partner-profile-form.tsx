"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react"

interface ReferralPartnerProfileFormProps {
  userId: string
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

export function ReferralPartnerProfileForm({ userId }: ReferralPartnerProfileFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    whatsapp_number: "",
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
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            whatsapp_number: data.whatsapp_number || "",
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
        }
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file"
    }
    return null
  }

  const handleFileUpload = (field: keyof FormData, file: File) => {
    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setFormData((prev) => ({ ...prev, [field]: result }))
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
    reader.readAsDataURL(file)
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
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter phone number"
              maxLength={20}
              required
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => handleInputChange("whatsapp_number", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter WhatsApp number"
              maxLength={20}
              required
            />
            {errors.whatsapp_number && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.whatsapp_number}</p>
            )}
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
              placeholder="Enter address line 2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="Enter area"
                required
              />
              {errors.area && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.area}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taluk">Taluk *</Label>
              <Input
                id="taluk"
                value={formData.taluk}
                onChange={(e) => handleInputChange("taluk", e.target.value)}
                placeholder="Enter taluk"
                required
              />
              {errors.taluk && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.taluk}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="Enter district"
                required
              />
              {errors.district && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.district}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="division">Division *</Label>
              <Input
                id="division"
                value={formData.division}
                onChange={(e) => handleInputChange("division", e.target.value)}
                placeholder="Enter division"
                required
              />
              {errors.division && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.division}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Enter region"
                required
              />
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
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter state"
                required
              />
              {errors.state && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter pincode"
                maxLength={10}
                required
              />
              {errors.pincode && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.pincode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter country"
                required
              />
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
            <Input
              id="ifsc_code"
              value={formData.ifsc_code}
              onChange={(e) => handleInputChange("ifsc_code", e.target.value.toUpperCase())}
              placeholder="Enter IFSC code"
              maxLength={11}
              required
            />
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
              placeholder="Enter branch name"
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
          {formData.partner_photo ? (
            <div className="relative max-w-md">
              <img
                src={formData.partner_photo}
                alt="Partner photo"
                className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleInputChange("partner_photo", "")}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
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
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to upload partner photo or drag and drop
                </span>
                <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
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
              {formData.aadhar_front ? (
                <div className="relative">
                  <img
                    src={formData.aadhar_front}
                    alt="Aadhar front"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInputChange("aadhar_front", "")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
              {formData.aadhar_back ? (
                <div className="relative">
                  <img
                    src={formData.aadhar_back}
                    alt="Aadhar back"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInputChange("aadhar_back", "")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                  />
                  <label
                    htmlFor="aadhar-back-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
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
              {formData.pancard_front ? (
                <div className="relative">
                  <img
                    src={formData.pancard_front}
                    alt="PAN front"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInputChange("pancard_front", "")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                  />
                  <label
                    htmlFor="pancard-front-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
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
              {formData.pancard_back ? (
                <div className="relative">
                  <img
                    src={formData.pancard_back}
                    alt="PAN back"
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInputChange("pancard_back", "")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                  />
                  <label
                    htmlFor="pancard-back-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
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

