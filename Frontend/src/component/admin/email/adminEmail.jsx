import React, { useState, useEffect } from "react";
import axios from 'axios'
import AdminNavbar from "../navbar/adminNavbar";

import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import EmailCard from "./card/emailCard";
import EmailTable from "./table/emailTable";

import '../css/adminEmail.css';

const AdminEmail = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        targetEmail: '',
        emailSubject: '',
        emailBody: '',
        attachment: null,
    });
    const [currentData, setCurrentData] = useState({
        targetEmail: '',
        emailSubject: '',
        emailBody: '',
        attachment: null,
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
      
        if (type === 'file') {
          // Handle file input
          const file = files[0] || null;
          setFormData(prevState => ({
            ...prevState,
            [name]: file
          }));
        } else {
          setFormData(prevState => ({
            ...prevState,
            [name]: value || ''
          }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('targetEmail', formData.targetEmail);
        form.append('EmailSubject', formData.emailSubject);
        form.append('EmailBody', formData.emailBody);
        if (document.querySelector('input[type="file"]').files[0]) {
            form.append('EmailAttachment', document.querySelector('input[type="file"]').files[0]);
        }
    
        try {
            // Use POST instead of GET
            await axios.post(`http://localhost:8000/api/massEmail`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            window.location.reload();
            setError('');
        } catch (err) {
            setError('Error Sending Email');
            console.error('Error updating profile:', err);
        }
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    return (
        <>
            <div className="container-fluid">
                <div className="adminNavbar">
                    <AdminNavbar />
                </div>
                <div className="email-bg">
                    <EmailCard />
                    <div className="ms-5 me-5 mt-5 Email-table-bg">
                        <div className="p-3">
                            <div className="d-flex justify-content-between">
                                <h1 className="Email-header" style={{'font-weight': '600'}}>Email History</h1>
                                <div className="d-flex justify-content-center align-items-center">
                                    <Button variant="outlined" className="px-4 py-2" onClick={handleOpen}>Send Email</Button>
                                </div>
                            </div>
                            <EmailTable /> 
                        </div>  
                    </div>
                </div>
            </div>
            <div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" style={{'font-weight': '600'}}>
                        New Email Message
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <input
                            type="text"
                            name="targetEmail"
                            placeholder="Email Target"
                            value={formData.targetEmail}
                            onChange={handleChange}
                            className="emailmessage-input mt-3"
                            style={{ width: '100%' }}
                        />
                        *Target your emails using quotation marks: ""<br />
                        eg: "name" / "gmail.com"
                        <input
                            type="text"
                            name="emailSubject"
                            placeholder="Email Subject"
                            value={formData.emailSubject}
                            onChange={handleChange}
                            className="emailmessage-input mt-4"
                            style={{ width: '100%' }}
                        />
                        <textarea
                            type="text"
                            name="emailBody"
                            placeholder="Email Message"
                            value={formData.emailBody}
                            onChange={handleChange}
                            className="emailmessage-input mt-4"
                            style={{ width: '100%' }}
                        />
                        <input
                            type="file"
                            name="attachment"
                            onChange={handleChange}
                            className="mt-4"
                            style={{ width: '100%' }}
                        />
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <Button variant="contained" onClick={handleClose}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmit}>Send</Button>
                        </div> 
                    </Typography>
                    </Box>
                </Modal>
            </div>
        </>
    )
}

export default AdminEmail;