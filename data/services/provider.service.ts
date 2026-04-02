import { APP_ENV } from '../config';
import * as mock from './impl/provider.mock';
import * as real from './impl/provider.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const getProvider        = (...args: Parameters<typeof mock.getProvider>)        => impl.getProvider(...args);
export const getProviderByPhone = (...args: Parameters<typeof mock.getProviderByPhone>) => impl.getProviderByPhone(...args);
export const createProvider     = (...args: Parameters<typeof mock.createProvider>)     => impl.createProvider(...args);
export const updateProvider     = (...args: Parameters<typeof mock.updateProvider>)     => impl.updateProvider(...args);
export const listProviders      = (...args: Parameters<typeof mock.listProviders>)      => impl.listProviders(...args);
