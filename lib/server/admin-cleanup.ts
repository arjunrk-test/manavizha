import { supabaseAdmin } from "@/lib/supabase"

const TEST_USER_EMAILS = new Set([
  "tls-test2@test.com",
  "tls-test@test.com",
  "edge2@test.com",
])

export async function executeTestUserCleanup(): Promise<
  { success: true; deleted: number } | { success: false; error: string }
> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const usersToDelete = (data.users || []).filter(
      (user) => user.email && TEST_USER_EMAILS.has(user.email)
    )

    for (const user of usersToDelete) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) {
        return { success: false, error: deleteError.message }
      }
    }

    return { success: true, deleted: usersToDelete.length }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed"
    return { success: false, error: message }
  }
}
