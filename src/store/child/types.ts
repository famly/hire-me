// Types
import { Child } from '../../types/child';

export interface SetChildrenAction {
    type: 'SET_CHILDREN';
    payload: Child[];
}

export interface CheckInChildAction {
    type: 'CHECK_IN_CHILD';
    payload: { id: string; pickupTime: Date };
}

export interface CheckOutChildAction {
    type: 'CHECK_OUT_CHILD';
    payload: { id: string };
}

export interface ChildrenState {
    children: Child[];
}

export type ChildrenReducerAction =
    | SetChildrenAction
    | CheckInChildAction
    | CheckOutChildAction;
