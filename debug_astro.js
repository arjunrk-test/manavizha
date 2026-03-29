const { getPlanetaryPositions, getPanchang, getMoonSign, getKundali } = require('vedic-astro');

async function debugHoroscope() {
  const ist_dob = "1998-09-17T15:50:00.000Z"; 
  const location = { latitude: 9.1764, longitude: 77.8772 };
  
  const positions = await getPlanetaryPositions({ iso: ist_dob }, location);
  const panchang = getPanchang(positions, location);
  const rashi = getMoonSign(positions);
  const kundali = getKundali(positions);

  console.log("Planets and their Rashis:");
  Object.keys(positions.planets).forEach(p => {
    console.log(`${p}: ${positions.planets[p].rashi}`);
  });
  console.log("Ascendant (Lagnam):", kundali.ascendant);
}

debugHoroscope();
