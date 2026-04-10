
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
    const { data: personalCols, error: pError } = await supabase.from('personal_details').select('*').limit(1)
    console.log('--- personal_details first row ---')
    console.log(personalCols?.[0] ? Object.keys(personalCols[0]) : 'Empty table or error')
    if (pError) console.error(pError)

    const { data: userCols, error: uError } = await supabase.from('users').select('*').limit(1)
    console.log('--- users first row ---')
    console.log(userCols?.[0] ? Object.keys(userCols[0]) : 'Empty table or error')
    if (uError) console.error(uError)

    const { data: settingsCols, error: sError } = await supabase.from('user_settings').select('*').limit(1)
    console.log('--- user_settings first row ---')
    console.log(settingsCols?.[0] ? Object.keys(settingsCols[0]) : 'Empty table or error')
    if (sError) console.error(sError)
}

checkSchema()
