import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';

interface Child {
  childId: string;
  name: {
    fullName: string;
  };
  checkedIn: boolean;
}

interface State {
  children: Child[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  childrenPerPage: number;
}

const initialState: State = {
  children: [],
  loading: true,
  error: null,
  currentPage: 1,
  childrenPerPage: 10,
};

type Action =
  | { type: 'SET_CHILDREN'; payload: Child[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number };

const AppContext = createContext<{ state: State; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CHILDREN':
      console.log('Setting children in state:', action.payload); // Log payload
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log('AppProvider state:', state); // Log state
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
