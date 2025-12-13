# Confirmation Dialogs - Testing Guide

## Quick Test Checklist

### 1. Booking Form Confirmation
**Location:** `/booking` route
**Test Steps:**
- [ ] Navigate to Booking page
- [ ] Fill out all form fields (Event Type, Guests, Food Package, Drink, Dessert)
- [ ] Click "Complete Booking" button
- [ ] Verify dialog appears with:
  - Title: "Confirm Your Booking"
  - Shows number of guests and total amount
  - Two buttons: "Cancel" and "Confirm Booking"
- [ ] Click "Cancel" - dialog closes, form data preserved
- [ ] Click "Complete Booking" again, then "Confirm Booking" - proceeds to payment

### 2. Payment Form Confirmation
**Location:** `/payment` route
**Test Steps:**
- [ ] Navigate to Payment page (requires valid booking)
- [ ] Upload a payment receipt
- [ ] Click "Upload & Complete Payment" button
- [ ] Verify dialog appears with:
  - Title: "Confirm Payment Receipt"
  - Shows total amount
  - Two buttons: "Cancel" and "Confirm & Submit"
- [ ] Click "Cancel" - dialog closes, file remains selected
- [ ] Click upload again, then confirm - proceeds to booking history

### 3. Login Form Confirmation
**Location:** `/login` route
**Test Steps:**
- [ ] Navigate to Login page
- [ ] Enter email and password
- [ ] Click "Login" button
- [ ] Verify dialog appears with:
  - Title: "Confirm Login"
  - Shows email address
  - Two buttons: "Cancel" and "Login"
- [ ] Click "Cancel" - dialog closes, form data preserved
- [ ] Click "Login" again, then confirm - proceeds with login

### 4. Registration Form Confirmation
**Location:** `/register` route
**Test Steps:**
- [ ] Navigate to Registration page
- [ ] Fill out all fields (Name, Phone, Email, Password, Confirm Password)
- [ ] Click "Sign Up" button
- [ ] Verify dialog appears with:
  - Title: "Confirm Registration"
  - Shows email address
  - Two buttons: "Cancel" and "Create Account"
- [ ] Click "Cancel" - dialog closes, form data preserved
- [ ] Click "Sign Up" again, then confirm - proceeds with registration

## Visual Tests

### Dialog Animation
- [ ] Dialog should fade in smoothly when opened
- [ ] Dialog should slide up from bottom on mobile view
- [ ] Dialog should have semi-transparent dark overlay

### Button States
- [ ] Buttons should be disabled while loading
- [ ] "Processing..." text should show during submission
- [ ] Buttons should re-enable if action fails

### Mobile Responsiveness
- [ ] Buttons should stack vertically on phones
- [ ] Dialog width should be 90% on mobile, max 400px on desktop
- [ ] Text should be readable on all screen sizes

## Error Scenarios

### Booking Error
- [ ] Confirm with invalid booking data
- [ ] Server returns error
- [ ] Dialog should close and error message displayed on page
- [ ] Form data should be preserved for retry

### Payment Error
- [ ] Confirm with large file (>20MB)
- [ ] Server returns error
- [ ] Dialog should close and error message displayed
- [ ] File selection should be preserved

### Network Error
- [ ] Confirm action with no internet
- [ ] Network error should be caught
- [ ] Appropriate error message should display
- [ ] Dialog should close and form data preserved

## Accessibility Tests

### Keyboard Navigation
- [ ] Press Tab to navigate between buttons
- [ ] Press Enter to activate focused button
- [ ] Press Escape to close dialog (if implemented)

### Screen Reader
- [ ] Dialog title should be announced
- [ ] Button purposes should be clear
- [ ] Error messages should be announced

## Performance Tests

### Load Time
- [ ] Dialog should appear instantly when submit clicked
- [ ] No noticeable lag or delay

### File Handling (Payment)
- [ ] Upload 5MB file - should work
- [ ] Upload 20MB file - should work
- [ ] Upload 21MB file - should show error before dialog

## Cross-Browser Tests

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Integration Tests

### Success Flow
1. [ ] Booking: Complete → Confirm → Navigate to Payment
2. [ ] Payment: Upload → Confirm → Navigate to Booking History
3. [ ] Login: Submit → Confirm → Navigate to Dashboard or Home
4. [ ] Register: Submit → Confirm → Navigate to Login

### Cancellation Flow
1. [ ] All forms should preserve data when dialog cancelled
2. [ ] User should be able to retry without re-entering info

## Edge Cases

- [ ] Test with very long email addresses
- [ ] Test with special characters in form fields
- [ ] Test with copy-paste operations in dialogs
- [ ] Test rapid clicks on submit button
- [ ] Test dialog while network request in progress
- [ ] Test page refresh during dialog open

## Backend Integration Notes

Verify that backend is sending security headers:
```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
X-Content-Type-Options: nosniff
```

These should be visible in browser Network tab (Developer Tools → Network → [any request] → Response Headers)

## Sign-Off

- **Tester Name:** _______________
- **Date:** _______________
- **Status:** ☐ PASS ☐ FAIL
- **Issues Found:** _______________________________________________
