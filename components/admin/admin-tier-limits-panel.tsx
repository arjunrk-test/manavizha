"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Gauge, Save } from "lucide-react"

const TIER_META: Record<string, { label: string; hint: string; color: string }> = {
    free: { label: "Free", hint: "Non-premium members", color: "text-[#6b7280]" },
    premium: { label: "Premium", hint: "Standard paid plan", color: "text-[#1F4068]" },
    prime_gold: { label: "Prime Gold", hint: "Top-tier plan", color: "text-[#c9a227]" },
}

const ORDER = ["free", "premium", "prime_gold"]

export function AdminTierLimitsPanel() {
    const [limits, setLimits] = useState<Record<string, number>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [savingTier, setSavingTier] = useState<string>("")

    useEffect(() => {
        const load = async () => {
            try {
                const res = await authFetch("/api/tier-limits")
                if (res.ok) {
                    const data = await res.json()
                    const map: Record<string, number> = {}
                    ;(data.limits || []).forEach((l: any) => { map[l.tier] = l.contact_view_limit })
                    setLimits(map)
                }
            } catch {
                toast.error("Failed to load tier limits")
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const save = async (tier: string) => {
        setSavingTier(tier)
        try {
            const res = await authFetch("/api/tier-limits", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier, limit: Number(limits[tier]) || 0 }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                toast.success(`${TIER_META[tier]?.label} limit saved`)
            } else {
                toast.error(data.error || "Failed to save")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setSavingTier("")
        }
    }

    return (
        <div className="rounded-[20px] border border-[#f0ebe3] bg-white/90 shadow-[0_2px_16px_rgba(31,64,104,0.05)] overflow-hidden">
            <div className="border-b border-[#f0ebe3] px-5 py-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4068]/10">
                    <Gauge className="h-4 w-4 text-[#1F4068]" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[#1F4068]">Contact-view limits</h2>
                    <p className="text-xs text-gray-500">How many distinct member contacts each tier can unlock</p>
                </div>
            </div>

            <div className="p-5 space-y-3">
                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#f0ebe3] border-t-[#1F4068]" />
                    </div>
                ) : (
                    ORDER.map(tier => (
                        <div key={tier} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f0ebe3] bg-white p-4">
                            <div>
                                <p className={`text-sm font-semibold ${TIER_META[tier]?.color}`}>{TIER_META[tier]?.label}</p>
                                <p className="text-xs text-gray-500">{TIER_META[tier]?.hint}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    value={limits[tier] ?? 0}
                                    onChange={(e) => setLimits(prev => ({ ...prev, [tier]: Number(e.target.value) }))}
                                    className="h-10 w-24 rounded-xl border border-[#e5e7eb] px-3 text-sm text-[#1F4068] focus:border-[#1F4068]/40 focus:outline-none focus:ring-2 focus:ring-[#1F4068]/10"
                                />
                                <span className="text-xs text-gray-400">contacts</span>
                                <Button
                                    size="sm"
                                    className="rounded-xl bg-[#1F4068] hover:bg-[#173252] text-white"
                                    disabled={savingTier === tier}
                                    onClick={() => save(tier)}
                                >
                                    <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                <p className="text-[11px] text-gray-400 pt-1">
                    Set a tier to a high number (e.g. 9999) for effectively unlimited views. Re-viewing an
                    already-unlocked contact never counts again.
                </p>
            </div>
        </div>
    )
}
