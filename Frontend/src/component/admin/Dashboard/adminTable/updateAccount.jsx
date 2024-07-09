import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Checkbox, FormControlLabel, Box, Grid } from '@mui/material';

const UpdateAccount = ({ accountNo, currentStatus, currentScammer, onUpdate, onClose, accountDetails }) => {
  const [accountStatus, setAccountStatus] = useState(currentStatus);
  const [scammer, setScammer] = useState(currentScammer);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/accounts/${accountNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ AccountStatus: accountStatus, Scammer: scammer })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setSuccess('Account updated successfully');
      setError(null);
      onUpdate(); // Call onUpdate to refresh the account list
      onClose();  // Close the modal after successful update
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <Box sx={{
      width: '400px',
      backgroundColor: '#FAF9F6',
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
      mx: 'auto',
      mt: '10%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h6" gutterBottom>
        Update Account: {accountNo}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(accountDetails).map(([key, value]) => (
          <Grid item xs={12} key={key}>
            <Typography variant="body1"><strong>{key}:</strong> {value.toString()}</Typography>
          </Grid>
        ))}
        <Grid xs={12}>
            <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={accountStatus}
                onChange={(e) => setAccountStatus(e.target.checked)}
              />
            }
            label="Toggle Account Status: "
            labelPlacement='start'
            color='red'
          />
        </Grid>
        <Grid xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={scammer}
                onChange={(e) => setScammer(e.target.checked)}
              />
            }
            label="Toggle Scammer: "
            labelPlacement='start'
          />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="outlined" color="warning" onClick={onClose}>
            Cancel
          </Button>
        </Grid>
        {success && (
          <Grid item xs={12}>
            <Typography color="success.main">{success}</Typography>
          </Grid>
        )}
        {error && (
          <Grid item xs={12}>
            <Typography color="error.main">{error}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UpdateAccount;
