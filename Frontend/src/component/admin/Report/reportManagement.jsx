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
import UpdateReport from './updateReport'; // Assuming you have an UpdateQuery component

export const ReportManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('EnquiryID');

  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/enquiries');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQueries(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredQueries(
      queries.filter(query =>
        Object.values(query).some(value =>
          value.toString().toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  }, [filter, queries]);

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

  const handleEditClick = (query) => {
    setSelectedQuery(query);
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedQuery(null);
  };

  const handleUpdate = () => {
    fetchQueries();
    handleCloseUpdate();
  };

  const columns = [
    { id: 'EnquiryID', label: 'ID', minWidth: 50 },
    { id: 'EnquiryDate', label: 'Date', minWidth: 100 },
    { id: 'AccountNo', label: 'Account No', minWidth: 150 },
    { id: 'FullName', label: 'Name', minWidth: 100 },
    { id: 'Email', label: 'Email', minWidth: 150 },
    { id: 'EnquiryType', label: 'Type', minWidth: 100 },
    { id: 'EnquiryStatus', label: 'Status', minWidth: 100 },
    { id: 'EnquiryDetails', label: 'Details', minWidth: 200 },
  ];

  const visibleQueries = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return stableSort(filteredQueries, comparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredQueries, order, orderBy, page, rowsPerPage]);

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
            Customer Queries
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
                <TableCell sx={{ backgroundColor: '#E8E8E8', fontWeight: 900 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {visibleQueries.map(query => (
              <TableRow hover role="checkbox" tabIndex={-1} key={query.EnquiryID}>
                {columns.map((column) => {
                  const value = query[column.id];
                  const isStatusColumn = column.id === 'EnquiryStatus';
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {isStatusColumn ? (
                        <span
                          style={{
                            color: value ? 'green' : 'orange',
                            fontWeight: 'bold',
                            backgroundColor: value ? '#d4edda' : '#fff3cd',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}
                        >
                          {value ? 'Completed' : 'Pending'}
                        </span>
                      ) : (
                        column.format && typeof value === 'number' ? column.format(value) : value
                      )}
                    </TableCell>
                  );
                })}
                  <TableCell>
                    <IconButton sx={{ backgroundColor: "#fabd05", color: "white", fontWeight: 'bold'}}
                      variant="contained"
                      onClick={() => handleEditClick(query)}
                    >
                      <EditNoteIcon/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredQueries.length}
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
            alignItems: 'center',
            height: '100vh',
          }}
        >
          {selectedQuery && (
            <UpdateReport
              enquiryID={selectedQuery.EnquiryID}
              currentStatus={selectedQuery.EnquiryStatus}
              onUpdate={handleUpdate}
              onClose={handleCloseUpdate}
              enquiryDetails={selectedQuery}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

