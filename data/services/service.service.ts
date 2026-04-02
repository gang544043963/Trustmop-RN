import { APP_ENV } from '../config';
import * as mock from './impl/service.mock';
import * as real from './impl/service.real';

const impl = APP_ENV === 'mock' ? mock : real;

export type { ServiceWithProvider } from './impl/service.mock';

export const listServices   = (...args: Parameters<typeof mock.listServices>)   => impl.listServices(...args);
export const getService     = (...args: Parameters<typeof mock.getService>)     => impl.getService(...args);
export const createService  = (...args: Parameters<typeof mock.createService>)  => impl.createService(...args);
export const updateService  = (...args: Parameters<typeof mock.updateService>)  => impl.updateService(...args);
