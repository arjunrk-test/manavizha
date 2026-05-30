import { ShieldCheck, Lock, Award, Heart } from "lucide-react"

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "100% Verified",
    description: "Carefully verified profiles for your peace of mind.",
    iconBg: "bg-[#3bb9ac]/12",
    iconColor: "text-[#3bb9ac]",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is private and protected with advanced security.",
    iconBg: "bg-[#c9a227]/12",
    iconColor: "text-[#c9a227]",
  },
  {
    icon: Award,
    title: "Trusted by Families",
    description: "10,000+ families trust Manavizha for genuine connections.",
    iconBg: "bg-[#e8a0a0]/20",
    iconColor: "text-[#c97a7a]",
  },
  {
    icon: Heart,
    title: "Free Registration",
    description: "Create your profile for free and explore meaningful matches.",
    iconBg: "bg-[#3bb9ac]/12",
    iconColor: "text-[#3bb9ac]",
  },
]

export function TrustBar() {
  return (
    <div className="bg-white border border-gray-100/90 rounded-2xl shadow-[0_12px_48px_rgba(31,64,104,0.08)] px-6 py-8 sm:px-10 sm:py-9">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {trustPillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <div key={pillar.title} className="flex gap-4 items-start">
              <div
                className={`shrink-0 w-11 h-11 rounded-full ${pillar.iconBg} flex items-center justify-center`}
              >
                <Icon className={`h-5 w-5 ${pillar.iconColor}`} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1F4068] mb-1">{pillar.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{pillar.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
