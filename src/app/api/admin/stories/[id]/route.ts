import { NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { db, stories } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteMediaAssets, diffRemovedMediaTargets } from '@/lib/storage';
import { sanitizeArticleHtml } from '@/lib/sanitizeHtml';
import { isValidUuid, toSafeSlug } from '@/lib/validation';
import { revalidatePortfolioCache } from '@/lib/cache';

async function ensureUniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = toSafeSlug(desired, 72);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const conflict = excludeId
      ? await db
          .select({ id: stories.id })
          .from(stories)
          .where(and(eq(stories.slug, candidate), ne(stories.id, excludeId)))
          .limit(1)
      : await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, candidate)).limit(1);

    if (conflict.length === 0) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const isNew = id === 'new';
  if (!isNew && !isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid story ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const coverImage = String(body.coverImage || '').trim();

    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Story title and cover image are required.' },
        { status: 400 }
      );
    }

    // Store structured Tiptap JSON when provided; preserve sanitized HTML fallback
    let contentPayload: Record<string, unknown> = {};
    if (body.content && typeof body.content === 'object' && Object.keys(body.content).length > 0) {
      contentPayload = { ...body.content };
    }
    if (typeof body.contentHtml === 'string' && body.contentHtml.trim()) {
      contentPayload = {
        ...contentPayload,
        html: sanitizeArticleHtml(body.contentHtml),
      };
    }

    const images = Array.isArray(body.images)
      ? body.images.filter((url: unknown): url is string => typeof url === 'string' && url.trim().length > 0)
      : [];

    const existing = isNew ? [] : await db.select().from(stories).where(eq(stories.id, id));
    const uniqueSlug = await ensureUniqueSlug(
      String(body.slug || title),
      existing.length > 0 ? id : undefined
    );

    const storyValues = {
      title,
      slug: uniqueSlug,
      shortDescription: String(body.shortDescription || '').trim(),
      coverImage,
      coverImagePath: body.coverImagePath || null,
      content: contentPayload,
      images,
      isFeatured: Boolean(body.isFeatured),
      isPublished: Boolean(body.isPublished),
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const prevGallery = Array.isArray(existing[0].images) ? existing[0].images : [];
      const removed = diffRemovedMediaTargets(
        [existing[0].coverImagePath, existing[0].coverImage, ...prevGallery],
        [storyValues.coverImagePath, storyValues.coverImage, ...images]
      );
      if (removed.length > 0) {
        await deleteMediaAssets(removed);
      }
      const [updated] = await db
        .update(stories)
        .set(storyValues)
        .where(eq(stories.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(stories)
        .values(isNew ? storyValues : { id, ...storyValues })
        .returning();
      result = inserted;
    }

    revalidatePortfolioCache();
    return NextResponse.json({ ok: true, story: result });
  } catch (err) {
    console.error('[Admin Story PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save story.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid story ID.' }, { status: 400 });
  }

  try {
    const existing = await db.select().from(stories).where(eq(stories.id, id));
    if (existing.length > 0) {
      const prevGallery = Array.isArray(existing[0].images) ? existing[0].images : [];
      await deleteMediaAssets([
        existing[0].coverImagePath,
        existing[0].coverImage,
        ...prevGallery,
      ]);
      await db.delete(stories).where(eq(stories.id, id));
    }
    revalidatePortfolioCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Story DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete story.' }, { status: 500 });
  }
}

