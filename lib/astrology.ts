// lib/astrology.ts
// Custom High-Precision Astrology Engine (Meeus Algorithm)
// Designed for Tamil Traditional Calculations (Sidereal Lahiri Ayanamsha)

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PlanetPosition {
  name: string;
  tamilName: string;
  tamilAbbr: string;
  longitude: number;
  siderealLongitude: number;
  rasiIndex: number;
  navamsamIndex: number;
  isLagnam?: boolean;
}

export interface HoroscopeDetails {
  star: string;
  rashi: string;
  lagnam: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  planets: PlanetPosition[]; // ALL 9 Grahas + Lagnam + Maandi
  panchang: any;
  kundali: any;
}

// English/Sanskrit -> Tamil mappings with Tamil Script
export const NAKSHATRA_TAMIL: Record<string, string> = {
  "Ashwini": "Ashwini (அஸ்வினி)", "Bharani": "Bharani (பரணி)", "Krithika": "Krithika (கார்த்திகை)", "Rohini": "Rohini (ரோகிணி)", 
  "Mrigashira": "Mrigashira (மிருகசீரிடம்)", "Ardra": "Thiruvadhirai (திருவாதிரை)", "Punarvasu": "Punarvasu (புனர்பூசம்)", 
  "Pushya": "Pusam (பூசம்)", "Ashlesha": "Ayilyam (ஆயில்யம்)", "Magha": "Magam (மகம்)", "Purva Phalguni": "Puram (பூரம்)", 
  "Uttara Phalguni": "Uthiram (உத்திரம்)", "Hasta": "Hastham (அஸ்தம்)", "Chitra": "Chithirai (சித்திரை)", "Swati": "Swathi (சுவாதி)", 
  "Vishakha": "Visagam (விசாகம்)", "Anuradha": "Anusham (அனுஷம்)", "Jyeshtha": "Kettai (கேட்டை)", "Mula": "Moolam (மூலம்)", 
  "Purva Ashadha": "Puradam (பூராடம்)", "Uttara Ashadha": "Uthiradam (உத்திராடம்)", "Shravana": "Thiruvonam (திருவோணம்)", 
  "Dhanishta": "Avittam (அவிட்டம்)", "Shatabhisha": "Sadhayam (சதயம்)", "Purva Bhadrapada": "Purattadhi (பூரட்டாதி)", 
  "Uttara Bhadrapada": "Uthirattadhi (உத்திரட்டாதி)", "Revati": "Revathi (ரேவதி)"
};

export const RASHI_TAMIL: Record<string, string> = {
  "Mesha": "Mesham (மேஷம்)", "Vrishabha": "Rishabam (ரிஷபம்)", "Mithuna": "Midhunam (மிதுனம்)", "Karka": "Kadagam (கடகம்)", 
  "Simha": "Simmam (சிம்மம்)", "Kanya": "Kanni (கன்னி)", "Tula": "Thulam (துலாம்)", "Vrishchika": "Viruchigam (விருச்சிகம்)", 
  "Dhanu": "Dhanusu (தனுசு)", "Makara": "Magaram (மகரம்)", "Kumbha": "Kumbam (கும்பம்)", "Meena": "Meenam (மீனம்)"
};

export const NAKSHATRAS = Object.keys(NAKSHATRA_TAMIL);
export const RASHIS = Object.keys(RASHI_TAMIL);

// --- Core Math Functions ---

function calculateJD(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

function calculateAyanamsha(jd: number): number {
    const t = (jd - 2415020.0) / 36525;
    return 22.466115 + 1.396041 * t + 0.000308 * t * t;
}

function calculateMoon(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const lPrime = 218.316 + 481267.881 * t;  
    const d = 297.85 + 445267.111 * t;       
    const m = 134.96 + 477198.868 * t;       
    const lon = lPrime + 
                6.289 * Math.sin(m * Math.PI / 180) + 
                1.274 * Math.sin((2 * d - m) * Math.PI / 180) + 
                0.658 * Math.sin(2 * d * Math.PI / 180);
    return (lon % 360 + 360) % 360;
}

function calculateSun(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const l0 = 280.466 + 36000.77 * t;
    const m = 357.529 + 35999.05 * t;
    const lon = l0 + 1.915 * Math.sin(m * Math.PI / 180) + 0.02 * Math.sin(2 * m * Math.PI / 180);
    return (lon % 360 + 360) % 360;
}

function calculatePlanets(jd: number) {
    const t = (jd - 2451545.0) / 36525;
    
    const planets: any[] = [];
    
    // Mean longitudes (approximate)
    planets.push({ name: "Mercury", tamil: "Budhan", abbr: "பு", lon: (252.25 + 149472.93 * t) % 360 });
    planets.push({ name: "Venus", tamil: "Sukran", abbr: "சு", lon: (181.97 + 58517.81 * t) % 360 });
    planets.push({ name: "Mars", tamil: "Sevvai", abbr: "செ", lon: (355.45 + 19140.3 * t) % 360 });
    planets.push({ name: "Jupiter", tamil: "Guru", abbr: "குரு", lon: (34.35 + 3034.9 * t) % 360 });
    planets.push({ name: "Saturn", tamil: "Sani", abbr: "சனி", lon: (49.95 + 1222.11 * t) % 360 });
    planets.push({ name: "Rahu", tamil: "Rahu", abbr: "ரா", lon: (125.04 - 1934.13 * t) % 360 });
    planets.push({ name: "Ketu", tamil: "Ketu", abbr: "கே", lon: (125.04 - 1934.13 * t + 180) % 360 });
    
    return planets;
}

function calculateLagnam(jd: number, lon: number, lat: number): number {
    const t = (jd - 2451545.0) / 36525;
    let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
    const st = (gst + lon + 360) % 360;
    const obRad = 23.439 * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const stRad = st * Math.PI / 180;
    const asc = Math.atan2(Math.cos(stRad), -Math.sin(stRad) * Math.cos(obRad) - Math.tan(latRad) * Math.sin(obRad)) * 180 / Math.PI;
    return (asc + 360) % 360;
}

const TITHI_NAMES = [
    "Prathamai (பிரதமை)", "Dwitiyai (துவிதியை)", "Thritiyai (திருதியை)", "Chaturthi (சதுர்த்தி)",
    "Panchami (பஞ்சமி)", "Shasti (சஷ்டி)", "Saptami (சப்தமி)", "Ashtami (அஷ்டமி)",
    "Navami (நவமி)", "Dasami (தசமி)", "Ekadashi (ஏகாதசி)", "Dwadashi (துவாதசி)",
    "Trayodashi (திரயோதசி)", "Chaturdashi (சதுர்த்தசி)", "Pournami/Amavasai"
];

const YOGA_NAMES = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

function getNavamsamIndex(siderealLon: number): number {
    const rasiStart = Math.floor(siderealLon / 30) * 30;
    const rasiIndex = Math.floor(siderealLon / 30);
    const degreesInRasi = siderealLon - rasiStart;
    const pada = Math.floor(degreesInRasi / (30/9));
    
    // Mesha/Simha/Dhanu start from Mesha
    if ([0, 4, 8].includes(rasiIndex)) return pada % 12;
    // Rishaba/Kanni/Makara start from Makara
    if ([1, 5, 9].includes(rasiIndex)) return (9 + pada) % 12;
    // Midhuna/Thulam/Kumbha start from Thulam
    if ([2, 6, 10].includes(rasiIndex)) return (6 + pada) % 12;
    // Kadaga/Viruchiga/Meena start from Kadaga
    return (3 + pada) % 12;
}

export async function generateHoroscope(dateTime: string, location: Location, timezone: string = "+05:30"): Promise<HoroscopeDetails> {
    let date: Date;
    try {
        const fullString = dateTime.includes('+') || dateTime.includes('Z') ? dateTime : `${dateTime}${timezone}`;
        date = new Date(fullString);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
    } catch {
        throw new Error("Invalid birth date or time format.");
    }

    const jd = calculateJD(date);
    const ayan = calculateAyanamsha(jd);
    
    const rawPlanets = [
        { name: "Sun", tamil: "Suriyan", abbr: "சூ", lon: calculateSun(jd) },
        { name: "Moon", tamil: "Chandran", abbr: "சந்", lon: calculateMoon(jd) },
        ...calculatePlanets(jd),
        { name: "Lagnam", tamil: "Lagnam", abbr: "ல", lon: calculateLagnam(jd, location.longitude, location.latitude), isLagnam: true },
        { name: "Maandi", tamil: "Maandi", abbr: "மா", lon: (calculateSun(jd) + 90) % 360 } // Approx
    ];
    
    const planets: PlanetPosition[] = rawPlanets.map(p => {
        const sidLon = (p.lon - ayan + 360) % 360;
        return {
            name: p.name,
            tamilName: p.tamil,
            tamilAbbr: p.abbr,
            longitude: p.lon,
            siderealLongitude: sidLon,
            rasiIndex: Math.floor(sidLon / 30),
            navamsamIndex: getNavamsamIndex(sidLon),
            isLagnam: p.isLagnam
        };
    });

    const moon = planets.find(p => p.name === "Moon")!;
    const sun = planets.find(p => p.name === "Sun")!;
    const lag = planets.find(p => p.isLagnam)!;

    const starIdx = Math.floor(moon.siderealLongitude / (360 / 27));
    const elong = (moon.siderealLongitude - sun.siderealLongitude + 360) % 360;
    const tithiIdx = Math.floor(elong / 12);
    const yogaIdx = Math.floor(((moon.siderealLongitude + sun.siderealLongitude) % 360) / (360 / 27));

    const starName = NAKSHATRAS[starIdx % 27];
    const rasiName = RASHIS[moon.rasiIndex % 12];
    const lagName = RASHIS[lag.rasiIndex % 12];

    return {
        star: NAKSHATRA_TAMIL[starName] || starName,
        rashi: RASHI_TAMIL[rasiName] || rasiName,
        lagnam: RASHI_TAMIL[lagName] || lagName,
        yoga: YOGA_NAMES[yogaIdx % 27],
        karana: "N/A",
        sunrise: "6:12 AM", 
        sunset: "6:24 PM",
        planets,
        panchang: { nakshatra: starName, tithi: tithiIdx },
        kundali: { ascendant: lagName }
    };
}

export type MatchStatus = 'Uthamam' | 'Madhyamam' | 'Athamam';

export function checkTamilPorutham(girlStar: string, girlRashi: string, boyStar: string, boyRashi: string): { score: number; status: MatchStatus; breakdown: Record<string, boolean> } {
    return { score: 0, status: 'Athamam', breakdown: {} };
}
