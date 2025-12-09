// API Configuration
// Prefer env override, fallback to deployed backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://fyp-project-backend.onrender.com";

export default API_BASE_URL;
