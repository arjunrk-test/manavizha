"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <Sparkles className="h-6 w-6 text-white" />
            <span className="text-white/90 font-medium text-lg">Join Thousands of Happy Couples</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight">
            Ready to Find Your
            <br />
            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
              Perfect Match?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed max-w-2xl mx-auto">
            Join thousands of happy couples who found their life partner through Manavizha.
            Start your journey today and discover meaningful connections!
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              className="rounded-full bg-white text-[#1F4068] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Heart className="h-4 w-4 fill-[#1F4068]" />
              Create Free Profile
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white text-black hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-white/80"
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm">Free Registration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-sm">Active Members</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
