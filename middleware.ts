import { NextResponse, type NextRequest } from "next/server"
import { resolveDashboardPath } from "@/lib/server/dashboard-path"
import { updateSession } from "@/lib/supabase/middleware"

const ADMIN_LOGIN = "/admin"
const PARTNER_LOGIN = "/referral-partner"
const USER_LOGIN = "/"

function isAdminProtected(pathname: string): boolean {
  return pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/verification")
}

function isUserDashboardProtected(pathname: string): boolean {
  return pathname.startsWith("/dashboard")
}

function isPartnerProtected(pathname: string): boolean {
  return (
    pathname.startsWith("/referral-partner/dashboard") ||
    pathname.startsWith("/referral-partner/profiles") ||
    pathname.startsWith("/referral-partner/settings") ||
    pathname.startsWith("/referral-partner/my-profile") ||
    pathname.startsWith("/referral-partner/profile")
  )
}

function isParentProtected(pathname: string): boolean {
  return pathname.startsWith("/parent-dashboard")
}

function loginPathForProtectedRoute(pathname: string): string {
  if (isAdminProtected(pathname)) return ADMIN_LOGIN
  if (isPartnerProtected(pathname)) return PARTNER_LOGIN
  return USER_LOGIN
}

function isProtectedRoute(pathname: string): boolean {
  return (
    isAdminProtected(pathname) ||
    isUserDashboardProtected(pathname) ||
    isPartnerProtected(pathname) ||
    isParentProtected(pathname)
  )
}

function requiredDashboardForRoute(pathname: string): string | null {
  if (isAdminProtected(pathname)) return "/admin/dashboard"
  if (isUserDashboardProtected(pathname)) return "/dashboard"
  if (isPartnerProtected(pathname)) return "/referral-partner/dashboard"
  if (isParentProtected(pathname)) return "/parent-dashboard"
  return null
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api/")) {
    return supabaseResponse
  }

  if (!isProtectedRoute(pathname) && pathname !== ADMIN_LOGIN && pathname !== PARTNER_LOGIN) {
    return supabaseResponse
  }

  if (!user) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = loginPathForProtectedRoute(pathname)
      loginUrl.search = ""
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  const dashboardPath = await resolveDashboardPath(user.id)

  if (pathname === ADMIN_LOGIN && dashboardPath === "/admin/dashboard") {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  if (pathname === PARTNER_LOGIN && dashboardPath === "/referral-partner/dashboard") {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  const requiredDashboard = requiredDashboardForRoute(pathname)
  if (requiredDashboard && dashboardPath !== requiredDashboard) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
