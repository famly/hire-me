import { Child } from '../../types/child';
import {
    CheckInChildAction,
    CheckOutChildAction,
    SetChildrenAction,
} from './types';

export const setChildrenAction = (children: Child[]): SetChildrenAction => {
    return { type: 'SET_CHILDREN', payload: children };
};

export const checkInChildAction = (
    id: string,
    pickupTime: Date
): CheckInChildAction => {
    return { type: 'CHECK_IN_CHILD', payload: { id, pickupTime } };
};

export const checkOutChildAction = (id: string): CheckOutChildAction => {
    return { type: 'CHECK_OUT_CHILD', payload: { id } };
};
