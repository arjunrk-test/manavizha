"use client"

import { LegalPageShell } from "@/components/legal/legal-page-shell"
import { PrivacyPolicyPanel } from "@/components/legal/privacy-policy-panel"

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" eyebrow="Legal">
      <PrivacyPolicyPanel />
    </LegalPageShell>
  )
}
