import { NextResponse } from 'next/server';
import { db, articles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteStorageFile } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const existing = await db.select().from(articles).where(eq(articles.id, id));

    // Support both Tiptap JSON and HTML input
    let contentJson: Record<string, unknown> = {};
    if (typeof body.content === 'object' && body.content !== null) {
      contentJson = body.content;
    } else if (typeof body.contentHtml === 'string') {
      contentJson = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: body.contentHtml.replace(/<[^>]+>/g, '') }],
          },
        ],
      };
    }

    const articleValues = {
      title: body.title || 'Untitled Article',
      slug: body.slug || `article-${Date.now()}`,
      excerpt: body.excerpt || '',
      content: contentJson,
      contentFormat: 'tiptap_json',
      language: body.language === 'en' ? 'en' : 'bn',
      coverImage: body.coverImageUrl || body.coverImage || '',
      coverImagePath: body.coverImagePath || null,
      author: body.authorName || body.author || 'Razaul Hafiz Rahi',
      publishedAt: body.published ? new Date() : null,
      isFeatured: Boolean(body.featured),
      status: body.published ? 'published' : 'draft',
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.excerpt,
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(articles)
        .set(articleValues)
        .where(eq(articles.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(articles)
        .values({ id, ...articleValues })
        .returning();
      result = inserted;
    }

    return NextResponse.json({ ok: true, article: result });
  } catch (err) {
    console.error('[Admin Article PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save article.' }, { status: 500 });
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
  try {
    const existing = await db.select().from(articles).where(eq(articles.id, id));
    if (existing.length > 0) {
      if (existing[0].coverImagePath) {
        await deleteStorageFile(existing[0].coverImagePath);
      }
      await db.delete(articles).where(eq(articles.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Article DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete article.' }, { status: 500 });
  }
}

