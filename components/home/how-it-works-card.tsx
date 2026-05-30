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
    <div className="bg-white rounded-2xl shadow-[0_16px_48px_rgba(31,64,104,0.14)] border border-gray-100/80 p-6 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold mb-2">
        How it works
      </p>
      <h3 className="font-display text-xl sm:text-[1.35rem] font-semibold text-[#1F4068] mb-6 leading-snug">
        Your path to the right match
      </h3>

      <div className="relative pl-1">
        <div
          className="absolute left-[11px] top-2 bottom-10 border-l border-dashed border-[#c9a227]/40"
          aria-hidden
        />

        <ol className="space-y-5">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-3.5 items-start pl-0">
              <span className="relative z-10 shrink-0 w-[22px] h-[22px] rounded-full bg-[#c9a227]/15 text-[#1F4068] text-[11px] font-bold flex items-center justify-center mt-0.5 ring-4 ring-white">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 rounded-xl bg-[#3bb9ac]/10 border border-[#3bb9ac]/15 px-4 py-3.5 flex gap-3 items-start">
        <Shield className="h-4 w-4 text-[#3bb9ac] shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-[#1F4068]">Privacy first. Safety always.</span>{" "}
          Your information is kept secure and shared only on your terms.
        </p>
      </div>
    </div>
  )
}
