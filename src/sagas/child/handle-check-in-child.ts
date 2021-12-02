import { call, put, takeLatest } from 'redux-saga/effects';
import { ActionType } from 'typesafe-actions';
import { checkInChildRequest } from '../../api';
import { API_TOKEN } from '../../constants';

import { checkInChild } from '../../store/child-list';

export function* handleCheckInChildRequest() {
  yield takeLatest(
    checkInChild.request,
    function* ({ payload }: ActionType<typeof checkInChild.request>) {
      const { childId, pickupTime } = payload;
      try {
        yield call(checkInChildRequest, API_TOKEN, childId, pickupTime);

        yield put(checkInChild.success(childId));
      } catch (e) {
        const error = e as Error;

        console.error(error);

        yield put(checkInChild.failure(error.message));
      }
    },
  );
}
