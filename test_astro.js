const { generateHoroscope } = require('./lib/astrology');
const location = { latitude: 9.1732, longitude: 77.8732 }; 

async function test() {
  const result = await generateHoroscope('1998-09-17T21:20:00', location, '+05:30', 'thirukanitham');
  console.log("With 1998-09-17 fallback:", result.star, result.rashi, result.lagnam);
}

test().catch(console.error);
