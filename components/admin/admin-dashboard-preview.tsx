"use client"

import {
  LayoutDashboard,
  Users,
  UserCircle,
  ShieldCheck,
  BarChart3,
  Settings,
  ScrollText,
  Clock3,
} from "lucide-react"
import Image from "next/image"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Users", icon: Users, active: false },
  { label: "Profiles", icon: UserCircle, active: false },
  { label: "Verifications", icon: ShieldCheck, active: false },
  { label: "Reports", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
  { label: "System Logs", icon: ScrollText, active: false },
]

const stats = [
  { label: "Total Users", value: "12,540", change: "+3.2%", up: true },
  { label: "Verified Profiles", value: "9,842", change: "+1.6%", up: true },
  { label: "Pending Verifications", value: "236", change: "-1.5%", up: false },
  { label: "Reports", value: "48", change: "+2.1%", up: true },
]

const queue = [
  { name: "Arun K.", type: "Profile Verification", time: "2 hr ago" },
  { name: "Meena S.", type: "Photo Verification", time: "3 hr ago" },
  { name: "Kavitha R.", type: "ID Verification", time: "4 hr ago" },
]

export function AdminDashboardPreview() {
  return (
    <div className="relative w-full pb-20 sm:pb-24 lg:pb-28">
      <div className="relative overflow-visible">
        <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white shadow-[0_28px_70px_rgba(31,64,104,0.14),0_8px_24px_rgba(232,120,152,0.08)]">
          <div className="flex min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
          <aside className="hidden sm:flex w-[152px] shrink-0 flex-col border-r border-gray-100/80 bg-[#faf8f4]/70 px-3 py-4">
            <div className="mb-5 flex items-center gap-2 px-1">
              <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-auto" />
              <span className="text-[11px] font-bold leading-tight text-[#1F4068]">
                Manavizha
                <span className="block text-[10px] font-semibold text-brand-gold">Admin</span>
              </span>
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium ${
                      item.active
                        ? "bg-[#fce8ef] text-[#1F4068]"
                        : "text-gray-500"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </div>
                )
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 p-3.5 sm:p-4 lg:p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#1F4068] sm:text-[15px]">
              Dashboard overview
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-100/80 bg-[#faf8f4]/60 px-2.5 py-2.5 sm:px-3 sm:py-3"
                >
                  <p className="text-[10px] text-gray-500 leading-tight">{stat.label}</p>
                  <p className="mt-1 text-base font-bold text-[#1F4068] sm:text-lg">{stat.value}</p>
                  <p
                    className={`mt-0.5 text-[10px] font-semibold ${
                      stat.up ? "text-[#3bb9ac]" : "text-[#c97a7a]"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
              <div className="rounded-xl border border-gray-100/80 bg-[#faf8f4]/30 p-3 lg:col-span-3">
                <p className="mb-2.5 text-xs font-semibold text-[#1F4068]">Verification queue</p>
                <div className="space-y-2">
                  {queue.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/80 bg-white/90 px-2.5 py-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-[#1F4068]">
                          {item.name}
                        </p>
                        <p className="truncate text-[10px] text-gray-500">{item.type}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden items-center gap-1 text-[10px] text-gray-400 sm:inline-flex">
                          <Clock3 className="h-3 w-3" />
                          {item.time}
                        </span>
                        <span className="rounded-md bg-[#c9a227] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                          Review
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100/80 bg-[#faf8f4]/30 p-3 lg:col-span-2">
                <p className="mb-2.5 text-xs font-semibold text-[#1F4068]">Analytics</p>
                <div className="relative h-[118px] sm:h-[128px]">
                  <svg viewBox="0 0 240 100" className="h-full w-full" aria-hidden>
                    <defs>
                      <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e87898" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#e87898" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 78 C30 72, 45 58, 70 62 S110 48, 140 52 S190 28, 240 34 L240 100 L0 100 Z"
                      fill="url(#adminChartFill)"
                    />
                    <path
                      d="M0 78 C30 72, 45 58, 70 62 S110 48, 140 52 S190 28, 240 34"
                      fill="none"
                      stroke="#e87898"
                      strokeWidth="2.5"
                    />
                    {[
                      [0, 78],
                      [70, 62],
                      [140, 52],
                      [240, 34],
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="4" fill="#1F4068" />
                    ))}
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] text-gray-400">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Anchored to dashboard card corners — matches UI mockup */}
        <img
          src="/images/admin/ring-soft.png"
          alt=""
          className="pointer-events-none absolute z-30 left-0 bottom-0 w-[clamp(118px,31%,200px)] -translate-x-[6%] translate-y-[46%] sm:-translate-x-[5%] sm:translate-y-[48%] h-auto object-contain drop-shadow-[0_10px_24px_rgba(201,162,39,0.15)]"
          draggable={false}
        />

        <img
          src="/images/admin/kuthu-vilakku-soft.png"
          alt=""
          className="pointer-events-none absolute z-30 right-0 bottom-0 w-[clamp(155px,46%,380px)] translate-x-[8%] translate-y-[10%] sm:translate-x-[10%] sm:translate-y-[8%] h-auto object-contain drop-shadow-[0_12px_28px_rgba(31,64,104,0.1)]"
          draggable={false}
        />
      </div>
    </div>
  )
}
