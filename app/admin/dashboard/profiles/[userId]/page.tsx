"use client"

import { supabase } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, User, Pencil, Check, X } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { useMasterData } from "@/hooks/use-master-data"
import { toast } from "sonner"

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, editing, saving, onEdit, onSave, onCancel, children }: {
    title: string; editing: boolean; saving: boolean
    onEdit: () => void; onSave: () => void; onCancel: () => void
    children: React.ReactNode
}) {
    return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400">{title}</h2>
                {editing ? (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={onCancel} className="h-7 px-2 text-xs flex items-center gap-1">
                            <X className="h-3 w-3" /> Cancel
                        </Button>
                        <Button size="sm" onClick={onSave} disabled={saving} className="h-7 px-2 text-xs flex items-center gap-1 bg-[#4B0082] hover:bg-[#3a0066] text-white">
                            <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 px-2 text-xs text-gray-500 hover:text-[#4B0082] flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Edit
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </div>
    )
}

// ─── Plain field (view / text input) ──────────────────────────────────────────
function F({ label, value, editing, fieldKey, onChange, type = "text" }: {
    label: string; value?: string | number | null
    editing?: boolean; fieldKey?: string; type?: string
    onChange?: (k: string, v: string) => void
}) {
    if (editing && fieldKey && onChange) {
        return (
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">{label}</Label>
                <Input type={type} value={value?.toString() ?? ""} onChange={e => onChange(fieldKey, e.target.value)} className="h-8 text-sm rounded-lg" />
            </div>
        )
    }
    return (
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value ?? "—"}</p>
        </div>
    )
}

// ─── Dropdown field ────────────────────────────────────────────────────────────
function D({ label, id, value, options, editing, fieldKey, onChange }: {
    label: string; id: string; value?: string | null
    options: { id: string; value: string;[key: string]: any }[]
    editing?: boolean; fieldKey?: string
    onChange?: (k: string, v: string) => void
}) {
    if (editing && fieldKey && onChange) {
        return (
            <SelectDropdown id={id} label={label} value={value ?? ""} options={options}
                onChange={v => onChange(fieldKey, v)} />
        )
    }
    return (
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value ?? "—"}</p>
        </div>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminProfileViewPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params.userId as string

    const [isLoading, setIsLoading] = useState(true)
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

    // ─── Master data ─────────────────────────────────────────────────────────────
    const { data: genderOpts } = useMasterData({ tableName: "master_gender" })
    const { data: bodyTypeOpts } = useMasterData({ tableName: "master_body_type" })
    const { data: maritalOpts } = useMasterData({ tableName: "master_marital_status" })
    const { data: foodOpts } = useMasterData({ tableName: "master_food_preferences" })
    const { data: casteOpts } = useMasterData({ tableName: "master_caste" })
    const { data: subcasteOpts } = useMasterData({ tableName: "master_subcaste" })
    const { data: kulamOpts } = useMasterData({ tableName: "master_kulam" })
    const { data: gotramOpts } = useMasterData({ tableName: "master_gotram" })
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
            const [
                { data: p }, { data: c }, { data: edu },
                { data: fam }, { data: horo }, { data: int },
                { data: soc }, { data: photos }, { data: ref },
                { data: emp }, { data: bus }, { data: stu }, { data: ur },
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
                        const { data: urlData } = await supabase.storage.from(bucket).createSignedUrl(filePath, 31536000)
                        return urlData?.signedUrl || url
                    } catch { return url }
                }

                const userPhotos = photos.user_photos || []
                const userPhotoUrls = await Promise.all(
                    userPhotos.map(async (photo: string, index: number) => {
                        if (photo.startsWith("http")) return photo
                        try {
                            const filePath = photo.includes("/") ? photo : `${userId}/photo_${index + 1}.jpg`
                            const { data: urlData } = await supabase.storage.from("user-photos").createSignedUrl(filePath, 31536000)
                            return urlData?.signedUrl || photo
                        } catch { return photo }
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
            setPersonal(p || {}); setContact(c || {}); setFamily(fam || {})
            setHoroscope(horo || {}); setInterests(int || {}); setSocial(soc || {})
            setUserRow(ur || {})
            setIsLoading(false)
        }
        load()
    }, [userId])

    const startEdit = (s: string) => setEditing(p => ({ ...p, [s]: true }))
    const cancelEdit = (s: string) => setEditing(p => ({ ...p, [s]: false }))

    const saveSection = async (section: string, table: string, data: any) => {
        setSaving(p => ({ ...p, [section]: true }))
        // Strip meta-columns and any null/undefined/empty-string values to avoid
        // violating DB check constraints on fields we didn't actually edit
        const { id, user_id, created_at, updated_at, ...rest } = data
        const fields = Object.fromEntries(
            Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== "")
        )
        const { error } = await supabase.from(table).update(fields).eq("user_id", userId)
        setSaving(p => ({ ...p, [section]: false }))
        if (error) toast.error(`Failed: ${error.message}`)
        else { toast.success(`${section} saved!`); cancelEdit(section) }
    }

    const saveUser = async () => {
        setSaving(p => ({ ...p, account: true }))
        const { error } = await supabase.from("users").update({ name: userRow.name, phone: userRow.phone }).eq("id", userId)
        setSaving(p => ({ ...p, account: false }))
        if (error) toast.error(`Failed: ${error.message}`)
        else { toast.success("Account saved!"); cancelEdit("account") }
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#4B0082]" />
        </div>
    )

    const ed = (s: string) => !!editing[s]
    const sv = (s: string) => !!saving[s]

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-[#4B0082]" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{personal?.name || userRow?.name || "Profile"}</h1>
                            <p className="text-xs text-gray-500">{userRow?.email}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.back()} variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </div>
            </div>

            <div className="relative z-10 py-8">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Account */}
                    <Section title="Account" editing={ed("account")} saving={sv("account")}
                        onEdit={() => startEdit("account")} onCancel={() => cancelEdit("account")} onSave={saveUser}>
                        <F label="Name" value={userRow.name} editing={ed("account")} fieldKey="name" onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Email" value={userRow.email} />
                        <F label="Phone" value={userRow.phone} editing={ed("account")} fieldKey="phone" onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Personal Details */}
                    <Section title="Personal Details" editing={ed("personal")} saving={sv("personal")}
                        onEdit={() => startEdit("personal")} onCancel={() => cancelEdit("personal")}
                        onSave={() => saveSection("personal", "personal_details", personal)}>
                        <F label="Full Name" value={personal.name} editing={ed("personal")} fieldKey="name" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Date of Birth" value={personal.date_of_birth} type="date" editing={ed("personal")} fieldKey="date_of_birth" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Age (auto)" value={personal.age} />
                        <D label="Gender" id="sex" value={personal.sex} options={genderOpts} editing={ed("personal")} fieldKey="sex" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Height (cm)" value={personal.height} type="number" editing={ed("personal")} fieldKey="height" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Weight (kg)" value={personal.weight} type="number" editing={ed("personal")} fieldKey="weight" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Skin Color" value={personal.skin_color} editing={ed("personal")} fieldKey="skin_color" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Body Type" id="bodyType" value={personal.body_type} options={bodyTypeOpts} editing={ed("personal")} fieldKey="body_type" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Marital Status" id="marital" value={personal.marital_status} options={maritalOpts} editing={ed("personal")} fieldKey="marital_status" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Food Preference" id="food" value={personal.food_preference} options={foodOpts} editing={ed("personal")} fieldKey="food_preference" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Languages" value={Array.isArray(personal.languages) ? personal.languages.join(", ") : personal.languages} />
                        <F label="About" value={personal.about} editing={ed("personal")} fieldKey="about" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Contact Details */}
                    <Section title="Contact Details" editing={ed("contact")} saving={sv("contact")}
                        onEdit={() => startEdit("contact")} onCancel={() => cancelEdit("contact")}
                        onSave={() => saveSection("contact", "contact_details", contact)}>
                        <F label="Phone" value={contact.phone} editing={ed("contact")} fieldKey="phone" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="WhatsApp" value={contact.whatsapp_number} editing={ed("contact")} fieldKey="whatsapp_number" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Address Line 1" value={contact.permanent_address_line1} editing={ed("contact")} fieldKey="permanent_address_line1" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Address Line 2" value={contact.permanent_address_line2} editing={ed("contact")} fieldKey="permanent_address_line2" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Area" value={contact.permanent_area} editing={ed("contact")} fieldKey="permanent_area" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="District" value={contact.permanent_district} editing={ed("contact")} fieldKey="permanent_district" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="State" value={contact.permanent_state} editing={ed("contact")} fieldKey="permanent_state" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Country" value={contact.permanent_country} editing={ed("contact")} fieldKey="permanent_country" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Pincode" value={contact.permanent_pincode} editing={ed("contact")} fieldKey="permanent_pincode" onChange={(k, v) => setContact((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Education (read-only – multi-row) */}
                    {raw.edu && raw.edu.length > 0 && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Educational Details</h2>
                            {raw.edu.map((edu: any, i: number) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <F label="Education" value={edu.education === "Other" ? edu.education_other : edu.education} />
                                    <F label="Degree" value={edu.degree === "Other" ? edu.degree_other : edu.degree} />
                                    <F label="Branch/Specialization" value={edu.branch} />
                                    <F label="Institution" value={edu.institution} />
                                    <F label="Year of Graduation" value={edu.year_of_graduation} />
                                    <F label="Status" value={edu.status} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Professional Details (read-only) */}
                    {(raw.emp || raw.bus || raw.stu) && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Professional Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {raw.emp && (
                                    <>
                                        <F label="Employment Type" value="Employee" />
                                        <F label="Sector" value={raw.emp.sector === "Other" ? raw.emp.sector_other : raw.emp.sector} />
                                        <F label="Company" value={raw.emp.company} />
                                        <F label="Designation" value={raw.emp.designation} />
                                        <F label="Salary" value={raw.emp.salary} />
                                        <F label="Work Location" value={raw.emp.work_location} />
                                    </>
                                )}
                                {raw.bus && (
                                    <>
                                        <F label="Employment Type" value="Business" />
                                        <F label="Sector" value={raw.bus.sector === "Other" ? raw.bus.sector_other : raw.bus.sector} />
                                        <F label="Business Type" value={raw.bus.business_type === "Other" ? raw.bus.business_type_other : raw.bus.business_type} />
                                        <F label="Business Name" value={raw.bus.business_name} />
                                        <F label="Designation" value={raw.bus.designation} />
                                        <F label="Annual Returns" value={raw.bus.annual_returns} />
                                        <F label="Business Location" value={raw.bus.business_location} />
                                    </>
                                )}
                                {raw.stu && (
                                    <>
                                        <F label="Employment Type" value="Student" />
                                        <F label="Institution" value={raw.stu.institution} />
                                        <F label="Course" value={raw.stu.course} />
                                        <F label="Field of Study" value={raw.stu.field_of_study} />
                                        <F label="Year of Study" value={raw.stu.year_of_study} />
                                        <F label="Expected Graduation Year" value={raw.stu.expected_graduation_year} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Family Details */}
                    <Section title="Family Details" editing={ed("family")} saving={sv("family")}
                        onEdit={() => startEdit("family")} onCancel={() => cancelEdit("family")}
                        onSave={() => saveSection("family", "family_details", family)}>
                        <F label="Father's Name" value={family.father_name} editing={ed("family")} fieldKey="father_name" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Father's Occupation" value={family.father_occupation} editing={ed("family")} fieldKey="father_occupation" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Mother's Name" value={family.mother_name} editing={ed("family")} fieldKey="mother_name" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Mother's Occupation" value={family.mother_occupation} editing={ed("family")} fieldKey="mother_occupation" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Siblings" value={family.siblings} editing={ed("family")} fieldKey="siblings" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Caste" id="caste" value={family.caste} options={casteOpts} editing={ed("family")} fieldKey="caste" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Subcaste" id="subcaste" value={family.subcaste} options={subcasteOpts} editing={ed("family")} fieldKey="subcaste" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Kulam / Kilai (Optional)" value={family.kulam} editing={ed("family")} fieldKey="kulam" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Gotram (Optional)" value={family.gotram} editing={ed("family")} fieldKey="gotram" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Family Type" id="familyType" value={family.family_type} options={familyTypeOpts} editing={ed("family")} fieldKey="family_type" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Family Status" id="familyStatus" value={family.family_status} options={familyStatusOpts} editing={ed("family")} fieldKey="family_status" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Horoscope Details */}
                    <Section title="Horoscope Details" editing={ed("horoscope")} saving={sv("horoscope")}
                        onEdit={() => startEdit("horoscope")} onCancel={() => cancelEdit("horoscope")}
                        onSave={() => saveSection("horoscope", "horoscope_details", horoscope)}>
                        <F label="Time of Birth" value={horoscope.time_of_birth} type="time" editing={ed("horoscope")} fieldKey="time_of_birth" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Place of Birth" value={horoscope.place_of_birth} editing={ed("horoscope")} fieldKey="place_of_birth" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Zodiac / Moon Sign" id="zodiac" value={horoscope.zodiac_sign} options={zodiacOpts} editing={ed("horoscope")} fieldKey="zodiac_sign" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Star" id="star" value={horoscope.star} options={starOpts} editing={ed("horoscope")} fieldKey="star" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Lagnam" id="lagnam" value={horoscope.lagnam} options={lagnamOpts} editing={ed("horoscope")} fieldKey="lagnam" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Dhosham" value={horoscope.dhosham} editing={ed("horoscope")} fieldKey="dhosham" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Interests */}
                    <Section title="Interests" editing={ed("interests")} saving={sv("interests")}
                        onEdit={() => startEdit("interests")} onCancel={() => cancelEdit("interests")}
                        onSave={() => saveSection("interests", "interests", interests)}>
                        <F label="Hobbies" value={Array.isArray(interests.hobbies) ? interests.hobbies.join(", ") : interests.hobbies} />
                        <F label="Interests" value={Array.isArray(interests.interests) ? interests.interests.join(", ") : interests.interests} />
                    </Section>

                    {/* Social Habits */}
                    <Section title="Social Habits" editing={ed("social")} saving={sv("social")}
                        onEdit={() => startEdit("social")} onCancel={() => cancelEdit("social")}
                        onSave={() => saveSection("social", "social_habits", social)}>
                        <D label="Smoking" id="smoking" value={social.smoking} options={smokingOpts} editing={ed("social")} fieldKey="smoking" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Drinking" id="drinking" value={social.drinking} options={drinkingOpts} editing={ed("social")} fieldKey="drinking" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Parties" id="parties" value={social.parties} options={partiesOpts} editing={ed("social")} fieldKey="parties" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Pubs" id="pubs" value={social.pubs} options={pubsOpts} editing={ed("social")} fieldKey="pubs" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Photos */}
                    {raw.photos && (raw.photos.userPhotos?.length > 0 || raw.photos.familyPhoto || raw.photos.aadharFront || raw.photos.aadharBack) && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Photos</h2>

                            {raw.photos.userPhotos?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">User Photos</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {raw.photos.userPhotos.map((url: string, i: number) => (
                                            <img key={i} src={url} alt={`User Photo ${i + 1}`} className="h-32 w-32 object-cover rounded-xl border border-gray-200" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-6">
                                {raw.photos.familyPhoto && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Family Photo</h3>
                                        <img src={raw.photos.familyPhoto} alt="Family Photo" className="h-40 w-40 object-cover rounded-xl border border-gray-200" />
                                    </div>
                                )}
                                {raw.photos.aadharFront && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Aadhar Front</h3>
                                        <img src={raw.photos.aadharFront} alt="Aadhar Front" className="h-40 w-60 object-cover rounded-xl border border-gray-200" />
                                    </div>
                                )}
                                {raw.photos.aadharBack && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Aadhar Back</h3>
                                        <img src={raw.photos.aadharBack} alt="Aadhar Back" className="h-40 w-60 object-cover rounded-xl border border-gray-200" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Referral (read-only) */}
                    {raw.ref && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Referral</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <F label="Referral Partner" value={raw.ref.referral_partners?.name} />
                                <F label="Referral Partner ID" value={raw.ref.referral_partner_id} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
