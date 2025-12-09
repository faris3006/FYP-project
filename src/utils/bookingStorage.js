
import API_BASE_URL from "../config/api";

// Fetch all bookings for the current user
export const getBookingsByUser = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

// Fetch a single booking by ID
export const getBookingById = async (bookingId, token) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
};

// Create or update a booking
export const upsertBooking = async (booking, token) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error("Failed to save booking");
  return res.json();
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, token) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update booking status");
  return res.json();
};

