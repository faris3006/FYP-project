import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import qrImage from "./assets/QR payment.jpeg";
import {
  getBookingById,
  getBookingsByUser,
  upsertBooking,
} from "./utils/bookingStorage";
import {
  saveReceiptBlob,
  getReceiptObjectURL,
} from "./utils/receiptStore";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingFromState = location.state?.bookingId;
  const query = new URLSearchParams(location.search);
  const queryId = query.get("bookingId");
  const storedId = localStorage.getItem("ee_active_booking_id");
  const bookingId = bookingFromState || queryId || storedId;

  const [booking, setBooking] = useState(() =>
    bookingId ? getBookingById(bookingId) : null
  );
  const [amount, setAmount] = useState(booking?.amountDue ?? "");
  const [notes, setNotes] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [receiptName, setReceiptName] = useState(
    booking?.payment?.receiptName ?? ""
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (bookingId) {
        const latest = getBookingById(bookingId);
        if (latest) {
          setBooking(latest);
          if (!amount) setAmount(latest.amountDue ?? "");
          if (latest.payment?.receiptStored) {
            const url = await getReceiptObjectURL(latest.id);
            if (url) setFilePreview(url);
            setReceiptName(latest.payment?.receiptName ?? "");
          }
        }
      }
    };
    loadBooking();
  }, [bookingId, amount]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const allBookings = useMemo(() => getBookingsByUser(), []);

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Receipt must be 20MB or less.");
      e.target.value = "";
      return;
    }
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    const preview = URL.createObjectURL(file);
    setFilePreview(preview);
    setReceiptName(file.name);
    setSelectedFile(file);
    setError("");
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!booking) {
      setError("No booking selected. Please create a booking first.");
      return;
    }
    if (!amount) {
      setError("Please enter the amount you transferred.");
      return;
    }
    if (!filePreview && !booking?.payment?.receiptStored && !selectedFile) {
      setError("Attach your transfer receipt (max 20MB).");
      return;
    }

    setIsSubmitting(true);
    const persistReceipt = selectedFile
      ? saveReceiptBlob(booking.id, selectedFile)
      : Promise.resolve();

    persistReceipt
      .then(() => {
        const updated = {
          ...booking,
          status: "pending_review",
          payment: {
            amountPaid: Number(amount),
            receiptStored: true,
            receiptName,
            notes,
            submittedAt: new Date().toISOString(),
          },
        };

        upsertBooking(updated);
        localStorage.setItem("ee_active_booking_id", updated.id);
        setSuccess("Receipt submitted! Our admin team will confirm shortly.");
        setError("");
        setTimeout(() => {
          navigate("/");
        }, 1800);
      })
      .catch(err => {
        console.error("Receipt storage error:", err);
        setError("Failed to store receipt locally. Please try again.");
      })
      .finally(() => setIsSubmitting(false));
  };

  if (!booking && allBookings.length === 0) {
    return (
      <div className="payment-page">
        <section className="payment-panel">
          <h1>No booking detected</h1>
          <p>Create a booking first so we know what to reconcile.</p>
          <button className="action-btn" onClick={() => navigate("/booking")}>
            Go to booking form
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <section className="payment-panel">
        <p className="label">Scan & transfer</p>
        <h1>Complete your payment</h1>
        <p className="subtitle">
          Scan the QR code below using your banking app. Once the transfer is
          complete, upload the receipt so we can verify it.
        </p>

        <div className="qr-block">
          <img src={qrImage} alt="QR payment code" />
          <div>
            <p>Reference: EventEase HQ</p>
            <p>Note: Include your full name for easier tracking.</p>
          </div>
        </div>

        {booking ? (
          <div className="booking-summary">
            <h3>Booking summary</h3>
            <ul>
              <li>
                <span>Event</span>
                <strong>{typeof booking.event === 'object' ? JSON.stringify(booking.event) : (booking.event || 'N/A')}</strong>
              </li>
              <li>
                <span>Date</span>
                <strong>{typeof booking.bookingDate === 'object' ? JSON.stringify(booking.bookingDate) : (booking.bookingDate || 'N/A')}</strong>
              </li>
              <li>
                <span>Time</span>
                <strong>{typeof booking.bookingTime === 'object' ? JSON.stringify(booking.bookingTime) : (booking.bookingTime || 'N/A')}</strong>
              </li>
              <li>
                <span>Guests per table</span>
                <strong>
                  {typeof booking.guestsPerTable === 'object' ? JSON.stringify(booking.guestsPerTable) : booking.guestsPerTable} 
                  {booking.seatingLabel && `• ${typeof booking.seatingLabel === 'object' ? JSON.stringify(booking.seatingLabel) : booking.seatingLabel}`}
                </strong>
              </li>
              <li>
                <span>Status</span>
                <strong>{typeof booking.status === 'string' ? booking.status.replace("_", " ") : (typeof booking.status === 'object' ? JSON.stringify(booking.status) : booking.status)}</strong>
              </li>
            </ul>
          </div>
        ) : (
          <div className="booking-summary">
            <p>Select a booking from your history to continue.</p>
            <button className="text-link" onClick={() => navigate("/booking-history")}>
              Open booking history →
            </button>
          </div>
        )}
      </section>

      <form className="payment-form" onSubmit={handleSubmit}>
        <header>
          <h2>Upload receipt</h2>
          <p>Provide the payment details so the admin can confirm quickly.</p>
        </header>

        {error && <div className="form-alert error">{error}</div>}
        {success && <div className="form-alert success">{success}</div>}

        <label htmlFor="amount">Amount transferred (MYR)</label>
        <input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="input"
          placeholder="Enter the exact amount sent"
        />

        <label htmlFor="receipt">Receipt (max 20MB)</label>
        <input
          id="receipt"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        {receiptName && <p className="file-label">Attached: {receiptName}</p>}
        {filePreview && (
          <div className="receipt-preview">
            <img src={filePreview} alt="Receipt preview" />
          </div>
        )}

        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows="3"
          className="input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Share any reference number or extra context"
        />

        <button type="submit" className="action-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit receipt & return home"}
        </button>
      </form>
    </div>
  );
};

export default Payment;
