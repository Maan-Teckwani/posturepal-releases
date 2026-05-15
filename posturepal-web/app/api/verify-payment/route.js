import crypto from 'crypto';

function safeCompare(a, b) {
  const bufferA = Buffer.from(a, 'utf-8');
  const bufferB = Buffer.from(b, 'utf-8');
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ message: 'Missing payment fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ message: 'Server configuration missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return new Response(JSON.stringify({ success: false, message: 'Signature mismatch.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error?.message || 'Verification failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
