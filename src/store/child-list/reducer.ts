import { ActionType, createReducer } from 'typesafe-actions';

import { PER_PAGE } from '../../constants';
import { Child, ChildListState, State } from '../../types';
import * as actions from './actions';

export const CHILD_LIST_NS = 'child-list';

const findByChildId = (childId: string) => (child: Child) =>
  child.childId === childId;

type ChildListActions = ActionType<typeof actions>;

export const initialState = {
  loading: false,
  checkingIn: false,
  error: null,
  list: [],
  page: 1,
  nextPage: true,
} as ChildListState;

export const childListReducer = createReducer<ChildListState, ChildListActions>(
  initialState,
  {
    LOAD_CHILD_LIST_REQUEST: (state) => ({
      ...state,
      loading: true,
    }),

    LOAD_CHILD_LIST_SUCCESS: (state, { payload }) => ({
      ...state,
      loading: false,
      error: null,
      list: state.page === 0 ? payload : [...state.list, ...payload],
      nextPage: payload.length === PER_PAGE,
    }),

    LOAD_CHILD_LIST_FAILURE: (state, { payload }) => ({
      ...state,
      loading: false,
      error: payload,
    }),

    SET_CHILD_LIST_PAGE: (state, { payload }) => ({
      ...state,
      page: payload,
    }),

    CHECK_IN_CHILD_REQUEST: (state) => ({
      ...state,
      checkingIn: true,
    }),

    CHECK_IN_CHILD_SUCCESS: (state, { payload: childId }) => {
      const i = state.list.findIndex(findByChildId(childId));
      const child = {
        ...state.list[i],
        checkedIn: true,
      };

      return {
        ...state,
        checkingIn: false,
        error: null,
        list: [...state.list.slice(0, i), child, ...state.list.slice(i + 1)],
      };
    },

    CHECK_IN_CHILD_FAILURE: (state, { payload }) => ({
      ...state,
      checkingIn: false,
      error: payload,
    }),

    CHECK_OUT_CHILD_REQUEST: (state) => ({
      ...state,
      checkingIn: true,
    }),

    CHECK_OUT_CHILD_SUCCESS: (state, { payload: childId }) => {
      const i = state.list.findIndex(findByChildId(childId));
      const child = {
        ...state.list[i],
        checkedIn: false,
      };

      return {
        ...state,
        checkingIn: false,
        error: null,
        list: [...state.list.slice(0, i), child, ...state.list.slice(i + 1)],
      };
    },

    CHECK_OUT_CHILD_FAILURE: (state, { payload }) => ({
      ...state,
      checkingIn: false,
      error: payload,
    }),
  },
);

export const selectChildListLoading = (state: State): boolean =>
  state[CHILD_LIST_NS].loading;

export const selectChildCheckingIn = (state: State): boolean =>
  state[CHILD_LIST_NS].checkingIn;

export const selectChildList = (state: State): Child[] =>
  state[CHILD_LIST_NS].list;

export const selectChildListPage = (state: State): number =>
  state[CHILD_LIST_NS].page;

export const selectNextPage = (state: State): boolean =>
  state[CHILD_LIST_NS].nextPage;
