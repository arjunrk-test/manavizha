const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key) env[key.trim()] = val.join('=').trim();
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function dump() {
  const { data: zodiac } = await supabase.from('master_zodiac_moon_sign').select('*');
  const { data: star } = await supabase.from('master_star').select('*');
  const { data: lagnam } = await supabase.from('master_lagnam').select('*');
  console.log("Zodiac:", zodiac);
  console.log("Star:", star.slice(0, 10)); // just first 10
  console.log("Lagnam:", lagnam);
}
dump();
