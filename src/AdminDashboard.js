import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateBookingStatus } from "./utils/bookingStorage";
import API_BASE_URL from "./config/api";



const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch users from API (with fallback to empty array)
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
        setError(""); // Clear error on success
      })
      .catch((err) => {
        // If API fails, just show empty users (no error for users)
        setUsers([]);
        // Only set error for bookings API failure
      })
      .finally(() => setLoadingUsers(false));

    // Fetch bookings from API only
    fetch(`${API_BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data.bookings && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
        setError(""); // Clear error on success
      })
      .catch(() => {
        setBookings([]);
        setError("Failed to fetch bookings from backend.");
      })
      .finally(() => setLoadingBookings(false));
  }, [token, navigate]);





  const normalizeStatus = status =>
    (status || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  // Only use backend bookings
  const historyBookings = bookings;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 40,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    backgroundColor: "#0f1529",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(124,93,255,0.15)",
  };

  const thTdStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "12px 15px",
    textAlign: "left",
    color: "#f5f8ff",
  };

  const headerStyle = {
    padding: "20px 30px",
    fontFamily: "'Inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#f5f8ff",
  };

  const buttonStyle = {
    backgroundColor: "#6d4dfb",
    color: "#fdfdff",
    fontWeight: "700",
    border: "none",
    borderRadius: "999px",
    padding: "8px 22px",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(109,77,251,0.35)",
    transition: "transform 0.2s ease",
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "'Inter','Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #030612, #010207 70%)",
        color: "#f5f8ff",
      }}
    >
      <header style={headerStyle}>
        <h1>Admin Dashboard</h1>
        <button onClick={logout} style={{ ...buttonStyle, marginBottom: 20 }}>
          Logout
        </button>
      </header>

      {error && (
        <p style={{ color: "red", marginBottom: 20, fontWeight: "600" }}>
          Error: {error}
        </p>
      )}

      <section>
        <h2>Registered Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <table style={tableStyle}>
            <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th style={thTdStyle}>Name</th>
                <th style={thTdStyle}>Email</th>
                <th style={thTdStyle}>Phone</th>
                <th style={thTdStyle}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(({ _id, name, email, phone, role }) => (
                  <tr key={_id}>
                    <td style={thTdStyle}>{name}</td>
                    <td style={thTdStyle}>{email}</td>
                    <td style={thTdStyle}>{phone}</td>
                    <td style={thTdStyle}>{role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Booking History</h2>
        {loadingBookings ? (
          <p>Loading bookings...</p>
        ) : (
          <table style={tableStyle}>
            <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th style={thTdStyle}>User</th>
                <th style={thTdStyle}>Booking Date</th>
                <th style={thTdStyle}>Payment Status</th>
                <th style={thTdStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyBookings.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                historyBookings.map((booking) => {
                  const _id = booking._id || booking.id;
                  const userId = booking.userId;
                  const bookingDate = booking.bookingDate;
                  const normalizedStatus = normalizeStatus(booking.status);
                  const isCompleted = normalizedStatus === "completed";
                  const paymentStatus =
                    booking.paymentStatus !== undefined
                      ? booking.paymentStatus
                      : isCompleted;
                  const userName = userId?.name || booking.userEmail || booking.userId || "Unknown";
                  const displayDate = bookingDate
                    ? new Date(bookingDate).toLocaleString()
                    : booking.bookingDate || "N/A";
                  const actionLabel =
                    isCompleted
                      ? "COMPLETED"
                      : normalizedStatus.startsWith("pending")
                        ? "PENDING"
                        : booking.status?.replace("_", " ").toUpperCase() || "PENDING";

                  return (
                    <tr key={_id}>
                      <td style={thTdStyle}>{userName}</td>
                      <td style={thTdStyle}>{displayDate}</td>
                      <td style={thTdStyle}>
                        {paymentStatus ? "Paid" : "Unpaid"}
                      </td>
                      <td style={thTdStyle}>{actionLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Removed local receipt review queue. All data comes from backend. */}
    </div>
  );
};

export default AdminDashboard;
