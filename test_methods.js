const { getPlanetaryPositions, getPanchang } = require('vedic-astro');

async function testComponentVsIso() {
  const location = { latitude: 9.1764, longitude: 77.8772 };
  
  console.log("--- Method 1: ISO ---");
  try {
    const posIso = await getPlanetaryPositions({ iso: "1998-09-17T15:50:00.000Z" }, location);
    const panIso = getPanchang(posIso, location);
    console.log("ISO Star:", panIso.nakshatra);
  } catch (e) {
    console.log("ISO Error:", e.message);
  }

  console.log("\n--- Method 2: Components (UTC) ---");
  try {
    // 15:50 UTC is 21:20 IST
    const posComp = await getPlanetaryPositions({ 
        year: 1998, 
        month: 9, 
        day: 17, 
        hour: 15, 
        minute: 50, 
        second: 0 
    }, location);
    const panComp = getPanchang(posComp, location);
    console.log("Comp Star:", panComp.nakshatra);
  } catch (e) {
    console.log("Comp Error:", e.message);
  }
}

testComponentVsIso();
