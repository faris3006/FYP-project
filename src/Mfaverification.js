import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "./config/api";

const MfaVerification = () => {
  const navigate = useNavigate();
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  // Extract userId from URL query parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");

    if (!id) {
      alert("Missing user ID. Please login again.");
      navigate("/login");
    } else {
      setUserId(id);
    }
  }, [navigate]);

  // Handle form submission to verify MFA code
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: MFA code must be 6 digits
    if (mfaCode.length !== 6) {
      setError("Please enter a 6-digit MFA code.");
      return;
    }
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: mfaCode }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token } = data;
        localStorage.setItem("token", token);
        const user = jwtDecode(token);

        alert("MFA verified! Redirecting to your dashboard.");

        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Invalid MFA code, please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("MFA verification error:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Multi-Factor Authentication</h2>
      <p style={styles.instruction}>Please enter the 6-digit MFA code sent to your email.</p>
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <input
          type="text"
          maxLength="6"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter MFA code"
          style={styles.input}
          aria-label="6-digit MFA code"
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Verify
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "30px",
    backgroundColor: "#fff7cc",
    borderRadius: "15px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#4a3c1f",
    textAlign: "center",
  },
  heading: {
    marginBottom: "15px",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  instruction: {
    marginBottom: "25px",
    fontSize: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "1.1rem",
    borderRadius: "8px",
    border: "2px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    color: "#d9534f",
    fontSize: "0.9rem",
    marginTop: "0",
    marginBottom: "10px",
  },
  button: {
    padding: "12px",
    fontSize: "1.2rem",
    fontWeight: "700",
    backgroundColor: "#ff8c00",
    color: "#fff7cc",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
    transition: "background-color 0.3s ease",
  },
};

export default MfaVerification;
