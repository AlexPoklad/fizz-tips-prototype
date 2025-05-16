import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const dataFile = path.resolve("waiters.json");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, waiter } = req.body;

  // Загружаем accountId из waiters.json
  const waiters = fs.existsSync(dataFile)
    ? JSON.parse(fs.readFileSync(dataFile, "utf-8"))
    : {};

  const connectedAccountId = waiters[waiter];

  if (!connectedAccountId) {
    return res.status(400).json({ error: "Waiter not found or not connected" });
  }

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
      payment_intent_data: {
        transfer_data: {
          destination: connectedAccountId
        }
      },
      success_url: `${req.headers.origin}/thank-you?via=stripe`,
      cancel_url: `${req.headers.origin}/${waiter}`,
    });

    res.status(200).json({ checkout_url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}