import { jwtDecode } from "jwt-decode";

const STORAGE_KEY = "ee_local_bookings";

export const readBookings = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeBookings = bookings => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const upsertBooking = booking => {
  const bookings = readBookings();
  const existingIndex = bookings.findIndex(item => item.id === booking.id);
  if (existingIndex >= 0) {
    bookings[existingIndex] = booking;
  } else {
    bookings.push(booking);
  }
  writeBookings(bookings);
  return booking;
};

// Helper function to get current user info from token
const getCurrentUserInfo = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    const userEmail = (decoded.email || decoded.userEmail || "").toLowerCase().trim();
    const userId = (decoded.userId || decoded.id || userEmail || "").toLowerCase().trim();
    
    if (!userEmail && !userId) return null;
    
    return { userEmail, userId };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Helper function to check if booking belongs to user
const belongsToUser = (booking, userInfo) => {
  if (!userInfo || !booking) return false;
  
  // Booking must have at least one user identifier
  if (!booking.userId && !booking.userEmail) return false;
  
  // Normalize booking user identifiers
  const bookingUserId = (booking.userId || "").toLowerCase().trim();
  const bookingUserEmail = (booking.userEmail || "").toLowerCase().trim();
  
  // Check if booking belongs to current user
  const matchesUserId = bookingUserId && (bookingUserId === userInfo.userId || bookingUserId === userInfo.userEmail);
  const matchesUserEmail = bookingUserEmail && (bookingUserEmail === userInfo.userEmail || bookingUserEmail === userInfo.userId);
  
  return matchesUserId || matchesUserEmail;
};

export const getBookingById = bookingId => {
  const userInfo = getCurrentUserInfo();
  if (!userInfo) return null;
  
  const booking = readBookings().find(item => item.id === bookingId);
  // Only return booking if it belongs to current user
  if (booking && belongsToUser(booking, userInfo)) {
    return booking;
  }
  return null;
};

export const getBookingsByUser = () => {
  const userInfo = getCurrentUserInfo();
  if (!userInfo) return [];
  
  const allBookings = readBookings();
  // Filter bookings to only return those belonging to current user
  // Bookings without user info are excluded
  return allBookings.filter(booking => belongsToUser(booking, userInfo));
};

export const updateBookingStatus = (bookingId, status) => {
  const bookings = readBookings();
  const updated = bookings.map(item =>
    item.id === bookingId ? { ...item, status } : item
  );
  writeBookings(updated);
  return updated.find(item => item.id === bookingId);
};

