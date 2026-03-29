const astronomia = require('astronomia');

async function testAstronomiaDirectly() {
  const date = new Date("1998-09-17T15:50:00.000Z");
  const jd = astronomia.julian.DateToJD(date);
  
  console.log("Julian Day:", jd);
  
  // Moon Position
  const moonPos = astronomia.moonposition.position(jd);
  console.log("Tropical Moon Lon:", moonPos.lon);
  
  // Ayanamsha (Lahiri approx for 1998 is ~23.82)
  const lahiri = 23.82;
  const siderealMoon = (moonPos.lon - lahiri + 360) % 360;
  console.log("Sidereal Moon Lon:", siderealMoon);
  
  // 120 degrees is the end of Cancer (Kadagam). Ayilyam is 106.66 to 120.
  if (siderealMoon >= 106.66 && siderealMoon <= 120) {
    console.log("Star: Ayilyam (Correct!)");
  } else {
    console.log("Star: Something else (Incorrect!)");
  }
}

testAstronomiaDirectly();
