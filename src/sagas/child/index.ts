import { spawn, all } from 'redux-saga/effects';

import { handleCheckInChildRequest } from './handle-check-in-child';
import { handleCheckOutChildRequest } from './handle-check-out-child';

export function* ChildSaga(): Generator {
  yield all([
    spawn(handleCheckInChildRequest),
    spawn(handleCheckOutChildRequest),
  ]);
}
