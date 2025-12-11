import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingHistory.css";
import { getBookingsByUser, getBookingById } from "./utils/bookingStorage";

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
        const list = Array.isArray(data) ? data : [];

        // If list items lack serviceDetails or totalAmount, fetch each booking for full details
        const enriched = await Promise.all(
          list.map(async (b) => {
            const id = b.id || b._id || b.bookingId;
            const hasDetails = b.serviceDetails || b.totalAmount || b.paymentStatus;
            if (!id || hasDetails) return b;
            try {
              const full = await getBookingById(id, token);
              return { ...b, ...full };
            } catch (err) {
              return b; // fallback to original if detail fetch fails
            }
          })
        );

        setBookings(
          enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
            const details = booking.serviceDetails || {};
            const bookingStatusRaw = booking.paymentStatus || booking.status || 'unknown';
            const bookingStatus = typeof bookingStatusRaw === 'string' ? bookingStatusRaw : 'unknown';
            const status = statusCopy[bookingStatus] ?? {
              label: bookingStatus,
              description: "",
              tone: "info",
            };
            const needsPayment = ["awaiting_payment", "rejected", "pending"].includes(bookingStatus);

            const bookingId = booking.id || booking._id || booking.bookingId;
            const eventTitle = booking.serviceName || details.eventType || booking.eventType || 'Event Booking';
            const numPeople = details.numPeople || booking.numPeople;
            const foodPackage = details.foodPackage || booking.foodPackage;
            const selectedSides = details.selectedSides || booking.selectedSides;
            const drink = details.drink || booking.drink;
            const dessert = details.dessert || booking.dessert;
            const notes = details.notes || details.specialRequests || booking.specialRequests;
            const totalAmount = booking.totalAmount || booking.amountDue || details.totalAmount;

            return (
              <article key={bookingId || eventTitle} className="history-card">
                <div className="card-head">
                  <div>
                    <h3>{eventTitle}</h3>
                    <p>
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Date N/A'}
                    </p>
                  </div>
                  <span className={`badge ${status.tone}`}>{status.label}</span>
                </div>
                <ul>
                  <li>
                    <span>Guests</span>
                    <strong>{numPeople || 'N/A'} people</strong>
                  </li>
                  <li>
                    <span>Main dish</span>
                    <strong>{foodPackage || 'N/A'}</strong>
                  </li>
                  <li>
                    <span>Sides</span>
                    <strong>{Array.isArray(selectedSides) && selectedSides.length > 0 ? selectedSides.join(", ") : "None"}</strong>
                  </li>
                  <li>
                    <span>Drink</span>
                    <strong>{drink || "None"}</strong>
                  </li>
                  <li>
                    <span>Dessert</span>
                    <strong>{dessert || "None"}</strong>
                  </li>
                  {notes && (
                    <li>
                      <span>Notes</span>
                      <strong>{notes}</strong>
                    </li>
                  )}
                  <li>
                    <span>Total Amount</span>
                    <strong>RM {totalAmount ?? 'N/A'}</strong>
                  </li>
                </ul>
                <p className="status-copy">{status.description}</p>
                <div className="card-actions">
                  {needsPayment && (
                    <button
                      className="primary"
                      onClick={() =>
                        navigate("/payment", {
                          state: { bookingId },
                        })
                      }
                    >
                      {bookingStatus === "pending_payment" ? "Resubmit payment" : "Pay now"}
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
