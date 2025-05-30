import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { computeFinalAmounts } from "@/lib/feeModel"; // ✅ импорт модели комиссий

const stepButtonStyle = {
  fontSize: "1.2rem",
  width: 40,
  height: 40,
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const feeChoiceStyle = {
  padding: "0.5rem 1rem",
  borderRadius: 6,
  minWidth: 100,
  cursor: "pointer",
  fontSize: "1rem",
};

export default function TipPage() {
  const router = useRouter();
  const { userId } = router.query;

  const [amount, setAmount] = useState(10.0);
  const [coverFee, setCoverFee] = useState(true);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(userId);

  const { fee, total, received } = computeFinalAmounts(amount, coverFee); // ✅ использование новой логики

  useEffect(() => {
    if (!router.isReady || !userId) return;
    console.log("Fetching user profile for:", userId);
    fetch(`/api/get-user?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
          setDisplayName(fullName || userId);
        }
      });
  }, [router.isReady, userId]);

  const handleChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) setAmount(value);
  };

  const handlePayment = async () => {
    if (!amount || amount <= 0) return alert("Enter valid amount");
    setLoading(true);
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount.toFixed(2)),
        waiter: userId,
        coverFee,
      }),
    });
    const data = await res.json();
    if (data.checkout_url) window.location.href = data.checkout_url;
    else alert("Error");
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "sans-serif",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <img
        src={`/images/${userId}.jpg`}
        alt={userId}
        onError={(e) => (e.target.style.display = "none")}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 16,
          border: "3px solid #eee",
        }}
      />

      <h2 style={{ marginBottom: 8 }}>
        Leave a tip for <strong>{displayName}</strong>
      </h2>

      <div style={{ fontSize: "1rem", marginBottom: 8 }}>Amount:</div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setAmount(Math.max(0, amount - 1))} style={stepButtonStyle}>–</button>
        <input
          type="number"
          step="0.5"
          inputMode="decimal"
          value={amount}
          onChange={handleChange}
          style={{
            fontSize: "2rem",
            textAlign: "center",
            border: "none",
            borderBottom: "2px solid #ccc",
            width: 120,
            background: "transparent",
            MozAppearance: "textfield",
          }}
        />
        <button onClick={() => setAmount(amount + 1)} style={stepButtonStyle}>+</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        Do you want the waiter to receive the full tip amount?
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setCoverFee(true)}
          style={{
            ...feeChoiceStyle,
            background: coverFee ? "#000" : "#fff",
            color: coverFee ? "#fff" : "#000",
            border: coverFee ? "2px solid #000" : "2px solid #ccc",
          }}
        >
          Yes
        </button>
        <button
          onClick={() => setCoverFee(false)}
          style={{
            ...feeChoiceStyle,
            background: !coverFee ? "#000" : "#fff",
            color: !coverFee ? "#fff" : "#000",
            border: !coverFee ? "2px solid #000" : "2px solid #ccc",
          }}
        >
          No
        </button>
      </div>

      {amount > 0 && (
        <div style={{ fontSize: "0.95rem", marginBottom: 24, color: "#666" }}>
          You pay: <strong>€{total.toFixed(2)}</strong>
          <br />
          {displayName} receives: <strong>€{received.toFixed(2)}</strong>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || amount <= 0}
        style={{
          background: "#000",
          color: "#fff",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: 8,
          fontSize: "1rem",
          cursor: "pointer",
          width: "100%",
          maxWidth: 300,
        }}
      >
        {loading ? "Redirecting..." : "Pay with Card / Apple Pay"}
      </button>
    </div>
  );
}