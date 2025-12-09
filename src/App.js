import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage";
import Login from "./Login";
import Register from "./Register";
import MfaVerification from "./Mfaverification";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import BookingHistory from "./BookingHistory";
import AdminDashboard from "./AdminDashboard";
import Booking from "./Booking";
import Payment from "./Payment";
import ErrorBoundary from "./ErrorBoundary";

// Simple auth check (can be improved with context)
const isAuthenticated = () => !!localStorage.getItem("token");

// Protect BookingHistory route
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mfa-verification" element={<MfaVerification />} /> {/* MFA route */}
          <Route path="/api/auth/verify-email" element={<VerifyEmail />} /> {/* Email verification route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route
            path="/booking-history"
            element={
              <PrivateRoute>
                <BookingHistory />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
