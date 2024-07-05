import React from 'react';
import Button from 'react-bootstrap/Button';

const PlaceHolder = () => {
    return (
        <>
            <Button variant='dark' href='/adminBC'>Blockchain</Button>
            <Button variant='dark' href='/adminDMZ'>DMZ</Button>
            <Button variant='dark' href='/adminDashboard'>Dashboard</Button>
            <Button variant='dark' href='/Login'>User</Button>
        </>
    )
}

export default PlaceHolder