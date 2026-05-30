import { Shield } from "lucide-react"

const steps = [
  {
    title: "Tell your story",
    description: "Share photos, background, and partner preferences.",
  },
  {
    title: "Explore verified matches",
    description: "Browse profiles aligned with your values and family expectations.",
  },
  {
    title: "Connect with intention",
    description: "Express interest and message privately when you are ready.",
  },
]

export function HowItWorksCard() {
  return (
    <div className="bg-white rounded-xl shadow-[0_12px_40px_rgba(31,64,104,0.12)] border border-gray-100/80 p-3.5 sm:p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-1">
        How it works
      </p>
      <h3 className="font-display text-base font-semibold text-[#1F4068] mb-3 leading-snug">
        Your path to the right match
      </h3>

      <div className="relative pl-0.5">
        <div
          className="absolute left-[9px] top-1.5 bottom-6 border-l border-dashed border-[#c9a227]/40"
          aria-hidden
        />

        <ol className="space-y-2.5">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-2.5 items-start">
              <span className="relative z-10 shrink-0 w-[18px] h-[18px] rounded-full bg-[#c9a227]/15 text-[#1F4068] text-[10px] font-bold flex items-center justify-center mt-0.5 ring-2 ring-white">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{step.title}</p>
                <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-3 rounded-lg bg-[#3bb9ac]/10 border border-[#3bb9ac]/15 px-3 py-2 flex gap-2 items-start">
        <Shield className="h-3.5 w-3.5 text-[#3bb9ac] shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-[10px] text-gray-600 leading-snug">
          <span className="font-semibold text-[#1F4068]">Privacy first. Safety always.</span>{" "}
          Your information stays secure and shared on your terms.
        </p>
      </div>
    </div>
  )
}
