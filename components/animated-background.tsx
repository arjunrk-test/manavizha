"use client"

import { motion } from "framer-motion"

export function AnimatedBackground() {
  return (
    <>
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
          const fadeDuration = 8 + Math.random() * 4
          const rotateDuration = 60 + i * 8
          const moveDuration = 12 + Math.random() * 6
          
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
    </>
  )
}

