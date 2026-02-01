import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signInWithGitHub } from "@/app/actions/auth";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import type { PostWithAuthor, CommentWithAuthor } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("Posts fetch error:", postsError);
  }

  const postIds = (posts ?? []).map((p) => p.id);
  const { data: commentsRaw } =
    postIds.length > 0
      ? await supabase
          .from("comments")
          .select("*")
          .in("post_id", postIds)
          .order("created_at", { ascending: true })
      : { data: [] };
  const userIds = [
    ...new Set([
      ...(posts ?? []).map((p) => p.user_id),
      ...(commentsRaw ?? []).map((c) => c.user_id),
    ]),
  ];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds)
      : { data: [] };
  const profileByUserId = (profiles ?? []).reduce(
    (acc, pr) => {
      acc[pr.id] = pr;
      return acc;
    },
    {} as Record<string, { id: string; username: string | null; avatar_url: string | null }>
  );
  const commentsByPost = (commentsRaw ?? []).reduce(
    (acc, c) => {
      if (!acc[c.post_id]) acc[c.post_id] = [];
      acc[c.post_id].push({
        ...c,
        profiles: profileByUserId[c.user_id] ?? null,
      } as CommentWithAuthor);
      return acc;
    },
    {} as Record<string, CommentWithAuthor[]>
  );
  const { data: likes } = postIds.length
    ? await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user?.id ?? "")
    : { data: [] };
  const likedPostIds = new Set((likes ?? []).map((l) => l.post_id));

  const { data: likeCounts } =
    postIds.length > 0
      ? await supabase
          .from("likes")
          .select("post_id")
          .in("post_id", postIds)
      : { data: [] };
  const likeCountByPost = (likeCounts ?? []).reduce(
    (acc, { post_id }) => {
      acc[post_id] = (acc[post_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const postsWithMeta: PostWithAuthor[] = (posts ?? []).map((p) => ({
    ...p,
    profiles: profileByUserId[p.user_id] ?? null,
    likes_count: likeCountByPost[p.id] ?? 0,
    comments_count: (commentsByPost[p.id] ?? []).length,
    user_has_liked: user ? likedPostIds.has(p.id) : false,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Chirp
              </h1>
              <p className="mt-2 text-sky-100">
                {user 
                  ? `Hey ${user.user_metadata?.full_name || 'there'}! Ready to share your thoughts?` 
                  : "A simple space to share your thoughts and connect with others."}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="rounded-full bg-white/20 p-3">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className="mb-8">
          {user ? (
            <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                <div>
                  <p className="font-medium text-slate-800">Share your thoughts...</p>
                  <p className="text-sm text-slate-500">What's on your mind?</p>
                </div>
              </div>
              <Link
                href="/compose"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg"
              >
                Create Post
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">Join the conversation</h2>
              <p className="mt-2 text-slate-600">
                Sign in to create posts, like, and comment on others' thoughts.
              </p>
              <form action={signInWithGitHub} className="mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              Recent Posts
              {postsWithMeta.length > 0 && (
                <span className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-sm font-normal text-slate-600">
                  {postsWithMeta.length}
                </span>
              )}
            </h2>
          </div>

          {postsWithMeta.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200">
                <svg
                  className="h-12 w-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700">
                No posts yet
              </h3>
              <p className="mt-2 text-slate-600">
                {user
                  ? "Be the first to share your thoughts!"
                  : "Sign in to create the first post."}
              </p>
              <div className="mt-6">
                {user ? (
                  <Link
                    href="/compose"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Post
                  </Link>
                ) : (
                  <form action={signInWithGitHub}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-lg"
                    >
                      Sign in to get started
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {postsWithMeta.map((post) => (
                <div key={post.id} className="transition-all hover:scale-[1.005]">
                  <PostCard
                    post={post}
                    comments={commentsByPost[post.id] ?? []}
                    currentUserId={user?.id}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Note */}
        {postsWithMeta.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              You've reached the end! 🎉
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {postsWithMeta.length} {postsWithMeta.length === 1 ? 'post' : 'posts'} total
            </p>
          </div>
        )}
      </main>
    </div>
  );
}