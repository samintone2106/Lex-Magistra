import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = pathname.startsWith("/panel") || pathname.startsWith("/admin");

  if (!URL_.startsWith("http") || KEY.length < 20) {
    if (isPrivate) return NextResponse.redirect(new URL("/ingresar?config=1", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(URL_, KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPrivate && !user) {
    const url = new URL("/ingresar", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (data?.role !== "admin") return NextResponse.redirect(new URL("/panel", request.url));
  }

  if (user && (pathname === "/ingresar" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
