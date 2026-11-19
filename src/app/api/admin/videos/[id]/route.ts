import { NextResponse } from 'next/server';
import { db, videos } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { parseVideoUrl } from '@/lib/videoEmbed';

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
    const existing = await db.select().from(videos).where(eq(videos.id, id));

    const parsed = parseVideoUrl(body.videoUrl || '');
    const platform = parsed ? parsed.platform : body.platform || 'youtube';
    const embedUrl = parsed ? parsed.embedUrl : body.embedUrl || body.videoUrl;

    const videoValues = {
      title: body.title || 'Untitled Video',
      description: body.description || '',
      videoUrl: body.videoUrl,
      platform,
      embedUrl,
      thumbnailUrl: body.thumbnailUrl || (parsed ? parsed.thumbnailUrl : null),
      thumbnailPath: body.thumbnailPath || null,
      category: body.category || 'Field Dispatches',
      isFeatured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder ?? 10),
      status: body.published === false ? 'draft' : 'published',
      updatedAt: new Date(),
    };

    let result;
    if (existing.length > 0) {
      const [updated] = await db
        .update(videos)
        .set(videoValues)
        .where(eq(videos.id, id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(videos)
        .values({ id, ...videoValues })
        .returning();
      result = inserted;
    }

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
  try {
    await db.delete(videos).where(eq(videos.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Admin Video DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete video.' }, { status: 500 });
  }
}

