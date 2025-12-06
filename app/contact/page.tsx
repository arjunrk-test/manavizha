"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus("success")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setTimeout(() => setSubmitStatus(null), 5000)
    }, 1500)
  }

  return (
    <main className="min-h-screen relative">
      <Navbar />
      
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#1F4068] via-[#4B0082] via-[#FF1493] to-[#FFA500] bg-[length:200%_auto] animate-gradient" />
      
      {/* White overlay to lighten the gradient */}
      <div className="fixed inset-0 bg-white/40 dark:bg-[#181818]/40" />
      
      {/* Overlay pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      {/* Modern grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="flex items-center gap-2 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We'd love to hear from you. Get in touch with us using the form below or contact information provided.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#1F4068]/10 to-[#4B0082]/10 dark:from-[#1F4068]/30 dark:to-[#4B0082]/30">
                      <Mail className="h-5 w-5 text-[#4B0082]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                      <a 
                        href="mailto:arjun.rksaravanan@gmail.com" 
                        className="text-gray-600 dark:text-gray-400 hover:text-[#4B0082] transition-colors"
                      >
                        arjun.rksaravanan@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#1F4068]/10 to-[#4B0082]/10 dark:from-[#1F4068]/30 dark:to-[#4B0082]/30">
                      <Phone className="h-5 w-5 text-[#4B0082]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                      <a 
                        href="tel:+918072734996" 
                        className="text-gray-600 dark:text-gray-400 hover:text-[#4B0082] transition-colors"
                      >
                        +91 8072734996
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#1F4068]/10 to-[#4B0082]/10 dark:from-[#1F4068]/30 dark:to-[#4B0082]/30">
                      <MapPin className="h-5 w-5 text-[#4B0082]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Business Hours</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this regarding?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      rows={6}
                      required
                    />
                  </div>

                  {submitStatus === "success" && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                      Something went wrong. Please try again later.
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#1F4068] via-[#4B0082] to-[#FF1493] hover:from-[#4B0082] hover:via-[#FF1493] hover:to-[#1F4068] text-white border-0 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message
                        <Send className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

