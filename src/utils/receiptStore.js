
import API_BASE_URL from "../config/api";

// Upload a receipt file to the backend for a booking
// Some backends expose different paths for receipt uploads. We attempt a few
// common variants to avoid 404s while keeping the logic in one place.
export const uploadReceiptFile = async (bookingId, file, token) => {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("bookingId", bookingId);

  const paths = [
    `${API_BASE_URL}/api/bookings/${bookingId}/upload-receipt`,
    `${API_BASE_URL}/api/bookings/${bookingId}/receipt-upload`,
    `${API_BASE_URL}/api/bookings/${bookingId}/receipt`, // legacy path
  ];

  let lastError;

  for (const path of paths) {
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        lastError = new Error(`Upload failed at ${path} (status ${res.status})`);
        continue;
      }

      // Success: return parsed response
      return res.json();
    } catch (err) {
      lastError = err;
      // Try next path
    }
  }

  throw lastError || new Error("Failed to upload receipt");
};

