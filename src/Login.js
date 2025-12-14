import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./shared.css";
import "./Login.css";
import API_BASE_URL from "./config/api";
import ConfirmationDialog from "./components/ConfirmationDialog";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Server-driven lockout handling
  const [isTemporarilyBlocked, setIsTemporarilyBlocked] = useState(false);
  const [isPermanentlyBlocked, setIsPermanentlyBlocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null); // ISO/epoch from server
  const [remainingTime, setRemainingTime] = useState(0);

  // Exponential backoff from backend (retryAfter in seconds)
  const [retryAfter, setRetryAfter] = useState(0);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // IP blocking from backend (429 status)
  const [isIpBlocked, setIsIpBlocked] = useState(false);
  const [ipBlockedUntil, setIpBlockedUntil] = useState(null);
  const [ipBlockCountdown, setIpBlockCountdown] = useState(0);

  // Active session enforcement
  const [sessionBlocked, setSessionBlocked] = useState(false);

  // Confirmation dialog states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  // Client-side progressive backoff after failures: 1s → 3s → 5s
  const backoffDelays = useRef([1000, 3000, 5000]);
  const backoffIndex = useRef(0);

  // Handle URL param from password reset success: clean any UI lock messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetSuccess = urlParams.get("resetSuccess");
    if (resetSuccess === "true") {
      window.history.replaceState({}, "", "/login");
      setIsTemporarilyBlocked(false);
      setIsPermanentlyBlocked(false);
      setLockUntil(null);
      setRemainingTime(0);
      setError("");
    }
  }, []);

  // Countdown timer effect for temp lock
  useEffect(() => {
    if (!isTemporarilyBlocked || !lockUntil) return;
    const endEpoch = typeof lockUntil === "number" ? lockUntil : Date.parse(lockUntil);
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((endEpoch - now) / 1000));
      setRemainingTime(timeLeft);
      if (timeLeft === 0) {
        setIsTemporarilyBlocked(false);
        setLockUntil(null);
        setError("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isTemporarilyBlocked, lockUntil]);

  // Countdown timer for retryAfter (exponential backoff)
  useEffect(() => {
    if (retryAfter <= 0) return;
    setRetryCountdown(retryAfter);
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          setRetryAfter(0);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfter]);

  // Countdown timer for IP block
  useEffect(() => {
    if (!isIpBlocked || !ipBlockedUntil) return;
    const endEpoch = typeof ipBlockedUntil === "number" ? ipBlockedUntil : Date.parse(ipBlockedUntil);
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((endEpoch - now) / 1000));
      setIpBlockCountdown(timeLeft);
      if (timeLeft === 0) {
        setIsIpBlocked(false);
        setIpBlockedUntil(null);
        setError("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isIpBlocked, ipBlockedUntil]);

  // Format remaining time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Respect server lock UI state
    if (isPermanentlyBlocked) return setError("Your account is permanently locked. Use Forgot Password to reset.");
    if (isTemporarilyBlocked) return setError("Too many attempts. Please wait for the countdown to finish.");
    if (retryCountdown > 0) return setError(`Please wait ${retryCountdown} second(s) before trying again.`);
    if (isIpBlocked) return setError("Your IP is blocked. Please wait for the countdown to finish.");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Show confirmation dialog instead of submitting directly
    setConfirmEmail(email);
    setShowConfirm(true);
  };

  const handleConfirmLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        if (data.mfaRequired) {
          // Store email and userId for MFA verification page
          localStorage.setItem("mfaEmail", email);
          if (data.userId) {
            localStorage.setItem("mfaUserId", data.userId);
          }
          console.log("MFA required. Email stored:", email, "userId stored:", data.userId);
          setShowConfirm(false);
          navigate(`/mfa-verification?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(data.userId || "")}`);
        } else {
          localStorage.setItem("token", data.token);
          const user = jwtDecode(data.token);
          setShowConfirm(false);
          navigate(user.role === "admin" ? "/admin" : "/");
        }
      } else if (response.status === 400) {
        // Invalid credentials; check for retryAfter (exponential backoff from backend)
        if (typeof data.retryAfter === "number" && data.retryAfter > 0) {
          setRetryAfter(data.retryAfter);
          setError(`Too many attempts. Please wait ${data.retryAfter} second(s) before trying again...`);
        } else {
          const attemptsMsg =
            typeof data.remainingAttempts === "number"
              ? ` ${data.remainingAttempts} attempt(s) remaining.`
              : "";
          setError((data.message || "Invalid credentials.") + attemptsMsg);
        }
        setShowConfirm(false);
      } else if (response.status === 429) {
        // IP blocked by backend
        if (data.isIpBlocked && data.blockedUntil) {
          setIsIpBlocked(true);
          setIpBlockedUntil(data.blockedUntil);
          setError(
            data.message ||
              "Your IP address has been temporarily blocked due to multiple failed attempts. Please wait."
          );
        } else {
          setError(data.message || "Too many requests. Please try again later.");
        }
        setShowConfirm(false);
      } else if (response.status === 403) {
        if (data.isTemporarilyLocked && data.lockUntil) {
          setIsTemporarilyBlocked(true);
          setLockUntil(data.lockUntil);
          setError(
            data.message ||
              (typeof data.remainingMinutes === "number"
                ? `Too many attempts. Try again in ${data.remainingMinutes} minute(s).`
                : "Too many attempts. Please wait.")
          );
        } else if (data.isPermanentlyLocked) {
          setIsPermanentlyBlocked(true);
          setError("Your account is permanently locked. Use Forgot Password to reset.");
        } else if (data.isActiveSessionBlocked) {
          setSessionBlocked(true);
          setError("Active session detected. Logout on the other device first.");
        } else if ((data.message || "").toLowerCase().includes("verify")) {
          setError(data.message);
        } else {
          setError(data.message || "Access denied.");
        }
        setShowConfirm(false);
      } else {
        setError(data.message || "Login failed");
        setShowConfirm(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
      setShowConfirm(false);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to your EventEase account</p>

        {error && <div className="error-message">{error}</div>}
        
        {retryCountdown > 0 && (
          <div className="error-message" style={{ backgroundColor: '#ff5722', color: '#fff' }}>
            ⏱ Please wait {retryCountdown} second(s) before trying again...
          </div>
        )}
        
        {isIpBlocked && (
          <div className="error-message" style={{ backgroundColor: '#d32f2f', color: '#fff' }}>
            🚫 Your IP address has been temporarily blocked due to multiple failed attempts.
            <br />
            <strong style={{ fontSize: '1.1em', marginTop: '8px', display: 'block' }}>
              Time remaining: {formatTime(ipBlockCountdown)}
            </strong>
            <small style={{ fontSize: '0.85em', marginTop: '5px', display: 'block' }}>
              Contact support if you believe this is a mistake.
            </small>
          </div>
        )}
        
        {isTemporarilyBlocked && (
          <div className="error-message" style={{ backgroundColor: '#ff9800', color: '#fff' }}>
            🔒 Account temporarily blocked. Time remaining: {formatTime(remainingTime)}
          </div>
        )}
        
        {isPermanentlyBlocked && (
          <div className="error-message" style={{ backgroundColor: '#f44336', color: '#fff' }}>
            🚫 Account permanently blocked. Please reset your password below.
          </div>
        )}
        
        {sessionBlocked && (
          <div className="error-message" style={{ backgroundColor: '#2196F3', color: '#fff', marginBottom: '15px' }}>
            🔐 This account is currently logged in on another device or browser.
            <br />
            <small style={{ fontSize: '0.9em', marginTop: '5px', display: 'block' }}>
              Please logout from the other device/browser, or force logout below.
            </small>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isPermanentlyBlocked}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isTemporarilyBlocked || isPermanentlyBlocked || retryCountdown > 0 || isIpBlocked}
              style={
                isTemporarilyBlocked || isPermanentlyBlocked || retryCountdown > 0 || isIpBlocked
                  ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' }
                  : {}
              }
            />
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="text-link"
              onClick={() => navigate("/forgot-password")}
              style={isPermanentlyBlocked ? { fontWeight: 'bold', color: '#f44336' } : {}}
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading || isTemporarilyBlocked || isPermanentlyBlocked || sessionBlocked || retryCountdown > 0 || isIpBlocked}
            style={
              isTemporarilyBlocked || isPermanentlyBlocked || sessionBlocked || retryCountdown > 0 || isIpBlocked
                ? { backgroundColor: '#ccc', cursor: 'not-allowed' }
                : {}
            }
          >
            {loading ? "Logging in..." : retryCountdown > 0 ? `Wait ${retryCountdown}s...` : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="link">
            Sign up
          </span>
        </p>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirm}
          title="Confirm Login"
          message={`You're about to log in with ${confirmEmail}. Proceed?`}
          confirmText="Login"
          cancelText="Cancel"
          isLoading={loading}
          onConfirm={handleConfirmLogin}
          onCancel={() => {
            setShowConfirm(false);
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default Login;
