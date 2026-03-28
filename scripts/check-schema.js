const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking database schema for verification features...");

  // Check personal_details
  const { data: personalData, error: personalError } = await supabase
    .from('personal_details')
    .select('*')
    .limit(1);

  if (personalData && personalData.length > 0) {
      const columns = Object.keys(personalData[0]);
      if (columns.includes('photo_verified')) {
          console.log("✅ Column 'photo_verified' exists in 'personal_details' table.");
      } else {
          console.log("❌ Column 'photo_verified' is MISSING in 'personal_details' table.");
      }
  } else if (personalError) {
      console.error("Error checking 'personal_details':", personalError.message);
  } else {
      console.log("⚠️ 'personal_details' table is empty, could not determine columns via SELECT *.");
  }

  // Check photos
  const { data: photosData, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .limit(1);

  if (photosData && photosData.length > 0) {
      const columns = Object.keys(photosData[0]);
      const missing = [];
      if (!columns.includes('verification_status')) missing.push('verification_status');
      if (!columns.includes('live_photo_url')) missing.push('live_photo_url');
      if (!columns.includes('comparison_photo_url')) missing.push('comparison_photo_url');

      if (missing.length === 0) {
          console.log("✅ All required columns exist in 'photos' table.");
      } else {
          console.log(`❌ The following columns are MISSING in 'photos' table: ${missing.join(', ')}`);
      }
  } else if (photosError) {
      console.error("Error checking 'photos':", photosError.message);
  } else {
      console.log("⚠️ 'photos' table is empty, could not determine columns via SELECT *.");
  }
}

checkSchema();
