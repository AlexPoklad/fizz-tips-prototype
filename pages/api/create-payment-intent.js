import Stripe from "stripe";
import fs from "fs";
import path from "path";

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

    const tipCents = Math.round(amountEuro * 100); // 10.00 → 1000
    const feeCents = Math.ceil(tipCents * 0.03);   // 3% → 30
    const totalCents = coverFee ? tipCents + feeCents : tipCents;

    // 🔽 Пытаемся получить имя по userId
    let waiterName = waiter;
    try {
      const userDataPath = path.join(process.cwd(), "data", "users.json");
      const userData = JSON.parse(fs.readFileSync(userDataPath, "utf-8")) || {};
 console.log("Loaded userData keys:", Object.keys(userData));
console.log("Looking up waiter:", waiter);
console.log("Matched entry:", userData[waiter]);

const profile = userData[waiter] || {};
const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
console.log("Resolved fullName:", fullName);

if (fullName) waiterName = fullName;
    } catch (e) {
      console.warn("Could not resolve waiter name:", e.message);
    }

    console.log(
      `[Stripe] ${waiterName} receives €${(coverFee ? amountEuro : (amountEuro - feeCents / 100)).toFixed(2)} | charged €${(totalCents / 100).toFixed(2)}`
    );
    console.log("Resolved waiter name:", waiterName);

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