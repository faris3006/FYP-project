import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login_redesign.css";
import API_BASE_URL from "./config/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Single session enforcement states
  const [sessionBlocked, setSessionBlocked] = useState(false);
  const [sessionBlockedEmail, setSessionBlockedEmail] = useState("");
  const [sessionBlockedPassword, setSessionBlockedPassword] = useState("");

  // Force logout from other device/browser
  const handleForceLogout = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/force-logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: sessionBlockedEmail, 
          password: sessionBlockedPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Force logout successful, now try to login again
        setSessionBlocked(false);
        await handleLoginAfterForceLogout();
      } else {
        setError(data.message || "Failed to force logout. Please try again.");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Login after successful force logout
  const handleLoginAfterForceLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: sessionBlockedEmail, 
          password: sessionBlockedPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.mfaRequired) {
          navigate(`/mfa-verification?userId=${data.userId}`);
        } else {
          localStorage.setItem("token", data.token);
          const user = jwtDecode(data.token);
          navigate(user.role === "admin" ? "/admin" : "/");
        }
      } else {
        setError(data.message || "Login failed after force logout.");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.mfaRequired) {
          navigate(`/mfa-verification?userId=${data.userId}`);
        } else {
          localStorage.setItem("token", data.token);
          const user = jwtDecode(data.token);
          navigate(user.role === "admin" ? "/admin" : "/");
        }
      } else {
        // Check if the error is due to active session on another device/browser
        if (data.message && (
          data.message.includes("already logged in") || 
          data.message.includes("active session") ||
          data.code === "SESSION_ACTIVE"
        )) {
          // Session is active on another device/browser
          setSessionBlocked(true);
          setSessionBlockedEmail(email);
          setSessionBlockedPassword(password);
          setError(data.message || "This account is already logged in on another device or browser. Please logout from the other device first, or click 'Force Logout' below.");
          return;
        }
        
        setError(data.message || "Login failed");
      }
        
        {sessionBlocked && (
          <div className="error-message" style={{ backgroundColor: '#2196F3', color: '#fff', marginBottom: '15px' }}>
            🔐 This account is currently logged in on another device or browser.
            <br />
            <small style={{ fontSize: '0.9em', marginTop: '5px', display: 'block' }}>
              Please logout from the other device/browser, or force logout below.
            </small>
          </div>
        )}
    } catch (error) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to your EventEase account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Password</label> || sessionBlocked}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
          {sessionBlocked && (
            <button 
              type="button"
              className="btn-submit"
              onClick={handleForceLogout}
              disabled={loading}
              style={{ 
                backgroundColor: '#ff9800',
                marginTop: '10px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Processing..." : "🔓 Force Logout Other Device"}
            </button>
          )}"password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="link">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
