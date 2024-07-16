import React, { useState } from 'react';
import { Button, Typography, FormControlLabel, Box, Grid, Switch } from '@mui/material';

const UpdateAccount = ({ accountNo, currentStatus, currentScammer, onUpdate, onClose, accountDetails }) => {
  const [accountStatus, setAccountStatus] = useState(currentStatus);
  const [scammer, setScammer] = useState(currentScammer);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountNo}`, {
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
      width: '700px',
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
        Update Account: {accountNo}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(accountDetails).map(([key, value]) => (
          <Grid item xs={6} key={key}>
            <Typography variant="body1"><strong>{key}:</strong> {value.toString()}</Typography>
          </Grid>
        ))}
        <Grid container spacing={2} marginTop={1}>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.checked)}
                />
              }
              label="Account Status:"
              labelPlacement='start'
              style={{color: "red"}}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={scammer}
                  onChange={(e) => setScammer(e.target.checked)}
                />
              }
              label="Scammer"
              labelPlacement="start"
              style={{color: "red"}}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3}}>
          <Button 
            sx={{
              backgroundColor: "#ffc107",
              fontWeight: 'bold',
              '&:hover': {
                  backgroundColor: "#ffb300",
              },}}
            variant="contained" 
            onClick={handleUpdate}>
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
