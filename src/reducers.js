import { routerReducer } from 'react-router-redux';

import { app, contract, items, web3 } from './redux';

export const reducers = {
  app: app.reducer,
  contract: contract.reducer,
  items: items.reducer,
  router: routerReducer,
  web3: web3.reducer
};
