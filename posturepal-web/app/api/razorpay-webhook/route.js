import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function generateLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response('Missing signature or secret', { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyText)
    .digest('hex');

  if (expectedSignature !== signature) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(bodyText);
  const eventName = event.event;

  if (eventName !== 'payment.captured' && eventName !== 'payment_link.paid') {
    return new Response(JSON.stringify({ status: 'ignored', event: eventName }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  const paymentEntity = event.payload?.payment?.entity;

  if (!paymentEntity) {
    return new Response('Missing payment entity', { status: 400 });
  }

  const paymentId = paymentEntity.id;
  const rawEmail = paymentEntity.email || event.payload?.payment_link?.entity?.customer?.email;
  const email = rawEmail ? String(rawEmail).trim().toLowerCase() : null;
  const notes = paymentEntity.notes || {};
  const firstName = String(notes.first_name || '').trim();
  const lastName = String(notes.last_name || '').trim();

  if (!paymentId) {
    return new Response('Missing payment id', { status: 400 });
  }

  if (!email) {
    return new Response('No email found in webhook payload', { status: 400 });
  }

  const { data: existing } = await supabase
    .from('licenses')
    .select('key')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (firstName && lastName) {
    const { error: customerError } = await supabase.from('customers').upsert(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        status: 'paid',
        created_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    );
    if (customerError) {
      console.error('Supabase customer upsert error:', customerError);
    }
  } else {
    const { error: statusErr } = await supabase
      .from('customers')
      .update({ status: 'paid' })
      .eq('email', email);
    if (statusErr) {
      console.error('Supabase customer status update error:', statusErr);
    }
  }

  const licenseKey = generateLicenseKey();

  const { error: insertError } = await supabase.from('licenses').insert({
    key: licenseKey,
    email,
    payment_id: paymentId,
    device_count: 0,
    created_at: new Date().toISOString()
  });

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return new Response('Database error', { status: 500 });
  }

  // Link any matching trial so the desktop app can silently upgrade on next validate.
  const { error: trialLinkErr } = await supabase
    .from('trials')
    .update({ converted_license_key: licenseKey })
    .eq('email', email);
  if (trialLinkErr) {
    console.error('Trial conversion link error:', trialLinkErr);
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
