import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// 1. Admin Users
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Hero Slides (Homepage cinematic multi-image hero)
export const heroSlides = pgTable('hero_slides', {
  id: uuid('id').defaultRandom().primaryKey(),
  image: text('image').notNull(),
  storagePath: text('storage_path'),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(10).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Photographs (Minimal portfolio plates with essential wildlife category)
export const photographs = pgTable('photographs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  storagePath: text('storage_path'),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').default('birds').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Videos
export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  thumbnail: text('thumbnail'),
  thumbnailPath: text('thumbnail_path'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Stories (Tiptap rich text + multiple photographs)
export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description'),
  coverImage: text('cover_image').notNull(),
  coverImagePath: text('cover_image_path'),
  content: jsonb('content').$type<Record<string, unknown>>().notNull().default({}),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  isPublished: boolean('is_published').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Photographer Profile
export const siteProfiles = pgTable('site_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  biography: text('biography'),
  profileImage: text('profile_image'),
  email: text('email'),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Contact Enquiries
export const enquiries = pgTable('enquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
