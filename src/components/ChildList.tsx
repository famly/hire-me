import React from 'react';

interface Child {
  id: string;
  fullName: string;
  checkedIn: boolean;
}

interface ChildListProps {
  children: Child[];
  onCheckIn: (childId: string) => void;
  onCheckOut: (childId: string) => void;
}

const ChildList: React.FC<ChildListProps> = ({ children, onCheckIn, onCheckOut }) => {
  const handleButtonClick = (child: Child) => {
    if (child.checkedIn) {
      onCheckOut(child.id);
    } else {
      onCheckIn(child.id);
    }
  };

  return (
    <ul>
      {children.map((child) => (
        <li key={child.id}>
          {child.fullName} - {child.checkedIn ? 'Checked In' : 'Checked Out'}
          <button onClick={() => handleButtonClick(child)}>
            {child.checkedIn ? 'Check Out' : 'Check In'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChildList;
