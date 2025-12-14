# Frame-Busting Test Instructions

## ✅ What Was Added

1. **Test Page:** `public/test-clickjacking.html` - A malicious page that tries to iframe your site
2. **Frame-Busting Code:** Added to `src/index.js` - Breaks out of iframes when detected

## 🧪 How to Test

### Option 1: Test Locally with Dev Server

1. Start your dev server:
   ```bash
   npm start
   ```

2. Open the test page in your browser:
   ```
   http://localhost:3000/test-clickjacking.html
   ```

3. **What you'll see:**
   - If frame-busting works: Empty iframe or security warning
   - If not working: Your site loads in the iframe (vulnerable)

### Option 2: Test on Vercel

1. Deploy your updated build to Vercel:
   ```bash
   npm run build
   # Deploy the build/ folder to Vercel
   ```

2. Create a local HTML file `test-vercel.html`:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Vercel Test</title></head>
   <body>
       <h1>Testing Vercel Deployment</h1>
       <iframe src="https://fyp-project-nine-gray.vercel.app" width="1200" height="800"></iframe>
   </body>
   </html>
   ```

3. Open `test-vercel.html` in your browser

4. **Expected Results:**
   - ✅ **Frame-busting works:** Page breaks out of iframe OR shows security warning
   - ❌ **Still vulnerable:** Site displays normally in iframe (need backend headers)

### Option 3: Quick Test with Browser Console

1. Open your deployed site: https://fyp-project-nine-gray.vercel.app
2. Open Browser Console (F12)
3. Run this code:
   ```javascript
   window.self === window.top
   ```
4. Result:
   - `true` = Not in an iframe (normal)
   - `false` = In an iframe (should trigger frame-busting)

## 📊 Frame-Busting Behavior

### When Your Site is Framed:

```javascript
// src/index.js now checks:
if (window.self !== window.top) {
  // Attempt 1: Break out of iframe
  window.top.location = window.self.location;
  
  // Attempt 2: If blocked, show warning
  // (Displays security message to user)
}
```

### Expected Outcomes:

| Scenario | What Happens |
|----------|--------------|
| **No iframe** | App loads normally ✅ |
| **In iframe (same origin)** | Breaks out to full page ✅ |
| **In iframe (cross-origin)** | Shows security warning ⚠️ |
| **Backend headers present** | Iframe blocked by browser 🔒 |

## 🔍 Visual Test Results

### ✅ PROTECTED (Frame-busting working)
```
┌──────────────────────────────────┐
│ Test Page Header                 │
├──────────────────────────────────┤
│                                  │
│  [Empty iframe or redirected]    │
│                                  │
└──────────────────────────────────┘
```

### ❌ VULNERABLE (Still needs backend headers)
```
┌──────────────────────────────────┐
│ Test Page Header                 │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ Your EventEase Site          │ │
│ │ [Fully visible in iframe]    │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

## ⚠️ Important Notes

### Frame-Busting Limitations:

1. **Can be bypassed** by sophisticated attackers
2. **Doesn't work** if user has JavaScript disabled
3. **May fail** with certain browser security policies
4. **Not a replacement** for backend security headers

### Why Backend Headers Are Still Needed:

Even with frame-busting code:
- Attackers can disable JavaScript
- Some browsers may block the `window.top.location` redirect
- Frame-busting can be circumvented with sandbox attributes

**Backend headers (`X-Frame-Options: DENY`) cannot be bypassed!**

## 🎯 Final Test Checklist

After deploying to Vercel:

- [ ] Test page created: `test-clickjacking.html`
- [ ] Frame-busting code added to `src/index.js`
- [ ] Build successful (no errors)
- [ ] Deployed to Vercel
- [ ] Tested iframe embedding locally
- [ ] Tested iframe embedding on deployed site
- [ ] Verified frame-busting triggers when framed
- [ ] Backend headers still need to be added (see BACKEND_SECURITY_HEADERS.md)

## 🚀 Next Steps

1. ✅ **Frontend frame-busting:** DONE (temporary measure)
2. ⏳ **Backend security headers:** STILL REQUIRED
3. ⏳ **Final verification:** Use https://securityheaders.com after backend implementation

## 📝 Summary

**What you have now:**
- ✅ Confirmation dialogs on critical actions
- ✅ Frame-busting code (tries to break out of iframes)
- ⏳ Backend security headers (still needed)

**To complete protection:**
- Backend developer implements headers from BACKEND_SECURITY_HEADERS.md
- Test with both methods (frame-busting + headers = strongest protection)
