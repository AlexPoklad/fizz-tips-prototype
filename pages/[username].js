import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function TipPage() {
  const router = useRouter();
  const { username } = router.query;

  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("guest");
  const [guestPays, setGuestPays] = useState("");
  const [waiterGets, setWaiterGets] = useState("");
  const [processing, setProcessing] = useState(false);

  const FEE_PERCENT = 0.03;

  useEffect(() => {
    const amt = parseFloat(amount);
    if (!isNaN(amt)) {
      if (fee === "guest") {
        const guestTotal = (amt * (1 + FEE_PERCENT)).toFixed(2);
        setGuestPays(guestTotal);
        setWaiterGets(amt.toFixed(2));
      } else {
        const waiterNet = (amt * (1 - FEE_PERCENT)).toFixed(2);
        setGuestPays(amt.toFixed(2));
        setWaiterGets(waiterNet);
      }
    } else {
      setGuestPays("");
      setWaiterGets("");
    }
  }, [amount, fee]);

  const handleStripe = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(guestPays),
          waiter: username
        })
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Failed to start Stripe checkout");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Stripe error");
      setProcessing(false);
    }
  };

  const handleBank = () => {
    setProcessing(true);
    setTimeout(() => {
      const url = `/api/pay/bank?waiter=${username}&amount=${amount}&fee=${fee}`;
      window.location.href = url;
    }, 1000);
  };

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "sans-serif",
      maxWidth: "400px",
      margin: "0 auto",
      textAlign: "center"
    }}>
      <img
        src={`/images/${username}.jpg`}
        alt={`${username}'s photo`}
        style={{
          borderRadius: "50%",
          width: "120px",
          height: "120px",
          objectFit: "cover",
          marginBottom: "1rem"
        }}
      />
      <h2 style={{ marginBottom: "0.5rem" }}>Leave a tip for</h2>
      <h3 style={{ marginTop: 0 }}>{username}</h3>

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

      {amount && (
        <div style={{
          background: "#f8f8f8",
          padding: "1rem",
          borderRadius: "8px",
          marginTop: "1rem"
        }}>
          <p><strong>You pay:</strong> €{guestPays}</p>
          <p><strong>{username} receives:</strong> €{waiterGets}</p>
        </div>
      )}

      {processing ? (
        <p style={{ marginTop: "1.5rem" }}>Processing payment...</p>
      ) : (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Select payment method:</h3>
          <button
            onClick={handleStripe}
            style={{
              margin: "0.5rem 0",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              width: "100%",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "6px"
            }}
          >
            <img
              src="/apple-pay-logo.png"
              alt="Apple Pay"
              style={{ height: "20px", verticalAlign: "middle", marginRight: "0.5rem" }}
            />
            Pay with Card / Apple Pay
          </button>
          <button
            onClick={handleBank}
            style={{
              margin: "0.5rem 0",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              width: "100%",
              backgroundColor: "#1a73e8",
              color: "#fff",
              border: "none",
              borderRadius: "6px"
            }}
          >
            <img
              src="/bank-icon.png"
              alt="Bank"
              style={{ height: "20px", verticalAlign: "middle", marginRight: "0.5rem" }}
            />
            Bank Transfer
          </button>
        </>
      )}
    </div>
  );
}