
import API_BASE_URL from "../config/api";

// Upload a receipt file to the backend for a booking
export const uploadReceiptFile = async (bookingId, file, token) => {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("bookingId", bookingId);
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/receipt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload receipt");
  return res.json();
};

