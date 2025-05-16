import { useRouter } from "next/router";
import { useState } from "react";

export default function TipPage() {
  const router = useRouter();
  const { username } = router.query;

  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("guest");

  const handlePay = (method) => {
    const url = `/api/pay/${method}?waiter=${username}&amount=${amount}&fee=${fee}`;
    window.location.href = url;
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Leave a tip for <strong>{username}</strong></h2>

      <label>Amount (€):</label><br />
      <input
        type="number"
        placeholder="e.g. 5.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ margin: "10px 0", padding: "0.5rem", width: "100%" }}
      />

      <label>Who covers the transaction fee?</label><br />
      <select
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        style={{ margin: "10px 0", padding: "0.5rem", width: "100%" }}
      >
        <option value="guest">Me (guest)</option>
        <option value="waiter">{username} (tip reduced)</option>
      </select>

      <h3>Select payment method:</h3>
      <button onClick={() => handlePay("stripe")} style={{ marginRight: "1rem" }}>
        Card / Apple Pay
      </button>
      <button onClick={() => handlePay("bank")}>
        Instant Bank Transfer
      </button>
    </div>
  );
}