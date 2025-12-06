import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./shared.css";
import "./Mfaverification.css";
import API_BASE_URL from "./config/api";

const MfaVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (!userId) {
      setError("Invalid MFA session");
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code || code.length < 4) {
      setError("Please enter a valid code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mfaCode: code }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        const user = jwtDecode(data.token);
        navigate(user.role === "admin" ? "/admin" : "/");
      } else {
        setError("Invalid MFA code");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify Code</h1>
        <p className="subtitle">Enter the MFA code sent to your email</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>MFA Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive a code?{" "}
          <span onClick={() => navigate("/login")} className="link">
            Back to login
          </span>
        </p>
      </div>
    </div>
  );
};

export default MfaVerification;
