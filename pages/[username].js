import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TipPage() {
  const router = useRouter();
  const { username } = router.query;

  const [amount, setAmount] = useState("");
  const [coverFee, setCoverFee] = useState(true);
  const [loading, setLoading] = useState(false);

  const feeRate = 0.03;
  const parsed = parseFloat(amount || "0");
  const fee = parsed * feeRate;
  const total = coverFee ? parsed + fee : parsed;
  const received = coverFee ? parsed : parsed - fee;

  const handlePayment = async () => {
    if (!amount || parsed <= 0) return alert("Enter valid amount");
    setLoading(true);
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        waiter: username,
      }),
    });
    const data = await res.json();
    if (data.checkout_url) window.location.href = data.checkout_url;
    else alert("Error");
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif", textAlign: "center" }}>
      <img
        src={`/images/${username}.jpg`}
        alt={username}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 16,
          border: "3px solid #eee"
        }}
      />
      <h2 style={{ marginBottom: 8 }}>Leave a tip for <strong>{username}</strong></h2>

      <div style={{ fontSize: "1rem", marginBottom: 8 }}>Amount:</div>
      <input
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          fontSize: "2rem",
          textAlign: "center",
          border: "none",
          borderBottom: "2px solid #ccc",
          padding: "0.5rem",
          width: "100%",
          maxWidth: 200,
          marginBottom: "1.5rem"
        }}
      />

      <div style={{ marginBottom: 12 }}>Who pays the 3% fee?</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setCoverFee(true)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: coverFee ? "2px solid #000" : "2px solid #ccc",
            background: coverFee ? "#000" : "#fff",
            color: coverFee ? "#fff" : "#000",
            cursor: "pointer",
            minWidth: 100
          }}
        >
          Guest
        </button>
        <button
          onClick={() => setCoverFee(false)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: !coverFee ? "2px solid #000" : "2px solid #ccc",
            background: !coverFee ? "#000" : "#fff",
            color: !coverFee ? "#fff" : "#000",
            cursor: "pointer",
            minWidth: 100
          }}
        >
          Waiter
        </button>
      </div>

      {parsed > 0 && (
        <div style={{ fontSize: "0.9rem", marginBottom: 24, color: "#666" }}>
          You pay: <strong>€{total.toFixed(2)}</strong><br />
          {username} receives: <strong>€{received.toFixed(2)}</strong>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || parsed <= 0}
        style={{
          background: "#000",
          color: "#fff",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: 8,
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        {loading ? "Redirecting..." : "Pay with Card / Apple Pay"}
      </button>
    </div>
  );
}