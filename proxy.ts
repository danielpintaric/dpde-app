import {
  isEmailInAdminAllowlist,
  parseAdminEmailAllowlist,
} from "@/lib/auth/admin-allowlist";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hasClientShareToken = request.nextUrl.searchParams.has("token");
  const isClientLogin = path === "/client/login";
  /** Token-Clientfläche: ohne Session-Refresh ausliefern — vermeidet Blockaden durch `getUser()` (langsames/fehlendes Supabase). */
  const isClientLanding = path === "/client" || path === "/client/";
  const isClientTokenSubPath =
    path.startsWith("/client/") && !isClientLogin && hasClientShareToken;

  if (isClientLanding || isClientTokenSubPath) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminAllowlist = parseAdminEmailAllowlist(process.env.ADMIN_EMAILS);

  const isAdminLogin = path === "/admin/login";
  const isAdminArea = path.startsWith("/admin");
  if (isAdminArea && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isEmailInAdminAllowlist(user.email, adminAllowlist)) {
      return NextResponse.redirect(
        new URL("/admin/login?reason=forbidden", request.url),
      );
    }
  }
  if (isAdminLogin && user) {
    if (isEmailInAdminAllowlist(user.email, adminAllowlist)) {
      return NextResponse.redirect(new URL("/admin/projects", request.url));
    }
  }

  const isClientArea = path.startsWith("/client");
  if (isClientArea && !isClientLogin && !isClientLanding && !user) {
    if (hasClientShareToken) {
      return response;
    }
    return NextResponse.redirect(new URL("/client/login", request.url));
  }
  if (isClientLogin && user) {
    return NextResponse.redirect(new URL("/client", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/client", "/client/:path*"],
};
