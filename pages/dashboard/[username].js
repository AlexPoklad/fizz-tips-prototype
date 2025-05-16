import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function WaiterDashboard() {
  const router = useRouter();
  const { username } = router.query;
  const [tipUrl, setTipUrl] = useState("");

  useEffect(() => {
    if (username) {
      setTipUrl(`${window.location.origin}/${username}`);
    }
  }, [username]);

  if (!username || !tipUrl) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Hello, {username} 👋</h2>
      <p>This is your personal tipping page:</p>

      <a href={tipUrl} target="_blank" rel="noopener noreferrer" style={{ color: "blue", display: "block", marginBottom: "1rem" }}>
        {tipUrl}
      </a>

      <p>Scan or share this QR code:</p>
      <div style={{ margin: "1rem auto" }}>
        <QRCodeCanvas value={tipUrl} size={200} />
      </div>

      <a
        href={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(tipUrl)}&size=400x400`}
        download={`tip-qr-${username}.png`}
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "6px",
          textDecoration: "none"
        }}
      >
        Download QR Code
      </a>

      <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
        You can print it or send to your phone. Guests can scan it to leave you tips.
      </p>
    </div>
  );
}