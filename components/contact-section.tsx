"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1.5 block"

const inputClass =
  "h-11 rounded-xl border border-gray-200/90 bg-white px-4 text-sm text-[#1F4068] placeholder:text-gray-400 focus-visible:border-[#3bb9ac] focus-visible:ring-4 focus-visible:ring-[#3bb9ac]/10 shadow-sm"

export function ContactSection() {
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

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus("success")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setTimeout(() => setSubmitStatus(null), 5000)
    }, 1500)
  }

  return (
    <section id="contact" className="py-14 sm:py-16 lg:py-20 bg-[#faf8f4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
            Contact
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F4068] leading-tight tracking-tight mb-4">
            Get in touch with us
          </h2>
          <p className="text-base text-[#6b7280] leading-relaxed">
            We&apos;d love to hear from you. Send a message or reach us directly using the details below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-gray-100/90 bg-white shadow-[0_8px_32px_rgba(31,64,104,0.06)] p-6">
              <h3 className="text-lg font-semibold text-[#1F4068] mb-5">Contact details</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#fce8ef]">
                    <Mail className="h-5 w-5 text-[#e87898]" />
                  </div>
                  <div>
                    <p className={labelClass}>Email</p>
                    <a
                      href="mailto:contact@manavizha.com"
                      className="text-sm text-[#6b7280] hover:text-[#3bb9ac] transition-colors"
                    >
                      contact@manavizha.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#e6f7f5]">
                    <Phone className="h-5 w-5 text-[#3bb9ac]" />
                  </div>
                  <div>
                    <p className={labelClass}>Phone</p>
                    <div className="space-y-1">
                      <a
                        href="tel:+918925554449"
                        className="block text-sm text-[#6b7280] hover:text-[#3bb9ac] transition-colors"
                      >
                        +91 8925554449
                      </a>
                      <a
                        href="tel:+918925554440"
                        className="block text-sm text-[#6b7280] hover:text-[#3bb9ac] transition-colors"
                      >
                        +91 8925554440
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#fdf6e3]">
                    <MapPin className="h-5 w-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className={labelClass}>Location</p>
                    <p className="text-sm text-[#6b7280]">India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100/90 bg-white shadow-[0_8px_32px_rgba(31,64,104,0.06)] p-6">
              <h3 className="text-lg font-semibold text-[#1F4068] mb-4">Business hours</h3>
              <div className="space-y-2 text-sm text-[#6b7280]">
                <p><strong className="text-[#1F4068]">Monday – Friday:</strong> 9:00 AM – 6:00 PM</p>
                <p><strong className="text-[#1F4068]">Saturday:</strong> 10:00 AM – 4:00 PM</p>
                <p><strong className="text-[#1F4068]">Sunday:</strong> Closed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-gray-100/90 bg-white shadow-[0_8px_32px_rgba(31,64,104,0.06)] p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-[#1F4068] mb-6">Send us a message</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="contact-name" className={labelClass}>Name *</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email" className={labelClass}>Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact-phone" className={labelClass}>Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 1234567890"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-subject" className={labelClass}>Subject *</Label>
                  <Input
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What is this regarding?"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-message" className={labelClass}>Message *</Label>
                  <Textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    required
                    className={`${inputClass} min-h-[140px] py-3`}
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="p-4 rounded-xl bg-[#e6f7f5] text-[#1F4068] border border-[#3bb9ac]/20 text-sm">
                    Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
                    Something went wrong. Please try again later.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-[10px] btn-brand-gradient px-8 py-6 text-base font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1F4068] border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send message
                      <Send className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
