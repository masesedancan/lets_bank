import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-aware client — used for anything tied to the signed-in user
// (auth.signUp, auth.signInWithPassword, auth.getUser). Reads and writes
// the session cookies automatically, replacing Appwrite's manual
// cookies().set("appwrite-session", session.secret, {...}) call.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, where cookies can't be
            // written directly. Safe to ignore once you add the
            // proxy/middleware session-refresh file (see chat) —
            // that's what keeps sessions alive between requests.
          }
        },
      },
    }
  );
}
