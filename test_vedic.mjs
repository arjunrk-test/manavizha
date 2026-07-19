import { getPlanetaryPositions } from 'vedic-astro';

async function test() {
  const vaSettings = { iso: new Date("1998-09-17T21:20:00+05:30").toISOString() };
  const vaLoc = { latitude: 9.1732, longitude: 77.8732 };
  
  try {
    const eph = await getPlanetaryPositions(vaSettings, vaLoc);
    const moon = eph.positions.find(p => p.name === 'Moon');
    console.log("Moon longitude from vedic-astro:", moon ? moon.longitude : 'Not found');
  } catch (err) {
    console.error("Error calling vedic-astro:", err);
  }
}

test();
