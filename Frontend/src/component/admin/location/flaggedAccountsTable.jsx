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
import { visuallyHidden } from "@mui/utils";

import '../css/adminAccount.css';

const FlaggedAccountsTable = ({ flaggedAccountData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('AccountNo');

  useEffect(() => {
    setFilteredAccounts(
      flaggedAccountData.filter(account =>
        Object.values(account).some(value =>
          value.toString().toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, flaggedAccountData]);

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

  const columns = [
    { id: 'AccountNo', label: 'Account No', minWidth: 100 },
    { id: 'Name', label: 'Name', minWidth: 170 },
    { id: 'ContactNumber', label: 'Contact Number', minWidth: 150 },
    { id: 'LastIPLogin', label: 'Last IP Login', minWidth: 150 },
    { id: 'Reason', label: 'Reason', minWidth: 150 }
  ];

  const visibleAccounts = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return stableSort(filteredAccounts, comparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAccounts, order, orderBy, page, rowsPerPage]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0px 0px rgba(0,0,0,0)', paddingX: 2 }}>
      <Toolbar sx={{ marginBottom: 2 }}>
        <Typography sx={{ flex: '1 1 100%', fontSize: 40 }} variant="h1" id="tableTitle" component="div">
          Flagged Accounts
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
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {value}
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
        count={filteredAccounts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FlaggedAccountsTable;
