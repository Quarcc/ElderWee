
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#eee' }}>

    <MDBContainer >
      <MDBRow className="d-flex justify-content-center align-items-center">
        <MDBCol md="12" lg="10" xl="8">
          <MDBCard>
            <MDBCardBody className="p-md-5">
              <div className="text-center" >
                <h1 >Top Up</h1>
                <p className="text-muted pb-2">
                  Choose any card to top up your account
                </p>
              </div>
              <div className="px-3 py-4 border border-primary border-2 rounded mt-4 d-flex justify-content-between">
                <div className="d-flex flex-row align-items-center">
                  <div className="d-flex flex-column ms-4">
                    <span className="h4 mb-1">SGD</span>
                    <span className="small text-muted">Balance: ${user.accounts && user.accounts.length > 0 ? user.accounts[0].Balance.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="d-flex flex-row align-items-center">
                  <sup className="dollar font-weight-bold text-muted">$</sup>
                  <MDBInput
                    type="number"
                    // value={}
                    // onChange={handleAmountChange}
                    style={{ width: '100px', margin: '0 10px' }}
                  />
                </div>
              </div>
              <h4 className="mt-5">Payment details</h4>
              <div className="mt-4 d-flex justify-content-between align-items-center">
                <div className="d-flex flex-row align-items-center">
                  <img
                    src="https://i.imgur.com/qHX7vY1.webp"
                    className="rounded"
                    width="70"
                  />
                  <div className="d-flex flex-column ms-3">
                    <span className="h5 mb-1">Credit Card</span>
                    <span className="small text-muted">
                      1234 XXXX XXXX 2570
                    </span>
                  </div>
                </div>
                <MDBInput
                  label="CVC"
                  id="form1"
                  type="text"
                  style={{ width: "70px" }}
                />
              </div>
              <div className="mt-4 d-flex justify-content-between align-items-center">
                <div className="d-flex flex-row align-items-center">
                  <img
                    src="https://i.imgur.com/qHX7vY1.webp"
                    className="rounded"
                    width="70"
                  />
                  <div className="d-flex flex-column ms-3">
                    <span className="h5 mb-1">Credit Card</span>
                    <span className="small text-muted">
                      2344 XXXX XXXX 8880
                    </span>
                  </div>
                </div>
                <MDBInput
                  label="CVC"
                  id="form2"
                  type="text"
                  style={{ width: "70px" }}
                />
              </div>
              <h6 className="mt-4 mb-3 text-primary text-uppercase">
                ADD PAYMENT METHOD
              </h6>
              <MDBInput
                label="Email address"
                id="form3"
                size="lg"
                type="email"
              />
              <MDBBtn block size="lg" className="mt-3">
                {" "}
                Proceed to payment <MDBIcon fas icon="long-arrow-alt-right" />
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
    </div>
  );
}