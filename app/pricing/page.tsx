"use client"

import { motion } from "framer-motion"
import { Check, Star, Gem, Crown, Shield, ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { AnimatedBackground } from "@/components/animated-background"

const plans = [
  {
    name: "Prime",
    duration: "Flexible Validity",
    price: "2,000",
    originalPrice: "2,999",
    icon: <Shield className="h-6 w-6 text-blue-500" />,
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-200 dark:border-blue-900/50",
    badge: null,
    features: [
      "Explore ID verified Prime & regular matches with photos",
      "Send unlimited messages & chat*",
      "Connect with preferred matches",
      "View unlimited Mobile Numbers*",
      "Check compatibility with unlimited horoscopes"
    ]
  },
  {
    name: "PRIME Gold",
    duration: "6 Months Validity",
    price: "6,000",
    originalPrice: "7,499",
    icon: <Star className="h-6 w-6 text-amber-500" />,
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-400 dark:border-amber-500/50",
    badge: "Most Popular",
    features: [
      "Explore ID verified Prime & regular matches with photos",
      "Send unlimited messages & chat*",
      "Connect with preferred matches",
      "View unlimited Mobile Numbers*",
      "Check compatibility with unlimited horoscopes"
    ]
  },
  {
    name: "Elite Assisted",
    duration: "1 Year Validity",
    price: "10,000",
    originalPrice: "12,999",
    icon: <Gem className="h-6 w-6 text-purple-500" />,
    gradient: "from-purple-500/10 to-indigo-500/10",
    border: "border-purple-200 dark:border-purple-900/50",
    badge: "Premium Choice",
    features: [
      "Dedicated Sr. Relationship manager",
      "Get more matches across entire Matrimony group",
      "Get more responses: Free members can message you",
      "All benefits of the Prime Gold package",
      "Chance to be part of exclusive Elite database"
    ]
  },
  {
    name: "Till You Marry",
    duration: "Lifetime Validity",
    price: "10,000",
    originalPrice: "15,999",
    icon: <Crown className="h-6 w-6 text-pink-500" />,
    gradient: "from-pink-500/10 to-rose-500/10",
    border: "border-pink-200 dark:border-pink-900/50",
    badge: "Best Value",
    features: [
      "Lifetime access to all Prime features",
      "Explore ID verified Prime & regular matches",
      "Send unlimited messages & chat*",
      "Connect with preferred matches without limits",
      "Endless horoscope compatibility checks"
    ]
  }
]

export default function PricingPage() {
  const handleUpgradeClick = () => {
    // Scroll to contact or modal trigger
    const phoneNumber = "919876543210" // Replace with actual admin number
    const message = "Hi, I am interested in upgrading my Manavizha account to a Premium Plan. Please guide me."
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-[#FF1493]/30">
      <AnimatedBackground />
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Find Your Perfect Match with <span className="bg-gradient-to-r from-[#FF1493] to-[#4B0082] bg-clip-text text-transparent">Premium</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              Unlock complete profiles, direct messaging, and priority matching. View our exclusive plans and get married sooner.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`relative flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 border-2 ${plan.border} overflow-hidden`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-[#FF1493] to-[#4B0082] py-1.5 text-center text-[10px] md:text-xs font-bold text-white uppercase tracking-widest z-10">
                    {plan.badge}
                  </div>
                )}

                <div className={`p-6 xl:p-8 flex-1 flex flex-col ${plan.badge ? 'pt-10 hover:!pt-[2.6rem]' : ''} transition-all`}>
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${plan.gradient} w-fit mb-6 ring-1 ring-black/5 dark:ring-white/10`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-6">{plan.duration}</p>
                  
                  <div className="mb-6 space-y-1">
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{plan.price}</span>
                    </div>
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-400 line-through decoration-red-500/50">
                        ₹{plan.originalPrice}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-200 transition-all">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleUpgradeClick}
                    className="w-full h-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-2 group mt-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact to Upgrade
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
            * Fair usage policy applies on chat and contact viewing. <br/>
            Prices mentioned are inclusive of all applicable taxes.
          </div>
        </div>
      </main>
    </div>
  )
}
