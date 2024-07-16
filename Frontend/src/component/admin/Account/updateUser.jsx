import React, { useState } from 'react';
import { Button, Typography, Box, Grid, TextField } from '@mui/material';

const UpdateUser = ({ userID, currentFullName, currentDOB, currentEmail, currentPhoneNo, onUpdate, onClose, userDetails }) => {
    const [FullName, setFullName] = useState(currentFullName);
    const [DOB, setDOB] = useState(currentDOB);
    const [Email, setEmail] = useState(currentEmail);
    const [PhoneNo, setPhoneNo] = useState(currentPhoneNo);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleUpdate = async () => {
        if (!FullName || !DOB || !Email || !PhoneNo) {
            setError('All fields are required.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/users/${userID}`, {
                method: 'PUT',
                headers: { // additional information for server to know format of request
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ FullName, DOB, Email, PhoneNo })
            });

            if (!response.ok) {
                console.log(JSON.stringify({ FullName, DOB, Email, PhoneNo }));
                throw new Error("Network response was not ok");
            }

            setSuccess('User Updated Successfully');
            setError(null);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    const filterUserDetails = Object.entries(userDetails).filter(
        ([key]) => key !== 'resetToken' && key !== 'resetTokenExpiration'
    );

    return (
        <Box sx={{
            width: '900px',
            backgroundColor: '#FAF9F6',
            borderRadius: 2,
            boxShadow: 24,
            p: 6,
            px: 10,
            mx: '10%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography variant="h5" gutterBottom mb={5} fontWeight={'bold'} fontSize={28} color={"orange"}>
                Update User: {userID}
            </Typography>
            <Grid container spacing={2}>
                {filterUserDetails.map(([key, value]) => (
                    <Grid item xs={4} key={key}>
                        <Typography variant="body1">
                            <strong>{key}: </strong>
                            {value.toString()}
                        </Typography>
                    </Grid>
                ))}
                <Grid container rowSpacing={2} columnSpacing={2} mt={2}>
                    <Grid item xs={6}>
                        <TextField
                            required
                            id="outlined-fullname"
                            label="Full Name"
                            value={FullName}
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            id="outlined-dob"
                            label="Date of Birth"
                            value={DOB}
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setDOB(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            id="outlined-email"
                            label="Email"
                            value={Email}
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            id="outlined-phone"
                            label="Phone Number"
                            value={PhoneNo}
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setPhoneNo(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        sx={{
                            backgroundColor: "#ffc107",
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: "#ffb300",
                            },}}
                        variant="contained" 
                        onClick={handleUpdate}
                        disabled={!FullName || !DOB || !Email || !PhoneNo}
                    >
                        Update
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: "#616161",
                            },}}
                        variant="contained"
                        onClick={onClose}>
                        Cancel
                    </Button>
                </Grid>
                {success && (
                    <Grid item xs={12}>
                        <Typography color="success">{success}</Typography>
                    </Grid>
                )}
                {error && (
                    <Grid item xs={12}>
                        <Typography color="error">{error}</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default UpdateUser;
