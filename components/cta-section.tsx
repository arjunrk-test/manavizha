"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      {/* Modern grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
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
      
      {/* Geometric shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full blur-2xl hidden lg:block" />
      <div className="absolute bottom-10 left-10 w-24 h-24 border border-white/10 rotate-45 blur-xl hidden md:block" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto py-8 sm:py-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <span className="text-white/90 font-medium text-sm sm:text-base lg:text-lg">Join Thousands of Happy Couples</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-white leading-tight px-4">
            Ready to Find Your
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent inline-block transform hover:scale-105 transition-transform duration-300">
              Perfect Match?
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 text-white/90 leading-relaxed max-w-2xl mx-auto px-4">
            Join thousands of happy couples who found their life partner through Manavizha.
            Start your journey today and discover meaningful connections!
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-white text-[#1F4068] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold group"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-[#1F4068] group-hover:scale-110 transition-transform duration-300" />
                Create Free Profile
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-2 border-white text-black hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold group"
              >
                Learn More
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-8 text-white/80 px-4"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">100%</div>
              <div className="text-xs sm:text-sm">Free Registration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">24/7</div>
              <div className="text-xs sm:text-sm">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">10K+</div>
              <div className="text-xs sm:text-sm">Active Members</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
