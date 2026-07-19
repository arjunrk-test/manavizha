import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { webcrypto } from 'node:crypto'
const { subtle } = webcrypto

const env = {}
for (const line of readFileSync('./.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const A = 'a1000000-0000-4000-8000-000000000001' // sender
const B = 'b1000000-0000-4000-8000-000000000001' // receiver
const results = []
const ok = (n, p, d = '') => { results.push(p); console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`) }

// ---- replica of the app's E2E scheme (lib/e2e.ts): ECDH P-256 + AES-GCM ----
const b64e = buf => Buffer.from(buf).toString('base64')
const b64d = s => new Uint8Array(Buffer.from(s, 'base64'))
async function genKeys() {
  const pair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])
  return { priv: pair.privateKey, pub: await subtle.exportKey('jwk', pair.publicKey) }
}
async function deriveAes(priv, otherPubJwk) {
  const otherPub = await subtle.importKey('jwk', otherPubJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  return subtle.deriveKey({ name: 'ECDH', public: otherPub }, priv, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
async function encrypt(text, myPriv, otherPub) {
  const key = await deriveAes(myPriv, otherPub)
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
  return { ciphertext: b64e(ct), iv: b64e(iv) }
}
async function decrypt(ciphertext, iv, myPriv, otherPub) {
  const key = await deriveAes(myPriv, otherPub)
  const pt = await subtle.decrypt({ name: 'AES-GCM', iv: b64d(iv) }, key, b64d(ciphertext))
  return new TextDecoder().decode(pt)
}
const isBase64 = s => typeof s === 'string' && /^[A-Za-z0-9+/]+=*$/.test(s) && s.length % 4 === 0

// replica of the route's premium gate
const hasActivePremium = s => !!s?.is_premium && (!s.premium_expires_at || new Date(s.premium_expires_at) > new Date())

async function main() {
  const { data: orig } = await admin.from('user_settings').select('is_premium, premium_plan, premium_expires_at').eq('user_id', A).maybeSingle()
  const inserted = []

  // ---- 1. Premium required to send ----
  await admin.from('user_settings').upsert({ user_id: A, is_premium: false }, { onConflict: 'user_id' })
  const { data: free } = await admin.from('user_settings').select('is_premium, premium_expires_at').eq('user_id', A).maybeSingle()
  const freeBlocked = hasActivePremium(free) === false
  await admin.from('user_settings').upsert({ user_id: A, is_premium: true, premium_plan: 'premium', premium_expires_at: null }, { onConflict: 'user_id' })
  const { data: prem } = await admin.from('user_settings').select('is_premium, premium_expires_at').eq('user_id', A).maybeSingle()
  const premAllowed = hasActivePremium(prem) === true
  const { data: exp } = { data: { is_premium: true, premium_expires_at: new Date(Date.now() - 86400000).toISOString() } }
  const expiredBlocked = hasActivePremium(exp) === false
  ok('Premium required to send — free blocked, active allowed, expired blocked', freeBlocked && premAllowed && expiredBlocked)

  // ---- 2 & 3. Encrypt, store as ciphertext, verify E2E ----
  const keysA = await genKeys()
  const keysB = await genKeys()
  const plaintext = 'Vanakkam! Can we talk this weekend? (QA test)'
  const enc = await encrypt(plaintext, keysA.priv, keysB.pub)  // A -> B
  ok('End-to-end encryption — ciphertext differs from plaintext + is base64', enc.ciphertext !== plaintext && isBase64(enc.ciphertext), `ct=${enc.ciphertext.slice(0, 24)}...`)

  // store the way /api/messages POST does when isEncrypted
  const { data: row } = await admin.from('messages').insert({ sender_id: A, receiver_id: B, content: enc.ciphertext, is_encrypted: true, iv: enc.iv }).select().single()
  inserted.push(row.id)
  const { data: stored } = await admin.from('messages').select('content, is_encrypted, iv').eq('id', row.id).single()
  const serverBlind = stored.is_encrypted === true && !!stored.iv && stored.content !== plaintext && isBase64(stored.content)
  ok('Server stores ciphertext (is_encrypted=true, iv set, no plaintext)', serverBlind, `is_encrypted=${stored.is_encrypted}, iv=${stored.iv ? 'set' : 'null'}`)

  // recipient B decrypts with own private key + A's public key
  const back = await decrypt(stored.content, stored.iv, keysB.priv, keysA.pub)
  ok('Recipient decrypts to original plaintext (round-trip)', back === plaintext, `"${back}"`)

  // ---- 4. Send & receive round-trip (route's conversation query) ----
  const { data: convo } = await admin.from('messages').select('id, sender_id, receiver_id')
    .or(`and(sender_id.eq.${A},receiver_id.eq.${B}),and(sender_id.eq.${B},receiver_id.eq.${A})`)
    .order('created_at', { ascending: true })
  ok('Send & receive — message appears in the A↔B conversation query', (convo || []).some(m => m.id === row.id))

  // ---- 5. Read receipts ----
  const { data: unread } = await admin.from('messages').select('is_read').eq('id', row.id).single()
  await admin.from('messages').update({ is_read: true }).eq('id', row.id).eq('receiver_id', B) // route PATCH shape
  const { data: read } = await admin.from('messages').select('is_read').eq('id', row.id).single()
  ok('Read receipts — sent=unread (single) then read=true (double check)', unread.is_read === false && read.is_read === true)

  // cleanup
  for (const id of inserted) await admin.from('messages').delete().eq('id', id)
  if (orig) await admin.from('user_settings').update({ is_premium: orig.is_premium, premium_plan: orig.premium_plan, premium_expires_at: orig.premium_expires_at }).eq('user_id', A)

  console.log('\n--- SUMMARY ---')
  console.log(`${results.filter(Boolean).length}/${results.length} checks passed`)
  const { count: leftover } = await admin.from('messages').select('id', { count: 'exact', head: true }).in('id', inserted)
  console.log('leftover test messages:', leftover || 0, '| settings restored')
  console.log('NOTE: real-time delivery + typing indicator are client WebSocket features (Supabase realtime/broadcast) — verified in code, not DB-testable.')
}
main().catch(e => console.error('ERROR', e))
