"use client"

import { LegalDocumentLayout } from "@/components/legal/legal-document-layout"

type TermsBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "contact"; email: string; phones: string[] }

type TermsSection = {
  id: string
  number: number
  title: string
  blocks: TermsBlock[]
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    number: 1,
    title: "Acceptance of Terms",
    blocks: [
      {
        type: "p",
        text: "By accessing and using Manavizha, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.",
      },
    ],
  },
  {
    id: "eligibility",
    number: 2,
    title: "Eligibility",
    blocks: [
      { type: "p", text: "To use our services, you must:" },
      {
        type: "ul",
        items: [
          "Be at least 18 years of age",
          "Be legally eligible to marry according to the laws of your jurisdiction",
          "Provide accurate, current, and complete information",
          "Maintain the security of your account credentials",
          "Not have been previously removed from our platform",
        ],
      },
    ],
  },
  {
    id: "user-accounts",
    number: 3,
    title: "User Accounts",
    blocks: [
      {
        type: "p",
        text: "You are responsible for maintaining the confidentiality of your account and password. You agree to:",
      },
      {
        type: "ul",
        items: [
          "Provide accurate and truthful information",
          "Update your information as necessary",
          "Notify us immediately of any unauthorized use",
          "Accept responsibility for all activities under your account",
        ],
      },
    ],
  },
  {
    id: "user-conduct",
    number: 4,
    title: "User Conduct",
    blocks: [
      { type: "p", text: "You agree not to:" },
      {
        type: "ul",
        items: [
          "Post false, misleading, or fraudulent information",
          "Harass, abuse, or harm other users",
          "Use the platform for any illegal purpose",
          "Impersonate any person or entity",
          "Upload viruses or malicious code",
          "Spam or send unsolicited communications",
          "Violate any applicable laws or regulations",
          "Interfere with the platform's operation",
        ],
      },
    ],
  },
  {
    id: "intellectual-property",
    number: 5,
    title: "Intellectual Property",
    blocks: [
      {
        type: "p",
        text: "All content on our platform, including text, graphics, logos, and software, is the property of Manavizha or its content suppliers and is protected by copyright and other intellectual property laws. You may not:",
      },
      {
        type: "ul",
        items: [
          "Reproduce, distribute, or create derivative works",
          "Use our content for commercial purposes without permission",
          "Remove any copyright or proprietary notices",
        ],
      },
    ],
  },
  {
    id: "user-content",
    number: 6,
    title: "User-Generated Content",
    blocks: [
      {
        type: "p",
        text: "You retain ownership of content you post on our platform. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content for the purpose of operating and promoting our services.",
      },
    ],
  },
  {
    id: "prohibited",
    number: 7,
    title: "Prohibited Activities",
    blocks: [
      { type: "p", text: "The following activities are strictly prohibited:" },
      {
        type: "ul",
        items: [
          "Creating fake profiles or impersonating others",
          "Engaging in fraudulent or deceptive practices",
          "Soliciting money or financial assistance",
          "Sharing contact information before appropriate verification",
          "Using automated systems to access the platform",
          "Reverse engineering or attempting to extract source code",
        ],
      },
    ],
  },
  {
    id: "termination",
    number: 8,
    title: "Termination",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to suspend or terminate your account at any time, with or without notice, for any violation of these Terms of Service or for any other reason we deem necessary. You may also terminate your account at any time by contacting us.",
      },
    ],
  },
  {
    id: "disclaimers",
    number: 9,
    title: "Disclaimers",
    blocks: [
      {
        type: "p",
        text: 'Our platform is provided "as is" and "as available" without warranties of any kind. We do not:',
      },
      {
        type: "ul",
        items: [
          "Guarantee the accuracy of user profiles",
          "Ensure successful matches or relationships",
          "Warrant uninterrupted or error-free service",
          "Verify all information provided by users",
        ],
      },
    ],
  },
  {
    id: "liability",
    number: 10,
    title: "Limitation of Liability",
    blocks: [
      {
        type: "p",
        text: "To the maximum extent permitted by law, Manavizha shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.",
      },
    ],
  },
  {
    id: "indemnification",
    number: 11,
    title: "Indemnification",
    blocks: [
      {
        type: "p",
        text: "You agree to indemnify and hold harmless Manavizha, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the platform or violation of these Terms of Service.",
      },
    ],
  },
  {
    id: "changes",
    number: 12,
    title: "Changes to Terms",
    blocks: [
      {
        type: "p",
        text: "We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the updated terms on this page. Your continued use of the platform after such changes constitutes acceptance of the new terms.",
      },
    ],
  },
  {
    id: "governing-law",
    number: 13,
    title: "Governing Law",
    blocks: [
      {
        type: "p",
        text: "These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.",
      },
    ],
  },
  {
    id: "contact",
    number: 14,
    title: "Contact Us",
    blocks: [
      {
        type: "p",
        text: "If you have any questions about these Terms of Service, please contact us at:",
      },
      {
        type: "contact",
        email: "contact@manavizha.com",
        phones: ["+91 8925554449", "+91 8925554440"],
      },
    ],
  },
]

const TERMS_SUMMARY =
  "These terms govern your use of Manavizha — eligibility, account responsibilities, acceptable conduct, and the limits of our liability."

function TermsSectionBlock({
  section,
  isLast,
}: {
  section: TermsSection
  isLast: boolean
}) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className={isLast ? "pb-0" : "border-b border-[#f0ebe3]/90 pb-8 mb-8"}>
        <h2
          id={`${section.id}-heading`}
          className="mb-3 text-lg font-semibold leading-snug text-[#1F4068] sm:text-[1.125rem]"
        >
          <span className="mr-2 text-brand-gold">{section.number}.</span>
          {section.title}
        </h2>
        <div className="space-y-3">
          {section.blocks.map((block, index) => {
            if (block.type === "p") {
              return (
                <p key={index} className="text-sm leading-7 text-gray-600 sm:text-[15px]">
                  {block.text}
                </p>
              )
            }

            if (block.type === "contact") {
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#f0ebe3] bg-white/70 px-4 py-3 text-sm text-gray-600"
                >
                  <p>
                    <span className="font-medium text-[#1F4068]">Email:</span>{" "}
                    <a href={`mailto:${block.email}`} className="text-[#3bb9ac] hover:underline">
                      {block.email}
                    </a>
                  </p>
                  <p className="mt-1">
                    <span className="font-medium text-[#1F4068]">Phone:</span> {block.phones.join(", ")}
                  </p>
                </div>
              )
            }

            return (
              <ul
                key={index}
                className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-gray-600 marker:text-[#c9a227]/80 sm:text-[15px]"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function TermsOfServicePanel() {
  return (
    <LegalDocumentLayout
      sections={TERMS_SECTIONS.map(({ id, number, title }) => ({ id, number, title }))}
      summary={TERMS_SUMMARY}
    >
      {TERMS_SECTIONS.map((section, index) => (
        <TermsSectionBlock
          key={section.id}
          section={section}
          isLast={index === TERMS_SECTIONS.length - 1}
        />
      ))}
    </LegalDocumentLayout>
  )
}
