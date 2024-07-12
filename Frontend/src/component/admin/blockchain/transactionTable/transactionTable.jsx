import React, {useEffect, useState} from 'react';
import axios from 'axios';
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
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";

import '../../css/adminBC.css';

const APIEndPoint = 'localhost:8000';

const TransactionTable = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('TransactionID'); // default column to sort byr

    useEffect (() => {
        const getTransactions = async () => {
            await axios.get(`http://${APIEndPoint}/api/allTransactions`).then(
                res => {
                    setTransactions(res.data);
                    setLoading(false);
                }
            ).catch(
                error=>{
                    // anything outside the status code 2xx range
                    if(error.response){
                        console.log('Error Response: ' + error.repsonse);
                    }
                    // Request made with no response
                    else if(error.request){
                        console.log('Error Request: ' + error.request);
                    }
                    // Any other error
                    else{
                        console.log('Error Message: ' + error.message);
                    }
                } 
            )  
        }
        getTransactions();
    }, []);

    useEffect(() => {
        setFilteredTransactions(
            transactions.filter(transaction =>
                Object.values(transaction).some(value =>
                    value.toString().toLowerCase().includes(filter.toLowerCase())
                )
            )
        );
    }, [filter, transactions]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleSort = (property) => (event) => {
        const isAsc = orderBy === property && order === 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;  
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const columns = [
        {id: 'TransactionID', label: 'Transaction ID', minWidth: 100},
        {id: 'SenderAccountNo', label: 'Sender Account Number', minWidth: 150},
        {id: 'ReceiverAccountNo', label: 'Receiver Account Number', minWidth: 150},
        {id: 'TransactionDate', label: 'Transaction Date', minWidth: 170},
        {id: 'TransactionAmount', label: 'Amount ($)', minWidth: 100},
        {id: 'TransactionStatus', label: 'Status', minWidth: 100},
        {id: 'TransactionTrace', label: 'Trace', minWidth: 100},
    ];

    const visibleTransactions = React.useMemo(() => {
        const comparator = getComparator(order, orderBy);
        return stableSort(filteredTransactions, comparator).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    }, [filteredTransactions, order, orderBy, page, rowsPerPage])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Toolbar>
                <TextField
                label="Filter"
                variant="outlined"
                size="small"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                />
                <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
                </Tooltip>
            </Toolbar>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    {columns.map(column => (
                        <TableCell
                        key={column.id}
                        align="left"
                        padding="normal"
                        >
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'desc'}
                            onClick={handleSort(column.id)}
                        >
                            {column.label}
                            {orderBy === column.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'asc' ? 'sorted ascending' : 'sorted descending'}
                            </Box>
                            ) : null}
                        </TableSortLabel>
                        </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visibleTransactions.map(transaction => (
                    <TableRow key={transaction.TransactionID} hover role="checkbox" tabIndex={-1}>
                        {columns.map(column => (
                        <TableCell key={column.id} align="left">
                            {column.id === 'TransactionDate' ? formatDate(transaction[column.id]) : transaction[column.id]}
                            {column.id === 'TransactionTrace' && transaction.TransactionStatus === 'Pending' ? (
                                <Button variant="contained" color="primary">Trace</Button>) : null}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPage}
            />
        </Paper>
    );
}

export default TransactionTable;