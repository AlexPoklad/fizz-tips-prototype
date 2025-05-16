// pages/dashboard/[userId].js

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function UserDashboard() {
  const router = useRouter();
  const { userId } = router.query;

  const [activeTab, setActiveTab] = useState("profile");
  const [tipUrl, setTipUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (!router.isReady || !userId) return;

    const url = `${window.location.origin}/${userId}`;
    setTipUrl(url);
    setPhotoUrl(`/images/${userId}.jpg`);
console.log("🔍 userId =", userId);
    fetch(`/api/get-user?userId=${userId}`)

      .then((res) => res.json())
      .then((data) => {
            console.log("✅ fetched user:", data);
        if (!data.error) setFormData(data);
      });
  }, [router.isReady]);

  const handleUpload = async () => {
    if (!selectedFile || !userId) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("username", userId);

    const res = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("Photo uploaded successfully!");
      setPhotoUrl(`/images/${userId}.jpg?${Date.now()}`);
    } else {
      alert("Upload failed");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const res = await fetch("/api/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profile: formData })
    });

    const result = await res.json();
    if (result.success) alert("Profile saved!");
    else alert("Failed to save");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
      <div style={{ width: 240, background: "#fff", padding: "2rem 1rem", borderRight: "1px solid #eee" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Avatar"
              style={{
                width: 135,
                height: 135,
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid #eee",
                marginBottom: 8
              }}
            />
          )}
          <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            {formData.firstName || userId} {formData.lastName}
          </div>
        </div>
        <nav>
          {[
            { id: "profile", label: "👤 My Profile" },
            { id: "qr", label: "📱 QR Code" },
            { id: "guide", label: "⚙️ How to set up payouts", disabled: true }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: 8,
                cursor: item.disabled ? "default" : "pointer",
                backgroundColor: activeTab === item.id ? "#f0f0f0" : "transparent",
                borderRadius: 6,
                color: item.disabled ? "#bbb" : "#333",
                fontWeight: activeTab === item.id ? "bold" : "normal"
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>

      <div style={{ flex: 1, padding: "2.5rem 3rem" }}>
        {activeTab === "profile" && (
          <div style={{ maxWidth: 600, background: "#fff", padding: "2rem", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.8rem" }}>Welcome, {formData.firstName || userId} 👋</h2>

            <label style={{ display: "block", marginBottom: 6 }}>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" style={inputStyle} />

            <label style={{ display: "block", marginTop: 16, marginBottom: 6 }}>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" style={inputStyle} />

            <label style={{ display: "block", marginTop: 16, marginBottom: 6 }}>Email</label>
            <input name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" style={inputStyle} />

            <label style={{ display: "block", marginTop: 16, marginBottom: 6 }}>Phone (optional)</label>
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+39 000 000 000" style={inputStyle} />

            <label style={{ display: "block", marginTop: 24, marginBottom: 6 }}>Profile Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={handleUpload}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: 6,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Upload Photo
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: 6,
                  background: "#444",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div style={{ maxWidth: 500, background: "#fff", padding: "2rem", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginBottom: "1rem" }}>Your QR Code</h2>
            <QRCodeCanvas value={tipUrl} size={200} style={{ marginBottom: "1rem" }} />
            <p>
              Page link: <br />
              <a href={tipUrl} target="_blank" rel="noopener noreferrer">{tipUrl}</a>
            </p>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(tipUrl)}&size=400x400`}
              download={`tip-qr-${userId}.png`}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "1rem"
              }}
            >
              Download QR Code
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
  backgroundColor: "#fafafa"
};