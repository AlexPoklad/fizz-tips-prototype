// File: /pages/api/create-payment-intent.js

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, waiter } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Tip for ${waiter}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/thank-you?via=stripe`,
      cancel_url: `${req.headers.origin}/${waiter}`,
    });

    res.status(200).json({ checkout_url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session error" });
  }
}