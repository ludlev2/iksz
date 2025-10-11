import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendEmail, formatTextAsHtml } from '@/lib/email-service';
import { createClient } from '@/utils/supabase/server';

const requestSchema = z.object({
  opportunityId: z.string().uuid(),
  shiftId: z.string().uuid().optional(),
  message: z.string().min(10).max(5000),
});

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'A szolgáltatás használatához be kell jelentkezned.' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Érvénytelen kérés.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { opportunityId, shiftId, message } = parsed.data;

  const { data: opportunity, error: opportunityError } = await supabase
    .from('opportunities')
    .select(
      `
        id,
        title,
        organization:organization_profiles (
          name,
          email
        ),
        shifts:opportunity_shifts (
          id,
          start_at,
          end_at
        )
      `,
    )
    .eq('id', opportunityId)
    .maybeSingle();

  if (opportunityError || !opportunity) {
    return NextResponse.json(
      { error: 'Nem található a kiválasztott lehetőség.' },
      { status: 404 },
    );
  }

  const organizationEmail = opportunity.organization?.email;

  if (!organizationEmail) {
    return NextResponse.json(
      { error: 'Ehhez a lehetőséghez nincs megadott email cím.' },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  const studentName = profile?.full_name ?? user.email ?? 'IKSZ Finder diák';

  const shift = shiftId
    ? (opportunity.shifts ?? []).find((item) => item.id === shiftId) ?? null
    : null;

  const textLines = [
    message.trim(),
    '',
    '---',
    `Diák neve: ${studentName}`,
  ];

  if (user.email) {
    textLines.push(`Diák email címe: ${user.email}`);
  }

  if (shift) {
    const duration =
      shift.start_at && shift.end_at
        ? `${formatDate(shift.start_at)} ${formatTime(shift.start_at)} – ${formatTime(shift.end_at)}`
        : shift.start_at
          ? `${formatDate(shift.start_at)} ${formatTime(shift.start_at)}`
          : null;

    if (duration) {
      textLines.push(`Kért idősáv: ${duration}`);
    }
  }

  textLines.push('Üzenet küldve: IKSZ Finder');

  const text = textLines.join('\n');
  const html = [
    formatTextAsHtml(message.trim()),
    '<hr />',
    `<p><strong>Diák neve:</strong> ${studentName}</p>`,
  ];

  if (user.email) {
    html.push(`<p><strong>Diák email címe:</strong> ${user.email}</p>`);
  }

  if (shift) {
    const shiftDetails =
      shift.start_at && shift.end_at
        ? `${formatDate(shift.start_at)} ${formatTime(shift.start_at)} – ${formatTime(shift.end_at)}`
        : shift.start_at
          ? `${formatDate(shift.start_at)} ${formatTime(shift.start_at)}`
          : null;

    if (shiftDetails) {
      html.push(`<p><strong>Kért idősáv:</strong> ${shiftDetails}</p>`);
    }
  }

  html.push('<p><em>Üzenet küldve az IKSZ Finder platformról.</em></p>');

  const subject = `Érdeklődés: ${opportunity.title}`;
  const sendResult = await sendEmail({
    to: organizationEmail,
    subject,
    text,
    html: html.join('\n'),
    replyTo: user.email ?? undefined,
  });

  if (!sendResult.success) {
    return NextResponse.json(
      { error: sendResult.error },
      { status: sendResult.status ?? 500 },
    );
  }

  return NextResponse.json({ success: true });
}
