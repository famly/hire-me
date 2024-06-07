import React from 'react';
import { Child } from '../hooks/useChildren';
import CheckInOutButtons from './CheckInOutButtons';

interface ChildListProps {
  children: Child[];
  onCheckIn: (childId: string, pickupTime: string) => void;
  onCheckOut: (childId: string) => void;
}

const ChildList: React.FC<ChildListProps> = ({ children, onCheckIn, onCheckOut }) => {
  console.log('Rendering ChildList with children:', children); // Add this line
  return (
    <ul>
      {children.map((child) => (
        <li key={child.childId}>
          {child.name.fullName} - {child.checkedIn ? 'Checked In' : 'Checked Out'}
          <CheckInOutButtons
            childId={child.childId}
            checkedIn={child.checkedIn}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
          />
        </li>
      ))}
    </ul>
  );
};

export default ChildList;
