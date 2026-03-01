"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Save, Heart } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useMasterData } from "@/hooks/use-master-data"
import { SelectDropdown } from "@/components/ui/select-dropdown"
import { CustomSelectDropdown } from "@/components/ui/custom-select-dropdown"

interface PartnerPreferencesFormProps {
    userId: string
    onBack: () => void
}

export function PartnerPreferencesForm({ userId, onBack }: PartnerPreferencesFormProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        minAge: "",
        maxAge: "",
        minHeight: "",
        maxHeight: "",
        maritalStatus: "",
        education: "",
        employmentType: "",
        sector: "",
        sectorOther: "",
        location: "",
        diet: "",
        smoking: "",
        drinking: "",
    })

    const { data: foodPreferenceOptions } = useMasterData({ tableName: "master_food_preferences" })
    const { data: smokingOptions } = useMasterData({ tableName: "master_smoking" })
    const { data: drinkingOptions } = useMasterData({ tableName: "master_drinking" })
    const { data: maritalStatusOptions } = useMasterData({ tableName: "master_marital_status" })
    const { data: employmentTypeOptions } = useMasterData({ tableName: "master_employment_type" })
    const { data: sectorOptions } = useMasterData({ tableName: "master_sector" })

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from("partner_preferences")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle()

                if (error && error.code !== "PGRST116") {
                    console.error("Error fetching preferences:", error)
                    return
                }

                if (data) {
                    setFormData({
                        minAge: data.min_age?.toString() || "",
                        maxAge: data.max_age?.toString() || "",
                        minHeight: data.min_height?.toString() || "",
                        maxHeight: data.max_height?.toString() || "",
                        maritalStatus: (data.marital_status || []).join(", "),
                        education: (data.education || []).join(", "),
                        employmentType: (data.employment_type || []).join(", "),
                        sector: (data.sector || []).some((s: string) => !sectorOptions.map((opt: { value: string }) => opt.value.toLowerCase()).includes(s.toLowerCase())) && !data.sector.includes("Other") ? "Other" : (data.sector || []).join(", "),
                        sectorOther: (data.sector || []).some((s: string) => !sectorOptions.map((opt: { value: string }) => opt.value.toLowerCase()).includes(s.toLowerCase())) && !data.sector.includes("Other") ? (data.sector || []).join(", ") : "",
                        location: (data.location || []).join(", "),
                        diet: (data.diet || []).join(", "),
                        smoking: (data.smoking || []).join(", "),
                        drinking: (data.drinking || []).join(", "),
                    })
                }
            } catch (error) {
                console.error("Error connecting to Supabase:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPreferences()
    }, [userId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const dataToSave = {
                user_id: userId,
                min_age: formData.minAge ? parseInt(formData.minAge) : null,
                max_age: formData.maxAge ? parseInt(formData.maxAge) : null,
                min_height: formData.minHeight ? parseInt(formData.minHeight) : null,
                max_height: formData.maxHeight ? parseInt(formData.maxHeight) : null,
                marital_status: formData.maritalStatus ? formData.maritalStatus.split(",").map(s => s.trim()).filter(Boolean) : null,
                education: formData.education ? formData.education.split(",").map(s => s.trim()).filter(Boolean) : null,
                employment_type: formData.employmentType ? formData.employmentType.split(",").map(s => s.trim()).filter(Boolean) : null,
                sector: formData.sector ? (formData.sector === "Other" && formData.sectorOther ? [formData.sectorOther.trim()] : formData.sector.split(",").map(s => s.trim()).filter(Boolean)) : null,
                location: formData.location ? formData.location.split(",").map(s => s.trim()).filter(Boolean) : null,
                diet: formData.diet ? formData.diet.split(",").map(s => s.trim()).filter(Boolean) : null,
                smoking: formData.smoking ? formData.smoking.split(",").map(s => s.trim()).filter(Boolean) : null,
                drinking: formData.drinking ? formData.drinking.split(",").map(s => s.trim()).filter(Boolean) : null,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from("partner_preferences")
                .upsert(dataToSave, { onConflict: "user_id" })

            if (error) {
                throw error
            }

            toast.success("Partner preferences saved successfully!")
            onBack()
        } catch (error: any) {
            console.error("Error saving preferences:", error)
            toast.error("Failed to save preferences. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Button onClick={onBack} variant="ghost" className="mb-2 -ml-4 hover:bg-transparent hover:text-[#4B0082]">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Heart className="h-8 w-8 text-[#FF1493]" />
                        Partner Preferences
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Tell us what you are looking for in a partner. We'll use this to filter your matches.
                    </p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-white/95 dark:bg-gray-800/95 shadow-xl border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
                    <form onSubmit={handleSave}>
                        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-6">
                            <CardTitle className="text-xl text-[#4B0082] dark:text-[#a16ee8]">Set Your Criteria</CardTitle>
                            <CardDescription>
                                Leave fields empty if you don't have a specific preference. For multiple values, separate them with commas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8 text-sm">

                            {/* Age and Height */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Age Range</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minAge">Min Age</Label>
                                            <Input id="minAge" name="minAge" type="number" placeholder="e.g. 24" value={formData.minAge} onChange={handleChange} min="18" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxAge">Max Age</Label>
                                            <Input id="maxAge" name="maxAge" type="number" placeholder="e.g. 30" value={formData.maxAge} onChange={handleChange} min="18" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Height Range (cm)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minHeight">Min Height</Label>
                                            <Input id="minHeight" name="minHeight" type="number" placeholder="e.g. 150" value={formData.minHeight} onChange={handleChange} min="100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxHeight">Max Height</Label>
                                            <Input id="maxHeight" name="maxHeight" type="number" placeholder="e.g. 180" value={formData.maxHeight} onChange={handleChange} min="100" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background & Location */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Background & Location</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectDropdown
                                        id="maritalStatus"
                                        label="Marital Status"
                                        value={formData.maritalStatus}
                                        onChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}
                                        options={maritalStatusOptions}
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Preferred Location(s)</Label>
                                        <Input id="location" name="location" placeholder="e.g. Chennai, Bangalore" value={formData.location} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="education">Education</Label>
                                        <Input id="education" name="education" placeholder="e.g. BE, MBA" value={formData.education} onChange={handleChange} />
                                    </div>
                                    <SelectDropdown
                                        id="employmentType"
                                        label="Employment Type"
                                        value={formData.employmentType}
                                        onChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                                        options={employmentTypeOptions}
                                    />
                                    {formData.employmentType && (formData.employmentType.toLowerCase().includes('employee') || formData.employmentType.toLowerCase().includes('business')) && (
                                        <CustomSelectDropdown
                                            id="sector"
                                            label="Sector"
                                            value={formData.sector}
                                            onChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                                            options={sectorOptions}
                                            showOtherInput={sectorOptions.some(opt => opt.value.toLowerCase() === "other")}
                                            otherValue={formData.sectorOther}
                                            onOtherChange={(value) => setFormData(prev => ({ ...prev, sectorOther: value }))}
                                            otherPlaceholder="Please specify sector"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Lifestyle</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <SelectDropdown
                                        id="diet"
                                        label="Diet Preferences"
                                        value={formData.diet}
                                        onChange={(value) => setFormData(prev => ({ ...prev, diet: value }))}
                                        options={foodPreferenceOptions}
                                    />
                                    <SelectDropdown
                                        id="smoking"
                                        label="Smoking Habits"
                                        value={formData.smoking}
                                        onChange={(value) => setFormData(prev => ({ ...prev, smoking: value }))}
                                        options={smokingOptions}
                                    />
                                    <SelectDropdown
                                        id="drinking"
                                        label="Drinking Habits"
                                        value={formData.drinking}
                                        onChange={(value) => setFormData(prev => ({ ...prev, drinking: value }))}
                                        options={drinkingOptions}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-[#1F4068] to-[#4B0082] text-white hover:opacity-90 px-8 py-6 text-lg relative group overflow-hidden shadow-lg shadow-[#4B0082]/20 border-0">
                                    <span className="relative z-10 flex items-center">
                                        <Save className={`mr-2 h-5 w-5 ${isSaving ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                                        {isSaving ? "Saving Preferences..." : "Save Preferences"}
                                    </span>
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
