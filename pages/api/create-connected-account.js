// File: /pages/api/create-connected-account.js

import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const dataFile = path.resolve("waiters.json");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Missing fields" });

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_type: "individual",
      business_profile: {
        product_description: "Tips for waiters"
      }
    });

    const baseUrl = req.headers.origin || "http://localhost:3000";
    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/register`,
      return_url: `${baseUrl}/thank-you?setup=done&username=${name}`,
      type: "account_onboarding"
    });

    // Обновляем локальный JSON-файл
    const existing = fs.existsSync(dataFile)
      ? JSON.parse(fs.readFileSync(dataFile, "utf-8"))
      : {};

    existing[name] = account.id;
    fs.writeFileSync(dataFile, JSON.stringify(existing, null, 2));

    res.status(200).json({
      accountId: account.id,
      onboardingUrl: link.url
    });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    res.status(500).json({ error: err.message });
  }
}