import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./shared.css";
import "./Payment.css";
import qrImage from "./assets/QR payment.jpeg";
import {
  getBookingById,
  upsertBooking,
} from "./utils/bookingStorage";
import { uploadReceiptFile } from "./utils/receiptStore";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingFromState = location.state?.bookingId;
  const query = new URLSearchParams(location.search);
  const queryId = query.get("bookingId");
  const bookingId = bookingFromState || queryId;

  const [booking, setBooking] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load booking data on mount
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getBookingById(bookingId, token);
        setBooking(data);
      } catch (e) {
        setError("Failed to load booking. Please try again.");
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="payment-page">
        <div className="booking-layout">
          <div className="field-card error-card">
            <p>No booking found. Please start a new booking.</p>
            <button className="submit-booking" onClick={() => navigate("/booking")}>
              Back to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic price based on selections
  const calculatePrice = () => {
    let total = 0;
    const numPeople = parseInt(booking?.numPeople) || 1;

    // Food package prices
    const foodPrices = {
      'Grilled Chicken with 1 Side': 25,
      'Grilled Chicken with 2 Sides': 30,
      'Grilled Chicken with 3 Sides': 35,
      'Grilled Chicken with Rice (1 Side)': 28,
      'Grilled Chicken with Rice (2 Sides)': 33,
    };

    // Drink prices
    const drinkPrices = {
      'Soft Drink': 3,
      'Juice': 5,
      'Mineral Water': 2,
    };

    // Dessert prices
    const dessertPrices = {
      'No Dessert': 0,
      'Matcha Bingsu': 15,
      'Biscoff Bingsu': 15,
    };

    // Calculate food cost
    const foodPrice = foodPrices[booking?.foodPackage] || 0;
    total += foodPrice * numPeople;

    // Calculate drink cost
    const drinkPrice = drinkPrices[booking?.drink] || 0;
    total += drinkPrice * numPeople;

    // Calculate dessert cost
    const dessertPrice = dessertPrices[booking?.dessert] || 0;
    total += dessertPrice * numPeople;

    return total.toFixed(2);
  };

  const totalPrice = calculatePrice();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.`);
      return;
    }

    setSelectedFile(file);
    setReceiptName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result ?? "");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please upload a receipt");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // Upload receipt file to backend
      await uploadReceiptFile(booking.id, selectedFile, token);

      // Update booking status to pending_approval and add payment info
      const updated = {
        ...booking,
        payment: {
          amountPaid: totalPrice,
          receiptName,
          receiptStored: true,
          uploadedAt: new Date().toISOString(),
        },
        status: "pending_approval",
        totalAmount: totalPrice,
        updatedAt: new Date().toISOString(),
      };
      await upsertBooking(updated, token);

      setSuccess("Receipt uploaded successfully! Your booking is awaiting admin approval.");
      setTimeout(() => {
        navigate("/booking-history");
      }, 2000);
    } catch (err) {
      setError("Failed to upload receipt. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-hero">
        <div className="hero-pill">Payment Required</div>
        <h1>Complete Your Payment</h1>
        <p>Scan the QR code or upload your payment receipt to finalize your booking.</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form-wrapper">
        <div className="booking-layout">
          {/* QR Payment Section */}
          <div className="field-card">
            <h3>Scan to Pay</h3>
            <div className="qr-container">
              <img src={qrImage} alt="QR Code for payment" className="qr-code" />
            </div>
            <p className="qr-amount">Total Amount: <strong>RM {totalPrice}</strong></p>
          </div>

          {/* Booking Summary */}
          <div className="summary-card">
            <h3>Booking Details</h3>
            <ul>
              <li>
                <span>Event Type:</span>
                <strong>{booking?.eventType || '—'}</strong>
              </li>
              <li>
                <span>Number of Guests:</span>
                <strong>{booking?.numPeople || '—'}</strong>
              </li>
              <li>
                <span>Main Dish:</span>
                <strong>{booking?.foodPackage || '—'}</strong>
              </li>
              {booking?.selectedSides && booking.selectedSides.length > 0 && (
                <li>
                  <span>Selected Sides:</span>
                  <strong>{booking.selectedSides.join(', ')}</strong>
                </li>
              )}
              <li>
                <span>Drink:</span>
                <strong>{booking?.drink || '—'}</strong>
              </li>
              <li>
                <span>Dessert:</span>
                <strong>{booking?.dessert || '—'}</strong>
              </li>
              {booking?.specialRequests && (
                <li>
                  <span>Special Requests:</span>
                  <strong>{booking.specialRequests}</strong>
                </li>
              )}
              <li style={{ borderTop: '2px solid rgba(102, 126, 234, 0.3)', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total Amount:</span>
                <strong style={{ fontSize: '1.3rem', color: '#667eea' }}>RM {totalPrice}</strong>
              </li>
              <li>
                <span>Status:</span>
                <strong style={{ color: '#ffa500' }}>Awaiting Payment</strong>
              </li>
            </ul>
          </div>

          {/* Receipt Upload Section */}
          <div className="field-card">
            <h3>Upload Payment Receipt</h3>
            
            {success && (
              <div className="alert alert-success">
                ✓ {success}
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                ✗ {error}
              </div>
            )}

            <label className="label">Select Receipt (Image or PDF)</label>
            <div className="file-input-custom">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                id="receipt"
                className="file-input-hidden"
              />
              <label htmlFor="receipt" className="file-input-label">
                <span className="file-icon">📎</span>
                <span className="file-text">
                  {receiptName ? `Selected: ${receiptName}` : 'Choose Receipt File'}
                </span>
              </label>
            </div>

            {filePreview && (
              <div className="preview-container">
                <h4>Preview</h4>
                {receiptName.toLowerCase().endsWith('.pdf') ? (
                  <p className="pdf-note">📄 PDF file selected</p>
                ) : (
                  <img src={filePreview} alt="Receipt preview" className="preview-image" />
                )}
              </div>
            )}

            <button type="submit" className="submit-booking" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload & Complete Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Payment;
