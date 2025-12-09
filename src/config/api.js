// API Configuration
// Prefer env override, fallback to deployed backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://fyp-project-backend.onrender.com";

console.log("API Configuration:");
console.log("  - REACT_APP_API_BASE_URL env:", process.env.REACT_APP_API_BASE_URL);
console.log("  - Using API_BASE_URL:", API_BASE_URL);
console.log("  - NODE_ENV:", process.env.NODE_ENV);

export default API_BASE_URL;
