"use client"

import { LegalDocumentLayout } from "@/components/legal/legal-document-layout"

type PrivacyBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "contact"; email: string; phones: string[] }

type PrivacySection = {
  id: string
  number: number
  title: string
  blocks: PrivacyBlock[]
}

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction",
    blocks: [
      {
        type: "p",
        text: "Welcome to Manavizha. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our matrimonial services platform.",
      },
    ],
  },
  {
    id: "information-we-collect",
    number: 2,
    title: "Information We Collect",
    blocks: [
      { type: "h3", text: "Personal information" },
      {
        type: "p",
        text: "We collect personal information that you provide to us, including but not limited to:",
      },
      {
        type: "ul",
        items: [
          "Name, date of birth, and gender",
          "Contact information (email, phone number, address)",
          "Educational and professional details",
          "Family background information",
          "Photographs and profile information",
          "Preferences and interests",
        ],
      },
      { type: "h3", text: "Usage information" },
      {
        type: "p",
        text: "We automatically collect information about how you interact with our platform, including:",
      },
      {
        type: "ul",
        items: [
          "Device information and IP address",
          "Browser type and version",
          "Pages visited and time spent on pages",
          "Search queries and interactions",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    number: 3,
    title: "How We Use Your Information",
    blocks: [
      { type: "p", text: "We use the information we collect to:" },
      {
        type: "ul",
        items: [
          "Provide and improve our matrimonial services",
          "Match you with potential partners based on your preferences",
          "Communicate with you about your account and our services",
          "Send you notifications and updates",
          "Verify your identity and prevent fraud",
          "Analyze usage patterns to enhance user experience",
          "Comply with legal obligations",
        ],
      },
    ],
  },
  {
    id: "sharing",
    number: 4,
    title: "Information Sharing",
    blocks: [
      {
        type: "p",
        text: "We do not sell your personal information. We may share your information only in the following circumstances:",
      },
      {
        type: "ul",
        items: [
          "With other registered users as part of our matching services",
          "With service providers who assist us in operating our platform",
          "When required by law or to protect our rights",
          "In case of a business transfer or merger",
          "With your explicit consent",
        ],
      },
    ],
  },
  {
    id: "data-security",
    number: 5,
    title: "Data Security",
    blocks: [
      {
        type: "p",
        text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "your-rights",
    number: 6,
    title: "Your Rights",
    blocks: [
      { type: "p", text: "You have the right to:" },
      {
        type: "ul",
        items: [
          "Access and review your personal information",
          "Update or correct inaccurate information",
          "Request deletion of your account and data",
          "Opt-out of certain communications",
          "Object to processing of your personal information",
          "Data portability",
        ],
      },
    ],
  },
  {
    id: "cookies",
    number: 7,
    title: "Cookies",
    blocks: [
      {
        type: "p",
        text: "We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with our marketing efforts. You can control cookie preferences through your browser settings.",
      },
    ],
  },
  {
    id: "children",
    number: 8,
    title: "Children's Privacy",
    blocks: [
      {
        type: "p",
        text: "Our services are intended for individuals who are 18 years of age or older. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information.",
      },
    ],
  },
  {
    id: "changes",
    number: 9,
    title: "Policy Changes",
    blocks: [
      {
        type: "p",
        text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
      },
    ],
  },
  {
    id: "contact",
    number: 10,
    title: "Contact Us",
    blocks: [
      {
        type: "p",
        text: "If you have any questions about this Privacy Policy, please contact us at:",
      },
      {
        type: "contact",
        email: "contact@manavizha.com",
        phones: ["+91 8925554449", "+91 8925554440"],
      },
    ],
  },
]

const PRIVACY_SUMMARY =
  "This policy explains what data we collect, how we use it, who we share it with, and the choices you have over your information."

function PrivacySectionBlock({
  section,
  isLast,
}: {
  section: PrivacySection
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

            if (block.type === "h3") {
              return (
                <h3 key={index} className="pt-1 text-sm font-semibold text-[#1F4068]">
                  {block.text}
                </h3>
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

export function PrivacyPolicyPanel() {
  return (
    <LegalDocumentLayout
      sections={PRIVACY_SECTIONS.map(({ id, number, title }) => ({ id, number, title }))}
      summary={PRIVACY_SUMMARY}
    >
      {PRIVACY_SECTIONS.map((section, index) => (
        <PrivacySectionBlock
          key={section.id}
          section={section}
          isLast={index === PRIVACY_SECTIONS.length - 1}
        />
      ))}
    </LegalDocumentLayout>
  )
}
