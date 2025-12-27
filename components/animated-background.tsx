"use client"

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
      
      {/* Decorative elements - using CSS animations for better performance */}
      <div className="fixed inset-0">
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          style={{
            animation: "float-blob 8s ease-in-out infinite",
            willChange: "transform, opacity",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          style={{
            animation: "float-blob-reverse 10s ease-in-out infinite 2s",
            willChange: "transform, opacity",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Animated PNG Background Images - using CSS animations for better performance */}
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
            <div
              key={`bg-image-${i}`}
              className="absolute"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                width: `${size}px`,
                height: `${size}px`,
                animation: `pattern-fade-${i % 3} ${fadeDuration}s ease-in-out infinite ${i * 1.2}s, pattern-rotate ${rotateDuration}s linear infinite, pattern-move-${i % 3} ${moveDuration}s ease-in-out infinite ${i * 0.7}s`,
                willChange: "transform, opacity",
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                perspective: "1000px",
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
            </div>
          )
        })}
      </div>

    </>
  )
}

