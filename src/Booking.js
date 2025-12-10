import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Booking.css';
import API_BASE_URL from './config/api';

function Booking() {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('');
  const [numPeople, setNumPeople] = useState('');
  const [foodPackage, setFoodPackage] = useState('');
  const [maxSides, setMaxSides] = useState(0);
  const [selectedSides, setSelectedSides] = useState([]);
  const [drink, setDrink] = useState('');
  const [dessert, setDessert] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const foodOptions = {
    'Grilled Chicken with 1 Side': 1,
    'Grilled Chicken with 2 Sides': 2,
    'Grilled Chicken with 3 Sides': 3,
    'Grilled Chicken with Rice (1 Side)': 1,
    'Grilled Chicken with Rice (2 Sides)': 2,
  };

  const sideOptions = [
    'Mashed Potato',
    'Potato Salad',
    'Steamed Green',
    'Sesame Salad',
  ];

  // Pricing tables (keep in sync with Payment page)
  const foodPrices = {
    'Grilled Chicken with 1 Side': 25,
    'Grilled Chicken with 2 Sides': 30,
    'Grilled Chicken with 3 Sides': 35,
    'Grilled Chicken with Rice (1 Side)': 28,
    'Grilled Chicken with Rice (2 Sides)': 33,
  };

  const drinkPrices = {
    'Soft Drink': 3,
    'Juice': 5,
    'Mineral Water': 2,
  };

  const dessertPrices = {
    'No Dessert': 0,
    'Matcha Bingsu': 15,
    'Biscoff Bingsu': 15,
  };

  const calculateTotalAmount = () => {
    const guests = parseInt(numPeople, 10) || 0;
    const foodPrice = foodPrices[foodPackage] || 0;
    const drinkPrice = drinkPrices[drink] || 0;
    const dessertPrice = dessertPrices[dessert] || 0;
    const total = (foodPrice + drinkPrice + dessertPrice) * (guests || 1);
    return Number(total.toFixed(2));
  };

  const handleFoodChange = (e) => {
    const selected = e.target.value;
    setFoodPackage(selected);
    setMaxSides(foodOptions[selected] || 0);
    setSelectedSides([]); // Reset sides when food package changes
  };

  const handleSideToggle = (side) => {
    if (selectedSides.includes(side)) {
      setSelectedSides(selectedSides.filter((s) => s !== side));
    } else if (selectedSides.length < maxSides) {
      setSelectedSides([...selectedSides, side]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const serviceName = eventType?.trim();
    const numPeopleInt = parseInt(numPeople, 10);
    const totalAmount = calculateTotalAmount();

    // Validate all required fields
    if (!serviceName || Number.isNaN(numPeopleInt) || numPeopleInt <= 0 || !foodPackage || !drink || !dessert) {
      setError('Please fill in all required fields and ensure guest count is valid.');
      console.warn('Form validation failed:', { serviceName, numPeopleInt, foodPackage, drink, dessert });
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      setError('Unable to calculate price. Please review your selections.');
      console.warn('Price calculation failed:', { totalAmount });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to make a booking. Please log in and try again.');
        setIsSubmitting(false);
        return;
      }

      const bookingData = {
        serviceName,
        eventType,
        numPeople: numPeopleInt,
        foodPackage,
        selectedSides: selectedSides && selectedSides.length > 0 ? selectedSides : [],
        drink,
        dessert,
        specialRequests: specialRequests || '',
        totalAmount,
      };

      console.log('Submitting booking data:', bookingData);

      // Submit booking to backend with required fields
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to create booking';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Backend error response:', errorData);
        } catch (parseErr) {
          console.error('Could not parse error response:', parseErr);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Booking response:', result);

      const bookingId = result.id || result._id || result.bookingId;

      if (!bookingId) {
        console.error('No booking ID in response:', result);
        throw new Error('Booking was created but no ID was returned. Please contact support if this persists.');
      }

      console.log('Booking created successfully with ID:', bookingId);
      
      // Navigate to Payment page with booking ID via URL and state
      navigate(`/payment?bookingId=${bookingId}`, { state: { bookingId, totalAmount, serviceName } });
    } catch (err) {
      console.error('Booking submission error:', err);
      const userMessage = err.message || 'Failed to create booking. Please try again.';
      setError(userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="hero-pill">New Booking</div>
        <h1>Book Your Event</h1>
        <p>
          Select your event type, customize your menu, and complete your
          booking in one simple step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form-wrapper">
        <div className="booking-layout">
          {/* Event Type Selection */}
          <div className="field-card">
            <h3>Event Type</h3>
            <div className="option-stack">
              {['Birthday Party', 'Gathering', 'Family Party'].map((type) => (
                <label key={type} className="choice-card">
                  <input
                    type="radio"
                    name="eventType"
                    value={type}
                    checked={eventType === type}
                    onChange={(e) => setEventType(e.target.value)}
                  />
                  <strong>{type}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Number of People */}
          <div className="field-card">
            <h3>Number of People</h3>
            <label className="label">How many guests?</label>
            <input
              type="number"
              min="1"
              max="500"
              value={numPeople}
              onChange={(e) => setNumPeople(e.target.value)}
              className="input"
              placeholder="Enter number of people"
              required
            />
          </div>

          {/* Food Selection */}
          <div className="field-card">
            <h3>Food Package</h3>
            <div className="option-stack">
              {Object.keys(foodOptions).map((option) => (
                <label key={option} className="choice-card">
                  <input
                    type="radio"
                    name="foodPackage"
                    value={option}
                    checked={foodPackage === option}
                    onChange={handleFoodChange}
                  />
                  <strong>{option}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Side Dishes Selection */}
          {maxSides > 0 && (
            <div className="field-card">
              <h3>
                Select Side Dishes
                <span className="side-count">
                  ({selectedSides.length}/{maxSides})
                </span>
              </h3>
              <p className="side-hint">Choose up to {maxSides} side dishes</p>
              <div className="chip-grid">
                {sideOptions.map((side) => (
                  <label
                    key={side}
                    className={`chip ${
                      selectedSides.includes(side) ? 'active' : ''
                    } ${
                      selectedSides.length >= maxSides &&
                      !selectedSides.includes(side)
                        ? 'disabled'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSides.includes(side)}
                      onChange={() => handleSideToggle(side)}
                      disabled={
                        selectedSides.length >= maxSides &&
                        !selectedSides.includes(side)
                      }
                    />
                    <span>{side}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Drink Selection */}
          <div className="field-card">
            <h3>Drink</h3>
            <div className="option-stack">
              {['Soft Drink', 'Juice', 'Mineral Water'].map((d) => (
                <label key={d} className="choice-card">
                  <input
                    type="radio"
                    name="drink"
                    value={d}
                    checked={drink === d}
                    onChange={(e) => setDrink(e.target.value)}
                  />
                  <strong>{d}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Dessert Selection */}
          <div className="field-card">
            <h3>Dessert</h3>
            <div className="option-stack">
              {['No Dessert', 'Matcha Bingsu', 'Biscoff Bingsu'].map((d) => (
                <label key={d} className="choice-card">
                  <input
                    type="radio"
                    name="dessert"
                    value={d}
                    checked={dessert === d}
                    onChange={(e) => setDessert(e.target.value)}
                  />
                  <strong>{d}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="field-card">
            <h3>Special Requests or Notes</h3>
            <label className="label">Any special requirements?</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="input textarea-input"
              placeholder="Tell us about any dietary restrictions, allergies, or special requests..."
              rows="5"
            ></textarea>
          </div>

          {/* Booking Summary */}
          <div className="summary-card">
            <h3>Booking Summary</h3>
            <ul>
              <li>
                <span>Event Type:</span>
                <strong>{eventType || '—'}</strong>
              </li>
              <li>
                <span>Number of Guests:</span>
                <strong>{numPeople || '—'}</strong>
              </li>
              <li>
                <span>Food Package:</span>
                <strong>{foodPackage || '—'}</strong>
              </li>
              <li>
                <span>Side Dishes:</span>
                <strong>
                  {selectedSides.length > 0 ? selectedSides.join(', ') : '—'}
                </strong>
              </li>
              <li>
                <span>Drink:</span>
                <strong>{drink || '—'}</strong>
              </li>
              <li>
                <span>Dessert:</span>
                <strong>{dessert || '—'}</strong>
              </li>
              <li>
                <span>Total Amount:</span>
                <strong>RM {calculateTotalAmount() || '—'}</strong>
              </li>
            </ul>
          </div>

          {/* Error Message with Retry Info */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '12px' }}>✕ <strong>Error:</strong> {error}</div>
              <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                If the issue persists, try refreshing the page or clearing your browser cache.
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-booking"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Booking...' : 'Complete Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Booking;
