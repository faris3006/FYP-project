import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Booking.css";
import { upsertBooking } from "./utils/bookingStorage";

// Simple pricing model so the UI can show an amount
const BASE_PRICE_PER_GUEST = 50;

const seatingOptions = [
  { id: "standard", label: "Standard seating", description: "Comfortable layout for most events." },
  { id: "premium", label: "Premium seating", description: "Closer to stage with extra service." },
  { id: "banquet", label: "Banquet seating", description: "Ideal for large dinners and galas." },
];

const mainDishes = ["Western set", "Asian fusion", "Buffet style"];

const sideDishOptions = [
  "Welcome canapés",
  "Coffee & tea station",
  "Soft drink package",
  "Late‑night snacks",
];

const dessertOptions = ["Mini desserts platter", "Custom cake", "Ice cream bar"];

const getCurrentUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return { userEmail: "", userId: "" };
  try {
    const decoded = jwtDecode(token);
    const userEmail = (decoded.email || decoded.userEmail || "").toLowerCase().trim();
    const userId =
      (decoded.userId || decoded.id || decoded._id || userEmail || "").toLowerCase().trim();
    return { userEmail, userId };
  } catch {
    return { userEmail: "", userId: "" };
  }
};

const Booking = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    event: "",
    date: "",
    time: "",
    guestsPerTable: "",
    seating: "standard",
    mainDish: mainDishes[0],
    sideDishes: [],
    dessert: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const amountDue = useMemo(() => {
    const guests = Number(form.guestsPerTable) || 0;
    if (!guests) return 0;
    let multiplier = 1;
    if (form.seating === "premium") multiplier = 1.2;
    if (form.seating === "banquet") multiplier = 1.5;
    return Math.round(guests * BASE_PRICE_PER_GUEST * multiplier);
  }, [form.guestsPerTable, form.seating]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = e => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setForm(prev => ({ ...prev, guestsPerTable: value }));
  };

  const handleSideToggle = value => {
    setForm(prev => {
      const exists = prev.sideDishes.includes(value);
      return {
        ...prev,
        sideDishes: exists
          ? prev.sideDishes.filter(item => item !== value)
          : [...prev.sideDishes, value],
      };
    });
  };

  const validate = () => {
    const next = {};
    if (!form.event.trim()) next.event = "Event name is required.";
    if (!form.date) next.date = "Event date is required.";
    if (!form.time) next.time = "Event time is required.";
    if (!form.guestsPerTable) next.guestsPerTable = "Number of guests is required.";
    if (!form.mainDish) next.mainDish = "Choose at least one main dish.";
    if (!amountDue) next.amount = "Guests must be greater than zero.";
    return next;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const { userEmail, userId } = getCurrentUserFromToken();

      const id = `b_${Date.now()}`;
      const booking = {
        id,
        userId,
        userEmail,
        createdAt: new Date().toISOString(),
        event: form.event.trim(),
        bookingDate: form.date,
        bookingTime: form.time,
        guestsPerTable: Number(form.guestsPerTable),
        seatingLabel:
          seatingOptions.find(opt => opt.id === form.seating)?.label || "Standard seating",
        mainDish: form.mainDish,
        sideDishes: form.sideDishes,
        dessert: form.dessert,
        amountDue,
        status: "awaiting_payment",
        notes: form.notes,
      };

      upsertBooking(booking);
      localStorage.setItem("ee_active_booking_id", booking.id);

      alert("Booking saved! Next, upload your payment receipt.");
      navigate("/payment", { state: { bookingId: booking.id } });
    } catch (err) {
      console.error("Failed to save booking:", err);
      alert("Something went wrong saving your booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booking-page">
      <section className="booking-hero">
        <span className="hero-pill">
          ✦ Booking workspace <span>Live preview</span>
        </span>
        <h1>Design your event and send us the brief in one form.</h1>
        <p>
          Capture the essentials—date, guest count, and menu—so our team can confirm availability
          and prepare a precise proposal without the back‑and‑forth.
        </p>
        <div className="hero-meta">
          <span>• Typical confirmation in under 24 hours</span>
          <span>• Bank‑transfer payments via QR</span>
          <span>• Local admin can update status anytime</span>
        </div>
      </section>

      <div className="booking-layout">
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <div className="status-banner">
            Draft only. Your booking is confirmed once an admin changes the status to
            “Completed”.
          </div>

          <div className="field-card">
            <header>
              <p className="label">Event basics</p>
              <h3>Tell us what you’re hosting</h3>
            </header>
            <input
              className={`input ${errors.event ? "error" : ""}`}
              name="event"
              placeholder="e.g. Product launch dinner, AGM, appreciation night"
              value={form.event}
              onChange={handleChange}
            />
            {errors.event && <p className="input-error">{errors.event}</p>}

            <div className="schedule-grid">
              <div>
                <label className="label" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  className={`input ${errors.date ? "error" : ""}`}
                  value={form.date}
                  onChange={handleChange}
                />
                {errors.date && <p className="input-error">{errors.date}</p>}
              </div>
              <div>
                <label className="label" htmlFor="time">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  name="time"
                  className={`input ${errors.time ? "error" : ""}`}
                  value={form.time}
                  onChange={handleChange}
                />
                {errors.time && <p className="input-error">{errors.time}</p>}
              </div>
              <div>
                <label className="label" htmlFor="guestsPerTable">
                  Guests
                </label>
                <input
                  id="guestsPerTable"
                  name="guestsPerTable"
                  className={`input ${errors.guestsPerTable ? "error" : ""}`}
                  inputMode="numeric"
                  value={form.guestsPerTable}
                  onChange={handleGuestsChange}
                  placeholder="e.g. 80"
                />
                {errors.guestsPerTable && (
                  <p className="input-error">{errors.guestsPerTable}</p>
                )}
              </div>
            </div>
          </div>

          <div className="field-card">
            <header>
              <p className="label">Seating & menu</p>
              <h3>How should the room and food feel?</h3>
            </header>

            <div className="option-stack">
              {seatingOptions.map(option => (
                <label key={option.id} className="choice-card">
                  <input
                    type="radio"
                    name="seating"
                    value={option.id}
                    checked={form.seating === option.id}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </div>
                </label>
              ))}
            </div>

            <label className="label" htmlFor="mainDish">
              Main dish
            </label>
            <select
              id="mainDish"
              name="mainDish"
              className={`input ${errors.mainDish ? "error" : ""}`}
              value={form.mainDish}
              onChange={handleChange}
            >
              {mainDishes.map(dish => (
                <option key={dish} value={dish}>
                  {dish}
                </option>
              ))}
            </select>
            {errors.mainDish && <p className="input-error">{errors.mainDish}</p>}

            <p className="label">Sides</p>
            <div className="chip-grid">
              {sideDishOptions.map(option => (
                <label key={option} className="chip">
                  <input
                    type="checkbox"
                    checked={form.sideDishes.includes(option)}
                    onChange={() => handleSideToggle(option)}
                  />
                  <span>ADD</span>
                  {option}
                </label>
              ))}
            </div>

            <label className="label" htmlFor="dessert">
              Dessert
            </label>
            <select
              id="dessert"
              name="dessert"
              className="input"
              value={form.dessert}
              onChange={handleChange}
            >
              <option value="">No dessert needed</option>
              {dessertOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="label" htmlFor="notes">
              Notes for our team
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              className="input"
              placeholder="Share VIPs, dietary needs, or timing constraints so we can prepare."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <button className="submit-booking" type="submit" disabled={saving}>
            {saving ? "Saving booking..." : "Save booking & go to payment"}
          </button>
        </form>

        <aside className="booking-sidebar">
          <div className="summary-card">
            <p className="label">Booking summary</p>
            <h3>Quick snapshot</h3>
            <ul>
              <li>
                <span>Event</span>
                <strong>{form.event || "Not set yet"}</strong>
              </li>
              <li>
                <span>Schedule</span>
                <strong>
                  {form.date || form.time
                    ? `${form.date || "Date TBD"} • ${form.time || "Time TBD"}`
                    : "Not set yet"}
                </strong>
              </li>
              <li>
                <span>Guests</span>
                <strong>{form.guestsPerTable || "Not set yet"}</strong>
              </li>
              <li>
                <span>Menu</span>
                <strong>
                  {form.mainDish}
                  {form.sideDishes.length > 0 && ` • ${form.sideDishes.length} sides`}
                  {form.dessert && ` • ${form.dessert}`}
                </strong>
              </li>
              <li>
                <span>Estimate</span>
                <strong>{amountDue ? `MYR ${amountDue}` : "To be calculated"}</strong>
              </li>
            </ul>
          </div>

          <div className="tips-card">
            <p className="label">Tips</p>
            <h3>Help us confirm faster</h3>
            <ul>
              <li>Use the same email you logged in with so bookings stay linked to your account.</li>
              <li>
                After submitting this form you’ll be taken to the payment page to upload your bank
                transfer receipt.
              </li>
              <li>
                You can always see your status in the Booking History section on the main dashboard.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Booking;

