const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

async function run() {
  // Can't use Supabase JS for DDL, so we'll use the postgres connection string if available
  // Wait, does Supabase JS allow rpc to execute arbitrary sql? No.
  // Let me just print the NEXT_PUBLIC_SUPABASE_URL and we can use psql.
  console.log(env.NEXT_PUBLIC_SUPABASE_URL);
}
run();
