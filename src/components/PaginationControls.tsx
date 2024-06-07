// src/components/PaginationControls.tsx
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onNext, onPrevious }) => {
  return (
    <div>
      <button onClick={onPrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <span> Page {currentPage} of {totalPages} </span>
      <button onClick={onNext} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
