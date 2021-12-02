import { createAction, createAsyncAction } from 'typesafe-actions';

import { Child, PlainObject } from '../../types';

export const loadChildList = createAsyncAction(
  'LOAD_CHILD_LIST_REQUEST',
  'LOAD_CHILD_LIST_SUCCESS',
  'LOAD_CHILD_LIST_FAILURE',
)<undefined, Child[], string>();

export const checkInChild = createAsyncAction(
  'CHECK_IN_CHILD_REQUEST',
  'CHECK_IN_CHILD_SUCCESS',
  'CHECK_IN_CHILD_FAILURE',
)<PlainObject, string, string>();

export const checkOutChild = createAsyncAction(
  'CHECK_OUT_CHILD_REQUEST',
  'CHECK_OUT_CHILD_SUCCESS',
  'CHECK_OUT_CHILD_FAILURE',
)<PlainObject, string, string>();

export const setChildListPage = createAction('SET_CHILD_LIST_PAGE')<number>();
