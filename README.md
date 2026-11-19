# Wild Rahi — Wildlife Photography Portfolio & Biodiversity Archive

An editorial wildlife photography portfolio, Bangladesh biodiversity archive, and conservation monograph by **Razaul Hafiz Rahi (Wild Rahi)**.

Migrated from React + Vite + Express + MongoDB to **Next.js 15 App Router + Supabase PostgreSQL + Drizzle ORM + Supabase Storage**.

---

## 🚀 Key Features Preserved & Enhanced

- **Editorial Public Experience:**
  - **Cinematic Hero:** Fullscreen hero showcase with smooth GSAP animations.
  - **Horizontal Journey:** Interactive horizontal scroll gallery highlighting featured wildlife.
  - **Photography Gallery:** Filterable by collection, habitat location, or search; fullscreen lightbox with EXIF metadata (camera, lens, shutter speed, aperture, ISO).
  - **Biodiversity Archive:** Rich species monographs (Bengali name, common name, scientific name, habitat, IUCN conservation status).
  - **Editorial Articles / Field Notes:** Full rich-text storytelling powered by Tiptap editor with bilingual (Bangla & English) reading typography using *Baloo Da 2*.
  - **Video Showcase:** Native responsive modal player supporting YouTube, Facebook, Instagram, and TikTok embeds.
  - **Ethical Conservation Monograph:** Safeguarding sensitive coordinates of endangered wildlife and breeding habitats.
  - **Public Enquiry System:** Contact and print licensing submission with rate limiting and input sanitization.

- **Robust Architecture:**
  - **Next.js 15 App Router:** Unified full-stack architecture with React 19, Server Components, and API Route Handlers.
  - **Supabase PostgreSQL & Drizzle ORM:** 15 strongly typed relational tables, UUID primary keys, foreign key constraints, timestamps, and relations.
  - **Supabase Storage:** Direct cloud storage in `wild-rahi-media` bucket with automatic WebP conversion, responsive image resizing (up to 1920px), thumbnail generation, and seamless local `public/uploads/` fallback during offline development.
  - **Custom Admin Auth:** Secure email/password login at `/admin/login` using bcrypt password hashing, signed HTTP-only JWT cookies (`wr_session`), SameSite protections, and middleware route guards.
  - **Complete Admin CMS:** Manage photographs (multi-upload), collections, species, locations, articles, videos, and visitor enquiries without touching code.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Database & ORM:** Supabase PostgreSQL + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `postgres`)
- **Storage:** Supabase Storage (`@supabase/supabase-js`, `sharp`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Icons & Animation:** Lucide React, Motion (Framer Motion v12), GSAP 3
- **Rich Text:** Tiptap Editor (`@tiptap/react`, `@tiptap/starter-kit`)
- **Authentication:** Custom bcrypt + `jose` JWT with HTTP-only cookies

---

## ⚙️ Quick Start & Supabase Setup

### 1. Prerequisites
- **Node.js:** v18+ (tested on Node v24)
- **Supabase Account:** Free project on [supabase.com](https://supabase.com)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase connection strings and secrets in `.env.local`:
```env
# Supabase PostgreSQL Database URL (Found under Project Settings > Database > Connection string > URI)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Project Configuration (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Initial Administrator Credentials (seeded into admin_users table)
ADMIN_EMAIL="admin@wildrahi.com"
ADMIN_PASSWORD="WildRahi#2026"

# Session Security Secret (minimum 32 random characters for signing JWT cookies)
AUTH_SECRET="your-ultra-secure-random-auth-secret-string-at-least-32-characters"

APP_URL="http://localhost:3000"
```

### 3. Create the Supabase Storage Bucket
In your Supabase Dashboard:
1. Navigate to **Storage** > **New bucket**.
2. Name the bucket: `wild-rahi-media`.
3. Toggle **Public bucket** to `ON` (so published website images are publicly viewable).
4. Save the bucket.

*(Note: In local development, if Supabase credentials are not yet configured, the system automatically saves uploaded images to `public/uploads/` as a smart local fallback.)*

### 4. Push Database Schema & Seed Initial Data
Run the Drizzle push command to apply all 15 tables to PostgreSQL:
```bash
npm run db:push
```

Seed the database with default categories, species, locations, demo articles, videos, and photographs:
```bash
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Administrator Access

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Default credentials:
   - **Email:** `admin@wildrahi.com`
   - **Password:** `WildRahi#2026` *(or custom credentials set in your `.env.local`)*
3. Once logged in, manage all photographs, articles, species, locations, videos, and visitor enquiries directly from the dashboard.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server at `localhost:3000` |
| `npm run build` | Builds the optimized production application |
| `npm start` | Starts the Next.js production server |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Runs the full unit test suite (19 tests) |
| `npm run db:generate`| Generates SQL migration files using Drizzle Kit |
| `npm run db:push` | Pushes Drizzle schemas directly to Supabase PostgreSQL |
| `npm run db:seed` | Seeds initial admin account, categories, species, and demo content |
