import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { ScrollToHeroButton } from "@/components/home/scroll-to-hero-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf8f4] [&_*]:not-italic">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
      <ScrollToHeroButton />
    </main>
  )
}
