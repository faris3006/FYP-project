import React, { useState } from "react";
import "./Register.css";
import API_BASE_URL from "./config/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // optional loading state

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) errs.name = "Name is required.";

    if (!form.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\d{7,15}$/.test(form.phone)) {
      errs.phone = "Phone must be digits only (7-15 chars).";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email format.";
    }

    if (!form.password) {
      errs.password = "Password is required.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(form.password)
    ) {
      errs.password =
        "Password must be 6+ chars, include uppercase, lowercase, number, and special char.";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/auth/register`;
        console.log("Register -> using API URL:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful! Please check your email to verify your account. If you don't receive the email within 5 minutes, check your spam folder or contact support.");
          setForm({
            name: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setErrors({});
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        alert("Network error, please try again later.");
        console.error("Register error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} noValidate className="register-form">
        <h2>Sign up</h2>

        <label>Name</label>
        <input
          className={errors.name ? "input error" : "input"}
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
        />
        {errors.name && <p className="input-error">{errors.name}</p>}

        <label>Phone Number</label>
        <input
          className={errors.phone ? "input error" : "input"}
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Digits only, e.g. 0123456789"
        />
        {errors.phone && <p className="input-error">{errors.phone}</p>}

        <label>Email</label>
        <input
          className={errors.email ? "input error" : "input"}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@mail.com"
        />
        {errors.email && <p className="input-error">{errors.email}</p>}

        <label>Password</label>
        <input
          className={errors.password ? "input error" : "input"}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 chars, upper, lower, number, special"
        />
        {errors.password && <p className="input-error">{errors.password}</p>}

        <label>Confirm Password</label>
        <input
          className={errors.confirmPassword ? "input error" : "input"}
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat your password"
        />
        {errors.confirmPassword && (
          <p className="input-error">{errors.confirmPassword}</p>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
