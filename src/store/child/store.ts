import { useReducer } from 'react';
import { childrenReducer } from './reducer';

export const useChildrenStore = () => {
    const [state, dispatch] = useReducer(childrenReducer, { children: [] });
    return [state.children, dispatch];
};
