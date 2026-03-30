const { getPlanetaryPositions, getPanchang } = require('vedic-astro');

async function testRadianFix() {
  const location = { latitude: 9.1764, longitude: 77.8772 };
  const iso = "1998-09-17T15:50:00.000Z";
  
  // 1. Original (Buggy) way
  const posBuggy = await getPlanetaryPositions({ iso }, location);
  const moonBuggy = posBuggy.positions.find(p => p.name === 'Moon').longitude;
  console.log("Buggy Moon Lon:", moonBuggy);

  // 2. Fix attempt: Library gave us Radians, but treated them as Degrees. 
  // Wait, let's reverse it.
  // The library did: sidereal = tropical - 24.
  // So tropical = moonBuggy + 24.
  const tropicalMoonBuggy = moonBuggy + 24;
  console.log("Buggy Tropical Moon:", tropicalMoonBuggy);
  
  // If tropicalMoonBuggy was actually radians:
  const actualDegrees = tropicalMoonBuggy * (180 / Math.PI);
  console.log("Fixed Degrees (approx):", actualDegrees);
  
  // Sidereal (with approx 23.83 ayanamsha for 1998)
  const siderealFixed = (actualDegrees - 23.838 + 360) % 360;
  console.log("Fixed Sidereal Moon:", siderealFixed);

  // 106.6 to 120 is Ayilyam
  if (siderealFixed >= 106.6 && siderealFixed <= 120) {
      console.log("Success! Radian fix confirms Ayilyam.");
  }
}

testRadianFix();
