import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "./config/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract token from URL query parameters
      const token = searchParams.get("token");

      console.log("Email verification page loaded");
      console.log("  - Token from URL:", token ? `${token.substring(0, 20)}...` : "missing");
      console.log("  - API_BASE_URL:", API_BASE_URL);

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const verifyUrl = `${API_BASE_URL}/api/auth/verify-email?token=${token}`;
        console.log("Sending verification request to:", verifyUrl);

        // Call backend API to verify email
        const response = await fetch(verifyUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        console.log("Verification response status:", response.status);

        const data = await response.json();

        console.log("Verification response data:", data);

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully! Redirecting to login...");
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed. The link may have expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error. Please try again later.");
        console.error("Email verification error:", err);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Email Verification</h2>
      {status === "verifying" && (
        <>
          <p style={styles.message}>{message}</p>
          <div style={styles.spinner}></div>
        </>
      )}
      {status === "success" && (
        <>
          <p style={{ ...styles.message, color: "#28a745" }}>{message}</p>
          <button 
            onClick={() => navigate("/login")} 
            style={styles.button}
          >
            Go to Login
          </button>
        </>
      )}
      {status === "error" && (
        <>
          <p style={{ ...styles.message, color: "#d9534f" }}>{message}</p>
          <button 
            onClick={() => navigate("/login")} 
            style={styles.button}
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "80px auto",
    padding: "40px",
    backgroundColor: "#fff7cc",
    borderRadius: "15px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#4a3c1f",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  message: {
    marginBottom: "25px",
    fontSize: "1.1rem",
    lineHeight: "1.6",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #ff8c00",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "20px auto",
  },
  button: {
    padding: "12px 30px",
    fontSize: "1.1rem",
    fontWeight: "700",
    backgroundColor: "#ff8c00",
    color: "#fff7cc",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
    transition: "background-color 0.3s ease",
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default VerifyEmail;










