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
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Try to get email from URL params first, then localStorage as fallback
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("mfaEmail");
    
    console.log("MFA page loaded. emailParam:", emailParam, "storedEmail:", storedEmail);
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Invalid MFA session. Please log in again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code || code.length < 4) {
      setError("Please enter a valid code");
      return;
    }

    if (!email) {
      setError("Email missing. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, mfaCode: code };
      
      console.log("Sending MFA verification with:", {
        email: email ? "present" : "missing",
        mfaCode: code ? "present" : "missing",
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.removeItem("mfaEmail");
        const user = jwtDecode(data.token);
        console.log("MFA verification successful. User role:", user.role);
        navigate(user.role === "admin" ? "/admin" : "/");
      } else {
        setError(data.message || "Invalid MFA code");
      }
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify Code</h1>
        <p className="subtitle">Enter MFA code sent to your email</p>

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
