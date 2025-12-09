import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./PasswordReset.css";
import API_BASE_URL from "./config/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const FORGOT_PASSWORD_PATH =
    process.env.REACT_APP_FORGOT_PASSWORD_PATH || "/api/auth/forgot-password";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    const endpoint = `${API_BASE_URL}${FORGOT_PASSWORD_PATH}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        data = {};
      }

      if (response.ok) {
        setSuccess(
          data.message ||
            "If that email is registered, we've sent password reset instructions. After resetting, you'll log in and verify with your MFA code."
        );
      } else if (response.status === 404) {
        setError(
          "Password reset endpoint is unavailable. Please verify the backend route or contact support."
        );
      } else {
        setError(data.message || "We couldn't process that request right now");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card reset-card">
        <h1>Reset your password</h1>
        <p className="subtitle">
          Enter the email you used to sign up. We'll send you a reset link.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="reset-footer">
          <button className="btn-link" onClick={() => navigate("/login")}>Back to login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
