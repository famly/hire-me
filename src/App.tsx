import React, { useEffect, useState } from 'react';
import { checkInChild, checkOutChild, fetchChildren } from './api/api';
import ChildList from './components/ChildList'

interface Child {
  id: string;
  fullName: string;
  checkedIn: boolean;
}

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [childrenPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedChildren = await fetchChildren();
      setChildren(fetchedChildren);
    } catch (error) {
      setError('Error loading children');
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (childId: string) => {
    setError(null);
    try {
      await checkInChild(childId);
      loadChildren();
    } catch (error) {
      setError('Error checking in child');
      console.error('Error checking in child:', error);
    }
  };

  const handleCheckOut = async (childId: string) => {
    setError(null);
    try {
      await checkOutChild(childId);
      loadChildren();
    } catch (error) {
      setError('Error checking out child');
      console.error('Error checking out child:', error);
    }
  };

  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;
  const currentChildren = children.slice(indexOfFirstChild, indexOfLastChild);

  const totalPages = Math.ceil(children.length / childrenPerPage);

  const paginateNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginatePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1>Nursery Attendance</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <ChildList children={currentChildren} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
          <div>
            <button onClick={paginatePrevious} disabled={currentPage === 1}>
              Previous
            </button>
            <button onClick={paginateNext} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
