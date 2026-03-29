const axios = require('axios');

async function testGeocoding() {
  try {
    const city = "Chennai";
    const state = "Tamil Nadu";
    const country = "India";
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${city},${state},${country}&limit=1`, {
      headers: {
        'User-Agent': 'ManavizhaHoroscopeApp/1.0 (contact@manavizha.com)'
      }
    });
    console.log("Geocoding Result for Chennai:", res.data[0]);
  } catch (err) {
    console.error("Geocoding failed", err);
  }
}

testGeocoding();
