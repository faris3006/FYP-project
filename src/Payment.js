import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./shared.css";
import "./Payment.css";
import qrImage from "./assets/QR payment.jpeg";
import { uploadReceiptFile } from "./utils/receiptStore";
import { updateBookingStatus } from "./utils/bookingStorage";
import API_BASE_URL from "./config/api";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingFromState = location.state?.bookingId;
  const query = new URLSearchParams(location.search);
  const queryId = query.get("bookingId");
  const bookingId = bookingFromState || queryId;

  // State for booking data from backend
  const [booking, setBooking] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load booking data on mount
  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      setError("");
      
      if (!bookingId) {
        setError("No booking ID provided. Please create a new booking.");
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to make a payment. Please log in and try again.");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching booking with ID:", bookingId);
        
        // Fetch booking from backend
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Booking fetch response status:", response.status);
        
        if (!response.ok) {
          let errorMessage = "Booking not found or access denied.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error("Backend error:", errorData);
          } catch (parseErr) {
            console.error("Could not parse error response:", parseErr);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log("Booking data received:", data);

        // Validate booking response has required fields
        if (!data || typeof data !== "object") {
          throw new Error("Invalid booking data received from server.");
        }

        // Backend might return { booking: {...} } or just the booking object
        const bookingData = data.booking || data;
        console.log("Extracted booking data:", bookingData);

        setBooking(bookingData);
        setError("");
      } catch (e) {
        console.error("Failed to fetch booking:", e);
        setError(e.message || "Failed to load booking. Please try again.");
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  // Show loading or error state
  if (isLoading || !booking) {
    return (
      <div className="payment-page">
        <div className="booking-layout">
          <div className="field-card error-card">
            {isLoading ? (
              <>
                <p>Loading booking details...</p>
              </>
            ) : !booking ? (
              <>
                <p style={{ color: '#c33', marginBottom: '16px' }}>
                  <strong>⚠ {error || "No booking found"}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  {error?.includes("not found") 
                    ? "The booking you're trying to access doesn't exist. Please create a new booking to continue."
                    : "If you believe this is a mistake, please try refreshing the page or creating a new booking."}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="submit-booking" onClick={() => navigate("/booking")}>
                    Create New Booking
                  </button>
                  <button 
                    className="submit-booking" 
                    style={{ backgroundColor: '#667eea' }}
                    onClick={() => window.location.reload()}
                  >
                    Retry Loading
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering payment page with booking:", booking);

  // Use backend totalAmount directly - NO CALCULATIONS
  const totalAmount = booking?.totalAmount || "0.00";
  const serviceName = booking?.serviceName || "Service";
  const scheduledDate = booking?.scheduledDate || null;
  const notes = booking?.notes || "";
  const paymentStatus = booking?.paymentStatus || "Pending";
  const serviceDetails = booking?.serviceDetails || {};

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
      const uploadResponse = await uploadReceiptFile(
        booking.id || booking._id,
        selectedFile,
        token
      );

      console.log("Receipt uploaded:", uploadResponse);

      // Update booking payment status via backend endpoint
      const bookingId = booking.id || booking._id;
      const updateResponse = await updateBookingStatus(
        bookingId,
        "pending_approval",
        token
      );

      console.log("Payment status updated:", updateResponse);

      setSuccess("Receipt uploaded successfully! Your booking is awaiting admin approval.");
      setTimeout(() => {
        navigate("/booking-history");
      }, 2000);
    } catch (err) {
      setError("Failed to upload receipt. Please try again.");
      console.error("Receipt upload error:", err);
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
            <p className="qr-amount">
              Total Amount: <strong>RM {typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}</strong>
            </p>
          </div>

          {/* Booking Summary */}
          <div className="summary-card">
            <h3>Booking Details</h3>
            <ul>
              <li>
                <span>Service:</span>
                <strong>{serviceName}</strong>
              </li>
              <li>
                <span>Scheduled Date & Time:</span>
                <strong>{scheduledDate ? new Date(scheduledDate).toLocaleString() : '—'}</strong>
              </li>
              {serviceDetails?.eventType && (
                <li>
                  <span>Event Type:</span>
                  <strong>{serviceDetails.eventType}</strong>
                </li>
              )}
              {serviceDetails?.numPeople && (
                <li>
                  <span>Number of Guests:</span>
                  <strong>{serviceDetails.numPeople}</strong>
                </li>
              )}
              {serviceDetails?.foodPackage && (
                <li>
                  <span>Main Dish:</span>
                  <strong>{serviceDetails.foodPackage}</strong>
                </li>
              )}
              {serviceDetails?.selectedSides && serviceDetails.selectedSides.length > 0 && (
                <li>
                  <span>Selected Sides:</span>
                  <strong>{serviceDetails.selectedSides.join(', ')}</strong>
                </li>
              )}
              {serviceDetails?.drink && (
                <li>
                  <span>Drink:</span>
                  <strong>{serviceDetails.drink}</strong>
                </li>
              )}
              {serviceDetails?.dessert && (
                <li>
                  <span>Dessert:</span>
                  <strong>{serviceDetails.dessert}</strong>
                </li>
              )}
              {notes && (
                <li>
                  <span>Special Requests/Notes:</span>
                  <strong>{notes}</strong>
                </li>
              )}
              <li style={{ borderTop: '2px solid rgba(102, 126, 234, 0.3)', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total Amount:</span>
                <strong style={{ fontSize: '1.3rem', color: '#667eea' }}>
                  RM {typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount}
                </strong>
              </li>
              <li>
                <span>Payment Status:</span>
                <strong style={{ color: '#ffa500' }}>{paymentStatus}</strong>
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
