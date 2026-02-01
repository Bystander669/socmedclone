import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signInWithGitHub, signOut } from "@/app/actions/auth";

function LogOutIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-slate-800 transition-all hover:scale-105"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 p-1.5">
              <svg 
                className="h-4 w-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
              Chirp
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                {/* Create Post Button */}
                <Link
                  href="/compose"
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  <svg
                    className="relative z-10 h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="relative z-10 hidden sm:inline">Create Post</span>
                  <span className="relative z-10 sm:hidden">Post</span>
                </Link>

                {/* User Profile - Simple version */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                  {/* Avatar */}
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-slate-100"
                        priority
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
                    )}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></div>
                  </div>

                  {/* User Info */}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {profile?.username || user.email?.split('@')[0] || "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email ? user.email.slice(0, 20) + (user.email.length > 20 ? '...' : '') : ''}
                    </p>
                  </div>

                  {/* Sign Out Button */}
                  <form action={signOut} className="ml-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      title="Sign out"
                    >
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="hidden sm:inline">Sign out</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Sign In Button */
              <form action={signInWithGitHub} className="flex-1">
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl" />
                  <svg 
                    className="relative z-10 h-4 w-4" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="relative z-10 hidden sm:inline">Sign in with GitHub</span>
                  <span className="relative z-10 sm:hidden">Sign in</span>
                </button>
              </form>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}