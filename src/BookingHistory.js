import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingHistory.css";
import { getBookingsByUser } from "./utils/bookingStorage";

const statusCopy = {
  awaiting_payment: {
    label: "Awaiting payment",
    description: "Please complete the payment to continue.",
    tone: "warning",
  },
  pending_review: {
    label: "In review",
    description: "Our admin is confirming your receipt.",
    tone: "info",
  },
  pending_payment: {
    label: "Pending",
    description: "Admin needs another payment proof.",
    tone: "danger",
  },
  completed: {
    label: "Completed",
    description: "Booking confirmed. See you at the event!",
    tone: "success",
  },
};

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const userBookings = getBookingsByUser();
    setBookings(userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
            const needsPayment = ["awaiting_payment", "pending_payment"].includes(bookingStatus);
            return (
              <article key={booking.id} className="history-card">
                <div className="card-head">
                  <div>
                    <h3>{typeof booking.event === 'object' ? JSON.stringify(booking.event) : (booking.event || 'N/A')}</h3>
                    <p>
                      {typeof booking.bookingDate === 'object' ? JSON.stringify(booking.bookingDate) : (booking.bookingDate || 'N/A')} • {typeof booking.bookingTime === 'object' ? JSON.stringify(booking.bookingTime) : (booking.bookingTime || 'N/A')}
                    </p>
                  </div>
                  <span className={`badge ${status.tone}`}>{status.label}</span>
                </div>
                <ul>
                  <li>
                    <span>Guests / table</span>
                    <strong>
                      {typeof booking.guestsPerTable === 'object' ? JSON.stringify(booking.guestsPerTable) : (booking.guestsPerTable || 'N/A')} {booking.seatingLabel && `• ${typeof booking.seatingLabel === 'object' ? JSON.stringify(booking.seatingLabel) : booking.seatingLabel}`}
                    </strong>
                  </li>
                  <li>
                    <span>Main dish</span>
                    <strong>{typeof booking.mainDish === 'object' ? JSON.stringify(booking.mainDish) : (booking.mainDish || 'N/A')}</strong>
                  </li>
                  <li>
                    <span>Sides</span>
                    <strong>{Array.isArray(booking.sideDishes) ? (booking.sideDishes.join(", ") || "None") : (typeof booking.sideDishes === 'object' ? JSON.stringify(booking.sideDishes) : (booking.sideDishes || 'None'))}</strong>
                  </li>
                  <li>
                    <span>Dessert</span>
                    <strong>{typeof booking.dessert === 'object' ? JSON.stringify(booking.dessert) : (booking.dessert || "None")}</strong>
                  </li>
                  <li>
                    <span>Amount</span>
                    <strong>MYR {typeof booking.amountDue === 'object' ? JSON.stringify(booking.amountDue) : (booking.amountDue || 'N/A')}</strong>
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
