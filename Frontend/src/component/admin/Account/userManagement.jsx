import React, { useEffect, useState } from 'react';
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from '@mui/material/TextField';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from '@mui/material/Modal';
import { visuallyHidden } from "@mui/utils";

import IconButton from '@mui/material/IconButton';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';

import UpdateUser from './updateUser';
import DeleteUser from './deleteUser';
import '../css/adminAccount.css';

export const UserManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('UserID');

  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        Object.values(user).some(value =>
          value != null && value.toString().toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRequestSort = (property) => (event) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setOpenUpdate(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedUser(null);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedUser(null);
  };

  const handleUpdate = () => {
    fetchUsers();
    handleCloseUpdate();
  };

  const handleDelete = () => {
    fetchUsers();
    handleCloseDelete();
  };

  const columns = [
    { id: 'UserID', label: 'User ID', minWidth: 100 },
    { id: 'FullName', label: 'Full Name', minWidth: 170 },
    { id: 'DOB', label: 'Date Of Birth', minWidth: 100 },
    { id: 'Email', label: 'Email', minWidth: 150 },
    { id: 'PhoneNo', label: 'Phone No.', minWidth: 100 },
    { id: 'Password', label: 'Password', minWidth: 150 },
    { id: 'FaceID', label: 'Face ID', minWidth: 100 },
    { id: 'Actions', label: '', minWidth: 100 }
  ];

  const visibleUsers = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return stableSort(filteredUsers, comparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, order, orderBy, page, rowsPerPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0px 0px rgba(0,0,0,0)', paddingX: 2 }}>
        <Toolbar sx={{ marginBottom: 2 }}>
          <Typography sx={{ flex: '1 1 100%', fontSize: 40 }} variant="h1" id="tableTitle" component="div">
            User Management
          </Typography>
          <TextField
            label="Filter"
            variant="outlined"
            size="small"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </Toolbar>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell sx={{ backgroundColor: '#E8E8E8', fontWeight: 900 }}
                    key={column.id}
                    align="left"
                    padding="normal"
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={handleRequestSort(column.id)}
                      style={{ color: 'black' }}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleUsers.map(user => (
                <TableRow key={user.UserID} hover role="checkbox" tabIndex={-1}>
                  {columns.map(column => {
                    const value = user[column.id];
                    return (
                      <TableCell key={column.id} align="left">
                        {column.id === 'Actions' ? (
                          <div>
                            <IconButton sx={{ backgroundColor: "#fabd05", color: "white", fontWeight: 'bold' }}
                              variant="contained"
                              onClick={() => handleEditClick(user)}
                            >
                              <EditNoteIcon />
                            </IconButton>
                            <IconButton sx={{ backgroundColor: "#d32f2f", color: "white", fontWeight: 'bold', marginLeft: 1 }}
                              variant="contained"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal
        open={openUpdate}
        onClose={handleCloseUpdate}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          {selectedUser && (
            <UpdateUser
              userID={selectedUser.UserID}
              currentFullName={selectedUser.FullName}
              currentDOB={selectedUser.DOB}
              currentEmail={selectedUser.Email}
              currentPhoneNo={selectedUser.PhoneNo}
              userDetails={selectedUser}
              onUpdate={handleUpdate}
              onClose={handleCloseUpdate}
            />
          )}
        </Box>
      </Modal>

      <Modal
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          {selectedUser && (
            <DeleteUser
              userID={selectedUser.UserID}
              userDetails={selectedUser}
              onDelete={handleDelete}
              onClose={handleCloseDelete}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
