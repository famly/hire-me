import { spawn, all } from 'redux-saga/effects';

import { handleLoadChildListRequest } from './handle-load-child-list';

export function* ChildListSaga() {
  yield all([spawn(handleLoadChildListRequest)]);
}
