function calculateSiderealTime(jd, lon) {
    const t = (jd - 2451545.0) / 36525;
    let st = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000;
    st = (st + lon + 360) % 360;
    return st;
}

function calculateLagnam(jd, lon, lat) {
    const st = calculateSiderealTime(jd, lon);
    const obliq = 23.439; // Obliquity of ecliptic
    const stRad = st * Math.PI / 180;
    const obRad = obliq * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    
    const asc = Math.atan2(Math.cos(stRad), -Math.sin(stRad) * Math.cos(obRad) - Math.tan(latRad) * Math.sin(obRad)) * 180 / Math.PI;
    return (asc + 360) % 360;
}

// Kovilpatti: 9.1764, 77.8772
const jd = 2451074.15972;
const asc = calculateLagnam(jd, 77.8772, 9.1764);
const siderealAsc = (asc - 23.838 + 360) % 360;
console.log("Sidereal Ascendant:", siderealAsc);

const rashis = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
console.log("Lagnam:", rashis[Math.floor(siderealAsc / 30)]);
