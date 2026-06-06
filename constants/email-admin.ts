import {
  Bell,
  FileText,
  Megaphone,
  Palette,
  ScrollText,
  Send,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react"

export type EmailTemplateCategory = "auth" | "profile" | "matching" | "billing" | "admin"

export type EmailTemplate = {
  id: string
  name: string
  category: EmailTemplateCategory
  subject: string
  previewText: string
  body: string
  variables: string[]
  enabled: boolean
  lastUpdated?: string
}

export type EmailSection = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  hoverBorder: string
}

export type SenderSettings = {
  fromName: string
  fromEmail: string
  replyTo: string
  bounceEmail: string
  provider: string
}

export type BrandingSettings = {
  logoUrl: string
  headerColor: string
  footerText: string
  supportEmail: string
  websiteUrl: string
}

export type AutomationTrigger = {
  id: string
  name: string
  description: string
  templateId: string
  enabled: boolean
  delay?: string
}

export type DeliveryLogEntry = {
  id: string
  sentAt: string
  recipient: string
  templateName: string
  status: "delivered" | "opened" | "bounced" | "failed"
}

export type ComplianceSettings = {
  includeUnsubscribe: boolean
  physicalAddress: string
  privacyPolicyUrl: string
  doubleOptIn: boolean
}

export const EMAIL_SECTIONS: EmailSection[] = [
  {
    id: "templates",
    title: "Email templates",
    description: "Create and maintain transactional email content",
    icon: FileText,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    hoverBorder: "hover:border-[#e87898]/30",
  },
  {
    id: "sender",
    title: "Sender & delivery",
    description: "From address, reply-to, and provider settings",
    icon: Settings,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    hoverBorder: "hover:border-[#1F4068]/25",
  },
  {
    id: "branding",
    title: "Brand & design",
    description: "Logo, colours, footer, and support links",
    icon: Palette,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    hoverBorder: "hover:border-[#c9a227]/35",
  },
  {
    id: "automations",
    title: "Automation triggers",
    description: "Control when automated emails are sent",
    icon: Bell,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    hoverBorder: "hover:border-[#3bb9ac]/30",
  },
  {
    id: "campaigns",
    title: "Broadcast campaigns",
    description: "One-off announcements to user segments",
    icon: Megaphone,
    iconBg: "bg-[#fce8ef]",
    iconColor: "text-[#e87898]",
    hoverBorder: "hover:border-[#e87898]/30",
  },
  {
    id: "logs",
    title: "Delivery logs",
    description: "Track sent, opened, bounced, and failed emails",
    icon: ScrollText,
    iconBg: "bg-[#1F4068]/10",
    iconColor: "text-[#1F4068]",
    hoverBorder: "hover:border-[#1F4068]/25",
  },
  {
    id: "test",
    title: "Test send",
    description: "Preview templates before they go live",
    icon: Send,
    iconBg: "bg-[#e6f7f5]",
    iconColor: "text-[#3bb9ac]",
    hoverBorder: "hover:border-[#3bb9ac]/30",
  },
  {
    id: "compliance",
    title: "Compliance",
    description: "Unsubscribe links, opt-in, and legal footer",
    icon: Shield,
    iconBg: "bg-[#fdf6e3]",
    iconColor: "text-[#c9a227]",
    hoverBorder: "hover:border-[#c9a227]/35",
  },
]

export const TEMPLATE_CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  auth: "Authentication",
  profile: "Profile",
  matching: "Matching",
  billing: "Billing",
  admin: "Admin",
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome email",
    category: "auth",
    subject: "Welcome to Manavizha — your journey begins",
    previewText: "We're glad you're here. Complete your profile to get started.",
    body: "Hi {{first_name}},\n\nWelcome to Manavizha. We're honoured to help you find a meaningful connection.\n\nComplete your profile to unlock personalised matches.\n\nWarm regards,\nThe Manavizha Team",
    variables: ["first_name", "profile_url"],
    enabled: true,
  },
  {
    id: "email-verification",
    name: "Email verification",
    category: "auth",
    subject: "Verify your email address",
    previewText: "Confirm your email to secure your account.",
    body: "Hi {{first_name}},\n\nPlease verify your email by clicking the link below:\n\n{{verification_link}}\n\nThis link expires in 24 hours.",
    variables: ["first_name", "verification_link"],
    enabled: true,
  },
  {
    id: "password-reset",
    name: "Password reset",
    category: "auth",
    subject: "Reset your Manavizha password",
    previewText: "Use this link to set a new password.",
    body: "Hi {{first_name}},\n\nWe received a request to reset your password.\n\n{{reset_link}}\n\nIf you didn't request this, you can ignore this email.",
    variables: ["first_name", "reset_link"],
    enabled: true,
  },
  {
    id: "profile-incomplete",
    name: "Profile incomplete reminder",
    category: "profile",
    subject: "Complete your profile to start matching",
    previewText: "You're almost there — finish the remaining steps.",
    body: "Hi {{first_name}},\n\nYour profile is {{completion_percent}}% complete. Finish the {{missing_stage}} section to appear in search results.\n\n{{profile_url}}",
    variables: ["first_name", "completion_percent", "missing_stage", "profile_url"],
    enabled: true,
  },
  {
    id: "profile-approved",
    name: "Profile approved",
    category: "profile",
    subject: "Your profile has been approved",
    previewText: "You're now visible to compatible matches.",
    body: "Hi {{first_name}},\n\nGreat news — your profile has been reviewed and approved. You can now browse and connect with matches.\n\n{{browse_url}}",
    variables: ["first_name", "browse_url"],
    enabled: true,
  },
  {
    id: "profile-rejected",
    name: "Profile needs changes",
    category: "profile",
    subject: "Action required on your profile",
    previewText: "Please update your profile based on our review.",
    body: "Hi {{first_name}},\n\nWe reviewed your profile and need a few updates before approval.\n\nReason: {{rejection_reason}}\n\n{{profile_url}}",
    variables: ["first_name", "rejection_reason", "profile_url"],
    enabled: true,
  },
  {
    id: "new-match",
    name: "New match notification",
    category: "matching",
    subject: "You have a new compatible match",
    previewText: "Someone new matches your preferences.",
    body: "Hi {{first_name}},\n\nWe found a new match for you: {{match_name}} ({{match_age}}, {{match_location}}).\n\nCompatibility score: {{match_score}}%\n\n{{match_url}}",
    variables: ["first_name", "match_name", "match_age", "match_location", "match_score", "match_url"],
    enabled: true,
  },
  {
    id: "profile-like",
    name: "Profile liked",
    category: "matching",
    subject: "Someone expressed interest in your profile",
    previewText: "View who liked your profile.",
    body: "Hi {{first_name}},\n\n{{liker_name}} liked your profile. View their profile and respond if you're interested.\n\n{{likes_url}}",
    variables: ["first_name", "liker_name", "likes_url"],
    enabled: true,
  },
  {
    id: "profile-view",
    name: "Profile viewed",
    category: "matching",
    subject: "Your profile was viewed",
    previewText: "See who's been looking at your profile.",
    body: "Hi {{first_name}},\n\nYour profile received a new view. Check your activity to see recent visitors.\n\n{{activity_url}}",
    variables: ["first_name", "activity_url"],
    enabled: false,
  },
  {
    id: "subscription-confirmation",
    name: "Subscription confirmation",
    category: "billing",
    subject: "Your Manavizha subscription is active",
    previewText: "Thank you for upgrading your membership.",
    body: "Hi {{first_name}},\n\nYour {{plan_name}} subscription is now active until {{expiry_date}}.\n\nAmount paid: {{amount}}\n\n{{billing_url}}",
    variables: ["first_name", "plan_name", "expiry_date", "amount", "billing_url"],
    enabled: true,
  },
  {
    id: "payment-receipt",
    name: "Payment receipt",
    category: "billing",
    subject: "Payment receipt for your Manavizha order",
    previewText: "Your payment was processed successfully.",
    body: "Hi {{first_name}},\n\nReceipt #{{receipt_id}}\nPlan: {{plan_name}}\nAmount: {{amount}}\nDate: {{payment_date}}",
    variables: ["first_name", "receipt_id", "plan_name", "amount", "payment_date"],
    enabled: true,
  },
  {
    id: "referral-partner-welcome",
    name: "Referral partner welcome",
    category: "admin",
    subject: "Welcome to the Manavizha referral partner programme",
    previewText: "Your partner account is ready.",
    body: "Hi {{partner_name}},\n\nYour referral partner account is active. Your referral code is {{referral_code}}.\n\n{{dashboard_url}}",
    variables: ["partner_name", "referral_code", "dashboard_url"],
    enabled: true,
  },
  {
    id: "admin-new-signup",
    name: "Admin new signup alert",
    category: "admin",
    subject: "New user registration on Manavizha",
    previewText: "A new user has signed up.",
    body: "New signup alert\n\nName: {{user_name}}\nEmail: {{user_email}}\nRegistered: {{signup_date}}\n\n{{admin_url}}",
    variables: ["user_name", "user_email", "signup_date", "admin_url"],
    enabled: true,
  },
]

export const DEFAULT_SENDER_SETTINGS: SenderSettings = {
  fromName: "Manavizha",
  fromEmail: "hello@manavizha.com",
  replyTo: "support@manavizha.com",
  bounceEmail: "bounce@manavizha.com",
  provider: "Resend",
}

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  logoUrl: "/logo.png",
  headerColor: "#1F4068",
  footerText: "Manavizha — Meaningful connections, thoughtfully matched.",
  supportEmail: "support@manavizha.com",
  websiteUrl: "https://manavizha.com",
}

export const DEFAULT_AUTOMATION_TRIGGERS: AutomationTrigger[] = [
  {
    id: "on-signup",
    name: "Welcome on signup",
    description: "Send welcome email immediately after registration",
    templateId: "welcome",
    enabled: true,
  },
  {
    id: "on-verify",
    name: "Email verification",
    description: "Send when user registers or changes email",
    templateId: "email-verification",
    enabled: true,
  },
  {
    id: "profile-idle",
    name: "Profile incomplete reminder",
    description: "Remind users with incomplete profiles after 3 days",
    templateId: "profile-incomplete",
    enabled: true,
    delay: "3 days",
  },
  {
    id: "on-match",
    name: "New match alert",
    description: "Notify when a high-compatibility match is found",
    templateId: "new-match",
    enabled: true,
  },
  {
    id: "on-like",
    name: "Profile liked",
    description: "Notify when someone likes the user's profile",
    templateId: "profile-like",
    enabled: true,
  },
  {
    id: "on-subscription",
    name: "Subscription confirmation",
    description: "Send receipt when a plan is purchased",
    templateId: "subscription-confirmation",
    enabled: true,
  },
  {
    id: "admin-signup",
    name: "Admin signup alert",
    description: "Notify admins when a new user registers",
    templateId: "admin-new-signup",
    enabled: false,
  },
]

export const SAMPLE_DELIVERY_LOGS: DeliveryLogEntry[] = [
  {
    id: "1",
    sentAt: "2026-06-06 09:14",
    recipient: "priya.sharma@email.com",
    templateName: "Welcome email",
    status: "delivered",
  },
  {
    id: "2",
    sentAt: "2026-06-06 08:52",
    recipient: "arjun.m@email.com",
    templateName: "New match notification",
    status: "opened",
  },
  {
    id: "3",
    sentAt: "2026-06-05 18:30",
    recipient: "invalid@bad-domain.xyz",
    templateName: "Profile incomplete reminder",
    status: "bounced",
  },
  {
    id: "4",
    sentAt: "2026-06-05 14:11",
    recipient: "meera.k@email.com",
    templateName: "Subscription confirmation",
    status: "delivered",
  },
  {
    id: "5",
    sentAt: "2026-06-05 11:03",
    recipient: "test@example.com",
    templateName: "Password reset",
    status: "failed",
  },
]

export const DEFAULT_COMPLIANCE_SETTINGS: ComplianceSettings = {
  includeUnsubscribe: true,
  physicalAddress: "Manavizha, Chennai, Tamil Nadu, India",
  privacyPolicyUrl: "/privacy-policy",
  doubleOptIn: true,
}

export const STORAGE_KEYS = {
  templates: "manavizha-email-templates",
  sender: "manavizha-email-sender",
  branding: "manavizha-email-branding",
  automations: "manavizha-email-automations",
  compliance: "manavizha-email-compliance",
  campaigns: "manavizha-email-campaigns",
} as const
