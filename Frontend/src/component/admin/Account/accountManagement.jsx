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

import UpdateAccount from './updateAccount';
import '../css/adminAccount.css';

export const AccountManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('UserID');

  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/accounts');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAccounts(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredAccounts(
      accounts.filter(account =>
        Object.values(account).some(value =>
          value.toString().toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, accounts]);

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

  const handleEditClick = (account) => {
    setSelectedAccount(account);
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedAccount(null);
  };

  const handleUpdate = () => {
    fetchAccounts();
    handleCloseUpdate();
  };

  const columns = [
    { id: 'AccountNo', label: 'Account No', minWidth: 100 },
    { id: 'Balance', label: 'Balance', minWidth: 170 },
    { id: 'DateOpened', label: 'Date Opened', minWidth: 100 },
    { id: 'AccountStatus', label: 'Account Status', minWidth: 150 },
    { id: 'Scammer', label: 'Scammer', minWidth: 100 },
    { id: 'Actions', label: '', minWidth: 100 }
  ];

  const visibleAccounts = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return stableSort(filteredAccounts, comparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAccounts, order, orderBy, page, rowsPerPage]);

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
                Account Management
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
                    {columns.map((column) => (
                    <TableCell sx={{ backgroundColor: '#E8E8E8', fontWeight: 900 }}
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
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
                    {visibleAccounts.map(account => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={account.AccountNo}>
                        {columns.map((column) => {
                            const value = account[column.id];
                            if (column.id === 'Actions') {
                            return (
                                <TableCell key={column.id} align={column.align}>
                                <IconButton sx={{ backgroundColor: "#fabd05", color: "white", fontWeight: 'bold'}}
                                    variant="contained"
                                    onClick={() => handleEditClick(account)}
                                >
                                    <EditNoteIcon/>
                                </IconButton>
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
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredAccounts.length}
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
          {selectedAccount && (
            <UpdateAccount
              accountNo={selectedAccount.AccountNo}
              currentStatus={selectedAccount.AccountStatus}
              currentScammer={selectedAccount.Scammer}
              accountDetails={selectedAccount}
              onUpdate={handleUpdate}
              onClose={handleCloseUpdate}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
