import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email) return alert("Please enter name and email");
    setLoading(true);

    const res = await fetch("/api/create-connected-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (data.onboardingUrl) {
      // можно сохранить в localStorage временно
      localStorage.setItem("username", name);
      window.location.href = data.onboardingUrl;
    } else {
      alert("Registration failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Register as a waiter</h2>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "6px"
        }}
      >
        {loading ? "Creating Stripe account..." : "Register and Connect Stripe"}
      </button>
    </div>
  );
}