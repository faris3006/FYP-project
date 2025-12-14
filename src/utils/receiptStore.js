
import API_BASE_URL from "../config/api";
import { authFetch } from "./auth";

// Upload a receipt file to the backend for a booking
// Backend route: POST /api/bookings/:bookingId/receipt-upload (multipart/form-data)
export const uploadReceiptFile = async (bookingId, file, token) => {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("bookingId", bookingId);

  const path = `${API_BASE_URL}/api/bookings/${bookingId}/receipt-upload`;

  const res = await authFetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const msg = `Upload failed at ${path} (status ${res.status})`;
    throw new Error(msg);
  }

  return res.json();
};

