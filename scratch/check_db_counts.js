
import { createClient } from '@supabase/supabase-client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { data: profiles, count } = await supabase
    .from('personal_details')
    .select('*', { count: 'exact' })
  
  console.log('Total profiles in DB:', count)
  
  const males = profiles.filter(p => p.sex?.toLowerCase() === 'male').length
  const females = profiles.filter(p => p.sex?.toLowerCase() === 'female').length
  
  console.log('Males:', males)
  console.log('Females:', females)
  
  if (profiles.length > 0) {
    console.log('Sample profile genders:', profiles.map(p => p.sex).slice(0, 5))
  }
}

checkData()
