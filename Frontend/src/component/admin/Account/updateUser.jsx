import React, { useState } from 'react';
import { Button, Typography, FormControlLabel, Box, Grid, TextField } from '@mui/material';

const UpdateUser = ({ userID, currentFullName, currentDOB, currentEmail, currentPhoneNo, onUpdate, onClose, userDetails }) => {
    const [FullName, setFullName] = useState(currentFullName);
    const [DOB, setDOB] = useState(currentDOB);
    const [Email, setEmail] = useState(currentEmail);
    const [PhoneNo, setPhoneNo] = useState(currentPhoneNo);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleUpdate = async () => {
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

            setSuccess('User Upated Successfully');
            setError(null);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    return (
        <Box>
            <Typography>
                Update User: {userID}
            </Typography>
            <Grid>
                {Object.entries(userDetails).map(([key, value]) => (
                    <Grid key={key}>
                        <Typography>
                            <strong>{key}</strong>
                            {value.toString()}
                        </Typography>
                    </Grid>
                ))}
                <Grid>
                    <TextField
                    required
                    id="outlined-required"
                    label="Required"
                    value= {FullName}
                    variant= "outlined"
                    onChange = {(e) => setFullName(e.target.value)}
                    />
                </Grid>
                <Grid>
                    <TextField
                    required
                    id="outlined-required"
                    label="Required"
                    value= {DOB}
                    variant= "outlined"
                    onChange = {(e) => setDOB(e.target.value)}
                    />
                </Grid>
                <Grid>
                    <TextField
                    required
                    id="outlined-required"
                    label="Required"
                    value= {Email}
                    variant= "outlined"
                    onChange = {(e) => setEmail(e.target.value)}
                    />
                </Grid>
                <Grid>
                    <TextField
                    required
                    id="outlined-required"
                    label="Required"
                    value= {PhoneNo}
                    variant= "outlined"
                    onChange = {(e) => setPhoneNo(e.target.value)}
                    />
                </Grid>
                <Grid>
                    <Button onClick={handleUpdate}>
                        Update
                    </Button>
                    <Button  onClick={onClose}>
                        Cancel
                    </Button>
                </Grid>
                {success && (
                    <Grid>
                        <Typography>{success}</Typography>
                    </Grid>
                )}
                {error && (
                    <Grid>
                        <Typography>{error}</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default UpdateUser