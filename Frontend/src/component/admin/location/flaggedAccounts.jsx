import React from 'react';

const FlaggedAccountRow = ({ accNo, name, contactNo, lastLogin, reason }) => {
  return (
    <tr>
      <td>{accNo}</td>
      <td>{name}</td>
      <td>{contactNo}</td>
      <td style={{ color: 'red' }}>{lastLogin}</td>
      <td>{reason}</td>
    </tr>
  );
};

export default FlaggedAccountRow;