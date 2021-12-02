import { faBed, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { Button, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkInChild,
  checkOutChild,
  loadChildList,
  selectChildList,
  selectChildCheckingIn,
  selectChildListPage,
  selectNextPage,
  setChildListPage,
} from '../../store/child-list';
import { Child } from '../../types';

import './ChildList.css';

export const ChildListItem: React.FC<{ child: Child }> = ({ child }) => {
  const dispatch = useDispatch();
  const isCheckingIn = useSelector(selectChildCheckingIn);

  const handleCheckInChild = () => {
    const pickupTime = '';
    dispatch(
      checkInChild.request({
        childId: child.childId,
        pickupTime,
      }),
    );
  };

  const handleCheckOutChild = () => {
    dispatch(
      checkOutChild.request({
        childId: child.childId,
      }),
    );
  };

  return (
    <ListGroupItem className="list-group-item-action" onClick={() => {}}>
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{child.name?.fullName || '<Missing Name>'}</h5>
        <div>
          <small>
            <FontAwesomeIcon
              icon={faUserCheck}
              style={{ color: child.checkedIn ? '#198754' : '#6c757d' }}
            />
            {` Checked In: ${child.checkedIn ? 'Yes' : 'No'}`}
          </small>
          <br />
          <small>
            <FontAwesomeIcon
              icon={faBed}
              style={{ color: child.isSleeping ? '#198754' : '#6c757d' }}
            />
            {` Sleeping: ${child.isSleeping ? 'Yes' : 'No'}`}
          </small>
        </div>
      </div>
      {!child.image.empty && (
        <img src={child.image.small} alt={child.name?.fullName} />
      )}
      <div className="buttons">
        <Button variant="outline-primary">View Child</Button>
        {!child.checkedIn && (
          <Button
            variant="outline-success"
            disabled={isCheckingIn}
            onClick={handleCheckInChild}
          >
            Check In
          </Button>
        )}
        {child.checkedIn && (
          <Button
            variant="outline-danger"
            disabled={isCheckingIn}
            onClick={handleCheckOutChild}
          >
            Check Out
          </Button>
        )}
      </div>
    </ListGroupItem>
  );
};

export const ChildList: React.FC = () => {
  const dispatch = useDispatch();

  const children = useSelector(selectChildList);
  const page = useSelector(selectChildListPage);
  const hasNext = useSelector(selectNextPage);

  // Load Child List Page One
  useEffect(() => {
    dispatch(loadChildList.request());
  }, [dispatch, page]);

  const loadMore = () => {
    dispatch(setChildListPage(page + 1));
  };

  return (
    <>
      <Row className="py-2">
        <h3>Children List</h3>
      </Row>
      <Row className="py-2">
        <ListGroup>
          {children.map((child) => (
            <ChildListItem key={child.childId} child={child} />
          ))}
        </ListGroup>
      </Row>
      <Row className="py-2">
        <Button onClick={loadMore} disabled={!hasNext}>
          Load More
        </Button>
      </Row>
    </>
  );
};
