import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Card() {
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // New state for loadingz
  const [cards, setCards] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // Cardholder Name validation
    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    // Card Number validation (simple check for 16 digits)
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry Date validation (MM/YY format)
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryDateRegex.test(expiryDate)) {
      errors.expiryDate = 'Expiry date must be in MM/YY format';
    } else {
      // Check if the expiry date is in the past
      const [month, year] = expiryDate.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100; // Get last two digits of the year
      const currentMonth = new Date().getMonth() + 1; // Get current month (0-indexed, so +1)

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    // CVC validation (simple check for 3 digits)
    const cvcRegex = /^\d{3}$/;
    if (!cvcRegex.test(cvc)) {
      errors.cvc = 'CVC must be 3 digits';
    }

    setErrors(errors);

    // If there are no errors, the form is valid
    return Object.keys(errors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateForm()) return; // Validate form before proceeding
  
    setLoading(true); // Set loading state to true
  
    try {
      await axios.post('http://localhost:8000/add-card', {
        cardNumber,
        cvc,
        expiryDate,
        cardholderName,
      }, { withCredentials: true });
  
      // Refresh the card list
      const updatedCardsResponse = await axios.get('http://localhost:8000/cards', { withCredentials: true });
      setCards(updatedCardsResponse.data);

      // Navigate back to /topup
      navigate('/topup');
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };
  

  return (
    <div>
      <h1>Add Payment Card</h1>
      <div>
        <input
          type="text"
          placeholder="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
        {errors.cardholderName && <p style={{ color: 'red' }}>{errors.cardholderName}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        {errors.cardNumber && <p style={{ color: 'red' }}>{errors.cardNumber}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="Expiry Date (MM/YY)"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        {errors.expiryDate && <p style={{ color: 'red' }}>{errors.expiryDate}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
        />
        {errors.cvc && <p style={{ color: 'red' }}>{errors.cvc}</p>}
      </div>
      <button onClick={handleAddCard} disabled={loading}>
        {loading ? (
          <div className="spinner" style={{ width: '24px', height: '24px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
        ) : (
          'Add Card'
        )}
      </button>

      {/* Adding spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
