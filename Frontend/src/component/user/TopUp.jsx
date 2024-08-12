import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Card from './Card';
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBInput,
  MDBRow,
} from "mdb-react-ui-kit";

export default function TopUp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [showCard, setShowCard] = useState(false); // State to toggle card form

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfileResponse = await axios.get('http://localhost:8000/user-profile', { withCredentials: true });
        setUser(userProfileResponse.data);

        const cardsResponse = await axios.get('http://localhost:8000/cards', { withCredentials: true });
        setCards(cardsResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDeleteCard = async (cardNumber) => {
    if (window.confirm(`Confirm deleting card ending with ${cardNumber.slice(-4)}?`)) {
      try {
        await axios.delete('http://localhost:8000/delete-card', {
          data: { cardNumber }
        }, { withCredentials: true });

        // Refresh the card list
        const updatedCardsResponse = await axios.get('http://localhost:8000/cards', { withCredentials: true });
        setCards(updatedCardsResponse.data);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleCardSelection = (cardNumber) => {
    setSelectedCard(cardNumber);
  };

  const handleProceedToPayment = async () => {
    if (!selectedCard || !amount) {
      setSuccessMessage('Please select a card and enter an amount.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      await axios.post('http://localhost:8000/process-payment', {
        cardNumber: selectedCard,
        amount
      }, { withCredentials: true });

      setSuccessMessage('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      setSuccessMessage('An error occurred while processing the payment');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleCardAdded = () => {
    setShowCard(false); 
    window.location.reload();
    navigate('/topup'); 
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eee' }}>
      <MDBContainer>
        <MDBRow className="d-flex justify-content-center align-items-center">
          <MDBCol md="12" lg="10" xl="8">
            <MDBCard>
              <MDBCardBody className="p-md-5">
                <div className="text-center">
                  <h1>Top Up</h1>
                  <p className="text-muted pb-2">
                    Choose any card to top up your account
                  </p>
                </div>
                <div className="px-3 py-4 border border-primary border-2 rounded mt-4 d-flex justify-content-between">
                  <div className="d-flex flex-row align-items-center">
                    <div className="d-flex flex-column ms-4">
                      <span className="h4 mb-1">SGD</span>
                      <span className="small text-muted">
                        Balance: ${user?.accounts && user.accounts.length > 0 ? user.accounts[0].Balance.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center">
                    <sup className="dollar font-weight-bold text-muted">$</sup>
                    <MDBInput
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ width: '100px', margin: '0 10px' }}
                    />
                  </div>
                </div>
                <h4 className="mt-5">Payment details</h4>
                {cards.map((card, index) => (
                  <div key={index} className="mt-4 d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-row align-items-center">
                      <input
                        type="radio"
                        name="cardSelection"
                        value={card.cardNumber}
                        checked={selectedCard === card.cardNumber}
                        onChange={() => handleCardSelection(card.cardNumber)}
                        style={{ marginRight: '10px' }}
                      />
                      <img src="https://i.imgur.com/qHX7vY1.webp" className="rounded" width="70" alt="Card" />
                      <div className="d-flex flex-column ms-3">
                        <span className="h5 mb-1">Credit Card</span>
                        <span className="small text-muted">
                          {card.cardNumber.replace(/.(?=.{4})/g, 'X')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.cardNumber)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={faTrash} color="red" />
                    </button>
                  </div>
                ))}
                <h6 
                  className="mt-4 mb-3 text-primary" 
                  onClick={() => setShowCard(!showCard)} 
                  style={{ cursor: 'pointer' }} 
                >
                  ADD PAYMENT METHOD
                </h6>

                {showCard && <Card onCardAdded={handleCardAdded} />} {/* Pass the callback */}

                <div className="text-center mt-3">
                  {isLoading && <p>Authenticating...</p>}
                  {successMessage && (
                    <p className={successMessage.includes('failed') ? 'text-danger' : 'text-success'}>
                      {successMessage}
                    </p>
                  )}
                </div>

                <button block size="lg" className="mt-3" onClick={() => navigate('/home')}>
                  Back <MDBIcon fas icon="long-arrow-alt-right" />
                </button>
                <button block size="lg" className="mt-3" onClick={handleProceedToPayment} disabled={isLoading}>
                  Proceed to payment <MDBIcon fas icon="long-arrow-alt-right" />
                </button>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
