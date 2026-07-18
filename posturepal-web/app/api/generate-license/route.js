import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function generateLicenseKey() {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

function generateSessionToken(paymentId, secret) {
  const payloadStr = JSON.stringify({ pid: paymentId, exp: Date.now() + 7200000 });
  const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return Buffer.from(payloadStr).toString('base64') + '.' + sig;
}

export async function POST(req) {
  try {
    const { payment_id, email, first_name, last_name } = await req.json();

    if (!payment_id || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing payment_id or email' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const firstName = String(first_name || '').trim();
    const lastName = String(last_name || '').trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: existing } = await supabase
      .from('licenses')
      .select('key')
      .eq('payment_id', payment_id)
      .maybeSingle();

    if (existing) {
      const sessionToken = generateSessionToken(payment_id, secret);
      return new Response(JSON.stringify({ success: true, sessionToken }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }

    const licenseKey = generateLicenseKey();

    const { error: insertError } = await supabase.from('licenses').insert({
      key: licenseKey,
      email: normalizedEmail,
      payment_id,
      device_count: 0,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'Database insert failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (firstName && lastName) {
      const { error: customerError } = await supabase.from('customers').upsert(
        {
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          status: 'paid',
          created_at: new Date().toISOString()
        },
        { onConflict: 'email' }
      );
      if (customerError) {
        console.error('Supabase customer upsert error:', customerError);
      }
    } else {
      // Email-only path (e.g. webhook fallback) — still mark customer as paid if a row exists.
      const { error: statusErr } = await supabase
        .from('customers')
        .update({ status: 'paid' })
        .eq('email', normalizedEmail);
      if (statusErr) {
        console.error('Supabase customer status update error:', statusErr);
      }
    }

    // If this email had an active trial, link the freshly issued license key so the
    // desktop app can silently upgrade on its next trial:revalidate call (which
    // re-hits /api/validate-license against the cached trial key).
    const { error: trialLinkErr } = await supabase
      .from('trials')
      .update({ converted_license_key: licenseKey })
      .eq('email', normalizedEmail);
    if (trialLinkErr) {
      console.error('Trial conversion link error:', trialLinkErr);
    }

    const sessionToken = generateSessionToken(payment_id, secret);

    return new Response(JSON.stringify({ success: true, sessionToken }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Generate license error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
