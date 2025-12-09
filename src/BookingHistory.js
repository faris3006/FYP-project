import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingHistory.css";
import { getBookingsByUser } from "./utils/bookingStorage";

const statusCopy = {
  awaiting_payment: {
    label: "Awaiting Payment",
    description: "Please complete the payment to continue.",
    tone: "warning",
  },
  pending_approval: {
    label: "Pending Approval",
    description: "Your payment receipt is being reviewed by admin.",
    tone: "info",
  },
  payment_received: {
    label: "Payment Received",
    description: "Payment confirmed. Booking is being processed.",
    tone: "info",
  },
  confirmed: {
    label: "Confirmed",
    description: "Booking confirmed. See you at the event!",
    tone: "success",
  },
  completed: {
    label: "Completed",
    description: "Event completed. Thank you!",
    tone: "success",
  },
  rejected: {
    label: "Payment Rejected",
    description: "Please resubmit a valid payment receipt.",
    tone: "danger",
  },
};

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getBookingsByUser(token);
        setBookings(
          Array.isArray(data)
            ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : []
        );
      } catch (e) {
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="history-page">
      <header>
        <p className="label">Booking history</p>
        <h1>Track every event in one place.</h1>
        <p className="subtitle">
          Need to update a pending booking? Tap the status action, resubmit payments, or reach out to support.
        </p>
      </header>

      {bookings.length === 0 ? (
        <section className="empty-state">
          <p>No bookings yet.</p>
          <button onClick={() => navigate("/booking")}>Create first booking</button>
        </section>
      ) : (
        <section className="history-grid">
          {bookings.map(booking => {
            const bookingStatus = typeof booking.status === 'string' ? booking.status : 'unknown';
            const status = statusCopy[bookingStatus] ?? {
              label: bookingStatus,
              description: "",
              tone: "info",
            };
            const needsPayment = ["awaiting_payment", "rejected"].includes(bookingStatus);
            
            return (
              <article key={booking.id} className="history-card">
                <div className="card-head">
                  <div>
                    <h3>{booking.eventType || 'Event Booking'}</h3>
                    <p>
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Date N/A'}
                    </p>
                  </div>
                  <span className={`badge ${status.tone}`}>{status.label}</span>
                </div>
                <ul>
                  <li>
                    <span>Guests</span>
                    <strong>{booking.numPeople || 'N/A'} people</strong>
                  </li>
                  <li>
                    <span>Main dish</span>
                    <strong>{booking.foodPackage || 'N/A'}</strong>
                  </li>
                  <li>
                    <span>Sides</span>
                    <strong>{Array.isArray(booking.selectedSides) && booking.selectedSides.length > 0 ? booking.selectedSides.join(", ") : "None"}</strong>
                  </li>
                  <li>
                    <span>Drink</span>
                    <strong>{booking.drink || "None"}</strong>
                  </li>
                  <li>
                    <span>Dessert</span>
                    <strong>{booking.dessert || "None"}</strong>
                  </li>
                  <li>
                    <span>Total Amount</span>
                    <strong>RM {booking.totalAmount || booking.amountDue || 'N/A'}</strong>
                  </li>
                </ul>
                <p className="status-copy">{status.description}</p>
                <div className="card-actions">
                  {needsPayment && (
                    <button
                      className="primary"
                      onClick={() =>
                        navigate("/payment", {
                          state: { bookingId: booking.id },
                        })
                      }
                    >
                      {booking.status === "pending_payment" ? "Resubmit payment" : "Pay now"}
                    </button>
                  )}
                  <button className="ghost" onClick={() => navigate("/booking")}>
                    Book another event
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default BookingHistory;
