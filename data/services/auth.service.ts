import { APP_ENV } from '../config';
import * as mock from './impl/auth.mock';
import * as real from './impl/auth.real';

const impl = APP_ENV === 'mock' ? mock : real;

export type { OtpEntry } from './impl/auth.mock';
export const delay = mock.delay;
export const sendOtp  = (...args: Parameters<typeof mock.sendOtp>)  => impl.sendOtp(...args);
export const verifyOtp = (...args: Parameters<typeof mock.verifyOtp>) => impl.verifyOtp(...args);
export const logout   = (...args: Parameters<typeof mock.logout>)   => impl.logout(...args);
