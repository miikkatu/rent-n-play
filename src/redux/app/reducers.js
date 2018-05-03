import { combineReducers } from 'redux';
import { handleAction, handleActions } from 'redux-actions';

import * as actions from './actions';

const account = handleAction(
  actions.setAccount,
  (state, action) => action.payload,
  ''
);

const isOwner = handleAction(
  actions.setIsOwner,
  (state, action) => action.payload,
  false
);

const transaction = handleActions(
  {
    [actions.dismissTransaction]: () => {},
    [actions.setTransaction]: (state, action) => action.payload
  },
  {}
);

export default combineReducers({
  account,
  isOwner,
  transaction
});
