import { supabase } from "@/lib/supabase"

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error("Not authenticated")
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(input, { ...init, headers })
}
