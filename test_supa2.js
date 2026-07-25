const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.from('master_status').select('*');
  console.log('master_status:', data);
  const { data: ed, error: ede } = await supabase.rpc('get_table_constraints', { table_name: 'education_details' });
  console.log('constraints:', ed, ede);
}
run();
