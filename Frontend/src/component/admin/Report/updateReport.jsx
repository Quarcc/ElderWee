import React, { useState } from 'react';
import { Button, Typography, Box, Grid, FormControlLabel, Checkbox } from '@mui/material';

const UpdateReport = ({ enquiryID, currentStatus, onUpdate, onClose, enquiryDetails = {} }) => {
    // Use a boolean for status to match checkbox checked/unchecked
    const [status, setStatus] = useState(currentStatus);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/enquiries/${enquiryID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ EnquiryStatus: status })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            setSuccess('Enquiry Status Updated Successfully');
            setError(null);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        }
    };

    // Filter out the status field to display only the editable status field
    const filterEnquiryDetails = Object.entries(enquiryDetails).filter(
        ([key]) => key !== 'EnquiryDetails'
    );

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
                Update Enquiry: {enquiryID}
            </Typography>
            <Grid container spacing={2}>
                {filterEnquiryDetails.map(([key, value]) => (
                    <Grid item xs={6} key={key}>
                        <Typography variant="body1">
                            <strong>{key}: </strong>
                            {value.toString()}
                        </Typography>
                    </Grid>
                ))}
                <Grid container spacing={2}>
                    <Grid item xs={12} mt={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                checked={status}
                                onChange={(e) => setStatus(e.target.checked)}
                                />
                            }
                            label="Enquiry Completed"
                            labelPlacement="start"
                            style={{color: "Green"}}
                        />
                    </Grid> 
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        sx={{
                            backgroundColor: "#ffc107",
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: "#ffb300",
                            },}}
                        variant="contained" 
                        onClick={handleUpdate}
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
                    <Grid item xs={12} mt={2}>
                        <Typography color="success">{success}</Typography>
                    </Grid>
                )}
                {error && (
                    <Grid item xs={12} mt={2}>
                        <Typography color="error">{error}</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default UpdateReport;
