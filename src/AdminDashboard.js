import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readBookings, updateBookingStatus } from "./utils/bookingStorage";
import { getReceiptObjectURL } from "./utils/receiptStore";
import API_BASE_URL from "./config/api";

const transformLocalBookings = localBookings =>
  localBookings.map(booking => ({
    _id: booking.id,
    userId: {
      name: booking.userEmail || booking.userId || "Local User",
      email: booking.userEmail || "N/A",
    },
    // For history views we treat createdAt as the true "submitted at" moment.
    bookingDate: booking.createdAt
      ? booking.createdAt
      : booking.bookingDate
        ? new Date(booking.bookingDate).toISOString()
        : null,
    paymentStatus: booking.status === "completed",
    event: booking.event,
    status: booking.status,
    amountDue: booking.amountDue,
    payment: booking.payment,
  }));

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [localQueue, setLocalQueue] = useState([]);
  const [isLocalBookings, setIsLocalBookings] = useState(false);
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

    // Fetch bookings from API (with fallback to local storage)
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
        setIsLocalBookings(false);
        setError(""); // Clear error on success
      })
      .catch((err) => {
        // Fallback to local storage bookings when API fails
        const localBookings = readBookings();
        // Transform local bookings to match API format
        const transformedBookings = transformLocalBookings(localBookings);
        setBookings(transformedBookings);
        setIsLocalBookings(true);
        setError(""); // Clear error since we have local data
      })
      .finally(() => setLoadingBookings(false));

    const refreshLocal = () => {
      setLocalQueue(readBookings());
    };
    refreshLocal();
    window.addEventListener("storage", refreshLocal);
    return () => window.removeEventListener("storage", refreshLocal);
  }, [token, navigate]);



  const handleLocalStatus = (bookingId, status) => {
    const updated = updateBookingStatus(bookingId, status);
    if (updated) {
      const localBookings = readBookings();
      setLocalQueue(localBookings);
      if (isLocalBookings) {
        setBookings(transformLocalBookings(localBookings));
      } else {
        // Optimistic UI update for API-loaded bookings
        setBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId || booking.id === bookingId
              ? { ...booking, status, paymentStatus: status === "completed" }
              : booking
          )
        );
      }
      alert(`Booking marked as ${status}`);
    }
  };

  const normalizeStatus = status =>
    (status || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  // Combine API bookings with any locally stored bookings so that once an
  // admin updates the status (completed / pending) it always appears in
  // Booking History, even if the backend doesn't yet return that booking.
  const localForHistory = transformLocalBookings(localQueue);

  const existingHistoryIds = new Set(
    bookings.map(b => (b._id || b.id || "").toString())
  );

  const historyBookings = [
    ...bookings,
    ...localForHistory.filter(
      b => !existingHistoryIds.has((b._id || b.id || "").toString())
    ),
  ];

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

      <section>
        <h2>Receipt review queue (local)</h2>
        {localQueue.filter(b =>
          ["awaiting_payment", "pending_review", "pending_payment"].includes(b.status)
        ).length === 0 ? (
          <p>No local bookings yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {localQueue
              .filter(b =>
                ["awaiting_payment", "pending_review", "pending_payment"].includes(b.status)
              )
              .map(booking => (
              <div
                key={booking.id}
                style={{
                  border: "1px solid rgba(124,93,255,0.25)",
                  borderRadius: 18,
                  padding: 18,
                  background: "#0f152a",
                  boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px" }}>{booking.event}</h3>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.7)" }}>
                      {booking.bookingDate} • {booking.bookingTime}
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: 600, color: "#9ab0ff" }}>
                      Status: {booking.status.replace("_", " ")}
                    </p>
                  </div>
                  {booking.payment?.receiptStored && (
                    <button
                      style={{
                        alignSelf: "flex-start",
                        color: "#ff8c00",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        const url = await getReceiptObjectURL(booking.id);
                        if (!url) {
                          alert("Receipt unavailable.");
                          return;
                        }
                        const newWindow = window.open(url, "_blank");
                        if (!newWindow) {
                          alert("Allow pop-ups to preview receipt.");
                        }
                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                      }}
                    >
                      View receipt
                    </button>
                  )}
                </div>
                <p style={{ margin: "8px 0 4px" }}>
                  Amount: <strong>MYR {booking.payment?.amountPaid ?? booking.amountDue}</strong>
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    style={buttonStyle}
                    onClick={() => handleLocalStatus(booking.id, "completed")}
                  >
                    Mark Completed
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: "#d9534f" }}
                    onClick={() => handleLocalStatus(booking.id, "pending_payment")}
                  >
                    Mark Pending
                  </button>
                </div>
              </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
