import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TRIAL_LENGTH_MS = 21 * 24 * 60 * 60 * 1000;
const GRACE_MS = 24 * 60 * 60 * 1000;

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || '').toUpperCase().trim();
  const machineId = String(body.machine_id || '').trim();

  if (!key) {
    return json({ valid: false, message: 'No trial key provided.' });
  }
  if (!machineId) {
    return json({ valid: false, message: 'Missing device identifier.' });
  }

  const { data: trial, error: lookupErr } = await supabase
    .from('trials')
    .select('*')
    .eq('token', key)
    .maybeSingle();

  if (lookupErr) {
    console.error('validate-trial-key lookup error:', lookupErr);
    return json({ valid: false, message: 'Database error while validating trial key.' }, 500);
  }

  if (!trial) {
    return json({ valid: false, message: 'Invalid trial key. Make sure you copied it exactly as shown on the download page.' });
  }

  // Already activated on a different device → reject.
  if (trial.token_consumed && trial.machine_id && trial.machine_id !== machineId) {
    return json({ valid: false, message: 'This trial key is already in use on another device.' });
  }

  // First-time activation path.
  if (!trial.token_consumed) {
    // One free trial per device.
    const { data: priorTrial } = await supabase
      .from('trials')
      .select('id')
      .eq('machine_id', machineId)
      .eq('token_consumed', true)
      .neq('id', trial.id)
      .maybeSingle();

    if (priorTrial) {
      return json({
        valid: false,
        reason: 'device-trial-used',
        message: 'This device has already used a free trial. Get lifetime access at posturepal.in.',
      });
    }

    const now = Date.now();
    const signupMs = new Date(trial.signup_at).getTime();
    const startedAt = new Date(Math.min(now, signupMs + GRACE_MS));
    const expiresAt = new Date(startedAt.getTime() + TRIAL_LENGTH_MS);

    const { error: updateErr } = await supabase
      .from('trials')
      .update({
        token_consumed: true,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        machine_id: machineId,
      })
      .eq('id', trial.id);

    if (updateErr) {
      console.error('trial activation error:', updateErr);
      return json({ valid: false, message: 'Could not activate trial.' }, 500);
    }

    return json({
      valid: true,
      status: 'active',
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      remaining_ms: expiresAt.getTime() - now,
      converted_license_key: trial.converted_license_key || null,
      message: 'Free trial activated.',
    });
  }

  // Idempotent re-validation on the same device.
  const expiresMs = trial.expires_at ? new Date(trial.expires_at).getTime() : 0;
  const remaining = expiresMs - Date.now();

  if (remaining <= 0) {
    return json({
      valid: false,
      status: 'expired',
      expires_at: trial.expires_at,
      remaining_ms: 0,
      converted_license_key: trial.converted_license_key || null,
      message: 'Your free trial has ended.',
    });
  }

  return json({
    valid: true,
    status: 'active',
    started_at: trial.started_at,
    expires_at: trial.expires_at,
    remaining_ms: remaining,
    converted_license_key: trial.converted_license_key || null,
    message: 'Free trial active.',
  });
}
