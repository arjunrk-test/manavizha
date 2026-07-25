import { createClient } from '@supabase/supabase-js'
import nodeFetch from 'node-fetch'
import https from 'https'
import dns from 'dns'

// Resolve Supabase hostname fresh each call via Node's DNS resolver,
// bypassing any ISP-level DNS issues without hardcoding a specific IP.
function resolveHostIp(hostname: string): Promise<string> {
    return new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
            if (!err && addresses?.length) return resolve(addresses[0])
            // resolve4 queries the DNS servers directly and can be blocked
            // (ECONNREFUSED) even when the OS resolver works — fall back to lookup.
            dns.lookup(hostname, { family: 4 }, (lookupErr, address) => {
                if (lookupErr || !address) reject(err ?? lookupErr ?? new Error('No addresses returned'))
                else resolve(address)
            })
        })
    })
}

function buildCustomFetch(hostname: string, ip: string) {
    return (url: any, options: any = {}) => {
        try {
            const u = new URL(url)
            if (u.hostname === hostname) {
                u.hostname = ip
                options.headers = options.headers || {}
                if (typeof options.headers.set === 'function') {
                    options.headers.set('Host', hostname)
                } else {
                    options.headers['Host'] = hostname
                }
                options.agent = new https.Agent({ servername: hostname })
                return (nodeFetch as any)(u.toString(), options)
            }
        } catch {
            // fall through to default fetch
        }
        return (nodeFetch as any)(url, options)
    }
}

export async function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Supabase URL and Service Role Key are required')
    }

    const hostname = new URL(supabaseUrl).hostname

    let ip: string | null = null
    try {
        ip = await resolveHostIp(hostname)
    } catch {
        // DNS resolution failed entirely — let the default fetch handle the
        // hostname rather than failing the whole request.
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        ...(ip ? { global: { fetch: buildCustomFetch(hostname, ip) } } : {}),
    })
}
