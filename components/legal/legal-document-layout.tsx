"use client"

import { type ReactNode, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export type LegalSectionLink = {
  id: string
  number: number
  title: string
}

interface LegalDocumentLayoutProps {
  sections: LegalSectionLink[]
  summary?: string
  children: ReactNode
}

export function LegalDocumentLayout({ sections, summary, children }: LegalDocumentLayoutProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] xl:gap-12">
      <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-gold lg:block">
          On this page
        </p>

        <ul className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0 lg:shrink">
              <a
                href={`#${section.id}`}
                onClick={() => setActiveId(section.id)}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-xs leading-snug transition-colors lg:px-3 lg:py-2 lg:text-[13px]",
                  activeId === section.id
                    ? "bg-[#1F4068]/8 font-medium text-[#1F4068]"
                    : "text-gray-500 hover:bg-white/70 hover:text-[#1F4068]"
                )}
              >
                <span className="mr-1 text-brand-gold">{section.number}.</span>
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        {summary && (
          <p className="mb-8 max-w-2xl border-l-2 border-[#3bb9ac]/40 pl-4 text-sm leading-relaxed text-gray-600">
            {summary}
          </p>
        )}
        <div className="max-w-2xl space-y-0">{children}</div>
      </div>
    </div>
  )
}
