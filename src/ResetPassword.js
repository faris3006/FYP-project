import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./shared.css";
import "./PasswordReset.css";
import API_BASE_URL from "./config/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return "Include uppercase, lowercase, number, and special character (!@#$%^&*)";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          data.message ||
            "Password updated. Log in with your new password and complete MFA verification."
        );
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setError(data.message || "Reset link may be invalid or expired.");
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
        <h1>Create a new password</h1>
        <p className="subtitle">
          Choose a strong password. You'll be asked to verify via MFA after logging in.
        </p>

        {!token && <div className="error-message">Reset link is missing.</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group password-field">
            <label>New password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="btn-link"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="password-rules">
            • At least 8 characters · Upper + lower · Number · Special (!@#$%^&*)
          </div>

          <button type="submit" className="btn-submit" disabled={loading || !token}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <div className="reset-footer inline-actions">
          <button className="btn-link" onClick={() => navigate("/login")}>Back to login</button>
          <button className="btn-link" onClick={() => navigate("/forgot-password")}>Request new link</button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
