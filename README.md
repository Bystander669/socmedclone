# Chirp – Twitter-like clone

A minimal Twitter-style app built with **Next.js** (App Router) and **Supabase**. Users can sign in with GitHub, post messages, like and comment on posts, and edit or delete their own posts.

## Features

- **GitHub login** via Supabase Auth
- **Posts** – create, edit, delete (own only)
- **Likes** – toggle like on any post
- **Comments** – add, edit, delete (own only) with inline replies
- **Feed** – chronological posts with author avatar and username

## Setup

1. **Supabase project**  
   Create a project at [supabase.com](https://supabase.com). The database schema (posts, likes, comments, profiles, RLS) is applied via the Supabase MCP migration.

2. **GitHub OAuth**  
   In Supabase: **Authentication → Providers → GitHub** → enable and add your GitHub OAuth App Client ID and Secret.  
   In your GitHub OAuth App, set the callback URL to:  
   `https://<your-project-ref>.supabase.co/auth/v1/callback`

3. **Environment variables**  
   Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` – from Supabase project Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – from the same page
   - `NEXT_PUBLIC_SITE_URL` – your app URL (e.g. `http://localhost:3000` for dev)

4. **Run the app**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with GitHub to post, like, and comment.

## Getting Started (dev)

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
