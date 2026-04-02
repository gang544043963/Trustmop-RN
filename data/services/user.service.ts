import { APP_ENV } from '../config';
import * as mock from './impl/user.mock';
import * as real from './impl/user.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const getUser       = (...args: Parameters<typeof mock.getUser>)       => impl.getUser(...args);
export const getUserByPhone = (...args: Parameters<typeof mock.getUserByPhone>) => impl.getUserByPhone(...args);
export const createUser    = (...args: Parameters<typeof mock.createUser>)    => impl.createUser(...args);
export const updateUser    = (...args: Parameters<typeof mock.updateUser>)    => impl.updateUser(...args);
