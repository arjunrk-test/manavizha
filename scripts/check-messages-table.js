const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function checkMessagesTable() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error(".env.local not found");
        return;
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split(/\r?\n/).filter(Boolean).forEach(line => {
        const firstEquals = line.indexOf('=');
        if (firstEquals === -1) return;
        const key = line.substring(0, firstEquals).trim();
        const value = line.substring(firstEquals + 1).trim().replace(/^["'](.*)["']$/, '$1');
        if (key && value) env[key] = value;
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking for 'messages' table...");
    const { data, error } = await supabase.from('messages').select('count', { count: 'exact', head: true });
    
    if (error) {
        if (error.code === '42P01') {
            console.log("Table 'messages' DOES NOT EXIST.");
        } else {
            console.error("Error checking table 'messages':", error.message, error.code);
        }
    } else {
        console.log("Table 'messages' EXISTS.");
        
        // Query information_schema for columns
        const { data: cols, error: colError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'messages')
            .eq('table_schema', 'public');

        if (colError) {
             console.log("Error getting columns from information_schema:", colError.message);
             // Fallback: try RPC or sample
             const { data: sample } = await supabase.from('messages').select('*').limit(1);
             if (sample && sample.length > 0) console.log("Columns (sample):", Object.keys(sample[0]));
        } else if (cols && cols.length > 0) {
            console.log("Columns (information_schema):");
            cols.forEach(c => console.log(` - ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'not null'})`));
        } else {
            console.log("No columns found in information_schema. Maybe it's empty or permissions issue.");
        }
    }
}

checkMessagesTable();
