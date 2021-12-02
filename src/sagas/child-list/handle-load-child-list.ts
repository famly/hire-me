import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { fetchChildren } from '../../api';
import { API_TOKEN, GROUP_ID, INSTITUTION_ID } from '../../constants';

import {
  loadChildList,
  selectChildList,
  setChildListPage,
} from '../../store/child-list';
import { Child } from '../../types';

export function* handleLoadChildListRequest(): Generator {
  yield takeLatest(loadChildList.request, function* () {
    try {
      const [page, childList] = yield all([
        select(setChildListPage),
        select(selectChildList),
      ]);

      const offset = page === 1 ? 0 : childList.length;

      const children: Child[] = yield call(
        fetchChildren,
        API_TOKEN,
        GROUP_ID,
        INSTITUTION_ID,
        offset,
      );

      yield put(loadChildList.success(children));
    } catch (e) {
      const error = e as Error;

      console.error(error);

      yield put(loadChildList.failure(error.message));
    }
  });
}
