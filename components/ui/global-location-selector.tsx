"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import axios from "axios"
import { cn } from "@/lib/utils"

interface LocationSelectorProps {
  onLocationChange: (location: {
    country: string
    state: string
    city: string
    latitude: number
    longitude: number
  }) => void
  initialCity?: string
}

export function GlobalLocationSelector({ onLocationChange, initialCity }: LocationSelectorProps) {
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState(initialCity || "")
  
  const [loading, setLoading] = useState({ countries: false, states: false, cities: false, coords: false })
  const [search, setSearch] = useState({ country: "", state: "", city: "" })

  const API_BASE = "https://countriesnow.space/api/v0.1"

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(prev => ({ ...prev, countries: true }))
      try {
        const res = await axios.get(`${API_BASE}/countries/positions`)
        setCountries(res.data.data)
      } catch (err) {
        console.error("Failed to fetch countries", err)
      } finally {
        setLoading(prev => ({ ...prev, countries: false }))
      }
    }
    fetchCountries()
  }, [])

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) return
      setLoading(prev => ({ ...prev, states: true }))
      setStates([])
      setSelectedState("")
      setSelectedCity("")
      try {
        const res = await axios.post(`${API_BASE}/countries/states`, { country: selectedCountry })
        setStates(res.data.data.states)
      } catch (err) {
        console.error("Failed to fetch states", err)
      } finally {
        setLoading(prev => ({ ...prev, states: false }))
      }
    }
    fetchStates()
  }, [selectedCountry])

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState || !selectedCountry) return
      setLoading(prev => ({ ...prev, cities: true }))
      setCities([])
      setSelectedCity("")
      try {
        const res = await axios.post(`${API_BASE}/countries/state/cities`, {
          country: selectedCountry,
          state: selectedState
        })
        setCities(res.data.data)
      } catch (err) {
        console.error("Failed to fetch cities", err)
      } finally {
        setLoading(prev => ({ ...prev, cities: false }))
      }
    }
    fetchCities()
  }, [selectedState, selectedCountry])

  const fetchCoords = async (city: string) => {
    setLoading(prev => ({ ...prev, coords: true }))
    try {
      // Use Nominatim for coordinates
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${city},${selectedState},${selectedCountry}&limit=1`, {
        headers: {
            'User-Agent': 'ManavizhaHoroscopeApp/1.0 (contact@manavizha.com)'
        }
      })
      if (res.data[0]) {
        const { lat, lon } = res.data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        if (!isNaN(latitude) && !isNaN(longitude)) {
            onLocationChange({
              country: selectedCountry,
              state: selectedState,
              city: city,
              latitude: latitude,
              longitude: longitude
            })
        } else {
            console.error("Invalid coordinates from Nominatim:", { lat, lon })
            toast.error("Could not determine precise coordinates for this city.")
        }
      } else {
          toast.error("City coordinates not found. Please try a nearby major city.")
      }
    } catch (err) {
      console.error("Failed to fetch coordinates", err)
      toast.error("Coordinate service (Nominatim) is currently unavailable.")
    } finally {
      setLoading(prev => ({ ...prev, coords: false }))
    }
  }

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(search.country.toLowerCase()))
  const filteredStates = states.filter(s => s.name.toLowerCase().includes(search.state.toLowerCase()))
  const filteredCities = cities.filter(c => c.toLowerCase().includes(search.city.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      {/* Country Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Country</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-gray-50/50 border-gray-100 rounded-2xl h-12">
              {loading.countries ? <Loader2 className="h-4 w-4 animate-spin" /> : (selectedCountry || "Select Country")}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto rounded-3xl border border-gray-100 shadow-2xl p-0 bg-white z-[100]"
          >
            <div className="p-3 border-b sticky top-0 bg-white z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B0082]/40 group-focus-within:text-[#4B0082] transition-colors" />
                    <Input 
                        placeholder="Search country..." 
                        className="h-10 pl-10 text-sm rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                        value={search.country}
                        onChange={(e) => setSearch(prev => ({ ...prev, country: e.target.value }))}
                    />
                </div>
            </div>
            <div className="p-1">
                {filteredCountries.map((c) => (
                <DropdownMenuItem
                    key={c.name}
                    onSelect={() => {
                    setSelectedCountry(c.name)
                    setSearch(prev => ({ ...prev, country: "" }))
                    }}
                    className="flex items-center justify-between py-3 px-4 cursor-pointer rounded-2xl hover:bg-[#4B0082]/5 focus:bg-[#4B0082]/5 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                    {selectedCountry === c.name && <Check className="h-4 w-4 text-[#4B0082]" />}
                </DropdownMenuItem>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* State Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State / Province</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!selectedCountry || states.length === 0}>
            <Button variant="outline" className="w-full justify-between bg-gray-50/50 border-gray-100 rounded-2xl h-12 disabled:opacity-30">
              {loading.states ? <Loader2 className="h-4 w-4 animate-spin" /> : (selectedState || "Select State")}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto rounded-3xl border border-gray-100 shadow-2xl p-0 bg-white z-[100]"
          >
            <div className="p-3 border-b sticky top-0 bg-white z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B0082]/40 group-focus-within:text-[#4B0082] transition-colors" />
                    <Input 
                        placeholder="Search state..." 
                        className="h-10 pl-10 text-sm rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                        value={search.state}
                        onChange={(e) => setSearch(prev => ({ ...prev, state: e.target.value }))}
                    />
                </div>
            </div>
            <div className="p-1">
                {filteredStates.map((s) => (
                <DropdownMenuItem
                    key={s.name}
                    onSelect={() => {
                    setSelectedState(s.name)
                    setSearch(prev => ({ ...prev, state: "" }))
                    }}
                    className="flex items-center justify-between py-3 px-4 cursor-pointer rounded-2xl hover:bg-[#4B0082]/5 focus:bg-[#4B0082]/5 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    {selectedState === s.name && <Check className="h-4 w-4 text-[#4B0082]" />}
                </DropdownMenuItem>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!selectedState || cities.length === 0}>
            <Button variant="outline" className="w-full justify-between bg-gray-50/50 border-gray-100 rounded-2xl h-12 disabled:opacity-30">
              {loading.cities || loading.coords ? <Loader2 className="h-4 w-4 animate-spin" /> : (selectedCity || "Select City")}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto rounded-3xl border border-gray-100 shadow-2xl p-0 bg-white z-[100]"
          >
            <div className="p-3 border-b sticky top-0 bg-white z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B0082]/40 group-focus-within:text-[#4B0082] transition-colors" />
                    <Input 
                        placeholder="Search city..." 
                        className="h-10 pl-10 text-sm rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                        value={search.city}
                        onChange={(e) => setSearch(prev => ({ ...prev, city: e.target.value }))}
                    />
                </div>
            </div>
            <div className="p-1">
                {filteredCities.map((c) => (
                <DropdownMenuItem
                    key={c}
                    onSelect={() => {
                    setSelectedCity(c)
                    setSearch(prev => ({ ...prev, city: "" }))
                    fetchCoords(c)
                    }}
                    className="flex items-center justify-between py-3 px-4 cursor-pointer rounded-2xl hover:bg-[#4B0082]/5 focus:bg-[#4B0082]/5 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">{c}</span>
                    {selectedCity === c && <Check className="h-4 w-4 text-[#4B0082]" />}
                </DropdownMenuItem>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
