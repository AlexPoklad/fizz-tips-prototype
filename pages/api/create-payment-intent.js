import Stripe from "stripe";
import fs from "fs";
import path from "path";
import { computeFinalAmounts } from "../../lib/feeModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, waiter, coverFee } = req.body;

  if (!amount || !waiter) {
    return res.status(400).json({ error: "Missing amount or waiter" });
  }

  try {
    const amountEuro = typeof amount === "string"
      ? parseFloat(amount.replace(",", "."))
      : Number(amount);

    if (isNaN(amountEuro)) {
      return res.status(400).json({ error: "Invalid amount format" });
    }

    // 🔽 Вычисляем финальные значения
    const { total, received, fee } = computeFinalAmounts(amountEuro, coverFee);
    const totalCents = Math.round(total * 100);
    const tipCents = Math.round(received * 100);

    // 🔽 Имя официанта
    let waiterName = waiter;
    try {
      const userDataPath = path.join(process.cwd(), "data", "users.json");
      const userData = JSON.parse(fs.readFileSync(userDataPath, "utf-8")) || {};
      const profile = userData[waiter] || {};
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
      if (fullName) waiterName = fullName;
    } catch (e) {
      console.warn("Could not resolve waiter name:", e.message);
    }

    console.log(`[Stripe] ${waiterName} receives €${(tipCents / 100).toFixed(2)} | charged €${(totalCents / 100).toFixed(2)}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Tip for ${waiterName}`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/thank-you`,
      cancel_url: `${req.headers.origin}/${waiter}`,
      metadata: { waiter },
    });

    res.status(200).json({ checkout_url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}