import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response('Missing signature or secret', { status: 400 });
  }

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyText)
    .digest('hex');

  if (expectedSignature !== signature) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(bodyText);

  // Razorpay fires payment_link.paid when a Payment Link is paid
  if (event.event === 'payment_link.paid') {
    const paymentLink = event.payload.payment_link.entity;
    const paymentEntity = event.payload.payment.entity;
    
    // Grab the email the customer provided during checkout
    const email = paymentEntity.email || paymentLink.customer?.email;

    if (!email) {
      return new Response('No email found in webhook payload', { status: 400 });
    }

    // Generate license key: XXXX-XXXX-XXXX-XXXX format
    const key = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase()
    ).join('-');

    // Save to Supabase
    await supabase.from('licenses').insert({
      key,
      email,
      device_count: 0,
      created_at: new Date().toISOString()
    });

    // Send license key email via Resend
    await resend.emails.send({
      from: 'PosturePal <license@YOUR_DOMAIN.com>', // Update to your verified domain in Resend
      to: email,
      subject: 'Your PosturePal License Key 🦐',
      html: `
        <div style="font-family: monospace; max-width: 500px; margin: 0 auto; padding: 40px;">
          <h1 style="font-size: 28px;">Welcome to PosturePal!</h1>
          <p style="margin: 20px 0;">Your license key:</p>
          <div style="background: #f5f0e8; border: 2px solid black; padding: 20px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center;">
            ${key}
          </div>
          <p style="margin: 20px 0;">Download PosturePal for your platform:</p>
          <p>Mac: [download link]</p>
          <p>Windows: [download link]</p>
          <p>Linux: [download link]</p>
          <p style="margin-top: 20px; color: #666;">This key works on 2 devices. Questions? Reply to this email.</p>
        </div>
      `
    });
  }

  return new Response('OK', { status: 200 });
}
