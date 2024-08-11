import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AppAppBar from './landing-page/AppAppBar';
import './css/Home.css';

const ContactUs = () => {
    const [enquiryType, setEnquiryType] = useState('');
    const [enquiryDetails, setEnquiryDetails] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
      event.preventDefault();

			const enquiryData = {
					EnquiryType: enquiryType,
					EnquiryDetails: enquiryDetails,
					EnquiryDate: new Date().toISOString(),
			};
	
			console.log('Enquiry Data:', enquiryData); // Log the request payload
	
			try {
					const response = await fetch('http://localhost:8000/api/enquiries', {
							method: 'POST',
							headers: {
									'Content-Type': 'application/json',
							},
							body: JSON.stringify(enquiryData),
							credentials: 'include',
					});

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setSuccess('Your enquiry has been submitted successfully!');
            setError(null);
            setEnquiryType('');
            setEnquiryDetails('');
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    return (
        <div className='contactus-page'>
            <div className='contactus-navbar'>
                <AppAppBar />
            </div>
            <div className='container contactus-container'>
                <Box className='contactus-box' sx={{ padding: 3}}>
                    <Typography variant="h4" gutterBottom>
                        Contact Us
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined" required>
                                    <InputLabel id="enquiry-type-label">Enquiry Type</InputLabel>
                                    <Select
                                        labelId="enquiry-type-label"
                                        value={enquiryType}
                                        onChange={(e) => setEnquiryType(e.target.value)}
                                        label="Enquiry Type"
                                    >
                                        <MenuItem value="Support">Support</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                        <MenuItem value="Technical">Technical</MenuItem>
                                        <MenuItem value="Feedback">Feedback</MenuItem>
                                        <MenuItem value="Complaint">Complaint</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Details"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={enquiryDetails}
                                    onChange={(e) => setEnquiryDetails(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" type="submit">
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    {success && (
                        <Typography color="success.main" mt={2}>
                            {success}
                        </Typography>
                    )}
                    {error && (
                        <Typography color="error.main" mt={2}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </div>
        </div>
    );
};

export default ContactUs;
