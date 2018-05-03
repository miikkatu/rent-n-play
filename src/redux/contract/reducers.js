import { handleAction } from 'redux-actions';

import * as actions from './actions';

export default handleAction(
  actions.setContract,
  (state, action) => action.payload,
  {}
);
