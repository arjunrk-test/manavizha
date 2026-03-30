const { getPlanetaryPositions, getPanchang, getMoonSign, getKundali } = require('vedic-astro');

async function debugExactInputs() {
  const inputs = [
    "1998-09-17T21:20:00+05:30", // IST
    "1998-09-17T21:20:00Z",      // UTC
    "1998-09-17T15:50:00Z"       // UTC equivalent of IST
  ];
  
  const location = { latitude: 9.1764, longitude: 77.8772 };
  
  for (const iso of inputs) {
    console.log(`\n--- Testing ISO: ${iso} ---`);
    try {
      const positions = await getPlanetaryPositions({ iso }, location);
      const panchang = getPanchang(positions, location);
      const rashi = getMoonSign(positions);
      const kundali = getKundali(positions);
      
      console.log("Star:", panchang.nakshatra);
      console.log("Rashi:", rashi.rashi);
      console.log("Lagnam Sign:", kundali.ascendant);
      console.log("Tithi (for comparison):", panchang.tithi);
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

debugExactInputs();
