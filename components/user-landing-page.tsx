"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  User, 
  CheckCircle2, 
  Edit, 
  ArrowRight, 
  Heart, 
  Users, 
  Sparkles
} from "lucide-react"

interface UserLandingPageProps {
  userEmail: string
  onNavigateToProfileSetup: () => void
}

interface ProfileData {
  name?: string
  age?: string
  occupation?: string
  sex?: string
}

export function UserLandingPage({ userEmail, onNavigateToProfileSetup }: UserLandingPageProps) {
  // Placeholder data for UI demonstration
  // TODO: Replace with actual data fetching when database is ready
  const profile = null as ProfileData | null // No profile data yet
  const completionPercentage = 0
  const userName = userEmail.split("@")[0]
  const isProfileComplete = false

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-[#4B0082]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {userName}! 👋
            </h1>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400">
            We're excited to help you find your perfect match
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <User className="h-6 w-6 text-[#4B0082]" />
                      Profile Status
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Complete your profile to increase your match potential
                    </CardDescription>
                  </div>
                  {isProfileComplete && (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Completion
                      </span>
                      <span className="text-sm font-bold text-[#4B0082]">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Profile Info */}
                  {profile && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {profile.name && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                        </div>
                      )}
                      {profile.age && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.age}</p>
                        </div>
                      )}
                      {profile.occupation && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Occupation</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.occupation}</p>
                        </div>
                      )}
                      {profile.sex && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.sex}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={onNavigateToProfileSetup}
                    className="w-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:opacity-90 text-white font-semibold py-6 text-lg"
                  >
                    {isProfileComplete ? (
                      <>
                        <Edit className="h-5 w-5 mr-2" />
                        Update Profile
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Complete Your Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-700/60 shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4B0082]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 hover:bg-[#4B0082]/10 hover:border-[#4B0082]"
                  disabled
                >
                  <Heart className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">View Matches</div>
                    <div className="text-xs text-gray-500">Coming soon</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 hover:bg-[#4B0082]/10 hover:border-[#4B0082]"
                  disabled
                >
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Browse Profiles</div>
                    <div className="text-xs text-gray-500">Coming soon</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

