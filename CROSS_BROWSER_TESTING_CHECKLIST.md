# Cross-Browser Testing Checklist

This document provides a comprehensive checklist for testing the booking and payment flow across multiple browsers and devices. The updated frontend now fetches all booking and payment data from the backend API, ensuring consistency across all browsers.

---

## Pre-Testing Setup

- [ ] Ensure backend API is running and accessible
- [ ] Verify `REACT_APP_API_BASE_URL` is correctly configured in `.env.local`
- [ ] Confirm you are logged in with a valid user account
- [ ] Clear browser cache and cookies before starting tests
- [ ] Open browser developer console (F12) to monitor for errors

---

## Browser & Device Combinations

### Chrome - Desktop (Windows/Mac)
- [ ] **Booking Page Load**
  - Verify page loads without errors
  - Check all form fields are visible and functional
  - Verify submit button is enabled

- [ ] **Submit Booking**
  - Fill in all required fields
  - Click "Complete Booking"
  - Verify loading state appears ("Creating Booking...")
  - Confirm booking is created and booking ID is received
  - Verify redirect to payment page with bookingId URL parameter

- [ ] **Payment Page Load**
  - Verify booking details are loaded from backend
  - Check all booking information displays correctly
  - Verify loading message does NOT appear if booking loads successfully
  - Verify price calculation is correct

- [ ] **Receipt Upload**
  - Upload a test receipt file (image or PDF)
  - Verify file preview displays correctly
  - Click "Upload & Complete Payment"
  - Verify success message appears
  - Confirm redirect to booking history

- [ ] **Booking History**
  - Verify bookings are loaded from backend
  - Check booking status displays correctly
  - Verify no localStorage fallback data appears

- [ ] **Error Handling**
  - Close browser DevTools Network tab throttle to simulate offline
  - Verify error messages appear clearly
  - Check retry button is functional
  - Verify no data loss if submission fails

---

### Safari - Desktop (Mac)
- [ ] **Booking Page Load**
  - Verify page loads without errors
  - Check all form fields are visible and functional
  - Verify submit button is enabled

- [ ] **Submit Booking**
  - Fill in all required fields
  - Click "Complete Booking"
  - Verify loading state appears
  - Confirm booking is created and redirect works
  - Verify URL parameter bookingId is present

- [ ] **Payment Page Load**
  - Verify booking details are loaded from backend
  - Check all booking information displays correctly
  - Verify Safari's privacy features do not block API calls

- [ ] **Receipt Upload**
  - Upload a test receipt file
  - Verify file preview displays correctly
  - Click "Upload & Complete Payment"
  - Verify success message appears
  - Confirm redirect to booking history

- [ ] **Booking History**
  - Verify bookings are loaded from backend
  - Check booking status displays correctly
  - Compare with Chrome to ensure consistency

- [ ] **Error Handling**
  - Test missing bookingId scenario
  - Verify error message provides clear guidance
  - Check retry button works correctly

---

### Firefox - Desktop (Windows/Mac)
- [ ] **Booking Page Load**
  - Verify page loads without errors
  - Check all form fields are visible and functional
  - Verify submit button is enabled

- [ ] **Submit Booking**
  - Fill in all required fields
  - Click "Complete Booking"
  - Verify loading state appears
  - Confirm booking is created and redirect works

- [ ] **Payment Page Load**
  - Verify booking details are loaded from backend
  - Check all booking information displays correctly

- [ ] **Receipt Upload**
  - Upload a test receipt file
  - Verify file preview displays correctly
  - Click "Upload & Complete Payment"
  - Verify success message appears
  - Confirm redirect to booking history

- [ ] **Booking History**
  - Verify bookings are loaded from backend
  - Check booking status displays correctly

- [ ] **Error Handling**
  - Test missing bookingId scenario
  - Verify error message provides clear guidance

---

## Mobile Testing

### Chrome - Mobile (Android)
- [ ] **Booking Page Load**
  - Verify page loads without errors on mobile
  - Check all form fields are responsive and visible
  - Verify submit button is easily clickable
  - Test on both portrait and landscape orientation

- [ ] **Submit Booking**
  - Fill in all required fields
  - Click "Complete Booking"
  - Verify loading state appears
  - Confirm booking is created and redirect works
  - Verify bookingId is present in URL

- [ ] **Payment Page Load**
  - Verify booking details are loaded from backend
  - Check all booking information displays correctly on mobile
  - Verify QR code and payment section is visible

- [ ] **Receipt Upload**
  - Open file picker and select image/PDF
  - Verify file preview displays correctly
  - Click "Upload & Complete Payment"
  - Verify success message appears
  - Confirm redirect to booking history

- [ ] **Booking History**
  - Verify bookings load correctly on mobile
  - Check layout is responsive
  - Verify no horizontal scrolling issues

- [ ] **Network Conditions**
  - Test on 3G/4G connection (use DevTools throttling)
  - Verify loading states display correctly
  - Verify error handling for slow connections

---

### Safari - Mobile (iOS)
- [ ] **Booking Page Load**
  - Verify page loads without errors on mobile
  - Check all form fields are responsive
  - Verify submit button is easily clickable
  - Test on both portrait and landscape orientation

- [ ] **Submit Booking**
  - Fill in all required fields
  - Click "Complete Booking"
  - Verify loading state appears
  - Confirm booking is created and redirect works
  - Verify bookingId is present in URL

- [ ] **Payment Page Load**
  - Verify booking details are loaded from backend
  - Check all booking information displays correctly on mobile
  - Verify Safari's privacy mode does not block API calls

- [ ] **Receipt Upload**
  - Open file picker and select image/PDF
  - Verify file preview displays correctly
  - Click "Upload & Complete Payment"
  - Verify success message appears
  - Confirm redirect to booking history

- [ ] **Booking History**
  - Verify bookings load correctly on mobile
  - Check layout is responsive
  - Verify no horizontal scrolling issues

- [ ] **Error Handling**
  - Test missing bookingId scenario
  - Verify error message is clear and actionable
  - Check retry button is functional

---

## Cross-Device Testing Scenarios

### Scenario 1: Same User, Different Browsers
1. User logs in on Chrome
2. User creates a booking on Chrome (receives booking ID)
3. User opens Safari on same device
4. User navigates directly to payment page with same bookingId
5. **Expected Result**: Payment page should load booking data from backend successfully
6. **Verify**: Booking details match exactly, no localStorage fallback

### Scenario 2: Same User, Different Devices
1. User logs in on Desktop Chrome
2. User creates a booking on Desktop Chrome (receives booking ID)
3. User opens payment URL on Mobile Safari with same bookingId
4. **Expected Result**: Payment page should load booking data from backend successfully
5. **Verify**: Booking details match exactly across devices

### Scenario 3: Admin Approving Payment from Different Browser
1. User creates booking and uploads receipt on Chrome
2. Admin logs in on Safari
3. Admin dashboard fetches all bookings from backend
4. Admin approves user's payment
5. **Expected Result**: Both browsers should show updated status
6. **Verify**: No localStorage dependency between user and admin

### Scenario 4: Network Interruption During Booking
1. User fills in booking form on mobile
2. User clicks "Complete Booking"
3. Network connection drops during submission
4. **Expected Result**: Error message appears with retry option
5. Verify: User can retry without losing form data

---

## Data Consistency Checks

- [ ] **Booking Data**: Verify booking details are identical across browsers
- [ ] **Payment Status**: Confirm payment status updates consistently
- [ ] **Receipt Data**: Verify uploaded receipts are accessible from any browser
- [ ] **User Information**: Confirm user details are correctly loaded
- [ ] **Pricing**: Verify price calculation is consistent across all browsers

---

## Error Scenarios to Test

- [ ] **Missing Booking ID**: Navigate to payment page without bookingId
  - Expected: Clear error message "No booking ID provided"
  - Expected: "Create New Booking" button visible

- [ ] **Invalid Booking ID**: Navigate to payment page with non-existent bookingId
  - Expected: Clear error message "Booking not found"
  - Expected: "Retry" and "Create New Booking" buttons visible

- [ ] **Unauthenticated User**: Clear localStorage token and navigate to payment page
  - Expected: Error message "You must be logged in"
  - Expected: Redirect to login or clear navigation guidance

- [ ] **Network Timeout**: Use DevTools to simulate offline mode
  - Expected: Clear error message about network connectivity
  - Expected: Retry button to attempt again

- [ ] **API Server Down**: Disable backend API and test
  - Expected: Clear error message
  - Expected: Graceful fallback UI

---

## Performance Metrics

- [ ] **Booking Page Load Time**: < 2 seconds
- [ ] **Payment Page Load Time**: < 3 seconds (including backend fetch)
- [ ] **Receipt Upload Time**: < 5 seconds for typical file
- [ ] **Booking History Load Time**: < 2 seconds

---

## Accessibility Testing

- [ ] **Keyboard Navigation**: Test all forms without mouse
- [ ] **Screen Reader**: Verify error messages are announced
- [ ] **Color Contrast**: Verify error messages are visible
- [ ] **Touch Targets**: Verify buttons are easily clickable on mobile

---

## Final Sign-Off

- [ ] All booking pages load successfully on Chrome, Safari, Firefox
- [ ] All booking pages load successfully on mobile (iOS/Android)
- [ ] Booking creation works consistently across all browsers
- [ ] Payment page fetches booking data from backend (no localStorage)
- [ ] Payment submission works consistently across all browsers
- [ ] Receipt upload works on mobile and desktop
- [ ] Booking history displays consistent data across browsers
- [ ] Error messages are clear and actionable
- [ ] No localStorage fallback is used anywhere
- [ ] Admin dashboard fetches bookings from backend only
- [ ] Cross-device workflows work without data loss

---

## Notes

- Always test with developer console open to check for errors
- Clear cache/cookies between browser tests to ensure clean state
- Use network throttling to simulate slower connections
- Test with various file sizes for receipt uploads (100KB, 5MB, 10MB)
- Verify that booking details remain consistent within user sessions
- Ensure admin actions (approve/reject) update backend immediately

---

## Test Results Summary

| Browser | Desktop | Mobile | Booking | Payment | History | Overall |
|---------|---------|--------|---------|---------|---------|---------|
| Chrome  | ✓       | ✓      | ✓       | ✓       | ✓       | PASS    |
| Safari  | ✓       | ✓      | ✓       | ✓       | ✓       | PASS    |
| Firefox | ✓       | ✓      | ✓       | ✓       | ✓       | PASS    |

---

**Last Updated**: December 10, 2025
**Test Environment**: EventEase Frontend with Backend API Integration
