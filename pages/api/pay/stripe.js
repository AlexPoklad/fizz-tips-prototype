export default function handler(req, res) {
  const { waiter, amount, fee } = req.query;
  console.log(`[Stripe] ${waiter} receives ${amount} € (${fee === "guest" ? "guest covers fee" : "fee deducted"})`);
  res.redirect("/thank-you?via=stripe");
}