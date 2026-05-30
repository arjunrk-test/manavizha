"use client"

import { motion } from "framer-motion"

const featuredStory = {
  name: "Arjun & Priya",
  meta: "Chennai · Married 2024",
  label: "Verified Manavizha match",
  text: "We were skeptical about online matchmaking. The verification process and horoscope matching gave both our families the confidence to take the next step.",
  image:
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
}

const supportingStories = [
  {
    name: "Rahul & Meera",
    meta: "Coimbatore · Married 2023",
    label: "Verified Manavizha match",
    text: "My parents could review verified profiles and horoscope compatibility before we met. That made all the difference for our families.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Vikram & Aditi",
    meta: "Hyderabad · Married 2022",
    label: "Verified Manavizha match",
    text: "We cared deeply about privacy. Manavizha let us connect on our terms — no pressure, no oversharing — and we found each other in under four months.",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-14 sm:py-16 lg:py-20 bg-[#faf8f4] dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto mb-16 sm:mb-20 lg:mb-24"
        >
          <p className="text-sm font-medium text-[#3bb9ac] mb-3">
            Success Stories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-[#1F4068] dark:text-white leading-[1.15] tracking-tight mb-4">
            Stories from our community
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Real matches. Real families.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Featured story */}
          <article className="mb-16 sm:mb-20 lg:mb-24">
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 lg:gap-14 items-start">
              <div className="w-full sm:w-48 lg:w-56 shrink-0">
                <img
                  src={featuredStory.image}
                  alt={featuredStory.name}
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <blockquote className="text-xl sm:text-2xl lg:text-[1.65rem] text-gray-800 dark:text-gray-200 leading-relaxed font-light mb-8 sm:mb-10">
                  &ldquo;{featuredStory.text}&rdquo;
                </blockquote>

                <footer>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {featuredStory.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {featuredStory.meta}
                  </p>
                  <p className="text-xs text-[#3bb9ac] mt-2">
                    {featuredStory.label}
                  </p>
                </footer>
              </div>
            </div>
          </article>

          {/* Supporting stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-14 lg:gap-16 pt-12 sm:pt-14 border-t border-gray-100 dark:border-gray-800">
            {supportingStories.map((story) => (
              <article key={story.name} className="flex gap-5 items-start">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] shrink-0 object-cover rounded-full"
                />

                <div className="flex-1 min-w-0">
                  <blockquote className="text-base sm:text-[1.05rem] text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                    &ldquo;{story.text}&rdquo;
                  </blockquote>

                  <footer>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {story.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {story.meta}
                    </p>
                    <p className="text-xs text-[#3bb9ac] mt-1.5">
                      {story.label}
                    </p>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
