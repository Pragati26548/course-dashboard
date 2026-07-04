import { useState } from "react";

export default function Login({ onLogin, onShowSignup }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Please fill in all fields!");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        onLogin();
      } else {
        setError("Invalid username or password!");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 36, width: "100%", maxWidth: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.10)" }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Course Dashboard</h2>
        <p style={{ margin: "0 0 24px 0", fontSize: 14, color: "#64748b" }}>Admin Login</p>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Username</label>
          <input
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 4 }}
            placeholder="Enter username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
        </div>

      <div style={{ marginBottom: 22 }}>
  <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Password</label>
  <div style={{ position: "relative", marginTop: 4 }}>
    <input
      style={{ width: "100%", padding: "10px 12px", paddingRight: "40px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#1e293b" }}
      type={showPassword ? "text" : "password"}
      placeholder="Enter password"
      value={form.password}
      onChange={e => setForm({ ...form, password: e.target.value })}
    />
    <span onClick={() => setShowPassword(!showPassword)}
      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>
      {"👁️"}
    </span>
  </div>
  </div>

        <button onClick={handleLogin}
          style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#0a66ff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff" }}>
          Login
        </button>
        <button onClick={onShowSignup}
        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#64748b", marginTop: 8 }}>
        Create New Account
        </button>
      </div>
    </div>
  );
}