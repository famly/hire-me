import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { checkInChild, checkOutChild, fetchChildren } from './api/api';

interface Child {
  childId: string;
  name: {
    fullName: string;
  };
  checkedIn: boolean;
}

interface State {
  children: Child[];
  currentPage: number;
  childrenPerPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  children: [],
  currentPage: 1,
  childrenPerPage: 10,
  loading: true,
  error: null,
};

type Action =
  | { type: 'SET_CHILDREN'; payload: Child[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CHILDREN':
      return { ...state, children: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log('useEffect called');
    const loadChildren = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const fetchedChildren = await fetchChildren();
        console.log('Fetched Children:', fetchedChildren); // Log the fetched children
        dispatch({ type: 'SET_CHILDREN', payload: fetchedChildren });
      } catch (error) {
        console.error('Error loading children:', error); // Log any errors
        dispatch({ type: 'SET_ERROR', payload: 'Error loading children' });
      }
    };

    loadChildren();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
