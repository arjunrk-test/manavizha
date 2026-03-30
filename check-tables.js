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

async function listTables() {
  // Use a query to information_schema if RPC is not available
  const { data, error } = await supabase
    .from('personal_details')
    .select('id')
    .limit(1);

  console.log("Checking for common tables...");
  const tables = ['shortlists', 'likes', 'bookmarks', 'saved_profiles', 'interests'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (!error) console.log(`Table exists: ${table}`);
    else if (error.code !== 'PGRST116' && error.code !== '42P01') console.log(`Table ${table} error: ${error.code}`);
  }
}

listTables();
