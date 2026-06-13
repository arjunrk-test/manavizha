"use client"

type TermsBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }

type TermsSection = {
  number: number
  title: string
  blocks: TermsBlock[]
}

const TERMS_SECTIONS: TermsSection[] = [
  {
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
    number: 5,
    title: "Content and Intellectual Property",
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
    number: 14,
    title: "Contact Information",
    blocks: [
      {
        type: "p",
        text: "If you have any questions about these Terms of Service, please contact us at contact@manavizha.com or call +91 8925554449 / +91 8925554440.",
      },
    ],
  },
]

function TermsSectionBlock({ section }: { section: TermsSection }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-base font-semibold text-[#1F4068] mb-2.5">
        <span className="text-brand-gold mr-1.5">{section.number}.</span>
        {section.title}
      </h2>
      <div className="space-y-2.5">
        {section.blocks.map((block, index) =>
          block.type === "p" ? (
            <p key={index} className="text-[13px] text-gray-600 leading-relaxed">
              {block.text}
            </p>
          ) : (
            <ul
              key={index}
              className="list-disc space-y-1 pl-4 text-[13px] text-gray-600 leading-relaxed marker:text-[#c9a227]/80"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  )
}

export function TermsOfServicePanel() {
  return (
    <div className="columns-1 lg:columns-2 gap-x-10 [column-fill:balance]">
      {TERMS_SECTIONS.map((section) => (
        <div key={section.number} className="break-inside-avoid mb-7">
          <TermsSectionBlock section={section} />
        </div>
      ))}
    </div>
  )
}
