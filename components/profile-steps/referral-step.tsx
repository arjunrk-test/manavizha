"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormData } from "@/types/profile"

interface ReferralStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function ReferralStep({ formData, onChange }: ReferralStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referralPartnerId">Referral Partner ID (Optional)</Label>
          <Input
            id="referralPartnerId"
            value={formData.referralPartnerId}
            onChange={(e) => onChange("referralPartnerId", e.target.value)}
            placeholder="Enter referral partner ID if you have one"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If someone referred you to this platform, enter their partner ID here.
          </p>
        </div>
      </div>
    </div>
  )
}

