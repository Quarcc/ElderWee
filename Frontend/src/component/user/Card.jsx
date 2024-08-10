import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Card.css'

export default function Card({ onCardAdded }) { // Add onCardAdded as a prop
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryDateRegex.test(expiryDate)) {
      errors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      const [month, year] = expiryDate.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    const cvcRegex = /^\d{3}$/;
    if (!cvcRegex.test(cvc)) {
      errors.cvc = 'CVC must be 3 digits';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateForm()) return;
  
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/add-card', {
        cardNumber,
        cvc,
        expiryDate,
        cardholderName,
      }, { withCredentials: true });

      // Call the callback to notify the parent component (TopUp.jsx)
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-container">
      <div className="card-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Cardholder Name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="form-input"
          />
          {errors.cardholderName && <p className="error-message">{errors.cardholderName}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="form-input"
          />
          {errors.cardNumber && <p className="error-message">{errors.cardNumber}</p>}
        </div>
        <div className="form-row">
          <div className="form-group half-width">
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="form-input"
            />
            {errors.expiryDate && <p className="error-message">{errors.expiryDate}</p>}
          </div>
          <div className="form-group half-width">
            <input
              type="text"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="form-input"
            />
            {errors.cvc && <p className="error-message">{errors.cvc}</p>}
          </div>
        </div>
        <button onClick={handleAddCard} disabled={loading} className="submit-button">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            'Add Card'
          )}
        </button>
      </div>
    </div>
  );
}
