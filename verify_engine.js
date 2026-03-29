function calculateAyanamsha(jd) {
    const t = (jd - 2415020.0) / 36525;
    return 22.466115 + 1.396041 * t + 0.000308 * t * t;
}

function calculateMoon(jd) {
    const t = (jd - 2451545.0) / 36525;
    const lPrime = 218.316 + 481267.881 * t; // Mean longitude
    const d = 297.85 + 445267.111 * t;      // Mean elongation
    const m = 134.96 + 477198.868 * t;      // Moon mean anomaly
    
    // Simplest perturbation
    const lon = lPrime + 6.289 * Math.sin(m * Math.PI / 180) + 1.274 * Math.sin((2 * d - m) * Math.PI / 180) + 0.658 * Math.sin(2 * d * Math.PI / 180);
    return (lon % 360 + 360) % 360;
}

async function verifyNewEngine() {
    // Sep 17, 1998 15:50 UTC (21:20 IST)
    const date = new Date("1998-09-17T15:50:00Z");
    const jd = (date.getTime() / 86400000) + 2440587.5;
    
    const tropicalMoon = calculateMoon(jd);
    const ayanamsha = calculateAyanamsha(jd);
    const siderealMoon = (tropicalMoon - ayanamsha + 360) % 360;
    
    console.log("JD:", jd);
    console.log("Tropical Moon:", tropicalMoon);
    console.log("Ayanamsha:", ayanamsha);
    console.log("Sidereal Moon:", siderealMoon);
    
    const starIdx = Math.floor(siderealMoon / (360/27));
    const rasiIdx = Math.floor(siderealMoon / 30);
    
    const stars = ["Ashwini", "Bharani", "Krithika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    const rashis = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
    
    console.log("Result Star:", stars[starIdx % 27]);
    console.log("Result Rasi:", rashis[rasiIdx % 12]);
    
    if (stars[starIdx] === "Ashlesha" && rashis[rasiIdx] === "Karka") {
        console.log("Success! Custom logic confirms Ayilyam / Kadagam.");
    }
}

verifyNewEngine();
