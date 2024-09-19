import { Dispatch, useReducer } from 'react';
import { childrenReducer } from './reducer';
import { Child } from '../../types/child';
import { ChildrenReducerAction } from './types';

export const useChildrenStore = (): [
    Child[],
    Dispatch<ChildrenReducerAction>
] => {
    const [state, dispatch] = useReducer(childrenReducer, { children: [] });
    return [state.children, dispatch];
};
