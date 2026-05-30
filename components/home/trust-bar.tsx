import { Fragment } from "react"
import { ShieldCheck, Lock, Award, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="bg-white border border-gray-100/90 rounded-xl shadow-[0_8px_32px_rgba(31,64,104,0.06)] px-4 py-3 sm:px-5 sm:py-3.5">
      <div className="flex flex-wrap lg:flex-nowrap items-stretch">
        {trustPillars.map((pillar, index) => {
          const Icon = pillar.icon
          return (
            <Fragment key={pillar.title}>
              {index > 0 && (
                <span
                  className="hidden lg:flex items-center text-gray-300/80 text-sm leading-none px-3 xl:px-4 shrink-0 select-none"
                  aria-hidden
                >
                  |
                </span>
              )}
              <div
                className={cn(
                  "flex gap-2.5 items-start min-w-0 w-1/2 py-0.5 lg:w-auto lg:flex-1 lg:py-0",
                  (index === 1 || index === 3) && "pl-1 sm:pl-2 lg:pl-0"
                )}
              >
                {(index === 1 || index === 3) && (
                  <span
                    className="lg:hidden text-gray-300/80 text-sm leading-none shrink-0 self-center mr-1 sm:mr-2 select-none"
                    aria-hidden
                  >
                    |
                  </span>
                )}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full ${pillar.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`h-3.5 w-3.5 ${pillar.iconColor}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#1F4068] mb-0.5 leading-tight">{pillar.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-snug line-clamp-2">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
