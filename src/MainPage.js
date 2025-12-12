import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "./config/api";
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

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        // Call backend logout API to end session
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    // Clear local storage and redirect
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
