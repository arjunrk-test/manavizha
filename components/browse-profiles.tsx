"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Briefcase, User, GraduationCap, Calendar, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BrowseProfilesProps {
    userId: string
    onBack?: () => void
}

export function BrowseProfiles({ userId, onBack }: BrowseProfilesProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
    const [targetGender, setTargetGender] = useState<string>("")

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                // 1. Get current user gender
                const { data: userData } = await supabase
                    .from("personal_details")
                    .select("sex")
                    .eq("user_id", userId)
                    .maybeSingle()

                if (!userData) {
                    setIsLoading(false)
                    return
                }

                const myGender = userData.sex
                const tg = myGender === "Male" ? "Female" : "Male"
                setTargetGender(tg)

                // 2. Fetch target profiles
                const { data: targetProfiles } = await supabase
                    .from("personal_details")
                    .select("*")
                    .ilike("sex", tg)

                if (!targetProfiles || targetProfiles.length === 0) {
                    setIsLoading(false)
                    return
                }

                // Filter out married locally to avoid case mismatch issues
                const unmarriedProfiles = targetProfiles.filter(p => p.marital_status?.toLowerCase() !== "married")
                const targetUserIds = unmarriedProfiles.map(p => p.user_id)

                if (targetUserIds.length === 0) {
                    setIsLoading(false)
                    return
                }

                // 3. Fetch auxiliary data
                const [
                    { data: photosData },
                    { data: contactData },
                    { data: empData },
                    { data: busData },
                    { data: eduData },
                ] = await Promise.all([
                    supabase.from("photos").select("user_id, user_photos").in("user_id", targetUserIds),
                    supabase.from("contact_details").select("user_id, current_city, current_state").in("user_id", targetUserIds),
                    supabase.from("profession_employee").select("user_id, designation, company").in("user_id", targetUserIds),
                    supabase.from("profession_business").select("user_id, designation, business_name").in("user_id", targetUserIds),
                    supabase.from("education_details").select("user_id, education, institution").in("user_id", targetUserIds),
                ])

                const combined = unmarriedProfiles.map(p => {
                    const myPhotos = photosData?.find(x => x.user_id === p.user_id)
                    const myContact = contactData?.find(x => x.user_id === p.user_id)
                    const myEmp = empData?.find(x => x.user_id === p.user_id)
                    const myBus = busData?.find(x => x.user_id === p.user_id)
                    const myEdu = eduData?.filter(x => x.user_id === p.user_id)

                    let profession = "Not specified"
                    if (myEmp && myEmp.designation && myEmp.company) profession = `${myEmp.designation} at ${myEmp.company}`
                    else if (myEmp && myEmp.designation) profession = myEmp.designation
                    else if (myBus && myBus.designation && myBus.business_name) profession = `${myBus.designation} at ${myBus.business_name}`

                    let location = "Location not specified"
                    if (myContact && myContact.current_city) {
                        location = `${myContact.current_city}${myContact.current_state ? `, ${myContact.current_state}` : ''}`
                    }

                    return {
                        ...p,
                        photos: myPhotos?.user_photos || [],
                        location,
                        profession,
                        education: myEdu || [],
                    }
                })

                setProfiles(combined)
            } catch (error) {
                console.error("Error fetching profiles:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfiles()
    }, [userId])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0082]"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Heart className="h-8 w-8 text-[#FF1493]" />
                        Discover Matches
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Here are some {targetGender.toLowerCase()} profiles tailored for you
                    </p>
                </div>
                {onBack && (
                    <Button onClick={onBack} variant="outline" className="hidden sm:flex">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                )}
            </div>

            {profiles.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Profiles Found</h3>
                    <p className="text-gray-500 mt-2">Check back later for new matches!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profiles.map((profile, index) => (
                        <motion.div
                            key={profile.user_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                                onClick={() => setSelectedProfile(profile)}
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    {profile.photos && profile.photos.length > 0 ? (
                                        <img
                                            src={profile.photos[0]}
                                            alt={profile.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name || 'User') + '&size=400&background=random'
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <User className="h-16 w-16 mb-2 opacity-50" />
                                            <span className="text-sm">No Photo</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4">
                                        <h3 className="text-white font-semibold text-lg drop-shadow-md">
                                            {profile.name || "Unknown"}
                                            {profile.age && `, ${profile.age}`}
                                        </h3>
                                        <div className="flex items-center text-white/90 text-sm mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {profile.location}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                        <Briefcase className="h-4 w-4 mr-2 shrink-0" />
                                        <span className="truncate">{profile.profession}</span>
                                    </div>
                                    {profile.education && profile.education.length > 0 && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                            <GraduationCap className="h-4 w-4 mr-2 shrink-0" />
                                            <span className="truncate">{profile.education[0]?.education || "Not specified"}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Profile Detail Dialog */}
            <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white dark:bg-gray-900 border-none rounded-2xl">
                    {selectedProfile && (
                        <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px]">
                            {/* Left side: Photo Gallery */}
                            <div className="md:w-2/5 bg-gray-100 dark:bg-gray-800 relative">
                                {selectedProfile.photos && selectedProfile.photos.length > 0 ? (
                                    <img
                                        src={selectedProfile.photos[0]}
                                        alt={selectedProfile.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedProfile.name || 'User') + '&size=400&background=random'
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <User className="h-24 w-24 mb-4 opacity-50" />
                                        <span>No Photos Uploaded</span>
                                    </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white md:hidden">
                                    <h2 className="text-2xl font-bold">{selectedProfile.name}{selectedProfile.age && `, ${selectedProfile.age}`}</h2>
                                </div>
                            </div>

                            {/* Right side: Details */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                                <div className="hidden md:block mb-6">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {selectedProfile.name}{selectedProfile.age && <span className="text-gray-500 font-normal">, {selectedProfile.age}</span>}
                                    </h2>
                                    <p className="text-[#4B0082] font-medium text-lg">{selectedProfile.profession}</p>
                                </div>

                                <div className="space-y-8">
                                    {/* About */}
                                    {selectedProfile.about && (
                                        <section>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                                <User className="h-5 w-5 mr-2 text-pink-500" /> About Me
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl">
                                                {selectedProfile.about}
                                            </p>
                                        </section>
                                    )}

                                    {/* Quick Info Grid */}
                                    <section>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                            <Heart className="h-5 w-5 mr-2 text-red-500" /> Basic Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                            <div>
                                                <span className="block text-gray-500 mb-1">Location</span>
                                                <span className="font-medium text-gray-900 dark:text-white flex items-center">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {selectedProfile.location}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 mb-1">Height</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {selectedProfile.height || "Not specified"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 mb-1">Mother Tongue</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {selectedProfile.mother_tongue || "Not specified"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 mb-1">Diet</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {selectedProfile.food_preference || "Not specified"}
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Education & Career */}
                                    <section>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                            <GraduationCap className="h-5 w-5 mr-2 text-blue-500" /> Education & Career
                                        </h3>
                                        <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                            <div className="flex gap-3">
                                                <Briefcase className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedProfile.profession}</p>
                                                    <p className="text-sm text-gray-500">Current Work</p>
                                                </div>
                                            </div>

                                            {selectedProfile.education && selectedProfile.education.map((edu: any, i: number) => (
                                                <div key={i} className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <GraduationCap className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{edu.education}</p>
                                                        {edu.institution && <p className="text-sm text-gray-500">{edu.institution}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
