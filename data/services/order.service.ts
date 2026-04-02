import { APP_ENV } from '../config';
import * as mock from './impl/order.mock';
import * as real from './impl/order.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const createOrder         = (...args: Parameters<typeof mock.createOrder>)         => impl.createOrder(...args);
export const getOrder            = (...args: Parameters<typeof mock.getOrder>)            => impl.getOrder(...args);
export const listOrders          = (...args: Parameters<typeof mock.listOrders>)          => impl.listOrders(...args);
export const updateOrderStatus   = (...args: Parameters<typeof mock.updateOrderStatus>)   => impl.updateOrderStatus(...args);
export const addCompletionPhotos = (...args: Parameters<typeof mock.addCompletionPhotos>) => impl.addCompletionPhotos(...args);
export const mockPay             = (...args: Parameters<typeof mock.mockPay>)             => impl.mockPay(...args);
export const mockRelease         = (...args: Parameters<typeof mock.mockRelease>)         => impl.mockRelease(...args);
export const mockRefund          = (...args: Parameters<typeof mock.mockRefund>)          => impl.mockRefund(...args);
