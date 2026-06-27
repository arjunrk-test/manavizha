"use client"

import { LegalPageShell } from "@/components/legal/legal-page-shell"
import { TermsOfServicePanel } from "@/components/legal/terms-of-service-panel"

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      eyebrow="Legal"
      relatedLink={{ href: "/privacy-policy", label: "Privacy Policy" }}
    >
      <TermsOfServicePanel />
    </LegalPageShell>
  )
}
