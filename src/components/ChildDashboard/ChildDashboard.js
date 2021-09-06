import React from "react";

import {
  Button,
  Card,
  CardContent,
  Typography,
  CardActions,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
});

const ChildDashboard = ({ data, checkOperation }) => {
  const classes = useStyles();

  const { childId, checkedIn, name, image } = data;

  const { fullName } = name;

  const handleClick = () => {
    checkOperation(childId, checkedIn);
  };

  return (
    <div className='childSummary'>
      <div>
        <Card className={classes.root}>
          <CardContent>
            <Typography className={classes.title} color='body1' gutterBottom>
              {fullName}
            </Typography>
            <img src={image.small} alt={fullName} />
          </CardContent>
          <CardActions>
            <Button
              variant='contained'
              color={checkedIn ? "secondary" : "primary"}
              onClick={handleClick}
            >
              {checkedIn ? "Check Out" : "Check In"}
            </Button>
          </CardActions>
        </Card>
      </div>
    </div>
  );
};

export default ChildDashboard;
