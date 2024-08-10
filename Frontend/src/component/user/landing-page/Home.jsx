import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppAppBar from './AppAppBar';
import '../css/Home.css';
import MoneyFlowChart from '../MoneyFlowChart';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user-profile', { withCredentials: true });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className='page-wrap'>
      <AppAppBar />
      <section className="home-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-text">Balance</h4>
                  <span className='span'>SGD</span>
                  <p className="balance">
                    ${user.accounts && user.accounts.length > 0 ? user.accounts[0].Balance.toFixed(2) : 'N/A'}
                  </p>
                  <div className="row">
                    <div className="col">
                      <button onClick={() => navigate('/topup')}>Top Up</button>
                    </div>
                    <div className="col">
                      <button onClick={() => navigate('/transfer')}>Transfer</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body">
                  <h4 className="card-text">Transaction History</h4>
                  <p className="card-text">See when funds come in and go out. You can find your recent transaction activities here.</p>
                  
                  <div className="row">
                    <div className="col">
                      <button onClick={() => navigate('/history')}>History</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div className="col-lg-7">
              <div className="card mb-4">
                <div className="card-body">
                  <MoneyFlowChart/>
                </div>
              </div>
              <div className="row">
                {/* Additional row content */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}