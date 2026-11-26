import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import postgres from 'postgres';
import { DEFAULT_HERO_SLIDES } from '../src/lib/defaults';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

async function migrateSimplify() {
  console.log(
    '[Migrate] Connecting to PostgreSQL:',
    connectionString.replace(/:[^:@]+@/, ':****@')
  );
  const sql = postgres(connectionString, { prepare: false, connect_timeout: 15 });

  try {
    await sql.begin(async (tx) => {
      console.log('[Migrate] 1. Creating hero_slides & stories tables if missing...');
      await tx`
        CREATE TABLE IF NOT EXISTS "hero_slides" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "image" text NOT NULL,
          "storage_path" text,
          "alt_text" text,
          "sort_order" integer DEFAULT 10 NOT NULL,
          "is_published" boolean DEFAULT true NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        )
      `;

      await tx`
        CREATE TABLE IF NOT EXISTS "stories" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "title" text NOT NULL,
          "slug" text NOT NULL UNIQUE,
          "short_description" text,
          "cover_image" text NOT NULL,
          "cover_image_path" text,
          "content" jsonb DEFAULT '{}'::jsonb NOT NULL,
          "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
          "is_published" boolean DEFAULT false NOT NULL,
          "is_featured" boolean DEFAULT false NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        )
      `;

      console.log('[Migrate] 2. Migrating articles -> stories (preserving existing data)...');
      const [articlesTable] = await tx`
        SELECT to_regclass('public.articles') AS tbl
      `;
      if (articlesTable?.tbl) {
        await tx`
          INSERT INTO "stories" (
            "id", "title", "slug", "short_description", "cover_image",
            "cover_image_path", "content", "images", "is_published", "is_featured",
            "created_at", "updated_at"
          )
          SELECT
            a."id",
            a."title",
            a."slug",
            COALESCE(a."excerpt", ''),
            a."cover_image",
            a."cover_image_path",
            COALESCE(a."content", '{}'::jsonb),
            '[]'::jsonb,
            (a."status" = 'published'),
            COALESCE(a."is_featured", false),
            a."created_at",
            a."updated_at"
          FROM "articles" a
          ON CONFLICT ("slug") DO NOTHING
        `;
      }

      console.log('[Migrate] 3. Simplifying photographs table while preserving categories & publish flags...');
      await tx`
        ALTER TABLE "photographs"
          ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'birds' NOT NULL,
          ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL
      `;

      const [catsTable] = await tx`SELECT to_regclass('public.categories') AS tbl`;
      const [photoCatCol] = await tx`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'photographs' AND column_name = 'category_id'
      `;
      if (catsTable?.tbl && photoCatCol) {
        await tx`
          UPDATE "photographs" p
          SET "category" = COALESCE(
            NULLIF(c."slug", ''),
            'birds'
          )
          FROM "categories" c
          WHERE p."category_id" = c."id"
        `;
      }

      const [photoStatusCol] = await tx`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'photographs' AND column_name = 'status'
      `;
      if (photoStatusCol) {
        await tx`
          UPDATE "photographs"
          SET "is_published" = ("status" = 'published')
        `;
      }

      await tx`
        ALTER TABLE "photographs"
          DROP CONSTRAINT IF EXISTS "photographs_category_id_categories_id_fk",
          DROP CONSTRAINT IF EXISTS "photographs_species_id_species_id_fk",
          DROP CONSTRAINT IF EXISTS "photographs_location_id_locations_id_fk",
          DROP CONSTRAINT IF EXISTS "photographs_slug_unique",
          DROP COLUMN IF EXISTS "slug",
          DROP COLUMN IF EXISTS "category_id",
          DROP COLUMN IF EXISTS "species_id",
          DROP COLUMN IF EXISTS "location_id",
          DROP COLUMN IF EXISTS "photographed_at",
          DROP COLUMN IF EXISTS "camera",
          DROP COLUMN IF EXISTS "lens",
          DROP COLUMN IF EXISTS "settings",
          DROP COLUMN IF EXISTS "status"
      `;

      console.log('[Migrate] 4. Simplifying videos table...');
      await tx`
        ALTER TABLE "videos"
          ADD COLUMN IF NOT EXISTS "thumbnail" text,
          ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL
      `;

      const [videoThumbCol] = await tx`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'videos' AND column_name = 'thumbnail_url'
      `;
      if (videoThumbCol) {
        await tx`
          UPDATE "videos"
          SET "thumbnail" = COALESCE("thumbnail", "thumbnail_url")
        `;
      }

      const [videoStatusCol] = await tx`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'videos' AND column_name = 'status'
      `;
      if (videoStatusCol) {
        await tx`
          UPDATE "videos"
          SET "is_published" = ("status" = 'published')
        `;
      }

      await tx`
        ALTER TABLE "videos"
          DROP COLUMN IF EXISTS "thumbnail_url",
          DROP COLUMN IF EXISTS "platform",
          DROP COLUMN IF EXISTS "embed_url",
          DROP COLUMN IF EXISTS "category",
          DROP COLUMN IF EXISTS "status"
      `;

      console.log('[Migrate] 5. Cleaning unused columns on site_profiles...');
      await tx`
        ALTER TABLE "site_profiles"
          DROP COLUMN IF EXISTS "biography_bn",
          DROP COLUMN IF EXISTS "conservation_content"
      `;

      console.log('[Migrate] 6. Dropping obsolete tables...');
      await tx`DROP TABLE IF EXISTS "collection_photos" CASCADE`;
      await tx`DROP TABLE IF EXISTS "collections" CASCADE`;
      await tx`DROP TABLE IF EXISTS "article_tags" CASCADE`;
      await tx`DROP TABLE IF EXISTS "article_translations" CASCADE`;
      await tx`DROP TABLE IF EXISTS "articles" CASCADE`;
      await tx`DROP TABLE IF EXISTS "article_categories" CASCADE`;
      await tx`DROP TABLE IF EXISTS "categories" CASCADE`;
      await tx`DROP TABLE IF EXISTS "species" CASCADE`;
      await tx`DROP TABLE IF EXISTS "locations" CASCADE`;
      await tx`DROP TABLE IF EXISTS "site_settings" CASCADE`;

      console.log('[Migrate] 7. Seeding initial hero_slides if empty...');
      const [{ count }] = await tx`SELECT count(*)::int AS count FROM "hero_slides"`;
      if (count === 0) {
        for (const slide of DEFAULT_HERO_SLIDES) {
          await tx`
            INSERT INTO "hero_slides" ("image", "alt_text", "sort_order", "is_published")
            VALUES (${slide.image}, ${slide.altText}, ${slide.sortOrder}, ${slide.isPublished})
          `;
        }
      }
    });

    console.log('[Migrate] ✓ Database schema simplification and migration complete!');
  } finally {
    await sql.end();
  }
}

migrateSimplify().catch((err) => {
  console.error('[Migrate] Failed:', err);
  process.exit(1);
});
