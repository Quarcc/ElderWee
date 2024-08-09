import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBListGroup,
  MDBListGroupItem,
  MDBInput
} from 'mdb-react-ui-kit';
import AppAppBar from './AppAppBar';

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
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <AppAppBar />
      <section style={{ backgroundColor: '#eee', marginTop: '80px' }}>
        <MDBContainer className="py-5">
          <MDBRow>
            <MDBCol lg="4">
              <MDBCard className="mb-4">
                <MDBCardBody >
                  <MDBCardText>Balance</MDBCardText>
                  <MDBCardText className="text-muted" style={{ fontSize: '35px', fontWeight: 'bold' }}>
                    ${user.accounts && user.accounts.length > 0 ? user.accounts[0].Balance.toFixed(2) : 'N/A'}
                  </MDBCardText>
                  <MDBRow>
                    <MDBCol>
                      <button onClick={() => navigate('/topup')}>Top Up</button>
                    </MDBCol>
                    <MDBCol>
                      <button>Transfer</button>
                    </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>

            </MDBCol>
            <MDBCol lg="7">
              <MDBCard className="mb-4">
                <MDBCardBody>
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Full Name</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                    </MDBCol>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Email</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9" className="d-flex align-items-center">

                    </MDBCol>
                    <div>

                    </div>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Phone</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                    </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>

              <MDBRow>
              </MDBRow>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </div>
  );
}
