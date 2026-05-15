import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(req) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount < 100) {
      return new Response(JSON.stringify({ error: 'Amount must be at least 100 paise.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    return new Response(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const status = error?.statusCode === 401 ? 401 : 500;
    return new Response(JSON.stringify({ error: error?.message || 'Unable to create order.' }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
