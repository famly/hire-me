import React from 'react';
import { useAppContext } from './AppContext';
import ChildList from './components/ChildList';
import { checkInChild, checkOutChild, fetchChildren } from './api/api'; // Ensure these imports are present

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { children, currentPage, childrenPerPage, loading, error } = state;

  const handleCheckIn = async (childId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await checkInChild(childId);
      const fetchedChildren = await fetchChildren();
      dispatch({ type: 'SET_CHILDREN', payload: fetchedChildren });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error checking in child' });
    }
  };

  const handleCheckOut = async (childId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await checkOutChild(childId);
      const fetchedChildren = await fetchChildren();
      dispatch({ type: 'SET_CHILDREN', payload: fetchedChildren });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error checking out child' });
    }
  };

  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;
  const currentChildren = children.slice(indexOfFirstChild, indexOfLastChild);

  const totalPages = Math.ceil(children.length / childrenPerPage);

  const paginateNext = () => {
    if (currentPage < totalPages) {
      dispatch({ type: 'SET_PAGE', payload: currentPage + 1 });
    }
  };

  const paginatePrevious = () => {
    if (currentPage > 1) {
      dispatch({ type: 'SET_PAGE', payload: currentPage - 1 });
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
