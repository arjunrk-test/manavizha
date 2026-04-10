const { createClient } = require('@supabase/supabase-js')

async function check() {
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data } = await s.from('personal_details').select('*').limit(1)
    if (data && data[0]) {
        console.log('Personal Columns:', Object.keys(data[0]))
    }
    const { data: sData } = await s.from('user_settings').select('*').limit(1)
    if (sData && sData[0]) {
        console.log('Settings Columns:', Object.keys(sData[0]))
    }
    const { data: uData } = await s.from('users').select('*').limit(1)
    if (uData && uData[0]) {
        console.log('Users Columns:', Object.keys(uData[0]))
    }
}
check()
