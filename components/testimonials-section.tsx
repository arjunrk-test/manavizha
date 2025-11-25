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
    <section id="testimonials" className="py-32 bg-gradient-to-br from-[#1F4068]/5 via-[#4B0082]/5 to-[#FF1493]/5 dark:from-[#181818] dark:via-[#000000] dark:to-[#181818] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1F4068]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF1493]/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm text-[#1F4068] dark:text-[#4B0082] font-medium mb-6 shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            <span>Success Stories</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Love Stories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hear from couples who found their perfect match through Manavizha
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-200 bg-white/95 dark:bg-gray-800/95 overflow-hidden relative group">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493]" />
                
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">{testimonial.image}</div>
                  <Quote className="h-8 w-8 text-[#1F4068]/50 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                      >
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
