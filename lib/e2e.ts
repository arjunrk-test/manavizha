// Client-side end-to-end encryption for messages.
// ECDH P-256 for key agreement + AES-GCM for message encryption.
//
// The private key never leaves the browser (stored in localStorage per device);
// only the public key is uploaded. The server stores ciphertext and cannot read
// message contents. Trade-off: a new device cannot decrypt history created on
// another device — those messages show as unavailable there.

import { authFetch } from "@/lib/api-client"

const PRIV_KEY_PREFIX = "manavizha_e2e_priv_"

function b64encode(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
function b64decode(str: string): ArrayBuffer {
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer
}

function subtle(): SubtleCrypto | null {
    if (typeof window === "undefined") return null
    return window.crypto?.subtle || null
}

/**
 * Returns the caller's ECDH private CryptoKey, creating and publishing a
 * keypair on first use. Returns null if WebCrypto is unavailable.
 */
export async function getOrCreatePrivateKey(userId: string): Promise<CryptoKey | null> {
    const s = subtle()
    if (!s) return null

    const storageKey = PRIV_KEY_PREFIX + userId
    const stored = localStorage.getItem(storageKey)

    if (stored) {
        try {
            const jwk = JSON.parse(stored)
            return await s.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"])
        } catch {
            // Corrupt key — regenerate below
        }
    }

    const pair = await s.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"])
    const privJwk = await s.exportKey("jwk", pair.privateKey)
    const pubJwk = await s.exportKey("jwk", pair.publicKey)
    localStorage.setItem(storageKey, JSON.stringify(privJwk))

    // Publish public key (best-effort; retried on next load if it fails)
    try {
        await authFetch("/api/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey: pubJwk }),
        })
    } catch { /* will retry next session */ }

    return pair.privateKey
}

const publicKeyCache = new Map<string, JsonWebKey | null>()

async function fetchPublicKey(userId: string): Promise<JsonWebKey | null> {
    if (publicKeyCache.has(userId)) return publicKeyCache.get(userId) || null
    try {
        const res = await authFetch(`/api/keys?userId=${userId}`)
        if (!res.ok) return null
        const data = await res.json()
        publicKeyCache.set(userId, data.publicKey || null)
        return data.publicKey || null
    } catch {
        return null
    }
}

async function deriveAesKey(privateKey: CryptoKey, otherPubJwk: JsonWebKey): Promise<CryptoKey | null> {
    const s = subtle()
    if (!s) return null
    const otherPub = await s.importKey("jwk", otherPubJwk, { name: "ECDH", namedCurve: "P-256" }, false, [])
    return s.deriveKey(
        { name: "ECDH", public: otherPub },
        privateKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    )
}

/**
 * Whether the given user has published a public key (i.e. can receive
 * encrypted messages).
 */
export async function canEncryptFor(otherUserId: string): Promise<boolean> {
    return (await fetchPublicKey(otherUserId)) !== null
}

export type EncryptedPayload = { ciphertext: string; iv: string }

export async function encryptMessage(
    plaintext: string,
    myPrivateKey: CryptoKey,
    otherUserId: string
): Promise<EncryptedPayload | null> {
    const s = subtle()
    if (!s) return null
    const otherPub = await fetchPublicKey(otherUserId)
    if (!otherPub) return null

    const aesKey = await deriveAesKey(myPrivateKey, otherPub)
    if (!aesKey) return null

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const cipher = await s.encrypt({ name: "AES-GCM", iv }, aesKey, encoded)

    return { ciphertext: b64encode(cipher), iv: b64encode(iv.buffer) }
}

export async function decryptMessage(
    ciphertext: string,
    iv: string,
    myPrivateKey: CryptoKey,
    otherUserId: string
): Promise<string | null> {
    const s = subtle()
    if (!s) return null
    const otherPub = await fetchPublicKey(otherUserId)
    if (!otherPub) return null

    try {
        const aesKey = await deriveAesKey(myPrivateKey, otherPub)
        if (!aesKey) return null
        const plain = await s.decrypt(
            { name: "AES-GCM", iv: b64decode(iv) },
            aesKey,
            b64decode(ciphertext)
        )
        return new TextDecoder().decode(plain)
    } catch {
        return null
    }
}
