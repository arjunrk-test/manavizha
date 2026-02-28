"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, User, Pencil, Check, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { useMasterData } from "@/hooks/use-master-data"
import { toast } from "sonner"
import { motion } from "framer-motion"

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, canEdit, editing, saving, onEdit, onSave, onCancel, children }: {
    title: string
    canEdit: boolean
    editing: boolean
    saving: boolean
    onEdit: () => void
    onSave: () => void
    onCancel: () => void
    children: React.ReactNode
}) {
    return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400">{title}</h2>
                {canEdit ? (
                    editing ? (
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
                    )
                ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </div>
    )
}

// ─── Plain field (view / text input) ────────────────────────────────────────
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

// ─── Dropdown field ──────────────────────────────────────────────────────────
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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ReferralPartnerMyProfilePage() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [canEdit, setCanEdit] = useState(false)
    const [partnerInfo, setPartnerInfo] = useState<any>(null)

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

    // ─── Master data ────────────────────────────────────────────────────────
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
        const init = async () => {
            // 1. Auth check
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/referral-partner")
                return
            }

            // 2. Verify referral partner + get can_edit_profile
            const { data: partnerData, error: partnerError } = await supabase
                .from("referral_partners")
                .select("user_id, partner_id, name, email, can_edit_profile")
                .eq("user_id", user.id)
                .single()

            if (partnerError || !partnerData) {
                await supabase.auth.signOut()
                router.push("/referral-partner")
                return
            }

            setUserId(user.id)
            setCanEdit(!!partnerData.can_edit_profile)
            setPartnerInfo(partnerData)

            // 3. Load all profile tables
            await loadProfile(user.id)
            setIsLoading(false)
        }
        init()
    }, [router])

    const loadProfile = async (uid: string) => {
        const [
            { data: p }, { data: c }, { data: edu },
            { data: fam }, { data: horo }, { data: int },
            { data: soc }, { data: photos }, { data: ref },
            { data: emp }, { data: bus }, { data: stu }, { data: ur },
        ] = await Promise.all([
            supabase.from("personal_details").select("*").eq("user_id", uid).single(),
            supabase.from("contact_details").select("*").eq("user_id", uid).single(),
            supabase.from("education_details").select("*").eq("user_id", uid),
            supabase.from("family_details").select("*").eq("user_id", uid).single(),
            supabase.from("horoscope_details").select("*").eq("user_id", uid).single(),
            supabase.from("interests").select("*").eq("user_id", uid).single(),
            supabase.from("social_habits").select("*").eq("user_id", uid).single(),
            supabase.from("photos").select("*").eq("user_id", uid),
            supabase.from("referral_details").select("*, referral_partners(name)").eq("user_id", uid).single(),
            supabase.from("profession_employee").select("*").eq("user_id", uid).single(),
            supabase.from("profession_business").select("*").eq("user_id", uid).single(),
            supabase.from("profession_student").select("*").eq("user_id", uid).single(),
            supabase.from("users").select("email, name, phone").eq("id", uid).single(),
        ])
        setRaw({ edu, photos, ref, emp, bus, stu })
        setPersonal(p || {}); setContact(c || {}); setFamily(fam || {})
        setHoroscope(horo || {}); setInterests(int || {}); setSocial(soc || {})
        setUserRow(ur || {})
    }

    const startEdit = (s: string) => setEditing(prev => ({ ...prev, [s]: true }))
    const cancelEdit = (s: string) => setEditing(prev => ({ ...prev, [s]: false }))

    const saveSection = async (section: string, table: string, data: any) => {
        setSaving(prev => ({ ...prev, [section]: true }))
        const { id, user_id, created_at, updated_at, ...rest } = data
        const fields = Object.fromEntries(
            Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== "")
        )
        const { error } = await supabase.from(table).update(fields).eq("user_id", userId)
        setSaving(prev => ({ ...prev, [section]: false }))
        if (error) toast.error(`Failed: ${error.message}`)
        else { toast.success(`${section} saved!`); cancelEdit(section) }
    }

    const saveUser = async () => {
        setSaving(prev => ({ ...prev, account: true }))
        const { error } = await supabase.from("users").update({ name: userRow.name, phone: userRow.phone }).eq("id", userId)
        setSaving(prev => ({ ...prev, account: false }))
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
            {/* Animated gradient background */}
            <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
            <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

            {/* Decorative blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
                />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-[#4B0082]" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {personal?.name || userRow?.name || "My Profile"}
                            </h1>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">{userRow?.email}</p>
                                {!canEdit && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                        <Lock className="h-2.5 w-2.5" /> View Only
                                    </span>
                                )}
                                {canEdit && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                        <Pencil className="h-2.5 w-2.5" /> Edit Enabled
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => router.push("/referral-partner/dashboard")} variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </div>
            </div>

            <div className="relative z-10 py-8 pb-24">
                <div className="max-w-4xl mx-auto px-4">

                    {/* Account */}
                    <Section title="Account" canEdit={canEdit} editing={ed("account")} saving={sv("account")}
                        onEdit={() => startEdit("account")} onCancel={() => cancelEdit("account")} onSave={saveUser}>
                        <F label="Name" value={userRow.name} editing={canEdit && ed("account")} fieldKey="name" onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Email" value={userRow.email} />
                        <F label="Phone" value={userRow.phone} editing={canEdit && ed("account")} fieldKey="phone" onChange={(k, v) => setUserRow((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Personal Details */}
                    <Section title="Personal Details" canEdit={canEdit} editing={ed("personal")} saving={sv("personal")}
                        onEdit={() => startEdit("personal")} onCancel={() => cancelEdit("personal")}
                        onSave={() => saveSection("personal", "personal_details", personal)}>
                        <F label="Full Name" value={personal.name} editing={canEdit && ed("personal")} fieldKey="name" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Date of Birth" value={personal.dob} type="date" editing={canEdit && ed("personal")} fieldKey="dob" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Age (auto)" value={personal.age} />
                        <D label="Gender" id="sex" value={personal.sex} options={genderOpts} editing={canEdit && ed("personal")} fieldKey="sex" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Height (cm)" value={personal.height} type="number" editing={canEdit && ed("personal")} fieldKey="height" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Weight (kg)" value={personal.weight} type="number" editing={canEdit && ed("personal")} fieldKey="weight" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Complexion" value={personal.complexion} editing={canEdit && ed("personal")} fieldKey="complexion" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Body Type" id="bodyType" value={personal.body_type} options={bodyTypeOpts} editing={canEdit && ed("personal")} fieldKey="body_type" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Marital Status" id="marital" value={personal.marital_status} options={maritalOpts} editing={canEdit && ed("personal")} fieldKey="marital_status" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Food Preference" id="food" value={personal.food_preference} options={foodOpts} editing={canEdit && ed("personal")} fieldKey="food_preference" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                        <F label="About" value={personal.about} editing={canEdit && ed("personal")} fieldKey="about" onChange={(k, v) => setPersonal((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Contact Details */}
                    <Section title="Contact Details" canEdit={canEdit} editing={ed("contact")} saving={sv("contact")}
                        onEdit={() => startEdit("contact")} onCancel={() => cancelEdit("contact")}
                        onSave={() => saveSection("contact", "contact_details", contact)}>
                        {(["phone", "address", "city", "state", "country", "pincode"] as const).map(k => (
                            <F key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={contact[k]}
                                editing={canEdit && ed("contact")} fieldKey={k} onChange={(fk, v) => setContact((p: any) => ({ ...p, [fk]: v }))} />
                        ))}
                    </Section>

                    {/* Education (read-only – multi-row) */}
                    {raw.edu && raw.edu.length > 0 && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Educational Details</h2>
                            {raw.edu.map((edu: any, i: number) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <F label="Degree" value={edu.degree} />
                                    <F label="Institution" value={edu.institution} />
                                    <F label="Year of Passing" value={edu.year_of_passing} />
                                    <F label="Specialization" value={edu.specialization} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Family Details */}
                    <Section title="Family Details" canEdit={canEdit} editing={ed("family")} saving={sv("family")}
                        onEdit={() => startEdit("family")} onCancel={() => cancelEdit("family")}
                        onSave={() => saveSection("family", "family_details", family)}>
                        <F label="Father's Name" value={family.father_name} editing={canEdit && ed("family")} fieldKey="father_name" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Father's Occupation" value={family.father_occupation} editing={canEdit && ed("family")} fieldKey="father_occupation" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Mother's Name" value={family.mother_name} editing={canEdit && ed("family")} fieldKey="mother_name" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Mother's Occupation" value={family.mother_occupation} editing={canEdit && ed("family")} fieldKey="mother_occupation" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Siblings" value={family.siblings} editing={canEdit && ed("family")} fieldKey="siblings" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Caste" id="caste" value={family.caste} options={casteOpts} editing={canEdit && ed("family")} fieldKey="caste" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Subcaste" id="subcaste" value={family.subcaste} options={subcasteOpts} editing={canEdit && ed("family")} fieldKey="subcaste" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Kulam" id="kulam" value={family.kulam} options={kulamOpts} editing={canEdit && ed("family")} fieldKey="kulam" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Gotram" id="gotram" value={family.gotram} options={gotramOpts} editing={canEdit && ed("family")} fieldKey="gotram" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Family Type" id="familyType" value={family.family_type} options={familyTypeOpts} editing={canEdit && ed("family")} fieldKey="family_type" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Family Status" id="familyStatus" value={family.family_status} options={familyStatusOpts} editing={canEdit && ed("family")} fieldKey="family_status" onChange={(k, v) => setFamily((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Horoscope Details */}
                    <Section title="Horoscope Details" canEdit={canEdit} editing={ed("horoscope")} saving={sv("horoscope")}
                        onEdit={() => startEdit("horoscope")} onCancel={() => cancelEdit("horoscope")}
                        onSave={() => saveSection("horoscope", "horoscope_details", horoscope)}>
                        <F label="Time of Birth" value={horoscope.time_of_birth} type="time" editing={canEdit && ed("horoscope")} fieldKey="time_of_birth" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Place of Birth" value={horoscope.place_of_birth} editing={canEdit && ed("horoscope")} fieldKey="place_of_birth" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Zodiac / Moon Sign" id="zodiac" value={horoscope.zodiac_sign} options={zodiacOpts} editing={canEdit && ed("horoscope")} fieldKey="zodiac_sign" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Star" id="star" value={horoscope.star} options={starOpts} editing={canEdit && ed("horoscope")} fieldKey="star" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Lagnam" id="lagnam" value={horoscope.lagnam} options={lagnamOpts} editing={canEdit && ed("horoscope")} fieldKey="lagnam" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                        <F label="Dhosham" value={horoscope.dhosham} editing={canEdit && ed("horoscope")} fieldKey="dhosham" onChange={(k, v) => setHoroscope((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Interests */}
                    <Section title="Interests" canEdit={canEdit} editing={ed("interests")} saving={sv("interests")}
                        onEdit={() => startEdit("interests")} onCancel={() => cancelEdit("interests")}
                        onSave={() => saveSection("interests", "interests", interests)}>
                        {(["hobbies", "sports", "music", "preferred_partner"] as const).map(k => (
                            <F key={k} label={k.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} value={interests[k]}
                                editing={canEdit && ed("interests")} fieldKey={k} onChange={(fk, v) => setInterests((p: any) => ({ ...p, [fk]: v }))} />
                        ))}
                    </Section>

                    {/* Social Habits */}
                    <Section title="Social Habits" canEdit={canEdit} editing={ed("social")} saving={sv("social")}
                        onEdit={() => startEdit("social")} onCancel={() => cancelEdit("social")}
                        onSave={() => saveSection("social", "social_habits", social)}>
                        <D label="Smoking" id="smoking" value={social.smoking} options={smokingOpts} editing={canEdit && ed("social")} fieldKey="smoking" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Drinking" id="drinking" value={social.drinking} options={drinkingOpts} editing={canEdit && ed("social")} fieldKey="drinking" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Parties" id="parties" value={social.parties} options={partiesOpts} editing={canEdit && ed("social")} fieldKey="parties" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                        <D label="Pubs" id="pubs" value={social.pubs} options={pubsOpts} editing={canEdit && ed("social")} fieldKey="pubs" onChange={(k, v) => setSocial((p: any) => ({ ...p, [k]: v }))} />
                    </Section>

                    {/* Photos */}
                    {raw.photos && raw.photos.length > 0 && (
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-[#4B0082] dark:text-purple-400 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">Photos</h2>
                            <div className="flex flex-wrap gap-3">
                                {raw.photos.map((p: any, i: number) => (
                                    <img key={i} src={p.url || p.photo_url} alt={`Photo ${i + 1}`} className="h-32 w-32 object-cover rounded-xl border border-gray-200" />
                                ))}
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
