import { createAction } from 'redux-actions';

export const dismissTransaction = createAction('DISMISS_TRANSACTION');
export const setTransaction = createAction('SET_TRANSACTION');

export const setGearList = createAction('SET_GEAR_LIST');
export const setRentedByMe = createAction('SET_RENTED_BY_ME');

export const rentGear = createAction('RENT_GEAR');
export const returnGear = createAction('RETURN_GEAR');
