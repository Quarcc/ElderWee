import React from 'react';

const FlaggedAccountRow = ({ accNo, name, contactNo, lastLogin, reason }) => {
  return (
    <tr>
      <td>{accNo}</td>
      <td>{name}</td>
      <td>{contactNo}</td>
      <td>{lastLogin}</td>
      <td>{reason}</td>
    </tr>
  );
};



export default FlaggedAccountRow;