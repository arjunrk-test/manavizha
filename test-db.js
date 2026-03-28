const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').filter(Boolean).forEach(line => {
  const [key, ...values] = line.split('=');
  const value = values.join('=').trim().replace(/^"(.*)"$/, '$1');
  if (key && value) env[key.trim()] = value;
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: tables, error } = await supabase.rpc('get_tables'); // This might not work if RPC doesn't exist
  if (error) {
      // Try listing from a known table to see if we can get a list of tables via information_schema
      const { data: schema, error: schemaError } = await supabase.from('personal_details').select('id').limit(1);
      console.log("personal_details exists");
  } else {
      console.log("Tables:", tables);
  }

  // Check for any column that looks like subscription in users
  const { data: userData } = await supabase.from('users').select('*').limit(1);
  if (userData) console.log("User columns:", Object.keys(userData[0]));

  const { data: pData } = await supabase.from('personal_details').select('*').limit(1);
  if (pData) console.log("Personal Details columns:", Object.keys(pData[0]));
}

test();
