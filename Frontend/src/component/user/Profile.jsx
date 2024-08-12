import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import AppAppBar from './landing-page/AppAppBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [profileImage, setProfileImage] = useState(null);

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

  const profilePicStyle = {
    width: '150px', /* Set the desired width */
    height: '150px', /* Set the desired height */
    borderRadius: '50%', /* Make the image a circle */
    overflow: 'hidden', /* Hide parts of the image that overflow the container */
    display: 'flex', /* Center the image */
    justifyContent: 'center',
    alignItems: 'center'
  };
  
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' /* Ensure the image covers the container */
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setNewEmail('');
    setOtp('');
    setOtpSent(false);
    setMessage('');
    setError(null);
    setEmailError('');
    setOtpError('');
    setProfileImage(null);
  };

  const handleEmailChange = async () => {
    setEmailError('');
    setMessage('');

    if (newEmail === user.Email) {
      setEmailError('New email cannot be the same as the old email.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/check-email', { newEmail }, { withCredentials: true });
      if (response.data.exists) {
        setEmailError('Email is already in use.');
      } else {
        await axios.post('http://localhost:8000/send-otp', { newEmail }, { withCredentials: true });
        setOtpSent(true);
        setMessage('OTP sent to new email.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/verify-otp', { newEmail, otp }, { withCredentials: true });
      if (response.status === 200) {
        setUser(prevUser => ({ ...prevUser, Email: newEmail }));
        setEditMode(false);
        setNewEmail('');
        setOtp('');
        setOtpSent(false);
        setMessage('Email updated successfully.');
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        if (err.response.data.error === 'OTP expired') {
          setOtpError('OTP has expired. Please request a new OTP.');
        } else if (err.response.data.error === 'OTP does not match') {
          setOtpError('The OTP you entered does not match.');
        } else {
          setOtpError('An error occurred. Please try again.');
        }
      } else {
        setError(err.message);
      }
    }
  };

  const handleProfileImageChange = (event) => {
    setProfileImage(event.target.files[0]);
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) {
      setError('Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', profileImage);

    try {
      const response = await axios.post('http://localhost:8000/upload-profile-image', formData, { withCredentials: true });
      const imageUrl = `http://localhost:8000/uploads/${response.data.profilePic}`;
      setUser(prevUser => ({ ...prevUser, profilePic: imageUrl }));
      setMessage('Profile image updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <AppAppBar />
      <section style={{ backgroundColor: '#eee', marginTop: '80px' }}>
        <MDBContainer className="py-5">
          <MDBRow>
            <MDBCol lg="3">
              <MDBCard className="mb-4">
                <MDBCardBody className="text-center">
                  <MDBCardImage
                    src={user.profilePic ? `${user.profilePic}?${new Date().getTime()}` : "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"}
                    alt="avatar"
                    className="rounded-circle"
                    style={profilePicStyle}
                    imgStyle={imageStyle}
                    fluid
                  />

                  <input
                    type="file"
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    style={{ marginTop: '10px' }}
                  />
                  <button onClick={handleUploadProfileImage} style={{ marginTop: '10px' }}>Upload Profile Image</button>
                  <p className="text-muted mb-1">Account Number: {user.accounts && user.accounts.length > 0 ? user.accounts[0].AccountNo : 'N/A'}</p>
                </MDBCardBody>
              </MDBCard>

              <MDBCard className="mb-4 mb-lg-0">
                <MDBCardBody className="p-0">
                  <MDBListGroup flush className="rounded-3">
                    <MDBListGroupItem className="d-flex justify-content-between align-items-center p-3">
                      <Link to="/forgot">
                        <MDBCardText>Forgot Password</MDBCardText>
                      </Link>
                    </MDBListGroupItem>
                  </MDBListGroup>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol lg="9">
              <MDBCard className="mb-4">
                <MDBCardBody>
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Full Name</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      <MDBCardText className="text-muted">{user.FullName}</MDBCardText>
                    </MDBCol>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Email</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9" className="d-flex align-items-center">
                      {editMode ? (
                        <>
                          <MDBInput
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                          />
                          <button onClick={handleEmailChange}>Send OTP</button>
                          {otpSent && (
                            <>
                              <MDBInput
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                              />
                              <button onClick={handleVerifyOtp}>Verify OTP</button>
                            </>
                          )}
                          <button onClick={handleCancelClick} outline className="ms-1">Cancel</button>
                        </>
                      ) : (
                        <>
                          <MDBCardText className="text-muted">{user.Email}</MDBCardText>
                          <FontAwesomeIcon icon={faPen} onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '8px' }} />
                        </>
                      )}
                    </MDBCol>
                    <div>
                      {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                      {otpError && <p style={{ color: 'red' }}>{otpError}</p>}
                      {message && <p style={{ color: 'green' }}>{message}</p>}
                    </div>
                  </MDBRow>
                  <hr />
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Phone</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      <MDBCardText className="text-muted">{user.PhoneNo}</MDBCardText>
                    </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>

              <MDBRow>
                <MDBCol>
                  <MDBCard className="mb-4 mb-md-0">
                  </MDBCard>
                </MDBCol>
              </MDBRow>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </div>
  );
}
