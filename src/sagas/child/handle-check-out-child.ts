import { call, put, takeLatest } from 'redux-saga/effects';
import { ActionType } from 'typesafe-actions';
import { checkOutChildRequest } from '../../api';
import { API_TOKEN } from '../../constants';

import { checkOutChild } from '../../store/child-list';

export function* handleCheckOutChildRequest() {
  yield takeLatest(
    checkOutChild.request,
    function* ({ payload }: ActionType<typeof checkOutChild.request>) {
      const { childId } = payload;
      try {
        yield call(checkOutChildRequest, API_TOKEN, childId);

        yield put(checkOutChild.success(childId));
      } catch (e) {
        const error = e as Error;

        console.error(error);

        yield put(checkOutChild.failure(error.message));
      }
    },
  );
}
