import { createAction } from 'redux-actions';

export const setAccount = createAction('SET_ACCOUNT');
export const setIsOwner = createAction('SET_ISOWNER');

export const dismissTransaction = createAction('DISMISS_TRANSACTION');
export const setTransaction = createAction('SET_TRANSACTION');
