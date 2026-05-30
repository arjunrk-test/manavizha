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
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold mb-3">
        How it works
      </p>

      <ol className="space-y-0">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-2.5">
              <div className="flex w-5 shrink-0 flex-col items-center self-stretch">
                <span className="how-it-works-step-badge shrink-0">{index + 1}</span>
                {index < steps.length - 1 && (
                  <div
                    className="my-1.5 w-px grow border-l border-dashed border-[#c9a227]/40"
                    aria-hidden
                  />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${index < steps.length - 1 ? "pb-2.5" : ""}`}>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{step.title}</p>
                <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
    </div>
  )
}
