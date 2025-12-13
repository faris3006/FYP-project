import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./shared.css";
import "./Register.css";
import API_BASE_URL from "./config/api";
import ConfirmationDialog from "./components/ConfirmationDialog";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmForm, setConfirmForm] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone format validation (Malaysia +60)
    const phoneRegex = /^\+?60\d{9,10}$/;
    const cleanPhone = form.phone.replace(/\s|-|\(|\)/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid Malaysian phone number (+60)");
      return;
    }

    // Strong password validation
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(form.password);
    const hasLowerCase = /[a-z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    const hasSpecialChar = /[!@#$%^&*]/.test(form.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError("Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Show confirmation dialog
    setConfirmForm(form);
    setShowConfirm(true);
  };

  const handleConfirmRegister = async () => {
    if (!confirmForm) return;

    setLoading(true);
    try {
      const payload = {
        name: confirmForm.name,
        phone: confirmForm.phone,
        email: confirmForm.email,
        password: confirmForm.password,
        confirmPassword: confirmForm.confirmPassword,
      };

      console.log("Sending registration request to:", `${API_BASE_URL}/api/auth/register`);
      console.log("Payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Registration response status:", response.status);
      console.log("Registration response data:", data);

      if (response.ok) {
        setShowConfirm(false);
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
        setLoading(false);
        setShowConfirm(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Connection error. Please try again.");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join EventEase today</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+60 12-345 6789"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="link">
            Log in
          </span>
        </p>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirm}
          title="Confirm Registration"
          message={`You're about to create an account for ${confirmForm?.email}. Proceed?`}
          confirmText="Create Account"
          cancelText="Cancel"
          isLoading={loading}
          onConfirm={handleConfirmRegister}
          onCancel={() => {
            setShowConfirm(false);
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default Register;
