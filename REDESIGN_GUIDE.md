# EventEase Redesign Guide - Simple, Modern, Dark Mode

This document contains all the redesigned code for your EventEase application.
All pages are now simple, modern, easy to use, and in dark mode.

## How to Apply These Changes

1. Open each file mentioned below
2. Replace the ENTIRE content with the new code provided
3. Save the file
4. Repeat for all files

---

## 1. SHARED CSS (Create new file: src/shared.css)

```css
/* Shared Styles - Simple, Modern, Dark Mode */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #1a1a1a;
  --border-color: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --accent-primary: #667eea;
  --accent-secondary: #764ba2;
  --error-color: #ff6b6b;
  --success-color: #51cf66;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

/* Auth Container (Login, Register, MFA) */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-primary);
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.auth-card h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 0.95rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Buttons */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: var(--error-color);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.success-message {
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
  color: var(--success-color);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.link {
  color: var(--accent-primary);
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 32px 24px;
  }
}
```

---

## 2. MAIN PAGE (src/MainPage.js)

Replace entire MainPage.js content with:

```javascript
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./shared.css";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const user = jwtDecode(token);
        setUserRole(user.role);
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="main-page">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>EventEase</div>
        <div className="nav-buttons">
          {!isLoggedIn ? (
            <>
              <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-primary" onClick={() => navigate("/register")}>Sign Up</button>
            </>
          ) : (
            <>
              {userRole === "admin" && (
                <button className="btn-ghost" onClick={() => navigate("/admin")}>Admin</button>
              )}
              <button className="btn-ghost" onClick={() => navigate("/booking-history")}>My Bookings</button>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <main className="hero-section">
        <h1>Plan Your Event<br/>In Minutes</h1>
        <p className="subtitle-hero">Simple booking. Easy payment. Fast confirmation.</p>
        <div className="cta-buttons">
          {!isLoggedIn ? (
            <>
              <button className="btn-large btn-primary" onClick={() => navigate("/register")}>
                Get Started
              </button>
              <button className="btn-large btn-ghost" onClick={() => navigate("/login")}>
                Login
              </button>
            </>
          ) : (
            <>
              <button className="btn-large btn-primary" onClick={() => navigate("/booking")}>
                Book Event
              </button>
              <button className="btn-large btn-ghost" onClick={() => navigate("/booking-history")}>
                View Bookings
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 EventEase • support@eventease.com</p>
      </footer>
    </div>
  );
};

export default MainPage;
```

---

## 3. MAIN PAGE CSS (src/MainPage.css)

Replace entire MainPage.css content with:

```css
.main-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.btn-ghost, .btn-primary, .btn-large {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: white;
}

.btn-ghost:hover {
  background: var(--bg-card);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
}

.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.hero-section h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-hero {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 48px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 16px;
    padding: 16px 24px;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .btn-large {
    width: 100%;
  }
}
```

---

**CONTINUE IN NEXT MESSAGE - This is getting too long. Should I:**
A) Create separate files for Login, Register, MFA, Booking, Payment redesigns?
B) Give you one complete ZIP/folder structure you can download?
C) Just push all changes to your repository directly?

Which do you prefer?
