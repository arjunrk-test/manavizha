"use client"

import { ReferralPartnerNavbar } from "@/components/referral-partner-navbar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Award, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Handshake,
  Target,
  BarChart3,
  Mail,
  Phone
} from "lucide-react"
import { useState } from "react"
import { ReferralPartnerAuthDialog } from "@/components/referral-partner-auth-dialog"

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Commissions",
    description: "Get rewarded for every successful referral. Competitive commission structure with timely payouts.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    iconBg: "bg-green-500",
  },
  {
    icon: Users,
    title: "Expand Your Network",
    description: "Connect with families and build meaningful relationships while helping people find their perfect match.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    iconBg: "bg-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Scale your referral business with our comprehensive partner program and dedicated support team.",
    color: "from-[#4B0082] to-[#1F4068]",
    bgColor: "from-[#4B0082]/10 to-[#1F4068]/10 dark:from-[#4B0082]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#4B0082]",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "Partner with a verified, secure platform trusted by thousands of families across the country.",
    color: "from-[#FF1493] to-[#4B0082]",
    bgColor: "from-[#FF1493]/10 to-[#4B0082]/10 dark:from-[#FF1493]/30 dark:to-[#4B0082]/30",
    iconBg: "bg-[#FF1493]",
  },
  {
    icon: Award,
    title: "Recognition & Rewards",
    description: "Earn badges, recognition, and exclusive rewards as you reach milestones in your referral journey.",
    color: "from-[#FFA500] to-[#FF1493]",
    bgColor: "from-[#FFA500]/10 to-[#FF1493]/10 dark:from-[#FFA500]/30 dark:to-[#FF1493]/30",
    iconBg: "bg-[#FFA500]",
  },
  {
    icon: Zap,
    title: "Easy Process",
    description: "Simple onboarding, intuitive dashboard, and all the tools you need to succeed as a referral partner.",
    color: "from-[#FFA500] to-[#1F4068]",
    bgColor: "from-[#FFA500]/10 to-[#1F4068]/10 dark:from-[#FFA500]/30 dark:to-[#1F4068]/30",
    iconBg: "bg-[#FFA500]",
  },
]

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your referral partner account with just a few simple steps. Complete your profile and verification.",
    icon: Handshake,
  },
  {
    number: "02",
    title: "Get Your Partner ID",
    description: "Receive your unique partner ID that you can use to track referrals and earn commissions.",
    icon: Target,
  },
  {
    number: "03",
    title: "Start Referring",
    description: "Share your partner link and start referring families. Track your performance in real-time.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "Earn Rewards",
    description: "Get paid for successful referrals. Enjoy competitive commissions and timely payouts.",
    icon: DollarSign,
  },
]

export default function ReferralPartnerPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <main className="min-h-screen relative">
      <ReferralPartnerNavbar />
      <ReferralPartnerAuthDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay to lighten the gradient */}
        <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
        
        {/* Overlay pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        
        {/* Modern grid overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
        
        {/* Decorative elements */}
        <div className="fixed inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          />
        </div>

        {/* Animated PNG Background Images */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[
            "/patterns/pattern1.png",
            "/patterns/pattern2.png",
            "/patterns/pattern3.png",
            "/patterns/pattern4.png",
            "/patterns/pattern5.png",
            "/patterns/pattern6.png",
            "/patterns/pattern7.png",
          ].map((imagePath, i) => {
            const baseX = 5 + (i * 13) % 82
            const baseY = 8 + (i * 15) % 75
            const size = 280 + (i % 3) * 80
            const fadeDuration = 8 + (i % 4)
            const rotateDuration = 60 + i * 8
            const moveDuration = 12 + (i % 6)
            
            return (
              <motion.div
                key={`bg-image-${i}`}
                className="absolute"
                style={{
                  left: `${baseX}%`,
                  top: `${baseY}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                initial={{ opacity: 0.15 }}
                animate={{
                  opacity: [0.1, 0.25, 0.15, 0.25, 0.1],
                  rotate: [0, 360],
                  x: [-40, 40, -40],
                }}
                transition={{
                  opacity: {
                    duration: fadeDuration,
                    repeat: Infinity,
                    delay: i * 1.2,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: rotateDuration,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  x: {
                    duration: moveDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.7,
                  },
                }}
              >
                <img
                  src={imagePath}
                  alt={`Background pattern ${i + 1}`}
                  className="w-full h-full object-contain"
                  style={{
                    filter: "brightness(0) invert(1)",
                    mixBlendMode: "screen",
                  }}
                  onError={(e) => {
                    console.warn(`Image not found: ${imagePath}`)
                    e.currentTarget.style.display = "none"
                  }}
                />
              </motion.div>
            )
          })}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1493] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1493]"></span>
              </span>
              Join 500+ Active Partners
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Become a Referral Partner
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                & Earn with Every Match
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Help families find their perfect match while building a rewarding business. 
              Join our network of trusted referral partners and start earning today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:from-[#4B0082] hover:via-[#FF1493] hover:to-[#1F4068] text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 hover:border-[#4B0082] text-gray-900 dark:text-white px-8 py-6 text-lg font-semibold"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#4B0082]/50 via-[#FF1493]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Become a Partner?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the benefits of joining our referral partner program
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${benefit.iconBg} text-white rounded-lg p-1.5`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-[#181818]/40" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in just four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.number}
                      </div>
                    </div>
                    <div className="mt-6 mb-4 flex justify-center">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#4B0082]/10 to-[#FF1493]/10 dark:from-[#4B0082]/30 dark:to-[#FF1493]/30">
                        <Icon className="h-8 w-8 text-[#4B0082] dark:text-[#FF1493]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#4B0082] to-[#FF1493] -translate-y-1/2 z-0" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/40 dark:bg-[#181818]/40" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 lg:p-16 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of successful referral partners and start earning today. 
              Sign up now and get your unique partner ID.
            </p>
            <Button
              size="lg"
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:from-[#4B0082] hover:via-[#FF1493] hover:to-[#1F4068] text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold group"
            >
              Become a Partner Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#4B0082]/50 via-[#FF1493]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
        
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Have Questions?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Get in touch with our partner support team
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="mailto:arjun.rksaravanan@gmail.com"
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-gray-900 dark:text-white hover:border-[#4B0082] transition-all shadow-sm hover:shadow-md"
              >
                <Mail className="h-5 w-5 text-[#4B0082]" />
                <span className="font-medium">arjun.rksaravanan@gmail.com</span>
              </a>
              <a
                href="tel:+918072734996"
                className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 text-gray-900 dark:text-white hover:border-[#4B0082] transition-all shadow-sm hover:shadow-md"
              >
                <Phone className="h-5 w-5 text-[#4B0082]" />
                <span className="font-medium">+91 8072734996</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
