import React from 'react';
import { makeStyles } from '@material-ui/core';

const Pagination = ({ pageNumber, handlePrev, handleNext }) => {
  const useStyles = makeStyles({
    pagination: {
      display: 'flex',
      height: 30,
      width: '100%',
      justifyContent: 'center',
    },
  });

  const classes = useStyles();

  return (
    <div className={classes.pagination}>
      <button onClick={handlePrev}>prev</button>
      <div>Page {pageNumber} </div>
      <button onClick={handleNext}>next</button>
    </div>
  );
};

export default Pagination;
