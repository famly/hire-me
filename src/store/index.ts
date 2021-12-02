import { combineReducers } from 'redux';

import { childListReducer, CHILD_LIST_NS } from './child-list';

export const rootReducer = combineReducers({
  [CHILD_LIST_NS]: childListReducer,
});
