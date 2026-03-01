const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking users...");
    const { data: u, error: ue } = await supabase.from('users').select('*').limit(1);
    console.log("Users schema cols:", u ? Object.keys(u[0] || {}) : ue);

    console.log("Checking shortlists...");
    const { data: s, error: se } = await supabase.from('shortlist_profiles').select('*').limit(1);
    console.log("Shortlists cols:", s ? Object.keys(s[0] || {}) : se);

    console.log("Checking likes...");
    const { data: l, error: le } = await supabase.from('likes').select('*').limit(1);
    console.log("Likes cols:", l ? Object.keys(l[0] || {}) : le);

    console.log("Checking interests...");
    const { data: i, error: ie } = await supabase.from('expressed_interests').select('*').limit(1);
    console.log("Interests cols:", i ? Object.keys(i[0] || {}) : ie);
}
check();
