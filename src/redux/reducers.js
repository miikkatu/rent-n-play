import { handleActions } from 'redux-actions';

import * as actions from './actions';

const gearList = handleActions(
  {
    [actions.setGearList]: (state, action) => action.payload,
    [actions.setRentedByMe]: (state, action) =>
      state.map(gear => {
        if (action.payload.some(x => x === gear.gearId)) {
          gear.rentedByMe = true;
        } else {
          gear.rentedByMe = false;
        }
        return gear;
      }),
    [actions.rentGear]: (state, action) =>
      state.map(gear => {
        if (gear.gearId === action.payload.id) {
          gear.isRented = true;
          gear.rentedByMe = true;
        }
        return gear;
      }),
    [actions.returnGear]: (state, action) =>
      state.map(gear => {
        if (gear.gearId === action.payload.id) {
          gear.isRented = false;
          gear.rentedByMe = false;
        }
        return gear;
      })
  },
  []
);

const transaction = handleActions(
  {
    [actions.dismissTransaction]: () => {},
    [actions.setTransaction]: (state, action) => action.payload
  },
  {}
);

export default {
  gearList,
  transaction
};
