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
    if (!password || !confirmPassword) {
      return "Please provide all required fields.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
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

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        token,
        newPassword: password,
        confirmPassword,
      };

      console.log("Sending reset-password request with:", {
        token: token ? "present" : "missing",
        newPassword: password ? "present" : "missing",
        confirmPassword: confirmPassword ? "present" : "missing",
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear any login block state so the user can log in after resetting password
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockEndTime');
        localStorage.removeItem('loginPermanentBlock');
        localStorage.removeItem('loginHadFirstBlock');

        setSuccess(
          data.message ||
            "Password updated. Log in with your new password and complete MFA verification."
        );
        setTimeout(() => navigate("/login"), 1800);
      } else if (response.status === 404) {
        setError(
          "Reset endpoint unavailable. Please verify the backend is running."
        );
      } else {
        setError(data.message || "Invalid or expired reset token.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Server error during password reset");
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
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="password-input"
              />
              <span className="toggle-password-placeholder" />
            </div>
          </div>

          <div className="password-rules">
            • At least 6 characters · Passwords must match
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
