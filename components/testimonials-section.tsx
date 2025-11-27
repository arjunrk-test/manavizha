"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, Sparkles } from "lucide-react"

const testimonials = [
  {
    name: "Priya & Raj",
    location: "Mumbai, India",
    text: "Manavizha helped us find each other. The platform is easy to use and the support team is amazing. We couldn't be happier!",
    rating: 5,
    image: "👫",
  },
  {
    name: "Anjali & Vikram",
    location: "Delhi, India",
    text: "The verification process gave us confidence, and the matching algorithm really understood our preferences. Highly recommended!",
    rating: 5,
    image: "💑",
  },
  {
    name: "Meera & Arjun",
    location: "Bangalore, India",
    text: "Privacy was our main concern, and Manavizha exceeded our expectations. We found our perfect match in just 3 months!",
    rating: 5,
    image: "💕",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Animated gradient background - lighter version */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F4068]/50 via-[#4B0082]/50 via-[#FF1493]/50 to-[#FFA500]/50 bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten */}
      <div className="absolute inset-0 bg-white/50 dark:bg-[#181818]/50" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      {/* Modern decorative elements */}
      <div className="absolute top-20 left-5 w-24 h-24 sm:w-32 sm:h-32 border border-[#FFA500]/10 rounded-full blur-xl hidden md:block" />
      <div className="absolute bottom-20 right-5 w-20 h-20 sm:w-28 sm:h-28 border border-[#4B0082]/10 rotate-45 blur-lg hidden lg:block" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm text-[#1F4068] dark:text-[#4B0082] font-medium mb-4 sm:mb-6 shadow-lg text-sm sm:text-base"
          >
            <Sparkles className="h-4 w-4" />
            <span>Success Stories</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient px-4">
            Love Stories
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Hear from couples who found their perfect match through Manavizha
          </p>
        </motion.div>

        {/* Auto-scrolling carousel container */}
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-scroll">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`first-${testimonial.name}`}
                className="flex-shrink-0 w-[90vw] sm:w-[400px] md:w-[420px] lg:w-[380px] xl:w-[400px] group relative"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-hidden relative hover:scale-[1.03] group">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FF1493]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-5 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                      {testimonial.image}
                    </div>
                    <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-[#1F4068]/40 dark:text-[#4B0082]/40 mb-4 sm:mb-5 group-hover:text-[#1F4068]/60 dark:group-hover:text-[#4B0082]/60 transition-colors duration-300" />
                    <p className="text-gray-700 dark:text-gray-300 mb-5 sm:mb-6 lg:mb-8 italic text-base sm:text-lg lg:text-xl leading-relaxed font-light">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-1 mb-4 sm:mb-5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="pt-4 sm:pt-5 border-t border-gray-200/60 dark:border-gray-700/60">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg lg:text-xl mb-1.5">
                        {testimonial.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`second-${testimonial.name}`}
                className="flex-shrink-0 w-[90vw] sm:w-[400px] md:w-[420px] lg:w-[380px] xl:w-[400px] group relative"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm overflow-hidden relative hover:scale-[1.03] group">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FF1493]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-5 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                      {testimonial.image}
                    </div>
                    <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-[#1F4068]/40 dark:text-[#4B0082]/40 mb-4 sm:mb-5 group-hover:text-[#1F4068]/60 dark:group-hover:text-[#4B0082]/60 transition-colors duration-300" />
                    <p className="text-gray-700 dark:text-gray-300 mb-5 sm:mb-6 lg:mb-8 italic text-base sm:text-lg lg:text-xl leading-relaxed font-light">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-1 mb-4 sm:mb-5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="pt-4 sm:pt-5 border-t border-gray-200/60 dark:border-gray-700/60">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg lg:text-xl mb-1.5">
                        {testimonial.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
