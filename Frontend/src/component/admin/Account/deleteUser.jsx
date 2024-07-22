import React, { useState } from 'react';
import { Button, Typography, Box, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const DeleteUser = ({ userID, userDetails, onDelete, onClose }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            setSuccess('User Deleted Successfully');
            setError(null);
            onDelete();
            onClose();
        } catch (err) {
            setError(err.message);
            setSuccess(null);
        } finally {
            handleClose();
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
            <Typography variant="h5" gutterBottom mb={5} fontWeight={'bold'} fontSize={28} color={'red'}>
                DELETE User: {userID}
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
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        sx={{
                            backgroundColor: "red",
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: "#d32f2f",
                            },
                        }}
                        variant="contained"
                        onClick={handleClickOpen}
                    >
                        Delete
                    </Button>
                    <Button 
                        sx={{
                            backgroundColor: '#9e9e9e',
                            fontWeight: 'bold',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: "#616161",
                            },}}
                        variant="contained"
                        onClick={onClose}>
                        Cancel
                    </Button>
                </Grid>
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle color={'red'} fontWeight={'bold'}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText color={"#212121"}>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        sx={{
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: "#616161",
                            },}}
                        variant='contained'
                        onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        sx={{
                            backgroundColor: "red",
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: "#d32f2f",
                            },
                        }}
                        variant="contained"
                        onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {success && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography color="success">{success}</Typography>
                </Grid>
            )}
            {error && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Grid>
            )}
        </Box>
    );
};

export default DeleteUser;
