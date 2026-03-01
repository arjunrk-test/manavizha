const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sup = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sup.from('users').delete().eq('email', 'tls-test2@test.com').then(r => console.log("Deleted tls-test2", r.error || 'OK'));
