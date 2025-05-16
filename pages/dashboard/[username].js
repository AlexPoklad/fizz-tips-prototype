import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function WaiterDashboard() {
  const router = useRouter();
  const { username } = router.query;
  const [tipUrl, setTipUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (username) {
      setTipUrl(`${window.location.origin}/${username}`);
    }
  }, [username]);

  const handleUpload = () => {
    alert("This is a demo. In production, photo would be uploaded to cloud storage and linked to your profile.");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Hello, {username} 👋</h2>
      <p>This is your personal tipping page:</p>

      <a href={tipUrl} target="_blank" rel="noopener noreferrer" style={{ color: "blue", display: "block", marginBottom: "1rem" }}>
        {tipUrl}
      </a>

      <QRCodeCanvas value={tipUrl} size={200} style={{ marginBottom: "1rem" }} />

      <a
        href={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(tipUrl)}&size=400x400`}
        download={`tip-qr-${username}.png`}
        style={{
          display: "inline-block",
          marginBottom: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "6px",
          textDecoration: "none"
        }}
      >
        Download QR Code
      </a>

      <hr style={{ marginBottom: "1.5rem" }} />

      <h3>Upload your photo</h3>
      <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <br />
      <button
        onClick={handleUpload}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          background: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer"
        }}
      >
        Upload (Simulated)
      </button>
    </div>
  );
}