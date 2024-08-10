import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppAppBar from './AppAppBar';
import "../css/LandingPage.css"

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='page-wrapper'>
      <AppAppBar/> 
      <div className="landing-container">
        <div className="content-container">
          <div className="text-stack">
            <h1 className="main-title">
              ElderWee
              <span className="highlight">Banking App</span>
            </h1>
            <p className="description">
              Designed with seniors in mind, ElderWee offers a simple, secure, and user-friendly experience.
              Embrace the convenience and reliability of ElderWee Banking App – banking made easy, just for you!
            </p>
            <div className="input-group">
              <input
                type="email"
                id="email"
                aria-label="Enter your email address"
                placeholder="Your email address"
                autoComplete="off"
              />
              <button className="start-button" onClick={() => navigate('/signup')}>
                Start now
              </button>
            </div>
            <p className="terms">
              By clicking "Start now" you agree to our
              <a href="#" className="terms-link">Terms & Conditions</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;