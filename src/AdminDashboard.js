import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config/api";
import { authFetch, logoutEverywhere } from "./utils/auth";

// Helper to fetch full booking by id (mirrors frontend user detail fetch)
const getBookingById = async (id, token) => {
  const res = await authFetch(`${API_BASE_URL}/api/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch booking detail");
  return res.json();
};



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
    authFetch(`${API_BASE_URL}/api/admin/users`, {
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
    authFetch(`${API_BASE_URL}/api/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then(async (data) => {
        console.log("[AdminDashboard] Raw bookings response:", data);
        
        const list = Array.isArray(data) ? data : data.bookings || [];
        console.log("[AdminDashboard] Extracted booking list:", list);

        // Enrich each booking with full details (serviceDetails, receipt info) if missing
        const enriched = await Promise.all(
          list.map(async (b) => {
            const id = b._id || b.id || b.bookingId;
            console.log(`[AdminDashboard] Processing booking ${id}:`, b);
            
            const hasDetails = b.serviceDetails || b.totalAmount || b.paymentStatus;
            if (!id || hasDetails) {
              console.log(`[AdminDashboard] Booking ${id} has details, skipping fetch`);
              return b;
            }
            
            try {
              console.log(`[AdminDashboard] Fetching full details for ${id}`);
              const full = await getBookingById(id, token);
              console.log(`[AdminDashboard] Full details for ${id}:`, full);
              return { ...b, ...full };
            } catch (err) {
              console.error("[AdminDashboard] Failed to fetch detail", id, err);
              return b; // fallback
            }
          })
        );

        console.log("[AdminDashboard] Enriched bookings:", enriched);
        setBookings(enriched);
        setError(""); // Clear error on success
      })
      .catch(() => {
        setBookings([]);
        setError("Failed to fetch bookings from backend.");
      })
      .finally(() => setLoadingBookings(false));
  }, [token, navigate]);



  const handleApprovePayment = async (bookingId) => {
    if (!window.confirm("Approve this payment?")) return;
    try {
      const url = `${API_BASE_URL}/api/bookings/${bookingId}/status`;
      const payload = { paymentStatus: "completed" };
      
      console.log("[AdminDashboard] Approving payment - REQUEST:", { 
        url, 
        payload, 
        bookingId,
        token: token ? "Present" : "Missing"
      });
      
      const res = await authFetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await res.text();
      console.log("[AdminDashboard] Approve payment - RESPONSE:", { 
        status: res.status, 
        statusText: res.statusText, 
        body: responseText 
      });
      
      if (!res.ok) {
        try {
          const errorBody = JSON.parse(responseText);
          console.error("[AdminDashboard] Approve payment - ERROR DETAILS:", errorBody);
          throw new Error(errorBody.message || `Backend returned ${res.status}`);
        } catch (e) {
          throw new Error(`Backend returned ${res.status}: ${responseText}`);
        }
      }
      
      alert("Payment approved successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to approve payment: " + err.message);
      console.error("[AdminDashboard] Approve error:", err);
    }
  };

  const handleRejectPayment = async (bookingId) => {
    if (!window.confirm("Reject this payment? User will need to resubmit.")) return;
    try {
      const url = `${API_BASE_URL}/api/bookings/${bookingId}/status`;
      // Backend only accepts: pending, receipt_submitted, completed
      // For rejection, set back to pending so user can resubmit
      const payload = { paymentStatus: "pending" };
      
      console.log("[AdminDashboard] Rejecting payment - REQUEST:", { 
        url, 
        payload, 
        bookingId,
        token: token ? "Present" : "Missing"
      });
      
      const res = await authFetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await res.text();
      console.log("[AdminDashboard] Reject payment - RESPONSE:", { 
        status: res.status, 
        statusText: res.statusText, 
        body: responseText 
      });
      
      if (!res.ok) {
        try {
          const errorBody = JSON.parse(responseText);
          console.error("[AdminDashboard] Reject payment - ERROR DETAILS:", errorBody);
          throw new Error(errorBody.message || `Backend returned ${res.status}`);
        } catch (e) {
          throw new Error(`Backend returned ${res.status}: ${responseText}`);
        }
      }
      
      alert("Payment rejected. User will be able to resubmit.");
      window.location.reload();
    } catch (err) {
      alert("Failed to reject payment: " + err.message);
      console.error("[AdminDashboard] Reject error:", err);
    }
  };

  // Only use backend bookings
  const historyBookings = bookings;

  const logout = async () => {
    await logoutEverywhere();
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
                <th style={thTdStyle}>Event Details</th>
                <th style={thTdStyle}>Receipt</th>
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
                  const paymentStatus = booking.paymentStatus || booking.status;
                  const details = booking.serviceDetails || booking.service || {};
                  
                  // Map all fields with exhaustive fallbacks
                  const totalAmount = booking.totalAmount ?? booking.amountDue ?? details.totalAmount ?? (booking.serviceDetails ? booking.serviceDetails.totalAmount : null);
                  const numPeople = details.numPeople ?? booking.numPeople ?? (booking.serviceDetails ? booking.serviceDetails.numPeople : null);
                  const foodPackage = details.foodPackage || booking.foodPackage || (booking.serviceDetails ? booking.serviceDetails.foodPackage : null);
                  const selectedSides = details.selectedSides || booking.selectedSides || (booking.serviceDetails ? booking.serviceDetails.selectedSides : null);
                  const drink = details.drink || booking.drink || (booking.serviceDetails ? booking.serviceDetails.drink : null);
                  const dessert = details.dessert || booking.dessert || (booking.serviceDetails ? booking.serviceDetails.dessert : null);
                  const eventType = details.eventType || booking.eventType || booking.serviceName || details.serviceName;
                  const notes = details.notes || booking.notes || details.specialRequests || booking.specialRequests;
                  
                  const receiptName = booking.receiptFileName || details.receiptFileName || booking.receiptName;
                  const receiptUrl = booking.receiptUrl || details.receiptUrl || (receiptName ? `${API_BASE_URL}/uploads/receipts/${receiptName}` : null);
                  
                  const userName = userId?.name || booking.userEmail || booking.userId || "Unknown";
                  const displayDate = bookingDate
                    ? new Date(bookingDate).toLocaleString()
                    : booking.bookingDate || "N/A";
                  
                  console.log(`[AdminDashboard] Rendering booking ${_id}:`, {
                    eventType, numPeople, foodPackage, selectedSides, drink, dessert, notes, totalAmount, receiptUrl
                  });

                  return (
                    <tr key={_id}>
                      <td style={thTdStyle}>{userName}</td>
                      <td style={thTdStyle}>{displayDate}</td>
                      <td style={thTdStyle}>{paymentStatus || "N/A"}</td>
                      <td style={thTdStyle}>
                        <div style={{ lineHeight: 1.4, fontSize: '0.9rem' }}>
                          <div><strong>Event:</strong> {eventType || "N/A"}</div>
                          <div><strong>Guests:</strong> {numPeople ?? "N/A"}</div>
                          <div><strong>Food:</strong> {foodPackage || "N/A"}</div>
                          <div><strong>Sides:</strong> {Array.isArray(selectedSides) && selectedSides.length ? selectedSides.join(', ') : "None"}</div>
                          <div><strong>Drink:</strong> {drink || "None"}</div>
                          <div><strong>Dessert:</strong> {dessert || "None"}</div>
                          {notes && <div><strong>Notes:</strong> {notes}</div>}
                          <div><strong>Total:</strong> RM {totalAmount != null ? totalAmount : "N/A"}</div>
                        </div>
                      </td>
                      <td style={thTdStyle}>
                        {receiptUrl ? (
                          <a href={receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6d4dfb', textDecoration: 'underline' }}>
                            View Receipt
                          </a>
                        ) : receiptName ? (
                          receiptName
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={thTdStyle}>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                          {paymentStatus === "receipt_submitted" && (
                            <>
                              <button 
                                onClick={() => handleApprovePayment(_id)}
                                style={{ ...buttonStyle, padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#28a745' }}
                              >
                                Approve Payment
                              </button>
                              <button 
                                onClick={() => handleRejectPayment(_id)}
                                style={{ ...buttonStyle, padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#dc3545' }}
                              >
                                Reject Payment
                              </button>
                            </>
                          )}
                          {paymentStatus === "completed" && <span style={{ color: '#28a745' }}>✓ Approved</span>}
                          {paymentStatus === "rejected" && <span style={{ color: '#dc3545' }}>✗ Rejected</span>}
                          {paymentStatus === "pending" && <span style={{ color: '#ffa500' }}>⏳ Pending</span>}
                        </div>
                      </td>
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
