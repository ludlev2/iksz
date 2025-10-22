import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

interface SyncSessionPayload {
  event?: string;
  session?: {
    access_token?: string;
    refresh_token?: string;
  } | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  let payload: SyncSessionPayload;
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Invalid auth session payload:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { event, session } = payload;

  try {
    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    if (session?.access_token && session?.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (error) {
        console.error('Failed to persist auth session:', error);
        return NextResponse.json({ success: false, error: 'Failed to persist session.' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Missing session tokens.' }, { status: 400 });
  } catch (error) {
    console.error('Unexpected error while syncing auth session:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error.' }, { status: 500 });
  }
}
