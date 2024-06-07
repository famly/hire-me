import React from 'react';
import ChildList from './components/ChildList';
import PaginationControls from './components/PaginationControls';
import useChildren from './hooks/useChildren';

const App: React.FC = () => {
  const { children, loading, error, handleCheckIn, handleCheckOut, currentPage, totalPages, setCurrentPage } = useChildren();

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  console.log('children in App component:', children); // Log children

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Child Management System</h1>
      <ChildList children={children} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
      />
    </div>
  );
};

export default App;
