import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

import UpdateAccount from './updateAccount'; // Ensure this path is correct
import '../../css/adminDashboard.css';

export const AccountTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/accounts');
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAccounts(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEditClick = (account) => {
    setSelectedAccount(account);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAccount(null);
  };

  const handleUpdate = () => {
    fetchAccounts();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    { id: 'AccountNo', label: 'Account No', minWidth: 100 },
    { id: 'Balance', label: 'Balance', minWidth: 170 },
    { id: 'DateOpened', label: 'Date Opened', minWidth: 100 },
    { id: 'AccountStatus', label: 'Account Status', minWidth: 150 },
    { id: 'Scammer', label: 'Scammer', minWidth: 100 },
    { id: 'Actions', label: 'Actions', minWidth: 100 }
  ];

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '20px' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((account) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={account.AccountNo}>
                      {columns.map((column) => {
                        const value = account[column.id];
                        if (column.id === 'Actions') {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleEditClick(account)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.id === 'AccountStatus' || column.id === 'Scammer'
                                ? value ? 'True' : 'False'
                                : column.format && typeof value === 'number'
                                  ? column.format(value)
                                  : value}
                            </TableCell>
                          );
                        }
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={accounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal
        open={open}
        onClose={handleClose}
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
          {selectedAccount && (
            <UpdateAccount
              accountNo={selectedAccount.AccountNo}
              currentStatus={selectedAccount.AccountStatus}
              currentScammer={selectedAccount.Scammer}
              accountDetails={selectedAccount}
              onUpdate={handleUpdate}
              onClose={handleClose}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
