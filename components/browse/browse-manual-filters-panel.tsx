"use client"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMasterData } from "@/hooks/use-master-data"
import {
  EMPTY_BROWSE_MANUAL_FILTERS,
  hasActiveBrowseManualFilters,
  type BrowseManualFilters,
} from "@/lib/utils/browse-manual-filter"
import { COLLEGE_EDUCATION_FILTER_OPTIONS } from "@/lib/utils/education-display"
import { cn } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"

interface BrowseManualFiltersPanelProps {
  filters: BrowseManualFilters
  onChange: (filters: BrowseManualFilters) => void
}

export function BrowseManualFiltersPanel({ filters, onChange }: BrowseManualFiltersPanelProps) {
  const { data: dbCastes } = useMasterData({ tableName: "master_caste" })
  const { data: dbSubcastes } = useMasterData({ tableName: "master_subcaste" })
  const { data: dbMaritalStatus } = useMasterData({ tableName: "master_marital_status" })

  const casteOptions = useMemo(() => ["Any", ...dbCastes.map((c) => c.value)], [dbCastes])
  const subcasteOptions = useMemo(() => {
    if (!filters.caste || filters.caste === "Any") return ["Any"]
    const filtered = dbSubcastes
      .filter((s) => !s.category || s.category === filters.caste)
      .map((s) => s.value)
    return ["Any", ...filtered]
  }, [dbSubcastes, filters.caste])
  const maritalOptions = useMemo(() => ["Any", ...dbMaritalStatus.map((m) => m.value)], [dbMaritalStatus])

  const active = hasActiveBrowseManualFilters(filters)

  const update = (patch: Partial<BrowseManualFilters>) => onChange({ ...filters, ...patch })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-4 rounded-[10px] text-[13px] font-medium shrink-0 transition-all",
            active
              ? "bg-[#e6f7f5] border-[#3bb9ac]/30 text-[#1F4068] hover:bg-[#e6f7f5]"
              : "bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#faf8f4]"
          )}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters{active ? " active" : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-[#1F4068]">Browse filters</p>
          <p className="text-xs text-gray-500 mt-0.5">Combine with your saved partner preferences.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Age from</Label>
            <Input
              type="number"
              min={18}
              max={80}
              value={filters.ageMin ?? ""}
              onChange={(e) =>
                update({ ageMin: e.target.value ? parseInt(e.target.value, 10) : null })
              }
              className="h-9"
              placeholder="Any"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Age to</Label>
            <Input
              type="number"
              min={18}
              max={80}
              value={filters.ageMax ?? ""}
              onChange={(e) =>
                update({ ageMax: e.target.value ? parseInt(e.target.value, 10) : null })
              }
              className="h-9"
              placeholder="Any"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Caste</Label>
          <Select
            value={filters.caste || "Any"}
            onValueChange={(value) =>
              update({ caste: value === "Any" ? null : value, subcaste: null })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {casteOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Subcaste</Label>
          <Select
            value={filters.subcaste || "Any"}
            onValueChange={(value) => update({ subcaste: value === "Any" ? null : value })}
            disabled={!filters.caste || filters.caste === "Any"}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {subcasteOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">College education</Label>
          <Select
            value={filters.educationLevel || "Any"}
            onValueChange={(value) =>
              update({ educationLevel: value === "Any" ? null : value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {COLLEGE_EDUCATION_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Marital status</Label>
          <Select
            value={filters.maritalStatus || "Any"}
            onValueChange={(value) =>
              update({ maritalStatus: value === "Any" ? null : value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {maritalOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm text-[#1F4068]">With photo</Label>
          <Switch
            checked={!!filters.withPhoto}
            onCheckedChange={(checked) => update({ withPhoto: checked || undefined })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm text-[#1F4068]">Verified profile</Label>
          <Switch
            checked={!!filters.verified}
            onCheckedChange={(checked) => update({ verified: checked || undefined })}
          />
        </div>

        {active && (
          <Button
            type="button"
            variant="ghost"
            className="w-full h-9 text-xs text-[#6b7280]"
            onClick={() => onChange(EMPTY_BROWSE_MANUAL_FILTERS)}
          >
            Clear filters
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
