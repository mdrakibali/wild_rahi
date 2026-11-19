import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  numeric,
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

// 2. Categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImage: text('cover_image'),
  sortOrder: integer('sort_order').default(10).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Collections
export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  coverImage: text('cover_image').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  status: text('status').default('published').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Species
export const species = pgTable('species', {
  id: uuid('id').defaultRandom().primaryKey(),
  commonName: text('common_name').notNull(),
  banglaName: text('bangla_name'),
  scientificName: text('scientific_name').notNull(),
  description: text('description'),
  habitat: text('habitat'),
  conservationStatus: text('conservation_status').default('Least Concern').notNull(),
  iucnStatus: text('iucn_status').default('Least Concern').notNull(),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Locations
export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  region: text('region'),
  country: text('country').default('Bangladesh'),
  description: text('description'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  isSensitive: boolean('is_sensitive').default(false).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Photographs
export const photographs = pgTable('photographs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  storagePath: text('storage_path'),
  thumbnailUrl: text('thumbnail_url'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  speciesId: uuid('species_id').references(() => species.id, { onDelete: 'set null' }),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  photographedAt: timestamp('photographed_at', { withTimezone: true }),
  camera: text('camera'),
  lens: text('lens'),
  settings: jsonb('settings').$type<Record<string, string | number>>().default({}),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  status: text('status').default('published').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Collection Photos (junction)
export const collectionPhotos = pgTable('collection_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  photographId: uuid('photograph_id')
    .notNull()
    .references(() => photographs.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(10).notNull(),
});

// 8. Article Categories
export const articleCategories = pgTable('article_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

// 9. Articles
export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: jsonb('content').$type<Record<string, unknown>>().notNull().default({}),
  contentFormat: text('content_format').default('tiptap_json').notNull(),
  language: text('language').default('bn').notNull(),
  coverImage: text('cover_image').notNull(),
  coverImagePath: text('cover_image_path'),
  categoryId: uuid('category_id').references(() => articleCategories.id, { onDelete: 'set null' }),
  author: text('author').default('Razaul Hafiz Rahi').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: text('status').default('draft').notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. Article Translations
export const articleTranslations = pgTable('article_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  translatedArticleId: uuid('translated_article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
});

// 11. Article Tags
export const articleTags = pgTable('article_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
});

// 12. Videos
export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  videoUrl: text('video_url').notNull(),
  platform: text('platform').notNull(),
  embedUrl: text('embed_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  thumbnailPath: text('thumbnail_path'),
  category: text('category').default('Field Dispatches').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(10).notNull(),
  status: text('status').default('published').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. Site Profiles
export const siteProfiles = pgTable('site_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  biography: text('biography'),
  biographyBn: text('biography_bn'),
  profileImage: text('profile_image'),
  email: text('email'),
  socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}),
  conservationContent: text('conservation_content'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 14. Enquiries
export const enquiries = pgTable('enquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 15. Site Settings
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Relations ---
export const photographsRelations = relations(photographs, ({ one, many }) => ({
  category: one(categories, {
    fields: [photographs.categoryId],
    references: [categories.id],
  }),
  species: one(species, {
    fields: [photographs.speciesId],
    references: [species.id],
  }),
  location: one(locations, {
    fields: [photographs.locationId],
    references: [locations.id],
  }),
  collectionPhotos: many(collectionPhotos),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionPhotos: many(collectionPhotos),
}));

export const collectionPhotosRelations = relations(collectionPhotos, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionPhotos.collectionId],
    references: [collections.id],
  }),
  photograph: one(photographs, {
    fields: [collectionPhotos.photographId],
    references: [photographs.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
  tags: many(articleTags),
  translations: many(articleTranslations, { relationName: 'sourceArticle' }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
}));
