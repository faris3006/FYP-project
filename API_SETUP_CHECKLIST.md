# Frontend API Setup & Verification Checklist

## ✅ **Current Configuration**

### **1. API Base URL Configuration**
- **File:** `src/config/api.js`
- **Status:** ✅ Environment variable support + fallback
- **Current URL:** `https://fyp-project-backend.onrender.com`
- **Environment Override:** Set `REACT_APP_API_BASE_URL` in `.env.local` or production env

### **2. Environment Variables (.env.local)**
```
REACT_APP_API_BASE_URL=https://fyp-project-backend.onrender.com
REACT_APP_SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
```
- **Status:** ✅ Updated with API base URL
- **⚠️ IMPORTANT:** Store your actual SendGrid API key ONLY in `.env.local` (git-ignored). Never commit it to GitHub.

### **3. All API Endpoints Currently Used**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify-email?token=...
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-mfa
POST /api/admin/users
POST /api/admin/bookings
```

---

## 🔍 **Data Sent to Backend**

### **Registration Request**
- **Endpoint:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "+601234567890",
    "email": "user@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }
  ```
- **Validation:** ✅ All fields required, email format checked, password strength enforced (8+ chars, upper, lower, number, special)
- **Logging:** ✅ Full payload logged to console

### **Email Verification Request**
- **Endpoint:** `GET /api/auth/verify-email?token={TOKEN}`
- **Headers:** `Content-Type: application/json`
- **Logging:** ✅ Token (first 20 chars), URL, response status all logged

### **Login Request**
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **On MFA Required:** Stores `mfaEmail` and `mfaUserId` in localStorage

### **Forgot Password Request**
- **Endpoint:** `POST /api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

### **Reset Password Request**
- **Endpoint:** `POST /api/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "reset-token-from-url",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }
  ```

### **MFA Verification Request**
- **Endpoint:** `POST /api/auth/verify-mfa`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "userId": "mongodb-user-id",
    "mfaCode": "123456"
  }
  ```
- **Logging:** ✅ All three fields logged with actual values

---

## 🚀 **Building & Deploying Frontend**

### **Local Development**
```bash
# Ensure .env.local has the correct API URL
REACT_APP_API_BASE_URL=https://fyp-project-backend.onrender.com

# Start dev server
npm start

# Check browser console for API configuration logs
# You should see:
# API Configuration:
#   - REACT_APP_API_BASE_URL env: https://fyp-project-backend.onrender.com
#   - Using API_BASE_URL: https://fyp-project-backend.onrender.com
#   - NODE_ENV: development
```

### **Production Build**
```bash
# Build for production
npm run build

# Build output will be in ./build/ directory
# This will be deployed to your frontend hosting (e.g., Vercel, Netlify)
```

### **Production Environment Variables**
Set these on your hosting platform (Vercel, Netlify, etc.):
```
REACT_APP_API_BASE_URL=https://fyp-project-backend.onrender.com
REACT_APP_SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
```
- **⚠️ CRITICAL:** Use your new SendGrid API key (after revoking the exposed one). Never hardcode secrets in code.

---

## 🔐 **CORS Configuration (Backend Requirement)**

For the frontend to communicate with the backend from any IP/domain, the backend **MUST** have CORS enabled:

### **Backend Must Allow:**
```javascript
// Example Node.js/Express
const cors = require('cors');

app.use(cors({
  origin: '*', // Allow all origins, or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  headers: ['Content-Type', 'Authorization']
}));
```

### **Expected Response Headers from Backend:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### **If CORS Error in Browser Console:**
```
Access to XMLHttpRequest at 'https://backend-url/api/auth/register' 
from origin 'https://frontend-url' has been blocked by CORS policy
```
**Solution:** Backend must configure CORS (not a frontend issue)

---

## 🧪 **Testing API Connection**

### **In Browser Console, Run:**
```javascript
// Test API endpoint accessibility
fetch('https://fyp-project-backend.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    phone: '+601234567890',
    email: 'test@example.com',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!'
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

### **Expected Results:**
- ✅ Network request completes
- ✅ Backend returns JSON response
- ❌ CORS error? Backend needs CORS config
- ❌ 404? Wrong endpoint path
- ❌ 500? Backend error, check server logs

---

## 📋 **Console Logging for Debugging**

### **On App Load:**
```
API Configuration:
  - REACT_APP_API_BASE_URL env: https://fyp-project-backend.onrender.com
  - Using API_BASE_URL: https://fyp-project-backend.onrender.com
  - NODE_ENV: production
```

### **On Registration Submit:**
```
Sending registration request to: https://fyp-project-backend.onrender.com/api/auth/register
Payload: {name: "John", phone: "+601234567890", email: "john@example.com", password: "...", confirmPassword: "..."}
Registration response status: 200
Registration response data: {message: "Registration successful..."}
```

### **On Email Verification:**
```
Email verification page loaded
  - Token from URL: abc123def456...
  - API_BASE_URL: https://fyp-project-backend.onrender.com
Sending verification request to: https://fyp-project-backend.onrender.com/api/auth/verify-email?token=abc123def456...
Verification response status: 200
Verification response data: {message: "Email verified successfully"}
```

### **On MFA Verification:**
```
Sending MFA verification request with payload: {email: "user@example.com", userId: "507f1f77bcf86cd799439011", mfaCode: "123456"}
  - Email value: user@example.com
  - UserId value: 507f1f77bcf86cd799439011
  - Code value: 123456
MFA verification response: {token: "eyJhbGciOiJIUzI1NiIs..."}
MFA verification successful. User role: user
```

---

## ✅ **Verification Steps**

- [ ] `.env.local` has `REACT_APP_API_BASE_URL` set correctly
- [ ] `.env.local` is in `.gitignore` (never committed to Git)
- [ ] `npm start` shows API configuration logs in console
- [ ] Register page logs full payload to console
- [ ] Email verification page shows token in logs
- [ ] MFA verification shows all three fields (email, userId, mfaCode) in logs
- [ ] No CORS errors in Network tab
- [ ] Backend returns 200/201 status codes
- [ ] Backend response JSON is properly logged
- [ ] Production build includes env variables via hosting platform settings
- [ ] All API calls include `Content-Type: application/json` header
- [ ] All validation happens before sending to backend
- [ ] No secrets are committed to Git

---

## 📞 **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot reach API" | Wrong API URL | Check `REACT_APP_API_BASE_URL` in `.env.local` |
| CORS error | Backend missing CORS config | Backend needs `cors` middleware |
| 404 error | Wrong endpoint path | Verify endpoint matches backend route |
| 500 error | Backend issue | Check backend server logs |
| Email not showing | localStorage not set | Verify Login.js stores `mfaEmail` |
| MFA fails with "userId missing" | userId not stored | Verify `mfaUserId` in localStorage |
| Console shows "null" for userId | Login response missing userId | Backend must return userId in response |
| Push blocked by GitHub | Exposed secrets in history | Use `git filter-branch` to remove from history |

---

## 🎯 **Next Steps**

1. **Verify `.env.local` is correct**
   ```bash
   cat .env.local
   ```

2. **Ensure `.env.local` is in `.gitignore`**
   ```bash
   cat .gitignore | grep env.local
   ```

3. **Restart dev server**
   ```bash
   npm start
   ```

4. **Open browser console (F12)**
   - Look for "API Configuration" logs
   - Try registration and check full payload logged

5. **Test production build**
   ```bash
   npm run build
   ```
   - Upload `build/` folder to hosting (Vercel, Netlify, etc.)
   - Set environment variables on hosting platform
   - Test all flows end-to-end

6. **Verify backend CORS**
   - Check backend console for incoming requests
   - Verify response includes `Access-Control-Allow-*` headers
   - Test with browser Network tab (F12 → Network tab)

7. **Regenerate SendGrid API Key**
   - Go to SendGrid Dashboard → API Keys
   - Revoke the old exposed key
   - Create a new API key
   - Store ONLY in `.env.local` and hosting platform env vars
   - Never commit to Git
