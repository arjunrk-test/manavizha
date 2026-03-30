export const TAMIL_NADU_DISTRICT_COORDS: Record<string, { lat: number, lng: number }> = {
    "chennai": { lat: 13.0827, lng: 80.2707 },
    "coimbatore": { lat: 11.0168, lng: 76.9558 },
    "madurai": { lat: 9.9252, lng: 78.1198 },
    "tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
    "trichy": { lat: 10.7905, lng: 78.7047 }, // alias
    "salem": { lat: 11.6643, lng: 78.1460 },
    "tirunelveli": { lat: 8.7139, lng: 77.7567 },
    "vellore": { lat: 12.9165, lng: 79.1325 },
    "erode": { lat: 11.3410, lng: 77.7172 },
    "thoothukudi": { lat: 8.7642, lng: 78.1348 },
    "tuticorin": { lat: 8.7642, lng: 78.1348 }, // alias
    "dindigul": { lat: 10.3673, lng: 77.9803 },
    "thanjavur": { lat: 10.7870, lng: 79.1378 },
    "tiruppur": { lat: 11.1085, lng: 77.3411 },
    "karur": { lat: 10.9504, lng: 78.0833 },
    "cuddalore": { lat: 11.7480, lng: 79.7714 },
    "kanchipuram": { lat: 12.8342, lng: 79.7036 },
    "kanyakumari": { lat: 8.0883, lng: 77.5385 },
    "dharmapuri": { lat: 12.1211, lng: 78.1582 },
    "krishnagiri": { lat: 12.5273, lng: 78.2144 },
    "tiruvannamalai": { lat: 12.2300, lng: 79.0667 },
    "villupuram": { lat: 11.9401, lng: 79.4861 },
    "pudukkottai": { lat: 10.3797, lng: 78.8205 },
    "ramanathapuram": { lat: 9.3639, lng: 78.8320 },
    "virudhunagar": { lat: 9.5680, lng: 77.9624 },
    "namakkal": { lat: 11.2189, lng: 78.1674 },
    "ariyalur": { lat: 11.1401, lng: 79.0786 },
    "perambalur": { lat: 11.2333, lng: 78.8833 },
    "tenkasi": { lat: 8.9594, lng: 77.3110 },
    "theni": { lat: 10.0104, lng: 77.4768 },
    "tiruvarur": { lat: 10.7715, lng: 79.6366 },
    "nagapattinam": { lat: 10.7656, lng: 79.8424 },
    "sivaganga": { lat: 9.8433, lng: 78.4809 },
    "nilgiris": { lat: 11.4064, lng: 76.6932 },
    "ooty": { lat: 11.4064, lng: 76.6932 }, // alias
    "chengalpattu": { lat: 12.6841, lng: 79.9839 },
    "ranipet": { lat: 12.9274, lng: 79.3323 },
    "tirupathur": { lat: 12.4939, lng: 78.5678 },
    "kallakurichi": { lat: 11.7381, lng: 78.9639 },
    "mayiladuthurai": { lat: 11.1035, lng: 79.6524 },
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "bangalore": { lat: 12.9716, lng: 77.5946 }, // alias
    "mumbai": { lat: 19.0760, lng: 72.8777 },
    "delhi": { lat: 28.7041, lng: 77.1025 },
    "hyderabad": { lat: 17.3850, lng: 78.4867 },
    "kochi": { lat: 9.9312, lng: 76.2673 },
    "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 }
}

/**
 * Calculates straight line distance between two coordinates using Haversine formula
 * Returns distance in kilometers.
 */
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Retrieves coordinates for a given city string, cleaning up the string to match aliases.
 */
export function getCoordinatesForCity(cityStr: string): { lat: number, lng: number } | null {
    if (!cityStr) return null;
    let normalized = cityStr.split(',')[0].trim().toLowerCase();
    
    // Quick cleanup
    if (normalized.includes(' ')) {
        normalized = normalized.split(' ')[0];
    }

    return TAMIL_NADU_DISTRICT_COORDS[normalized] || null;
}
