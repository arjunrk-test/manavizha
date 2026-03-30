const { getPlanetaryPositions } = require('vedic-astro');

async function testFormat() {
  const formats = [
    "2000-11-26T08:31:00+05:30",
    "2000-11-26T03:01:00Z", // Same as +05:30
    "2000-11-26T08:31:00.000+05:30",
    "2000-11-26T08:31Z"
  ];

  const location = { latitude: 9.1764, longitude: 77.8772 };

  for (const f of formats) {
    try {
      console.log(`\nTesting format: ${f}`);
      const pos = await getPlanetaryPositions({ iso: f }, location);
      console.log("Success!");
    } catch (e) {
      console.log(`Failed: ${e.message}`);
    }
  }
}

testFormat();
