"use client";

import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      // Replace with real API call
      await new Promise((res) => setTimeout(res, 800));
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Forgot password</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Enter your email and we'll send a reset link.</p>

      {status === "sent" ? (
        <div style={{ padding: 16, background: "#f0fff4", borderRadius: 6, marginTop: 16 }}>
          If an account with that email exists, a password reset link has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: "block", width: "100%", padding: 8, marginTop: 6, boxSizing: "border-box" }}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
          >
            {status === "sending" ? "Sending..." : "Send reset link"}
          </button>

          {status === "error" && (
            <div style={{ color: "#b00020", marginTop: 12 }}>Failed to send. Please try again.</div>
          )}
        </form>
      )}
    </div>
  );
}
