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
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const testValues = ['completed', 'Completed', 'COMPLETED', 'pursuing', 'Pursuing', 'PURSUING', 'Ongoing', 'ongoing'];
  
  for (const status of testValues) {
    const { data, error } = await supabase
      .from('education_details')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000',
          education: 'Test',
          status: status
        }
      ]);
    if (error && error.message.includes('violates check constraint "education_details_status_check"')) {
      console.log(`Failed for: ${status}`);
    } else if (error) {
      console.log(`Other error for ${status}:`, error.message);
    } else {
      console.log(`SUCCESS for: ${status}`);
    }
  }
}
run();
