import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormData } from "@/types/profile"

interface PartnerPreferencesStepProps {
  formData: FormData
  onChange: (field: keyof FormData, value: any) => void
}

export function PartnerPreferencesStep({ formData, onChange }: PartnerPreferencesStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic & Lifestyle Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Preferred Age Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formData.preferredAgeMin}
                onChange={(e) => onChange("preferredAgeMin", e.target.value)}
                placeholder="Min"
                min="18"
              />
              <span>to</span>
              <Input
                type="number"
                value={formData.preferredAgeMax}
                onChange={(e) => onChange("preferredAgeMax", e.target.value)}
                placeholder="Max"
                min="18"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preferred Height Range (cm)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formData.preferredHeightMin}
                onChange={(e) => onChange("preferredHeightMin", e.target.value)}
                placeholder="Min"
              />
              <span>to</span>
              <Input
                type="number"
                value={formData.preferredHeightMax}
                onChange={(e) => onChange("preferredHeightMax", e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select value={formData.preferredMaritalStatus} onValueChange={(v) => onChange("preferredMaritalStatus", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Never Married">Never Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
                <SelectItem value="Awaiting Divorce">Awaiting Divorce</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Physical Status</Label>
            <Select value={formData.preferredPhysicalStatus} onValueChange={(v) => onChange("preferredPhysicalStatus", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Physically Challenged">Physically Challenged</SelectItem>
                <SelectItem value="Any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mother Tongue</Label>
            <Input
              value={formData.preferredMotherTongue}
              onChange={(e) => onChange("preferredMotherTongue", e.target.value)}
              placeholder="e.g. Tamil, English"
            />
          </div>
          <div className="space-y-2">
            <Label>Eating Habits</Label>
            <Select value={formData.preferredEatingHabits} onValueChange={(v) => onChange("preferredEatingHabits", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="Eggetarian">Eggetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Smoking Habits</Label>
            <Select value={formData.preferredSmokingHabits} onValueChange={(v) => onChange("preferredSmokingHabits", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Never">Never</SelectItem>
                <SelectItem value="Occasionally">Occasionally</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Drinking Habits</Label>
            <Select value={formData.preferredDrinkingHabits} onValueChange={(v) => onChange("preferredDrinkingHabits", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Never">Never</SelectItem>
                <SelectItem value="Occasionally">Occasionally</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Religious & Horoscope Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Religion</Label>
            <Input
              value={formData.preferredReligion}
              onChange={(e) => onChange("preferredReligion", e.target.value)}
              placeholder="e.g. Hindu"
            />
          </div>
          <div className="space-y-2">
            <Label>Caste</Label>
            <Input
              value={formData.preferredCaste}
              onChange={(e) => onChange("preferredCaste", e.target.value)}
              placeholder="e.g. Kamma Naidu"
            />
          </div>
          <div className="space-y-2">
            <Label>Subcaste</Label>
            <Input
              value={formData.preferredSubcaste}
              onChange={(e) => onChange("preferredSubcaste", e.target.value)}
              placeholder="e.g. Koveru"
            />
          </div>
          <div className="space-y-2">
            <Label>Star</Label>
            <Input
              value={formData.preferredStar}
              onChange={(e) => onChange("preferredStar", e.target.value)}
              placeholder="e.g. Rohini"
            />
          </div>
          <div className="space-y-2">
            <Label>Dosham / Sevvai Dhosham</Label>
            <Select value={formData.preferredDosham} onValueChange={(v) => onChange("preferredDosham", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="Doesn't Matter">Doesn't Matter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional & Location Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Education</Label>
            <Input
              value={formData.preferredEducation}
              onChange={(e) => onChange("preferredEducation", e.target.value)}
              placeholder="e.g. Graduate"
            />
          </div>
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select value={formData.preferredEmploymentType} onValueChange={(v) => onChange("preferredEmploymentType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Private Sector">Private Sector</SelectItem>
                <SelectItem value="Govt Sector">Govt Sector</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Self Employed">Self Employed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Occupation</Label>
            <Input
              value={formData.preferredOccupation}
              onChange={(e) => onChange("preferredOccupation", e.target.value)}
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label>Annual Income</Label>
            <Input
              value={formData.preferredAnnualIncome}
              onChange={(e) => onChange("preferredAnnualIncome", e.target.value)}
              placeholder="e.g. 10 Lakhs+"
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.preferredCountry}
              onChange={(e) => onChange("preferredCountry", e.target.value)}
              placeholder="e.g. India"
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input
              value={formData.preferredState}
              onChange={(e) => onChange("preferredState", e.target.value)}
              placeholder="e.g. Tamil Nadu"
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={formData.preferredCity}
              onChange={(e) => onChange("preferredCity", e.target.value)}
              placeholder="e.g. Coimbatore"
            />
          </div>
          <div className="space-y-2">
            <Label>Citizenship</Label>
            <Input
              value={formData.preferredCitizenship}
              onChange={(e) => onChange("preferredCitizenship", e.target.value)}
              placeholder="e.g. Indian"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

