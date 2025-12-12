import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./shared.css";
import "./Login.css";
import API_BASE_URL from "./config/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password attempt tracking states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isTemporarilyBlocked, setIsTemporarilyBlocked] = useState(false);
  const [isPermanentlyBlocked, setIsPermanentlyBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [hasHadFirstBlock, setHasHadFirstBlock] = useState(false);

  // Load block data from localStorage on component mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginAttempts');
    const savedBlockEndTime = localStorage.getItem('loginBlockEndTime');
    const savedPermanentBlock = localStorage.getItem('loginPermanentBlock');
    const savedHadFirstBlock = localStorage.getItem('loginHadFirstBlock');

    if (savedPermanentBlock === 'true') {
      setIsPermanentlyBlocked(true);
      setError('Your account is permanently blocked. Please reset your password.');
    } else if (savedBlockEndTime) {
      const endTime = parseInt(savedBlockEndTime);
      const now = Date.now();
      
      if (now < endTime) {
        setIsTemporarilyBlocked(true);
        setBlockEndTime(endTime);
        setRemainingTime(Math.ceil((endTime - now) / 1000));
      } else {
        // Block expired, clear it
        localStorage.removeItem('loginBlockEndTime');
        const attempts = parseInt(savedAttempts) || 0;
        setFailedAttempts(attempts);
      }
    }
    
    if (savedAttempts) {
      setFailedAttempts(parseInt(savedAttempts));
    }
    
    if (savedHadFirstBlock === 'true') {
      setHasHadFirstBlock(true);
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isTemporarilyBlocked || !blockEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.ceil((blockEndTime - now) / 1000);

      if (timeLeft <= 0) {
        // Block expired
        setIsTemporarilyBlocked(false);
        setBlockEndTime(null);
        setRemainingTime(0);
        localStorage.removeItem('loginBlockEndTime');
        setError('');
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTemporarilyBlocked, blockEndTime]);

  // Format remaining time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if permanently blocked
    if (isPermanentlyBlocked) {
      setError("Your account is permanently blocked. Please click 'Forgot password?' to reset your password.");
      return;
    }

    // Check if temporarily blocked
    if (isTemporarilyBlocked) {
      setError("You cannot enter the password. Please wait.");
      return;
    }

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
        // Successful login - clear all attempt tracking
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockEndTime');
        localStorage.removeItem('loginPermanentBlock');
        localStorage.removeItem('loginHadFirstBlock');
        setFailedAttempts(0);
        setHasHadFirstBlock(false);
        
        if (data.mfaRequired) {
          // Store email and userId for MFA verification page
          localStorage.setItem("mfaEmail", email);
          if (data.userId) {
            localStorage.setItem("mfaUserId", data.userId);
          }
          console.log("MFA required. Email stored:", email, "userId stored:", data.userId);
          navigate(`/mfa-verification?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(data.userId || "")}`);
        } else {
          localStorage.setItem("token", data.token);
          const user = jwtDecode(data.token);
          navigate(user.role === "admin" ? "/admin" : "/");
        }
      } else {
        // Failed login - increment attempts
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        // Check if this is the 3rd attempt (first block) or 6th attempt (permanent block)
        if (newAttempts === 3 && !hasHadFirstBlock) {
          // First block - temporary 5 minute block
          const blockEnd = Date.now() + (5 * 60 * 1000); // 5 minutes from now
          setIsTemporarilyBlocked(true);
          setBlockEndTime(blockEnd);
          setRemainingTime(300); // 5 minutes in seconds
          localStorage.setItem('loginBlockEndTime', blockEnd.toString());
          localStorage.setItem('loginHadFirstBlock', 'true');
          setHasHadFirstBlock(true);
          setError(`Too many failed attempts. You are blocked for 5 minutes.`);
        } else if (newAttempts === 6) {
          // Second round of 3 failures - permanent block
          setIsPermanentlyBlocked(true);
          localStorage.setItem('loginPermanentBlock', 'true');
          setError("Too many failed attempts. Your account is permanently blocked. Please reset your password using 'Forgot password?'");
        } else {
          const remainingAttempts = hasHadFirstBlock ? (6 - newAttempts) : (3 - newAttempts);
          setError(`${data.message || "Login failed"}. ${remainingAttempts} attempt(s) remaining.`);
        }
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
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to your EventEase account</p>

        {error && <div className="error-message">{error}</div>}
        
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
              disabled={isTemporarilyBlocked || isPermanentlyBlocked}
              style={
                isTemporarilyBlocked || isPermanentlyBlocked
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
            disabled={loading || isTemporarilyBlocked || isPermanentlyBlocked}
            style={
              isTemporarilyBlocked || isPermanentlyBlocked
                ? { backgroundColor: '#ccc', cursor: 'not-allowed' }
                : {}
            }
          >
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
