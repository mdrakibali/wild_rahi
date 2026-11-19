import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { validateEnquiryInput } from '@/lib/validation';
import { getAdminSessionFromRequest } from '@/lib/auth';

const enquiryHits = new Map<string, { count: number; resetAt: number }>();

function checkEnquiryRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = enquiryHits.get(ip);
  if (!entry || now > entry.resetAt) {
    enquiryHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 6) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkEnquiryRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many enquiry submissions. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = validateEnquiryInput({
      name: typeof body.name === 'string' ? body.name : '',
      email: typeof body.email === 'string' ? body.email : '',
      organization: typeof body.organization === 'string' ? body.organization : '',
      enquiryType: body.enquiryType || 'General',
      subject: typeof body.subject === 'string' ? body.subject : '',
      message: typeof body.message === 'string' ? body.message : '',
    });

    if (!validated.valid) {
      const firstError = Object.values(validated.errors)[0] || 'Invalid enquiry submission.';
      return NextResponse.json({ error: firstError, errors: validated.errors }, { status: 400 });
    }

    const inserted = await repository.createEnquiry({
      name: validated.sanitized.name,
      email: validated.sanitized.email,
      subject: validated.sanitized.subject,
      message: validated.sanitized.message,
    });

    return NextResponse.json({
      ok: true,
      message: 'Your enquiry has been received. Razaul Hafiz Rahi will get back to you shortly.',
      enquiry: inserted,
    });
  } catch (err) {
    console.error('[Enquiries API] Error:', err);
    return NextResponse.json({ error: 'Failed to submit enquiry.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  }

  const list = await repository.getEnquiries();
  return NextResponse.json({ enquiries: list });
}
