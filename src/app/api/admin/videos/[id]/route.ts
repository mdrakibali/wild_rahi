import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, videos } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { deleteMediaAssets, diffRemovedMediaTargets } from '@/lib/storage';
import { isValidUuid } from '@/lib/validation';
import { parseVideoUrl } from '@/lib/videoEmbed';
import { revalidatePortfolioCache } from '@/lib/cache';

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
    return NextResponse.json({ error: 'Invalid video ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const videoUrl = String(body.videoUrl || '').trim();
    const parsed = parseVideoUrl(videoUrl);
    if (!parsed.valid) {
      return NextResponse.json(
        { error: parsed.error || 'Please provide a valid video URL.' },
        { status: 400 }
      );
    }

    const thumbnail = String(body.thumbnail || body.thumbnailUrl || parsed.thumbnailUrl || '').trim();

    const videoValues = {
      title: String(body.title || 'Untitled Video').trim(),
      description: String(body.description || '').trim(),
      videoUrl,
      thumbnail: thumbnail || null,
      thumbnailPath: body.thumbnailPath || null,
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 10),
      isPublished: body.isPublished !== false,
      updatedAt: new Date(),
    };

    const existing = isNew ? [] : await db.select().from(videos).where(eq(videos.id, id));

    let result;
    if (existing.length > 0) {
      const removed = diffRemovedMediaTargets(
        [existing[0].thumbnailPath, existing[0].thumbnail],
        [videoValues.thumbnailPath, videoValues.thumbnail]
      );
      if (removed.length > 0) {
        await deleteMediaAssets(removed);
      }
      const [updated] = await db
        .update(videos)
        .set(videoValues)
        .where(eq(videos.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(videos)
        .values(isNew ? videoValues : { id, ...videoValues })
        .returning();
      result = inserted;
    }

    revalidatePortfolioCache();
    return NextResponse.json({ ok: true, video: result });
  } catch (err) {
    console.error('[Admin Video PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to save video.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Invalid video ID.' }, { status: 400 });
  }

  try {
    const existing = await db.select().from(videos).where(eq(videos.id, id));
    if (existing.length > 0) {
      await deleteMediaAssets([existing[0].thumbnailPath, existing[0].thumbnail]);
      await db.delete(videos).where(eq(videos.id, id));
    }
    revalidatePortfolioCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Video DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete video.' }, { status: 500 });
  }
}
