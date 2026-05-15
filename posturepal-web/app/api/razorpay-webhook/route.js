import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

function resolveDownloadUrl(envName, fallback) {
  return process.env[envName] || fallback;
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

  const paymentEntity =
    eventName === 'payment.captured' || eventName === 'payment.authorized' || eventName === 'payment.failed'
      ? event.payload?.payment?.entity
      : eventName === 'payment_link.paid'
      ? event.payload?.payment?.entity
      : null;

  if (!paymentEntity) {
    return new Response('Unsupported event or missing payment entity', { status: 400 });
  }

  const paymentId = paymentEntity.id;
  const email = paymentEntity.email || event.payload?.payment_link?.entity?.customer?.email;

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

  const licenseKey = generateLicenseKey();
  const downloadMac = resolveDownloadUrl('DOWNLOAD_URL_MAC', 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal.dmg');
  const downloadWin = resolveDownloadUrl('DOWNLOAD_URL_WIN', 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal-Setup.exe');
  const downloadLinux = resolveDownloadUrl('DOWNLOAD_URL_LINUX', 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal.AppImage');

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

  await resend.emails.send({
    from: 'PosturePal <license@posturepal.io>',
    to: email,
    subject: 'Your PosturePal License Key 🦐',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f8f5ed; color: #121212;">
        <div style="background: #ffffff; border: 2px solid #000000; box-shadow: 5px 5px 0 rgba(0,0,0,.08); padding: 36px;">
          <h1 style="font-size: 32px; margin-bottom: 8px;">Thanks for buying PosturePal!</h1>
          <p style="margin: 0 0 24px; color: #555555;">Your license key is ready. Use it to activate the desktop app on up to 2 devices.</p>
          <p style="font-weight: 700; margin-bottom: 12px;">License Key</p>
          <div style="background: #d4f57a; border: 2px solid #000; padding: 22px 18px; font-size: 24px; letter-spacing: 6px; text-align: center; font-family: monospace; margin-bottom: 32px;">
            ${licenseKey}
          </div>
          <p style="font-weight: 700; margin-bottom: 12px;">Download PosturePal</p>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
            <a href="${downloadMac}" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 20px; text-align: center; font-weight: 700;">Download for Mac</a>
            <a href="${downloadWin}" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 20px; text-align: center; font-weight: 700;">Download for Windows</a>
            <a href="${downloadLinux}" style="display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 20px; text-align: center; font-weight: 700;">Download for Linux</a>
          </div>
          <p style="font-size: 14px; color: #666666; margin: 0;">If you need help installing PosturePal, reply to this email and our support team will assist you.</p>
        </div>
        <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 22px;">PosturePal © 2026</p>
      </div>
    `
  });

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
