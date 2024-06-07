import { useEffect, useCallback } from 'react';
import { fetchChildren, checkInChild, checkOutChild } from '../api/api';
import { useAppContext } from '../context/AppContext';

export interface Child {
  childId: string;
  name: {
    fullName: string;
  };
  checkedIn: boolean;
}

const useChildren = () => {
  const { state, dispatch } = useAppContext();

  const loadChildren = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const fetchedChildren = await fetchChildren();
      console.log('Fetched children in hook:', fetchedChildren); // Log fetched children
      dispatch({ type: 'SET_CHILDREN', payload: fetchedChildren });
    } catch (error) {
      console.error('Error loading children in hook:', error); // Log error
      dispatch({ type: 'SET_ERROR', payload: 'Error loading children' });
    }
  }, [dispatch]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleCheckIn = useCallback(async (childId: string, pickupTime: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await checkInChild(childId, pickupTime);
      await loadChildren();
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Error checking in child' });
    }
  }, [dispatch, loadChildren]);

  const handleCheckOut = useCallback(async (childId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await checkOutChild(childId);
      await loadChildren();
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Error checking out child' });
    }
  }, [dispatch, loadChildren]);

  // Pagination logic
  const indexOfLastChild = state.currentPage * state.childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - state.childrenPerPage;
  const currentChildren = state.children.slice(indexOfFirstChild, indexOfLastChild);
  const totalPages = Math.ceil(state.children.length / state.childrenPerPage);

  console.log('Current children in hook:', currentChildren); // Log current children

  return { 
    children: currentChildren, 
    loading: state.loading, 
    error: state.error, 
    handleCheckIn, 
    handleCheckOut, 
    currentPage: state.currentPage, 
    totalPages, 
    setCurrentPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }) 
  };
};

export default useChildren;
