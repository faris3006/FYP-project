import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./MainPage.css";

const featureHighlights = [
  {
    title: "Instant Bookings",
    description: "Reserve venues, catering, and staffing in one workflow.",
  },
  {
    title: "Smart Recommendations",
    description: "Get curated vendor suggestions based on event size.",
  },
  {
    title: "Live Collaboration",
    description: "Invite teammates to co-plan tasks and track progress.",
  },
];

const quickActions = [
  { label: "Plan New Event", action: "booking" },
  { label: "View Bookings", action: "booking-history" },
  { label: "Invite Team", action: "register" },
  { label: "Contact Support", action: "support" },
];

const statHighlights = [
  { value: "1.2K+", label: "Events Launched" },
  { value: "4.8/5", label: "Client Rating" },
  { value: "48h", label: "Average Turnaround" },
];

const testimonials = [
  {
    quote:
      "EventEase helped us launch a product roadshow in three cities without breaking a sweat.",
    author: "Marianne • Ops Lead",
  },
  {
    quote: "The booking dashboard is clean, fast, and keeps our CFO in the loop.",
    author: "Josh • Finance Director",
  },
];

const upcomingEvents = [
  {
    title: "Founders Meetup",
    date: "Dec 12",
    detail: "Hybrid format • 120 attendees • Downtown Hub",
  },
  {
    title: "Winter Gala",
    date: "Jan 08",
    detail: "Full-service catering • 300 guests • Lakeside Hall",
  },
  {
    title: "CXO Strategy Day",
    date: "Feb 02",
    detail: "Workshop pods • AV setup • Executive lounge",
  },
];

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
        console.error("Invalid token:", err);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/login");
  };

  const handleQuickAction = action => {
    if (action === "support") {
      window.open("mailto:hello@eventease.com?subject=Need%20a%20hand", "_blank");
      return;
    }
    navigate(`/${action}`);
  };

  const primaryCTA = () => (isLoggedIn ? "/booking" : "/register");

  return (
    <div className="landing-page">
      <nav className="top-nav">
        <div className="brand" onClick={() => navigate("/")}>
          EventEase
        </div>
        <div className="nav-actions">
          {!isLoggedIn && (
            <>
              <button className="ghost-btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="solid-btn" onClick={() => navigate("/register")}>
                Get Started
              </button>
            </>
          )}
          {isLoggedIn && (
            <>
              {userRole === "admin" && (
                <button className="ghost-btn" onClick={() => navigate("/admin")}>
                  Admin
                </button>
              )}
              <button
                className="ghost-btn"
                onClick={() => navigate("/booking-history")}
              >
                Booking History
              </button>
              <button className="solid-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <p className="hero-pill">Plan. Book. Impress.</p>
        <h1>Smarter event workflows, without the busywork.</h1>
        <p className="hero-subtitle">
          EventEase pulls venues, vendors, approvals, and updates into one live
          dashboard so your team can launch memorable experiences faster.
        </p>
        <div className="hero-ctas">
          <button className="solid-btn xl" onClick={() => navigate(primaryCTA())}>
            {isLoggedIn ? "Open Booking Workspace" : "Create Free Account"}
          </button>
          <button className="ghost-btn xl" onClick={() => navigate("/booking")}>
            Preview Booking Flow
          </button>
        </div>
        <div className="hero-stats">
          {statHighlights.map(stat => (
            <div key={stat.label} className="stat-card">
              <span>{stat.value}</span>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="feature-grid">
        {featureHighlights.map(feature => (
          <article key={feature.title} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="quick-panel">
        <div className="panel-header">
          <div>
            <p className="label">Daily toolkit</p>
            <h2>Jump back into work</h2>
          </div>
          <button className="text-btn" onClick={() => navigate("/booking-history")}>
            View timeline →
          </button>
        </div>
        <div className="action-grid">
          {quickActions.map(action => (
            <button
              key={action.label}
              className="action-card"
              onClick={() => handleQuickAction(action.action)}
            >
              <span className="action-icon">✦</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="events-section">
        <div className="panel-header">
          <div>
            <p className="label">In-flight</p>
            <h2>Upcoming milestones</h2>
          </div>
          <button className="text-btn" onClick={() => navigate("/booking")}>
            Add new event →
          </button>
        </div>
        <div className="events-list">
          {upcomingEvents.map(event => (
            <article key={event.title} className="event-card">
              <div className="event-date">{event.date}</div>
              <div>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
              </div>
              <button className="ghost-btn small" onClick={() => navigate("/booking")}>
                Edit
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials">
        {testimonials.map(item => (
          <blockquote key={item.author}>
            <p>“{item.quote}”</p>
            <cite>{item.author}</cite>
          </blockquote>
        ))}
      </section>

      <section className="cta-strip">
        <div>
          <p className="label">Need a partner?</p>
          <h2>Book a 20-minute walkthrough with our event strategists.</h2>
        </div>
        <button
          className="solid-btn xl"
          onClick={() =>
            window.open("https://calendly.com", "_blank", "noopener,noreferrer")
          }
        >
          Book a call
        </button>
      </section>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} EventEase • hello@eventease.com • (123) 456-7890</p>
        <div className="footer-links">
          <button onClick={() => navigate("/booking")}>Bookings</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Create account</button>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
