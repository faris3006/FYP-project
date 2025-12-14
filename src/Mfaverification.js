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
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Try to get email and userId from URL params first, then localStorage as fallback
    const emailParam = searchParams.get("email");
    const userIdParam = searchParams.get("userId");
    const storedEmail = localStorage.getItem("mfaEmail");
    const storedUserId = localStorage.getItem("mfaUserId");
    
    console.log("MFA page loaded.");
    console.log("  - emailParam from URL:", emailParam);
    console.log("  - userIdParam from URL:", userIdParam);
    console.log("  - storedEmail from localStorage:", storedEmail);
    console.log("  - storedUserId from localStorage:", storedUserId);
    
    let resolvedEmail = null;
    let resolvedUserId = null;
    
    if (emailParam) {
      resolvedEmail = decodeURIComponent(emailParam);
      console.log("  - Using email from URL:", resolvedEmail);
      setEmail(resolvedEmail);
    } else if (storedEmail) {
      resolvedEmail = storedEmail;
      console.log("  - Using email from localStorage:", resolvedEmail);
      setEmail(resolvedEmail);
    } else {
      console.log("  - No email found. Setting error.");
      setError("Invalid MFA session. Please log in again.");
    }

    if (userIdParam) {
      resolvedUserId = decodeURIComponent(userIdParam);
      console.log("  - Using userId from URL:", resolvedUserId);
      setUserId(resolvedUserId);
    } else if (storedUserId) {
      resolvedUserId = storedUserId;
      console.log("  - Using userId from localStorage:", resolvedUserId);
      setUserId(resolvedUserId);
    } else {
      console.log("  - No userId found.");
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

    if (!userId) {
      setError("User ID missing. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, userId, mfaCode: code };
      
      console.log("Sending MFA verification request with payload:", payload);
      console.log("  - Email value:", email);
      console.log("  - UserId value:", userId);
      console.log("  - Code value:", code);

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("MFA verification response:", data);

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.removeItem("mfaEmail");
        localStorage.removeItem("mfaUserId");
        const user = jwtDecode(data.token);
        console.log("MFA verification successful. User role:", user.role);
        navigate(user.role === "admin" ? "/admin" : "/");
      } else if (response.status === 400) {
        // Invalid/expired code scenarios from backend
        const msg = (data.message || "Invalid code").toLowerCase();
        if (msg.includes("expire")) {
          setError("Code expired — login again.");
        } else {
          setError("Invalid code");
        }
      } else if (response.status === 403 && data.isActiveSessionBlocked) {
        setError("Active session detected. Logout on the other device first.");
      } else {
        setError(data.message || "Verification failed");
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
