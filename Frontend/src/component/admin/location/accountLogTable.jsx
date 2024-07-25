import React, { useState, useEffect, useMemo } from "react";
import AdminNavBar from "../navbar/adminNavbar";
import "../css/adminNavbar.css";
import {
  GoogleMap,
  useLoadScript,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";

function AccountLogTable({logs}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("LoginTime");

  useEffect(() => {
    console.log(logs);
    setFilteredAccounts(
      logs.filter((account) =>
        Object.values(account).some((value) =>
          value.toString().toLowerCase().includes(filter.toLowerCase())
        )
      )
      
    );
  }, [filter, logs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRequestSort = (property) => (event) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
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
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const columns = [
    { id: "LoginTime", label: "Login Time", minWidth: 170 },
    { id: "LastIPLoginCountry", label: "Last IP Login", minWidth: 150 },
  ];

  const visibleAccounts = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return stableSort(filteredAccounts, comparator).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAccounts, order, orderBy, page, rowsPerPage]);

  return (
    <div>
      <div>Login Time</div>
      <div>Last IP Login</div>
    <div>
      {logs.map((log,idx)=>{
          console.log(log);
          return (<div key = {idx}>
              <div>{JSON.parse(log.LoginTime)}</div>
              <div>{log.LastIPLoginCountry}</div>
          </div>)
      })}
    </div>
    </div>
  );
}

export default AccountLogTable;
