import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const WIN_DOWNLOAD_URL =
  process.env.DOWNLOAD_URL_WIN ||
  'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe';

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Trial keys share the same XXXX-XXXX-XXXX-XXXX shape as paid license keys so
// the desktop app can accept either through its single key-entry field.
function generateTrialKey() {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const firstName = String(body.first_name || '').trim();
    const lastName = String(body.last_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return json({ success: false, error: 'Name and email are required.' }, 400);
    }

    const { data: existing, error: existingErr } = await supabase
      .from('trials')
      .select('token, token_consumed')
      .eq('email', email)
      .maybeSingle();

    if (existingErr) {
      console.error('trials lookup error:', existingErr);
      return json({ success: false, error: 'Database error.' }, 500);
    }

    if (existing) {
      if (existing.token_consumed) {
        return json(
          { success: false, error: 'A free trial has already been used for this email.' },
          409
        );
      }
      // Idempotent: re-render the download page with the same key.
      return json({
        success: true,
        trial_key: existing.token,
        download_url_win: WIN_DOWNLOAD_URL,
      });
    }

    const trialKey = generateTrialKey();

    const { error: insertErr } = await supabase.from('trials').insert({
      email,
      first_name: firstName,
      last_name: lastName,
      token: trialKey,
    });

    if (insertErr) {
      console.error('trials insert error:', insertErr);
      return json({ success: false, error: 'Could not create trial.' }, 500);
    }

    const { error: customerErr } = await supabase.from('customers').upsert(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        status: 'trial',
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (customerErr) {
      console.error('customers upsert error:', customerErr);
    }

    return json({
      success: true,
      trial_key: trialKey,
      download_url_win: WIN_DOWNLOAD_URL,
    });
  } catch (err) {
    console.error('create-trial error:', err);
    return json({ success: false, error: err?.message || 'Internal error.' }, 500);
  }
}
