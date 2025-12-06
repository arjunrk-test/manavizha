"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TermsOfServicePage() {
  const router = useRouter()

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
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
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-12 space-y-8"
          >
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using Manavizha, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to these Terms of Service, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Eligibility</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Be legally eligible to marry according to the laws of your jurisdiction</li>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not have been previously removed from our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. User Accounts</h2>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Update your information as necessary</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. User Conduct</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the platform for any illegal purpose</li>
                <li>Impersonate any person or entity</li>
                <li>Upload viruses or malicious code</li>
                <li>Spam or send unsolicited communications</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with the platform's operation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Content and Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                All content on our platform, including text, graphics, logos, and software, is the property of Manavizha 
                or its content suppliers and is protected by copyright and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Reproduce, distribute, or create derivative works</li>
                <li>Use our content for commercial purposes without permission</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. User-Generated Content</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You retain ownership of content you post on our platform. By posting content, you grant us a worldwide, 
                non-exclusive, royalty-free license to use, reproduce, and distribute your content for the purpose of 
                operating and promoting our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Prohibited Activities</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Creating fake profiles or impersonating others</li>
                <li>Engaging in fraudulent or deceptive practices</li>
                <li>Soliciting money or financial assistance</li>
                <li>Sharing contact information before appropriate verification</li>
                <li>Using automated systems to access the platform</li>
                <li>Reverse engineering or attempting to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for any 
                violation of these Terms of Service or for any other reason we deem necessary. You may also terminate 
                your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">9. Disclaimers</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our platform is provided "as is" and "as available" without warranties of any kind. We do not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Guarantee the accuracy of user profiles</li>
                <li>Ensure successful matches or relationships</li>
                <li>Warrant uninterrupted or error-free service</li>
                <li>Verify all information provided by users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">10. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, Manavizha shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">11. Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You agree to indemnify and hold harmless Manavizha, its officers, directors, employees, and agents from 
                any claims, damages, losses, liabilities, and expenses arising out of your use of the platform or 
                violation of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">12. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
                changes by posting the updated terms on this page. Your continued use of the platform after such changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">13. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India, without 
                regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">14. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Email:</strong> arjun.rksaravanan@gmail.com</p>
                <p><strong>Phone:</strong> +91 8072734996</p>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

