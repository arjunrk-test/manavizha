"use client"

import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Check, Lock, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMasterData } from "@/hooks/use-master-data"
import { toast } from "sonner"
import { normalizeTamilMasterLabel } from "@/lib/tamil-display"

const FIELD_INPUT =
  "rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] placeholder:text-gray-400"

function ThemedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)]">
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function Section({
  title,
  canEdit = true,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string
  canEdit?: boolean
  editing: boolean
  saving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
      <div className="flex items-center justify-between border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
        <h2 className="font-display text-base font-semibold text-[#1F4068]">{title}</h2>
        {canEdit && (editing ? (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="h-8 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4]"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="h-8 rounded-lg bg-[#1F4068] px-2.5 text-[11px] text-white hover:bg-[#1a3558]"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="h-8 rounded-lg border-[#f0ebe3] bg-white px-2.5 text-[11px] text-[#1F4068] hover:bg-[#faf8f4]"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
    </div>
  )
}

function ReadOnlySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
      <div className="border-b border-[#f0ebe3] px-4 py-3 sm:px-5">
        <h2 className="font-display text-base font-semibold text-[#1F4068]">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

function F({
  label,
  value,
  editing,
  fieldKey,
  onChange,
  type = "text",
}: {
  label: string
  value?: string | number | null
  editing?: boolean
  fieldKey?: string
  type?: string
  onChange?: (k: string, v: string) => void
}) {
  if (editing && fieldKey && onChange) {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-500">{label}</Label>
        <Input
          type={type}
          value={value?.toString() ?? ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className={`h-9 text-[12px] ${FIELD_INPUT}`}
        />
      </div>
    )
  }

  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-500">{label}</p>
      <p className="text-[13px] font-medium text-[#1F4068]">
        {normalizeTamilMasterLabel(value?.toString())}
      </p>
    </div>
  )
}

function D({
  label,
  value,
  options,
  editing,
  fieldKey,
  onChange,
}: {
  label: string
  value?: string | null
  options: { id: string; value: string; [key: string]: any }[]
  editing?: boolean
  fieldKey?: string
  onChange?: (k: string, v: string) => void
}) {
  if (editing && fieldKey && onChange) {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-500">{label}</Label>
        <select
          value={value ?? ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className={`h-9 w-full px-3 text-[12px] ${FIELD_INPUT}`}
        >
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option.id} value={option.value}>
              {normalizeTamilMasterLabel(option.value)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-500">{label}</p>
      <p className="text-[13px] font-medium text-[#1F4068]">
        {normalizeTamilMasterLabel(value)}
      </p>
    </div>
  )
}

export function ReferralPartnerProfileDetailPanel({ userId }: { userId: string }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [raw, setRaw] = useState<any>({})

  const [personal, setPersonal] = useState<any>({})
  const [contact, setContact] = useState<any>({})
  const [family, setFamily] = useState<any>({})
  const [horoscope, setHoroscope] = useState<any>({})
  const [interests, setInterests] = useState<any>({})
  const [social, setSocial] = useState<any>({})
  const [userRow, setUserRow] = useState<any>({})

  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const { data: genderOpts } = useMasterData({ tableName: "master_gender" })
  const { data: bodyTypeOpts } = useMasterData({ tableName: "master_body_type" })
  const { data: maritalOpts } = useMasterData({ tableName: "master_marital_status" })
  const { data: foodOpts } = useMasterData({ tableName: "master_food_preferences" })
  const { data: casteOpts } = useMasterData({ tableName: "master_caste" })
  const { data: subcasteOpts } = useMasterData({ tableName: "master_subcaste" })
  const { data: familyTypeOpts } = useMasterData({ tableName: "master_family_type" })
  const { data: familyStatusOpts } = useMasterData({ tableName: "master_family_status" })
  const { data: zodiacOpts } = useMasterData({ tableName: "master_zodiac_moon_sign" })
  const { data: starOpts } = useMasterData({ tableName: "master_star" })
  const { data: lagnamOpts } = useMasterData({ tableName: "master_lagnam" })
  const { data: smokingOpts } = useMasterData({ tableName: "master_smoking" })
  const { data: drinkingOpts } = useMasterData({ tableName: "master_drinking" })
  const { data: partiesOpts } = useMasterData({ tableName: "master_parties" })
  const { data: pubsOpts } = useMasterData({ tableName: "master_pubs" })

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/referral-partner")
        return
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from("referral_partners")
        .select("partner_id, can_edit_profile")
        .eq("user_id", user.id)
        .single()

      if (partnerError || !partnerData) {
        await supabase.auth.signOut()
        router.push("/referral-partner")
        return
      }

      setCanEdit(!!partnerData.can_edit_profile)

      const [
        { data: p },
        { data: c },
        { data: edu },
        { data: fam },
        { data: horo },
        { data: int },
        { data: soc },
        { data: photos },
        { data: ref },
        { data: emp },
        { data: bus },
        { data: stu },
        { data: ur },
      ] = await Promise.all([
        supabase.from("personal_details").select("*").eq("user_id", userId).single(),
        supabase.from("contact_details").select("*").eq("user_id", userId).single(),
        supabase.from("education_details").select("*").eq("user_id", userId),
        supabase.from("family_details").select("*").eq("user_id", userId).single(),
        supabase.from("horoscope_details").select("*").eq("user_id", userId).single(),
        supabase.from("interests").select("*").eq("user_id", userId).single(),
        supabase.from("social_habits").select("*").eq("user_id", userId).single(),
        supabase.from("photos").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("referral_details").select("*, referral_partners(name)").eq("user_id", userId).single(),
        supabase.from("profession_employee").select("*").eq("user_id", userId).single(),
        supabase.from("profession_business").select("*").eq("user_id", userId).single(),
        supabase.from("profession_student").select("*").eq("user_id", userId).single(),
        supabase.from("users").select("email, name, phone").eq("id", userId).single(),
      ])

      let processedPhotos: any = null
      if (photos) {
        const getPhotoUrl = async (url: string | null, bucket: string): Promise<string> => {
          if (!url) return ""
          if (url.startsWith("http")) return url
          try {
            const filePath = url.includes("/") ? url : `${userId}/${url}`
            const { data: urlData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(filePath, 31536000)
            return urlData?.signedUrl || url
          } catch {
            return url
          }
        }

        const userPhotos = photos.user_photos || []
        const userPhotoUrls = await Promise.all(
          userPhotos.map(async (photo: string, index: number) => {
            if (photo.startsWith("http")) return photo
            try {
              const filePath = photo.includes("/") ? photo : `${userId}/photo_${index + 1}.jpg`
              const { data: urlData } = await supabase.storage
                .from("user-photos")
                .createSignedUrl(filePath, 31536000)
              return urlData?.signedUrl || photo
            } catch {
              return photo
            }
          })
        )

        processedPhotos = {
          userPhotos: userPhotoUrls,
          familyPhoto: await getPhotoUrl(photos.family_photo, "family-photos"),
          aadharFront: await getPhotoUrl(photos.aadhar_front, "aadhar-photos"),
          aadharBack: await getPhotoUrl(photos.aadhar_back, "aadhar-photos"),
        }
      }

      setRaw({ edu, photos: processedPhotos, ref, emp, bus, stu })
      setPersonal(p || {})
      setContact(c || {})
      setFamily(fam || {})
      setHoroscope(horo || {})
      setInterests(int || {})
      setSocial(soc || {})
      setUserRow(ur || {})
      setIsLoading(false)
    }

    load()
  }, [router, userId])

  const startEdit = (s: string) => setEditing((p) => ({ ...p, [s]: true }))
  const cancelEdit = (s: string) => setEditing((p) => ({ ...p, [s]: false }))

  const saveSection = async (section: string, table: string, data: any) => {
    setSaving((p) => ({ ...p, [section]: true }))
    const { id, user_id, created_at, updated_at, ...rest } = data
    const fields = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== "")
    )
    const { error } = await supabase.from(table).update(fields).eq("user_id", userId)
    setSaving((p) => ({ ...p, [section]: false }))
    if (error) toast.error(`Failed: ${error.message}`)
    else {
      toast.success(`${section} saved`)
      cancelEdit(section)
    }
  }

  const saveUser = async () => {
    setSaving((p) => ({ ...p, account: true }))
    const { error } = await supabase
      .from("users")
      .update({ name: userRow.name, phone: userRow.phone })
      .eq("id", userId)
    setSaving((p) => ({ ...p, account: false }))
    if (error) toast.error(`Failed: ${error.message}`)
    else {
      toast.success("Account saved")
      cancelEdit("account")
    }
  }

  const ed = (s: string) => !!editing[s]
  const sv = (s: string) => !!saving[s]

  const displayName = personal?.name || userRow?.name || "Profile"

  if (isLoading) {
    return (
      <ThemedPanel>
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f0ebe3] border-t-[#1F4068]" />
          <p className="text-[12px] text-gray-500">Loading profile…</p>
        </div>
      </ThemedPanel>
    )
  }

  return (
    <ThemedPanel>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1F4068]/10 text-[16px] font-semibold text-[#1F4068]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">
                Referred profile
              </p>
              <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">
                {displayName}
              </h1>
              <p className="text-[11px] text-gray-500">{userRow?.email || "—"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {canEdit ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e6f7f5] bg-[#e6f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#3bb9ac]">
                    <Pencil className="h-2.5 w-2.5" />
                    Edit enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#fdf6e3] bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold text-[#c9a227]">
                    <Lock className="h-2.5 w-2.5" />
                    View only
                  </span>
                )}
                {personal?.sex && (
                  <span className="rounded-full bg-[#e6f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#3bb9ac]">
                    {personal.sex}
                  </span>
                )}
                {personal?.age && (
                  <span className="rounded-full bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold text-[#c9a227]">
                    {personal.age} yrs
                  </span>
                )}
                {personal?.marital_status && (
                  <span className="rounded-full bg-[#fce8ef] px-2 py-0.5 text-[10px] font-semibold text-[#e87898]">
                    {personal.marital_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/referral-partner/profiles")}
            className="rounded-lg border-[#f0ebe3] bg-white text-[#1F4068] hover:bg-[#faf8f4]"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to profiles
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <Section
          title="Account"
          canEdit={canEdit}
          editing={ed("account")}
          saving={sv("account")}
          onEdit={() => startEdit("account")}
          onCancel={() => cancelEdit("account")}
          onSave={saveUser}
        >
          <F
            label="Name"
            value={userRow.name}
            editing={canEdit && ed("account")}
            fieldKey="name"
            onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))}
          />
          <F label="Email" value={userRow.email} />
          <F
            label="Phone"
            value={userRow.phone}
            editing={canEdit && ed("account")}
            fieldKey="phone"
            onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        <Section
          title="Personal details"
          canEdit={canEdit}
          editing={ed("personal")}
          saving={sv("personal")}
          onEdit={() => startEdit("personal")}
          onCancel={() => cancelEdit("personal")}
          onSave={() => saveSection("personal", "personal_details", personal)}
        >
          <F
            label="Full name"
            value={personal.name}
            editing={canEdit && ed("personal")}
            fieldKey="name"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Date of birth"
            value={personal.date_of_birth}
            type="date"
            editing={canEdit && ed("personal")}
            fieldKey="date_of_birth"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F label="Age (auto)" value={personal.age} />
          <D
            label="Gender"
            value={personal.sex}
            options={genderOpts}
            editing={canEdit && ed("personal")}
            fieldKey="sex"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Height (cm)"
            value={personal.height}
            type="number"
            editing={canEdit && ed("personal")}
            fieldKey="height"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Weight (kg)"
            value={personal.weight}
            type="number"
            editing={canEdit && ed("personal")}
            fieldKey="weight"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Skin color"
            value={personal.skin_color}
            editing={canEdit && ed("personal")}
            fieldKey="skin_color"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Body type"
            value={personal.body_type}
            options={bodyTypeOpts}
            editing={canEdit && ed("personal")}
            fieldKey="body_type"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Marital status"
            value={personal.marital_status}
            options={maritalOpts}
            editing={canEdit && ed("personal")}
            fieldKey="marital_status"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Food preference"
            value={personal.food_preference}
            options={foodOpts}
            editing={canEdit && ed("personal")}
            fieldKey="food_preference"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Languages"
            value={
              Array.isArray(personal.languages)
                ? personal.languages.join(", ")
                : personal.languages
            }
          />
          <F
            label="About"
            value={personal.about}
            editing={canEdit && ed("personal")}
            fieldKey="about"
            onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        <Section
          title="Contact details"
          canEdit={canEdit}
          editing={ed("contact")}
          saving={sv("contact")}
          onEdit={() => startEdit("contact")}
          onCancel={() => cancelEdit("contact")}
          onSave={() => saveSection("contact", "contact_details", contact)}
        >
          <F
            label="Phone"
            value={contact.phone}
            editing={canEdit && ed("contact")}
            fieldKey="phone"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="WhatsApp"
            value={contact.whatsapp_number}
            editing={canEdit && ed("contact")}
            fieldKey="whatsapp_number"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Address line 1"
            value={contact.permanent_address_line1}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_address_line1"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Address line 2"
            value={contact.permanent_address_line2}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_address_line2"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Area"
            value={contact.permanent_area}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_area"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="District"
            value={contact.permanent_district}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_district"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="State"
            value={contact.permanent_state}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_state"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Country"
            value={contact.permanent_country}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_country"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Pincode"
            value={contact.permanent_pincode}
            editing={canEdit && ed("contact")}
            fieldKey="permanent_pincode"
            onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        {raw.edu && raw.edu.length > 0 && (
          <ReadOnlySection title="Educational details">
            {raw.edu.map((edu: any, i: number) => (
              <div
                key={i}
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  i > 0 ? "mt-4 border-t border-[#f0ebe3] pt-4" : ""
                }`}
              >
                <F
                  label="Education"
                  value={edu.education === "Other" ? edu.education_other : edu.education}
                />
                <F label="Degree" value={edu.degree === "Other" ? edu.degree_other : edu.degree} />
                <F label="Branch / specialization" value={edu.branch} />
                <F label="Institution" value={edu.institution} />
                <F label="Year of graduation" value={edu.year_of_graduation} />
                <F label="Status" value={edu.status} />
              </div>
            ))}
          </ReadOnlySection>
        )}

        {(raw.emp || raw.bus || raw.stu) && (
          <ReadOnlySection title="Professional details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {raw.emp && (
                <>
                  <F label="Employment type" value="Employee" />
                  <F
                    label="Sector"
                    value={raw.emp.sector === "Other" ? raw.emp.sector_other : raw.emp.sector}
                  />
                  <F label="Company" value={raw.emp.company} />
                  <F label="Designation" value={raw.emp.designation} />
                  <F label="Salary" value={raw.emp.salary} />
                  <F label="Work location" value={raw.emp.work_location} />
                </>
              )}
              {raw.bus && (
                <>
                  <F label="Employment type" value="Business" />
                  <F
                    label="Sector"
                    value={raw.bus.sector === "Other" ? raw.bus.sector_other : raw.bus.sector}
                  />
                  <F
                    label="Business type"
                    value={
                      raw.bus.business_type === "Other"
                        ? raw.bus.business_type_other
                        : raw.bus.business_type
                    }
                  />
                  <F label="Business name" value={raw.bus.business_name} />
                  <F label="Designation" value={raw.bus.designation} />
                  <F label="Annual returns" value={raw.bus.annual_returns} />
                  <F label="Business location" value={raw.bus.business_location} />
                </>
              )}
              {raw.stu && (
                <>
                  <F label="Employment type" value="Student" />
                  <F label="Institution" value={raw.stu.institution} />
                  <F label="Course" value={raw.stu.course} />
                  <F label="Field of study" value={raw.stu.field_of_study} />
                  <F label="Year of study" value={raw.stu.year_of_study} />
                  <F label="Expected graduation year" value={raw.stu.expected_graduation_year} />
                </>
              )}
            </div>
          </ReadOnlySection>
        )}

        <Section
          title="Family details"
          canEdit={canEdit}
          editing={ed("family")}
          saving={sv("family")}
          onEdit={() => startEdit("family")}
          onCancel={() => cancelEdit("family")}
          onSave={() => saveSection("family", "family_details", family)}
        >
          <F
            label="Father's name"
            value={family.father_name}
            editing={canEdit && ed("family")}
            fieldKey="father_name"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Father's occupation"
            value={family.father_occupation}
            editing={canEdit && ed("family")}
            fieldKey="father_occupation"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Mother's name"
            value={family.mother_name}
            editing={canEdit && ed("family")}
            fieldKey="mother_name"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Mother's occupation"
            value={family.mother_occupation}
            editing={canEdit && ed("family")}
            fieldKey="mother_occupation"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Siblings"
            value={family.siblings}
            editing={canEdit && ed("family")}
            fieldKey="siblings"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Caste"
            value={family.caste}
            options={casteOpts}
            editing={canEdit && ed("family")}
            fieldKey="caste"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Subcaste"
            value={family.subcaste}
            options={subcasteOpts}
            editing={canEdit && ed("family")}
            fieldKey="subcaste"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Kulam / kilai (optional)"
            value={family.kulam}
            editing={canEdit && ed("family")}
            fieldKey="kulam"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Gotram (optional)"
            value={family.gotram}
            editing={canEdit && ed("family")}
            fieldKey="gotram"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Family type"
            value={family.family_type}
            options={familyTypeOpts}
            editing={canEdit && ed("family")}
            fieldKey="family_type"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Family status"
            value={family.family_status}
            options={familyStatusOpts}
            editing={canEdit && ed("family")}
            fieldKey="family_status"
            onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        <Section
          title="Horoscope details"
          canEdit={canEdit}
          editing={ed("horoscope")}
          saving={sv("horoscope")}
          onEdit={() => startEdit("horoscope")}
          onCancel={() => cancelEdit("horoscope")}
          onSave={() => saveSection("horoscope", "horoscope_details", horoscope)}
        >
          <F
            label="Time of birth"
            value={horoscope.time_of_birth}
            type="time"
            editing={canEdit && ed("horoscope")}
            fieldKey="time_of_birth"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Place of birth"
            value={horoscope.place_of_birth}
            editing={canEdit && ed("horoscope")}
            fieldKey="place_of_birth"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Zodiac / moon sign"
            value={horoscope.zodiac_sign}
            options={zodiacOpts}
            editing={canEdit && ed("horoscope")}
            fieldKey="zodiac_sign"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Star"
            value={horoscope.star}
            options={starOpts}
            editing={canEdit && ed("horoscope")}
            fieldKey="star"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Lagnam"
            value={horoscope.lagnam}
            options={lagnamOpts}
            editing={canEdit && ed("horoscope")}
            fieldKey="lagnam"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
          <F
            label="Dhosham"
            value={horoscope.dhosham}
            editing={canEdit && ed("horoscope")}
            fieldKey="dhosham"
            onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        <Section
          title="Interests"
          canEdit={canEdit}
          editing={ed("interests")}
          saving={sv("interests")}
          onEdit={() => startEdit("interests")}
          onCancel={() => cancelEdit("interests")}
          onSave={() => saveSection("interests", "interests", interests)}
        >
          <F
            label="Hobbies"
            value={
              Array.isArray(interests.hobbies) ? interests.hobbies.join(", ") : interests.hobbies
            }
          />
          <F
            label="Interests"
            value={
              Array.isArray(interests.interests)
                ? interests.interests.join(", ")
                : interests.interests
            }
          />
        </Section>

        <Section
          title="Social habits"
          canEdit={canEdit}
          editing={ed("social")}
          saving={sv("social")}
          onEdit={() => startEdit("social")}
          onCancel={() => cancelEdit("social")}
          onSave={() => saveSection("social", "social_habits", social)}
        >
          <D
            label="Smoking"
            value={social.smoking}
            options={smokingOpts}
            editing={canEdit && ed("social")}
            fieldKey="smoking"
            onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Drinking"
            value={social.drinking}
            options={drinkingOpts}
            editing={canEdit && ed("social")}
            fieldKey="drinking"
            onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Parties"
            value={social.parties}
            options={partiesOpts}
            editing={canEdit && ed("social")}
            fieldKey="parties"
            onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))}
          />
          <D
            label="Pubs"
            value={social.pubs}
            options={pubsOpts}
            editing={canEdit && ed("social")}
            fieldKey="pubs"
            onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))}
          />
        </Section>

        {raw.photos &&
          (raw.photos.userPhotos?.length > 0 ||
            raw.photos.familyPhoto ||
            raw.photos.aadharFront ||
            raw.photos.aadharBack) && (
            <ReadOnlySection title="Photos">
              {raw.photos.userPhotos?.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    User photos
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {raw.photos.userPhotos.map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`User photo ${i + 1}`}
                        className="h-32 w-32 rounded-xl border-2 border-[#f0ebe3] object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-6">
                {raw.photos.familyPhoto && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Family photo
                    </p>
                    <img
                      src={raw.photos.familyPhoto}
                      alt="Family photo"
                      className="h-40 w-40 rounded-xl border-2 border-[#f0ebe3] object-cover"
                    />
                  </div>
                )}
                {raw.photos.aadharFront && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Aadhar front
                    </p>
                    <img
                      src={raw.photos.aadharFront}
                      alt="Aadhar front"
                      className="h-40 w-60 rounded-xl border-2 border-[#f0ebe3] object-cover"
                    />
                  </div>
                )}
                {raw.photos.aadharBack && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Aadhar back
                    </p>
                    <img
                      src={raw.photos.aadharBack}
                      alt="Aadhar back"
                      className="h-40 w-60 rounded-xl border-2 border-[#f0ebe3] object-cover"
                    />
                  </div>
                )}
              </div>
            </ReadOnlySection>
          )}

      </div>
    </ThemedPanel>
  )
}
