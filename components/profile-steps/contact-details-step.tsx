"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface ContactDetailsStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ContactDetailsStep({ formData, onChange }: ContactDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={formData.whatsappNumber}
            onChange={(e) => onChange("whatsappNumber", e.target.value)}
            placeholder="Enter your WhatsApp number"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Permanent Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Enter your permanent address"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="currentAddress">Current Address of Residence *</Label>
          <Input
            id="currentAddress"
            value={formData.currentAddress}
            onChange={(e) => onChange("currentAddress", e.target.value)}
            placeholder="Enter your current address"
            required
          />
        </div>
      </div>
    </div>
  )
}

