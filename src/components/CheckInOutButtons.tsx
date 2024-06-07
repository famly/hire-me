import React, { useState } from 'react';

interface CheckInOutButtonsProps {
  childId: string;
  checkedIn: boolean;
  onCheckIn: (childId: string, pickupTime: string) => void;
  onCheckOut: (childId: string) => void;
}

const CheckInOutButtons: React.FC<CheckInOutButtonsProps> = ({ childId, checkedIn, onCheckIn, onCheckOut }) => {
  const [pickupTime, setPickupTime] = useState<string>(() => {
    // Set the default pickup time to 1 hour later than the current time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  });

  const handleCheckIn = () => {
    onCheckIn(childId, pickupTime);
  };

  const handleCheckOut = () => {
    onCheckOut(childId);
  };

  return (
    <div>
      {checkedIn ? (
        <button onClick={handleCheckOut}>Check Out</button>
      ) : (
        <div>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
          />
          <button onClick={handleCheckIn}>Check In</button>
        </div>
      )}
    </div>
  );
};

export default CheckInOutButtons;
