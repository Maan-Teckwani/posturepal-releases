import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Paid lifetime licenses only. Trial keys live in a separate table and are
// validated by /api/validate-trial-key.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || '').toUpperCase().trim();

  if (!key) {
    return json({ valid: false, message: 'No license key provided.' });
  }

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error('validate-license lookup error:', error);
    return json({ valid: false, message: 'Database error while validating license.' }, 500);
  }

  if (!data) {
    return json({ valid: false, message: 'Invalid lifetime license key. If this is a free trial key, switch to the Free Trial tab.' });
  }

  if (data.device_count >= 2) {
    return json({ valid: false, message: 'This license has already been used on 2 devices.' });
  }

  await supabase
    .from('licenses')
    .update({ device_count: data.device_count + 1 })
    .eq('key', key);

  return json({ valid: true, type: 'paid', message: 'Lifetime license activated.' });
}
