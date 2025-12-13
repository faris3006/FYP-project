# Backend Implementation Notes - Clickjacking Protection

## For Backend Developer

This document outlines what needs to be implemented on the backend to complete the clickjacking protection for EventEase.

## What Frontend Did ✅

The frontend now includes **confirmation dialogs** for critical actions:
1. Booking submission
2. Payment receipt upload
3. User login
4. User registration

These dialogs improve UX and prevent accidental clicks, but they are **NOT the actual security mechanism**.

## What Backend Needs to Do 🔒

The **real clickjacking protection** comes from HTTP security headers sent by the backend. These headers tell the browser to prevent your site from being embedded in iframes.

### Required Headers

Add the following HTTP response headers to **ALL responses** from your backend:

#### 1. X-Frame-Options (Traditional method)
```
X-Frame-Options: DENY
```
**What it does:** Prevents your site from being framed in ANY iframe
**Browser support:** All modern browsers + IE9+

#### 2. Content-Security-Policy (Modern method)
```
Content-Security-Policy: frame-ancestors 'none'
```
**What it does:** Modern CSP directive that prevents framing
**Browser support:** All modern browsers
**Note:** More flexible than X-Frame-Options, can be combined with other CSP directives

#### 3. X-Content-Type-Options (Bonus security)
```
X-Content-Type-Options: nosniff
```
**What it does:** Prevents MIME-type sniffing attacks
**Related to:** Broader security, not specifically clickjacking

### Implementation Examples

#### Express.js
```javascript
// Middleware to add security headers
app.use((req, res, next) => {
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
```

#### Using helmet.js (Recommended)
```javascript
const helmet = require('helmet');
app.use(helmet());

// Or customize:
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    frameAncestors: ["'none'"],
  },
}));
```

#### Django
```python
# settings.py
SECURE_CONTENT_SECURITY_POLICY = "frame-ancestors 'none'"
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_SECURITY_POLICY_REPORT_ONLY = False
```

#### .htaccess (Apache)
```apache
# Add these lines to .htaccess
Header set X-Frame-Options "DENY"
Header set Content-Security-Policy "frame-ancestors 'none'"
Header set X-Content-Type-Options "nosniff"
```

#### Nginx
```nginx
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none'" always;
add_header X-Content-Type-Options "nosniff" always;
```

## How It Works

### Attack Scenario (Before Protection)
```
Attacker's Site                EventEase Site
[Hidden iframe]          →      Displayed normally
User clicks on            
innocent button on         
attacker's site            
↓                        
Actually clicks on        
"Confirm Booking"         
in hidden EventEase        
iframe                     
↓                        
User's money deducted      
without their knowledge    
```

### With X-Frame-Options: DENY
```
Browser receives: X-Frame-Options: DENY
↓
Browser refuses to display EventEase inside ANY iframe
↓
Attacker cannot trick users with hidden iframes
✅ Attack prevented
```

## Verification

### How to Verify Headers Are Being Sent

#### Using Browser DevTools
1. Open your site in a browser
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to **Network** tab
4. Click on any API request or page request
5. Look at **Response Headers** section
6. You should see:
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy: frame-ancestors 'none'`

#### Using curl command
```bash
curl -i https://yourserver.com/api/endpoint
```

Look for headers in the response:
```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

#### Using online tools
- https://securityheaders.com/
- https://observatory.mozilla.org/

## Testing the Implementation

### Test 1: Verify Headers Present
- [ ] All API endpoints return clickjacking protection headers
- [ ] All page endpoints return the headers
- [ ] Headers are consistent across all routes

### Test 2: Manual Iframe Test
```html
<!-- Create a test.html file with this content -->
<!DOCTYPE html>
<html>
<body>
  <h1>Attempting to frame EventEase</h1>
  <iframe src="https://youreventease.com/booking" style="width:100%; height:500px;"></iframe>
  <p>If iframe is blocked, you'll see an empty box above.</p>
</body>
</html>
```

**Expected result:** Iframe should not load or be replaced with error message

### Test 3: Browser Console Check
```javascript
// In browser console on your site
console.log(window.self === window.top) // Should be true
```

If true, your site is not framed. If false, it might be framed.

## Important Notes

⚠️ **Do NOT disable these headers!**
- These are essential security controls
- They have no negative impact on legitimate users
- The only "downside" is that your site cannot be embedded in iframes (which is a feature, not a bug)

⚠️ **Apply to ALL responses**
- API endpoints
- HTML pages  
- Static files (if served by your backend)
- Error pages

## Related Security Measures (Bonus)

Consider implementing these additional security headers:

### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
Forces HTTPS connections

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
Enables XSS filtering in browsers

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controls referrer information sent with requests

### Permissions-Policy (formerly Feature-Policy)
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
Restricts what browser features can be used

## Common Issues & Solutions

### Issue: "Headers not being applied"
**Solution:**
- Clear browser cache
- Check cache middleware isn't overriding headers
- Verify headers are added BEFORE response is sent
- Check for reverse proxy (AWS ALB, Nginx, etc.) not passing headers

### Issue: "Some endpoints still missing headers"
**Solution:**
- Add headers to global middleware (before route handlers)
- Don't rely on per-route implementation
- Test all routes including error handlers

### Issue: "Third-party iframes in our own site break"
**Solution:**
This is expected. You likely don't need to frame other sites anyway. If you do:
- Use alternative methods (API calls, popups)
- Use `Content-Security-Policy: frame-ancestors 'self'` instead of `'none'`
- This allows only your own domain to frame the site

## Verification Checklist

Before considering clickjacking protection complete:

- [ ] X-Frame-Options header set to DENY
- [ ] Content-Security-Policy frame-ancestors set to 'none'
- [ ] Headers present on all responses (API, HTML, etc.)
- [ ] Browser developer tools confirm headers are sent
- [ ] Online security header checker shows green
- [ ] Manual iframe test fails to load page
- [ ] Documentation updated for deployment
- [ ] Tested on production environment

## Questions?

If you encounter issues implementing these headers:
1. Check your framework's security headers documentation
2. Verify headers aren't being stripped by middleware
3. Check reverse proxy configuration
4. Test with online security header tools

## Resources

- [OWASP Clickjacking Defense](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
- [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [MDN CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Helmet.js Documentation](https://helmetjs.github.io/)
