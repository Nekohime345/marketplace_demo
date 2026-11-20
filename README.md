# goodagain.

A small neighborhood marketplace built with Next.js and Supabase. Visitors can browse and search listings, publish an item with a photo, and message its seller.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The marketplace starts empty and displays only listings stored in Supabase.

## Connect Supabase

1. Create a Supabase project at https://supabase.com.
2. In the SQL Editor, run [`supabase/setup.sql`](supabase/setup.sql). It creates the tables and access policies, and adds seller name, location, and category fields used by the listing preview and details.
3. Copy `.env.example` to `.env.local` and fill in the project URL and **publishable/anon** key from Project Settings → API. These values are public browser credentials; never use a service role key here.
4. Restart `npm run dev`.

The setup SQL enables public read access and anonymous listing, photo, and message inserts to meet the no-login marketplace flow. Add rate limiting or CAPTCHA before using this for a large public launch.

## Deploy to Vercel

Import this project’s `fb_marketplace` directory in Vercel, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project’s Environment Variables, then deploy. The same variables must be set for Preview and Production deployments.
