import React, { useEffect, useState } from 'react';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import '../../css/adminDashboard.css';

export const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const filteredData = data.filter(user => user.UserID !== 999);
        const sortedUsers = filteredData.sort((a, b) => b.UserID - a.UserID).slice(0, 10);
        setUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { id: 'UserID', label: 'User ID', minWidth: 100 },
    { id: 'FullName', label: 'Full Name', minWidth: 170 },
    { id: 'DOB', label: 'Date Of Birth', minWidth: 100 },
    { id: 'Email', label: 'Email', minWidth: 150 },
    { id: 'PhoneNo', label: 'Phone No.', minWidth: 100 },
    { id: 'Password', label: 'Password', minWidth: 150 },
    { id: 'FaceID', label: 'Face ID', minWidth: 100 },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '20px' }}>
      <Toolbar sx={{ margin: 2}}>
        <Typography sx={{ flex: '1 1 100%', fontSize: 40 }} variant="h1" id="tableTitle" component="div">
          Latest Users
        </Typography>
      </Toolbar>
      <TableContainer sx={{ marginBottom: 3 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align="left"
                  padding="normal"
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.UserID} hover role="checkbox" tabIndex={-1}>
                {columns.map(column => (
                  <TableCell key={column.id} align="left">
                    {user[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
