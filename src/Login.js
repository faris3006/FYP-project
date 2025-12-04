import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import API_BASE_URL from "./config/api";

const insightBullets = [
  "Single login unlocks bookings, approvals, and vendor chat.",
  "Bank-grade MFA keeps sensitive budgets protected.",
  "Session timeline helps finance review every change in seconds.",
];

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email format.";
    }
    if (!form.password) {
      errs.password = "Password is required.";
    }
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const loginUrl = `${API_BASE_URL}/api/auth/login`;
        console.log("Attempting login to:", loginUrl);
        
        const response = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.mfaRequired) {
            alert("Login successful! Please verify the MFA code.");
            navigate(`/mfa-verification?userId=${data.userId}`);
          } else {
            localStorage.setItem("token", data.token);
            const user = jwtDecode(data.token);
            if (user.role === "admin") {
              navigate("/admin");
            } else {
              alert("Login successful! Redirecting to the main page.");
              navigate("/");
            }
          }
        } else {
          handleFallbackLogin(data.message);
        }
      } catch (error) {
        console.error("Login error:", error);
        console.error("API Base URL:", API_BASE_URL);
        console.error("Full error details:", error.message);
        handleFallbackLogin(`Network error: ${error.message}. Check console for details.`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFallbackLogin = message => {
    alert(message || "Login failed");
  };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <p className="panel-pill">Workspace access</p>
        <h1>Plan events, approve budgets, and notify vendors in one login.</h1>
        <p className="panel-subtitle">
          Secure authentication brings every stakeholder into the same live timeline
          without sending spreadsheets around.
        </p>
        <ul className="panel-list">
          {insightBullets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="panel-meta">
          <p>Having trouble? Email <span>support@eventease.com</span></p>
          <button className="text-link" onClick={() => navigate("/register")}>
            Create an account →
          </button>
        </div>
      </section>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <header>
          <h2>Welcome back</h2>
          <p>Enter your details to access the EventEase cockpit.</p>
        </header>

        <label htmlFor="email">Work Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? "input error" : "input"}
          placeholder="you@company.com"
          aria-describedby="emailError"
          aria-invalid={errors.email ? "true" : "false"}
          required
        />
        {errors.email && (
          <p id="emailError" className="input-error">
            {errors.email}
          </p>
        )}

        <label htmlFor="password">Password</label>
        <div className="password-field">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "input error" : "input"}
            placeholder="Enter your password"
            aria-describedby="passwordError"
            aria-invalid={errors.password ? "true" : "false"}
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p id="passwordError" className="input-error">
            {errors.password}
          </p>
        )}

        <div className="form-footer">
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/register")}
          >
            Forgot access?
          </button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
