"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { useEffect, useRef } from "react"

export interface SetupWizardStep {
  id: string
  title: string
}

interface ProfileSetupWizardTimelineProps {
  steps: SetupWizardStep[]
  currentStep: number
  getStepProgress: (stepId: string) => number
  onStepClick: (index: number) => void
}

export function ProfileSetupWizardTimeline({
  steps,
  currentStep,
  getStepProgress,
  onStepClick,
}: ProfileSetupWizardTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const activeEl = stepRefs.current[currentStep]
    if (activeEl && scrollRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [currentStep])

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:#eadfce_transparent] lg:overflow-visible"
    >
      <ol className="relative flex w-full min-w-max list-none m-0 p-0 items-start lg:min-w-0">
        {steps.map((step, index) => {
          const progress = getStepProgress(step.id)
          const isActive = index === currentStep
          const isCompleted = progress === 100
          const isLast = index === steps.length - 1
          const connectorFilled = isCompleted || index < currentStep

          return (
            <li
              key={step.id}
              ref={(el) => {
                stepRefs.current[index] = el
              }}
              className="flex flex-1 items-start min-w-[72px] lg:min-w-0"
            >
              <button
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.title}${isCompleted ? ", complete" : progress > 0 ? `, ${progress}% filled` : ""}`}
                className={cn(
                  "group relative z-10 flex w-full min-w-[72px] flex-col items-center gap-1.5 rounded-xl px-1.5 py-2 transition-colors sm:px-2",
                  isActive && "bg-[#fce8ef]/80",
                  !isActive && "hover:bg-[#faf8f4]"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isActive &&
                      "border-[#e87898] bg-[#e87898] text-white shadow-[0_0_0_4px_rgba(232,120,152,0.18)]",
                    isCompleted &&
                      !isActive &&
                      "border-[#e87898] bg-[#fce8ef] text-[#e87898]",
                    !isActive &&
                      !isCompleted &&
                      "border-[#eadfce] bg-white text-[#9ca3af] group-hover:border-[#e87898]/40 group-hover:text-[#e87898]"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                  ) : (
                    <span className="text-[11px] font-semibold leading-none">{index + 1}</span>
                  )}
                </span>

                <span className="w-full text-center">
                  <span
                    className={cn(
                      "block text-[10px] sm:text-[11px] font-medium leading-snug line-clamp-2",
                      isActive && "text-[#e87898]",
                      !isActive && isCompleted && "text-[#1F4068]",
                      !isActive && !isCompleted && "text-[#6b7280] group-hover:text-[#374151]"
                    )}
                  >
                    {step.title}
                  </span>
                  {isActive && (
                    <span className="mt-0.5 block text-[9px] font-medium text-[#e87898]/90">
                      {progress}%
                    </span>
                  )}
                </span>
              </button>

              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "mt-4 h-px min-w-[8px] flex-1 shrink",
                    connectorFilled ? "bg-[#e87898]/70" : "bg-[#eadfce]"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
