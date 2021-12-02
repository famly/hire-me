import { spawn, all } from 'redux-saga/effects';

import { handleLoadChildListRequest } from './handle-load-child-list';

export function* ChildListSaga(): Generator {
  yield all([spawn(handleLoadChildListRequest)]);
}
