"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit,
  Eye,
  Mail,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { DashboardJourneyPatterns } from "@/components/dashboard/dashboard-journey-patterns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_AUTOMATION_TRIGGERS,
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_COMPLIANCE_SETTINGS,
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_SENDER_SETTINGS,
  EMAIL_SECTIONS,
  SAMPLE_DELIVERY_LOGS,
  STORAGE_KEYS,
  TEMPLATE_CATEGORY_LABELS,
  type AutomationTrigger,
  type BrandingSettings,
  type ComplianceSettings,
  type DeliveryLogEntry,
  type EmailSection,
  type EmailTemplate,
  type EmailTemplateCategory,
  type SenderSettings,
} from "@/constants/email-admin"

const EMAIL_SELECT_TRIGGER =
  "rounded-lg border-[#f0ebe3] bg-white text-[13px] text-[#1F4068] shadow-sm hover:bg-[#faf8f4]"
const EMAIL_SELECT_CONTENT =
  "z-[100] rounded-lg border border-[#f0ebe3] bg-white text-[#1F4068] shadow-lg"
const EMAIL_SELECT_ITEM =
  "text-[13px] text-[#1F4068] focus:bg-[#faf8f4] focus:text-[#1F4068] data-[highlighted]:bg-[#faf8f4] data-[highlighted]:text-[#1F4068]"

function EmailSelect({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={EMAIL_SELECT_TRIGGER}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={EMAIL_SELECT_CONTENT}>{children}</SelectContent>
    </Select>
  )
}

function EmailSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <SelectItem value={value} className={EMAIL_SELECT_ITEM}>
      {children}
    </SelectItem>
  )
}

type Campaign = {
  id: string
  name: string
  subject: string
  audience: string
  status: "draft" | "scheduled" | "sent"
  createdAt: string
}

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function ThemedPanel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#f0ebe3] bg-gradient-to-br from-[#fffdf8] via-[#fefcf7] to-[#fdf6ee] shadow-[0_2px_16px_rgba(31,64,104,0.05)] ${className}`}
    >
      <DashboardJourneyPatterns />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function SectionCard({ section, onSelect }: { section: EmailSection; onSelect: () => void }) {
  const Icon = section.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-xl border border-[#f0ebe3] bg-white/85 px-4 py-4 text-left transition-all hover:shadow-[0_4px_16px_rgba(31,64,104,0.08)] ${section.hoverBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${section.iconBg}`}>
          <Icon className={`h-5 w-5 ${section.iconColor}`} strokeWidth={1.75} />
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#c9a227]" />
      </div>
      <h3 className="mt-3 text-[13px] font-semibold text-[#1F4068]">{section.title}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-500">{section.description}</p>
    </button>
  )
}

function StatusBadge({ status }: { status: DeliveryLogEntry["status"] }) {
  const styles = {
    delivered: "bg-[#e6f7f5] text-[#3bb9ac]",
    opened: "bg-[#fdf6e3] text-[#c9a227]",
    bounced: "bg-[#fce8ef] text-[#e87898]",
    failed: "bg-red-50 text-red-600",
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}

function FieldGroup({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-[#1F4068]">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
    </div>
  )
}

export function AdminEmailPanel() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES)
  const [senderSettings, setSenderSettings] = useState<SenderSettings>(DEFAULT_SENDER_SETTINGS)
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING_SETTINGS)
  const [automations, setAutomations] = useState<AutomationTrigger[]>(DEFAULT_AUTOMATION_TRIGGERS)
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>(DEFAULT_COMPLIANCE_SETTINGS)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templateSearch, setTemplateSearch] = useState("")
  const [templateCategory, setTemplateCategory] = useState<EmailTemplateCategory | "all">("all")
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)
  const [campaignForm, setCampaignForm] = useState({ name: "", subject: "", audience: "all-active" })
  const [testEmail, setTestEmail] = useState("")
  const [testTemplateId, setTestTemplateId] = useState(DEFAULT_EMAIL_TEMPLATES[0].id)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setTemplates(loadStored(STORAGE_KEYS.templates, DEFAULT_EMAIL_TEMPLATES))
    setSenderSettings(loadStored(STORAGE_KEYS.sender, DEFAULT_SENDER_SETTINGS))
    setBrandingSettings(loadStored(STORAGE_KEYS.branding, DEFAULT_BRANDING_SETTINGS))
    setAutomations(loadStored(STORAGE_KEYS.automations, DEFAULT_AUTOMATION_TRIGGERS))
    setComplianceSettings(loadStored(STORAGE_KEYS.compliance, DEFAULT_COMPLIANCE_SETTINGS))
    setCampaigns(loadStored(STORAGE_KEYS.campaigns, []))
    setIsHydrated(true)
  }, [])

  const activeSection = useMemo(
    () => EMAIL_SECTIONS.find((section) => section.id === selectedSection) ?? null,
    [selectedSection]
  )

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.toLowerCase()
    return templates.filter((template) => {
      const matchesSearch =
        !q ||
        template.name.toLowerCase().includes(q) ||
        template.subject.toLowerCase().includes(q)
      const matchesCategory = templateCategory === "all" || template.category === templateCategory
      return matchesSearch && matchesCategory
    })
  }, [templates, templateSearch, templateCategory])

  const enabledTemplateCount = templates.filter((t) => t.enabled).length
  const enabledAutomationCount = automations.filter((a) => a.enabled).length

  const persistTemplates = (next: EmailTemplate[]) => {
    setTemplates(next)
    saveStored(STORAGE_KEYS.templates, next)
  }

  const handleSaveTemplate = () => {
    if (!editingTemplate) return
    const next = templates.map((t) =>
      t.id === editingTemplate.id
        ? { ...editingTemplate, lastUpdated: new Date().toISOString().slice(0, 10) }
        : t
    )
    persistTemplates(next)
    setEditingTemplate(null)
    toast.success("Template saved")
  }

  const toggleTemplateEnabled = (id: string) => {
    persistTemplates(templates.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))
  }

  const saveSenderSettings = () => {
    saveStored(STORAGE_KEYS.sender, senderSettings)
    toast.success("Sender settings saved")
  }

  const saveBrandingSettings = () => {
    saveStored(STORAGE_KEYS.branding, brandingSettings)
    toast.success("Branding settings saved")
  }

  const saveAutomations = () => {
    saveStored(STORAGE_KEYS.automations, automations)
    toast.success("Automation triggers saved")
  }

  const saveComplianceSettings = () => {
    saveStored(STORAGE_KEYS.compliance, complianceSettings)
    toast.success("Compliance settings saved")
  }

  const handleCreateCampaign = () => {
    if (!campaignForm.name.trim() || !campaignForm.subject.trim()) {
      toast.error("Campaign name and subject are required")
      return
    }

    const next: Campaign[] = [
      {
        id: crypto.randomUUID(),
        name: campaignForm.name.trim(),
        subject: campaignForm.subject.trim(),
        audience: campaignForm.audience,
        status: "draft",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...campaigns,
    ]
    setCampaigns(next)
    saveStored(STORAGE_KEYS.campaigns, next)
    setCampaignForm({ name: "", subject: "", audience: "all-active" })
    setIsCampaignDialogOpen(false)
    toast.success("Campaign draft created")
  }

  const handleTestSend = () => {
    if (!testEmail.trim()) {
      toast.error("Enter a recipient email address")
      return
    }
    const template = templates.find((t) => t.id === testTemplateId)
    toast.success(`Test email queued: "${template?.name}" → ${testEmail}`)
  }

  if (!isHydrated) {
    return null
  }

  return (
    <ThemedPanel className={`flex flex-col ${selectedSection ? "min-h-[calc(100vh-7rem)]" : ""}`}>
      <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce8ef]">
            <Mail className="h-5 w-5 text-[#e87898]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c9a227]">Operations</p>
            <h1 className="font-display text-lg font-semibold text-[#1F4068] sm:text-xl">Email</h1>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {selectedSection
                ? "Manage templates, delivery settings, and communications"
                : "Templates, campaigns, automations, and delivery tools"}
            </p>
          </div>
        </div>

        {!selectedSection && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Templates", value: templates.length, sub: `${enabledTemplateCount} active` },
              { label: "Automations", value: automations.length, sub: `${enabledAutomationCount} enabled` },
              { label: "Campaigns", value: campaigns.length, sub: "drafts & sent" },
              { label: "Delivered (24h)", value: "128", sub: "sample data" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2.5"
              >
                <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
                <p className="font-display text-lg font-semibold text-[#1F4068]">{stat.value}</p>
                <p className="text-[9px] text-gray-400">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedSection ? (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-4 sm:px-5 sm:py-5"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              Choose a section
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {EMAIL_SECTIONS.map((section) => (
                <SectionCard key={section.id} section={section} onSelect={() => setSelectedSection(section.id)} />
              ))}
            </div>
          </motion.div>
        ) : (
          activeSection && (
            <motion.div
              key={selectedSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-[#f0ebe3]/80 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activeSection.iconBg}`}
                    >
                      {(() => {
                        const Icon = activeSection.icon
                        return <Icon className={`h-4 w-4 ${activeSection.iconColor}`} strokeWidth={1.75} />
                      })()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500">
                        Email
                        <span className="mx-1.5 text-gray-300">/</span>
                        <span className="font-medium text-[#c9a227]">{activeSection.title}</span>
                      </p>
                      <h2 className="font-display text-base font-semibold text-[#1F4068] sm:text-lg">
                        {activeSection.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSection(null)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#f0ebe3] bg-white/80 px-3 py-2 text-[11px] font-medium text-gray-600 transition-colors hover:border-[#c9a227]/35 hover:bg-[#faf8f4] hover:text-[#1F4068]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All sections
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {selectedSection === "templates" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          placeholder="Search templates..."
                          className="h-9 rounded-lg border-[#f0ebe3] bg-white pl-9 text-[12px]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(["all", ...Object.keys(TEMPLATE_CATEGORY_LABELS)] as Array<
                          EmailTemplateCategory | "all"
                        >).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTemplateCategory(cat)}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                              templateCategory === cat
                                ? "bg-[#1F4068] text-white shadow-sm"
                                : "border border-[#c5d4e4] bg-white text-gray-600 hover:border-[#1F4068]/30 hover:text-[#1F4068]"
                            }`}
                          >
                            {cat === "all" ? "All" : TEMPLATE_CATEGORY_LABELS[cat as EmailTemplateCategory]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                              Template
                            </th>
                            <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] md:table-cell">
                              Category
                            </th>
                            <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068] lg:table-cell">
                              Subject
                            </th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTemplates.map((template) => (
                            <tr
                              key={template.id}
                              className="border-b border-[#f0ebe3]/80 transition-colors hover:bg-[#faf8f4]/60"
                            >
                              <td className="px-4 py-3">
                                <p className="text-[13px] font-medium text-[#1F4068]">{template.name}</p>
                                <p className="mt-0.5 text-[10px] text-gray-500 md:hidden">
                                  {TEMPLATE_CATEGORY_LABELS[template.category]}
                                </p>
                              </td>
                              <td className="hidden px-4 py-3 text-[12px] text-gray-600 md:table-cell">
                                {TEMPLATE_CATEGORY_LABELS[template.category]}
                              </td>
                              <td className="hidden max-w-xs truncate px-4 py-3 text-[12px] text-gray-600 lg:table-cell">
                                {template.subject}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleTemplateEnabled(template.id)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    template.enabled
                                      ? "bg-[#e6f7f5] text-[#3bb9ac]"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {template.enabled ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {template.enabled ? "Active" : "Disabled"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewTemplate(template)}
                                    className="h-8 rounded-lg border-[#f0ebe3] px-2.5 text-[11px]"
                                  >
                                    <Eye className="mr-1 h-3.5 w-3.5" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingTemplate({ ...template })}
                                    className="h-8 rounded-lg border-[#f0ebe3] px-2.5 text-[11px]"
                                  >
                                    <Edit className="mr-1 h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedSection === "sender" && (
                  <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[#f0ebe3] bg-white/90 p-5">
                    <FieldGroup label="From name" hint="Display name recipients see in their inbox">
                      <Input
                        value={senderSettings.fromName}
                        onChange={(e) => setSenderSettings({ ...senderSettings, fromName: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="From email">
                      <Input
                        type="email"
                        value={senderSettings.fromEmail}
                        onChange={(e) => setSenderSettings({ ...senderSettings, fromEmail: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Reply-to address">
                      <Input
                        type="email"
                        value={senderSettings.replyTo}
                        onChange={(e) => setSenderSettings({ ...senderSettings, replyTo: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Bounce address">
                      <Input
                        type="email"
                        value={senderSettings.bounceEmail}
                        onChange={(e) => setSenderSettings({ ...senderSettings, bounceEmail: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Email provider">
                      <EmailSelect
                        value={senderSettings.provider}
                        onValueChange={(value) => setSenderSettings({ ...senderSettings, provider: value })}
                      >
                        {["Resend", "SendGrid", "Amazon SES", "Postmark", "SMTP"].map((provider) => (
                          <EmailSelectItem key={provider} value={provider}>
                            {provider}
                          </EmailSelectItem>
                        ))}
                      </EmailSelect>
                    </FieldGroup>
                    <Button onClick={saveSenderSettings} className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]">
                      Save sender settings
                    </Button>
                  </div>
                )}

                {selectedSection === "branding" && (
                  <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[#f0ebe3] bg-white/90 p-5">
                    <FieldGroup label="Logo URL">
                      <Input
                        value={brandingSettings.logoUrl}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, logoUrl: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Header colour">
                      <div className="flex items-center gap-3">
                        <Input
                          value={brandingSettings.headerColor}
                          onChange={(e) => setBrandingSettings({ ...brandingSettings, headerColor: e.target.value })}
                          className="rounded-lg border-[#f0ebe3]"
                        />
                        <div
                          className="h-10 w-10 shrink-0 rounded-lg border border-[#f0ebe3]"
                          style={{ backgroundColor: brandingSettings.headerColor }}
                        />
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Footer text">
                      <Textarea
                        value={brandingSettings.footerText}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, footerText: e.target.value })}
                        className="min-h-[80px] rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Support email">
                      <Input
                        type="email"
                        value={brandingSettings.supportEmail}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, supportEmail: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Website URL">
                      <Input
                        value={brandingSettings.websiteUrl}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, websiteUrl: e.target.value })}
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <Button
                      onClick={saveBrandingSettings}
                      className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]"
                    >
                      Save branding
                    </Button>
                  </div>
                )}

                {selectedSection === "automations" && (
                  <div className="space-y-3">
                    {automations.map((automation) => {
                      const template = templates.find((t) => t.id === automation.templateId)
                      return (
                        <div
                          key={automation.id}
                          className="flex flex-col gap-3 rounded-xl border border-[#f0ebe3] bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#1F4068]">{automation.name}</p>
                            <p className="mt-0.5 text-[11px] text-gray-500">{automation.description}</p>
                            <p className="mt-1 text-[10px] text-[#c9a227]">
                              Template: {template?.name ?? automation.templateId}
                              {automation.delay ? ` · Delay: ${automation.delay}` : ""}
                            </p>
                          </div>
                          <Switch
                            checked={automation.enabled}
                            onCheckedChange={(checked) =>
                              setAutomations(automations.map((a) => (a.id === automation.id ? { ...a, enabled: checked } : a)))
                            }
                          />
                        </div>
                      )
                    })}
                    <Button onClick={saveAutomations} className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]">
                      Save automation triggers
                    </Button>
                  </div>
                )}

                {selectedSection === "campaigns" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] text-gray-500">
                        Create one-off emails to active users, incomplete profiles, or premium members.
                      </p>
                      <Button
                        onClick={() => setIsCampaignDialogOpen(true)}
                        size="sm"
                        className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]"
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        New campaign
                      </Button>
                    </div>

                    {campaigns.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#f0ebe3] bg-white/70 px-6 py-12 text-center">
                        <p className="text-[13px] font-medium text-[#1F4068]">No campaigns yet</p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Create a broadcast to announce features, events, or promotions.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                                Campaign
                              </th>
                              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                                Audience
                              </th>
                              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                                Created
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaigns.map((campaign) => (
                              <tr key={campaign.id} className="border-b border-[#f0ebe3]/80">
                                <td className="px-4 py-3">
                                  <p className="text-[13px] font-medium text-[#1F4068]">{campaign.name}</p>
                                  <p className="text-[11px] text-gray-500">{campaign.subject}</p>
                                </td>
                                <td className="px-4 py-3 text-[12px] capitalize text-gray-600">
                                  {campaign.audience.replace(/-/g, " ")}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex rounded-full bg-[#fdf6e3] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#c9a227]">
                                    {campaign.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[12px] text-gray-600">{campaign.createdAt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedSection === "logs" && (
                  <div className="overflow-hidden rounded-xl border border-[#f0ebe3] bg-white/90">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-[#f0ebe3] bg-[#faf8f4]">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                            Sent at
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                            Recipient
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                            Template
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#1F4068]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_DELIVERY_LOGS.map((log) => (
                          <tr key={log.id} className="border-b border-[#f0ebe3]/80 hover:bg-[#faf8f4]/60">
                            <td className="px-4 py-3 text-[12px] text-gray-600">{log.sentAt}</td>
                            <td className="px-4 py-3 text-[12px] text-[#1F4068]">{log.recipient}</td>
                            <td className="px-4 py-3 text-[12px] text-gray-600">{log.templateName}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={log.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="border-t border-[#f0ebe3] px-4 py-3 text-[10px] text-gray-400">
                      Sample delivery data — connect your email provider to see live logs.
                    </p>
                  </div>
                )}

                {selectedSection === "test" && (
                  <div className="mx-auto max-w-xl space-y-5 rounded-xl border border-[#f0ebe3] bg-white/90 p-5">
                    <p className="text-[12px] text-gray-500">
                      Send a test email to verify formatting, links, and variable substitution before going live.
                    </p>
                    <FieldGroup label="Template">
                      <EmailSelect value={testTemplateId} onValueChange={setTestTemplateId}>
                        {templates.map((template) => (
                          <EmailSelectItem key={template.id} value={template.id}>
                            {template.name}
                          </EmailSelectItem>
                        ))}
                      </EmailSelect>
                    </FieldGroup>
                    <FieldGroup label="Recipient email">
                      <Input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <Button onClick={handleTestSend} className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]">
                      <Send className="mr-1.5 h-4 w-4" />
                      Send test email
                    </Button>
                  </div>
                )}

                {selectedSection === "compliance" && (
                  <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[#f0ebe3] bg-white/90 p-5">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#f0ebe3] bg-[#faf8f4]/60 px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[#1F4068]">Include unsubscribe link</p>
                        <p className="text-[11px] text-gray-500">Required for marketing and broadcast emails</p>
                      </div>
                      <Switch
                        checked={complianceSettings.includeUnsubscribe}
                        onCheckedChange={(checked) =>
                          setComplianceSettings({ ...complianceSettings, includeUnsubscribe: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#f0ebe3] bg-[#faf8f4]/60 px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[#1F4068]">Double opt-in for marketing</p>
                        <p className="text-[11px] text-gray-500">Require confirmation before promotional emails</p>
                      </div>
                      <Switch
                        checked={complianceSettings.doubleOptIn}
                        onCheckedChange={(checked) =>
                          setComplianceSettings({ ...complianceSettings, doubleOptIn: checked })
                        }
                      />
                    </div>
                    <FieldGroup label="Physical mailing address" hint="Shown in email footer for compliance">
                      <Textarea
                        value={complianceSettings.physicalAddress}
                        onChange={(e) =>
                          setComplianceSettings({ ...complianceSettings, physicalAddress: e.target.value })
                        }
                        className="min-h-[70px] rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <FieldGroup label="Privacy policy URL">
                      <Input
                        value={complianceSettings.privacyPolicyUrl}
                        onChange={(e) =>
                          setComplianceSettings({ ...complianceSettings, privacyPolicyUrl: e.target.value })
                        }
                        className="rounded-lg border-[#f0ebe3]"
                      />
                    </FieldGroup>
                    <Button
                      onClick={saveComplianceSettings}
                      className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]"
                    >
                      Save compliance settings
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border-[#f0ebe3] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
            <DialogDescription>Update subject, preview text, and body content.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-2">
              <FieldGroup label="Subject">
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="rounded-lg border-[#f0ebe3]"
                />
              </FieldGroup>
              <FieldGroup label="Preview text">
                <Input
                  value={editingTemplate.previewText}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, previewText: e.target.value })}
                  className="rounded-lg border-[#f0ebe3]"
                />
              </FieldGroup>
              <FieldGroup
                label="Body"
                hint={`Variables: ${editingTemplate.variables.map((v) => `{{${v}}}`).join(", ")}`}
              >
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="min-h-[200px] rounded-lg border-[#f0ebe3] font-mono text-[12px]"
                />
              </FieldGroup>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)} className="rounded-lg border-[#f0ebe3]">
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="rounded-lg bg-[#1F4068] text-white hover:bg-[#1a3558]">
              Save template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border-[#f0ebe3] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>Email preview</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-[#f0ebe3] bg-[#faf8f4] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Subject</p>
                <p className="mt-1 text-[14px] font-medium text-[#1F4068]">{previewTemplate.subject}</p>
              </div>
              <div className="rounded-lg border border-[#f0ebe3] bg-[#faf8f4] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Preview text</p>
                <p className="mt-1 text-[12px] text-gray-600">{previewTemplate.previewText}</p>
              </div>
              <div className="rounded-lg border border-[#f0ebe3] bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Body</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-700">
                  {previewTemplate.body}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="rounded-xl border-[#f0ebe3] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New broadcast campaign</DialogTitle>
            <DialogDescription>Create a draft campaign to send to a user segment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FieldGroup label="Campaign name">
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="Summer membership offer"
                className="rounded-lg border-[#f0ebe3]"
              />
            </FieldGroup>
            <FieldGroup label="Email subject">
              <Input
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                placeholder="Exclusive offer for Manavizha members"
                className="rounded-lg border-[#f0ebe3]"
              />
            </FieldGroup>
            <FieldGroup label="Audience">
              <EmailSelect
                value={campaignForm.audience}
                onValueChange={(value) => setCampaignForm({ ...campaignForm, audience: value })}
              >
                <EmailSelectItem value="all-active">All active profiles</EmailSelectItem>
                <EmailSelectItem value="incomplete-profiles">Incomplete profiles</EmailSelectItem>
                <EmailSelectItem value="premium-members">Premium members</EmailSelectItem>
                <EmailSelectItem value="referral-partners">Referral partners</EmailSelectItem>
                <EmailSelectItem value="inactive-30d">Inactive 30+ days</EmailSelectItem>
              </EmailSelect>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCampaignDialogOpen(false)} className="rounded-lg border-[#f0ebe3]">
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} className="rounded-lg bg-[#c9a227] text-white hover:bg-[#b8921f]">
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemedPanel>
  )
}
