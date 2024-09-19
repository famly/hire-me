import { ChildrenReducerAction, ChildrenState } from './types';

export const childrenReducer = (
    state: ChildrenState,
    action: ChildrenReducerAction
) => {
    const { type, payload } = action;

    switch (type) {
        case 'SET_CHILDREN':
            return { children: payload };
        case 'CHECK_IN_CHILD':
            return {
                children: state.children.map((child) =>
                    child.id === payload.id
                        ? {
                              ...child,
                              checkedIn: true,
                              pickupTime: payload.pickupTime,
                          }
                        : child
                ),
            };
        case 'CHECK_OUT_CHILD':
            return {
                children: state.children.map((child) =>
                    child.id === payload.id
                        ? { ...child, checkedIn: false, pickupTime: undefined }
                        : child
                ),
            };
    }
};
