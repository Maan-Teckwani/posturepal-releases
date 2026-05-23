import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function safeCompare(a, b) {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function err(status, message) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') return err(400, 'Missing token.');

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return err(500, 'Server configuration error.');

    const dotIdx = token.indexOf('.');
    if (dotIdx === -1) return err(400, 'Invalid token format.');

    const payloadB64 = token.slice(0, dotIdx);
    const providedSig = token.slice(dotIdx + 1);

    let payloadStr;
    try {
      payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    } catch {
      return err(400, 'Invalid token encoding.');
    }

    const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
    if (!safeCompare(expectedSig, providedSig)) return err(401, 'Invalid token.');

    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      return err(400, 'Invalid token payload.');
    }

    if (!payload.pid || !payload.exp) return err(400, 'Malformed token payload.');
    if (Date.now() > payload.exp) {
      return err(401, 'This link has expired. Your license key was sent to your email — check your inbox and spam folder.');
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error: dbError } = await supabase
      .from('licenses')
      .select('key')
      .eq('payment_id', payload.pid)
      .maybeSingle();

    if (dbError || !data) {
      return err(404, 'License not found. Check your email for the license key.');
    }

    return new Response(JSON.stringify({ success: true, licenseKey: data.key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return err(500, error?.message || 'Verification failed.');
  }
}
