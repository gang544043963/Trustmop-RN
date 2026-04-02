import { APP_ENV } from '../config';
import * as mock from './impl/notification.mock';
import * as real from './impl/notification.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const createNotification  = (...args: Parameters<typeof mock.createNotification>)  => impl.createNotification(...args);
export const listNotifications   = (...args: Parameters<typeof mock.listNotifications>)   => impl.listNotifications(...args);
export const markRead            = (...args: Parameters<typeof mock.markRead>)            => impl.markRead(...args);
export const markAllRead         = (...args: Parameters<typeof mock.markAllRead>)         => impl.markAllRead(...args);
export const triggerNotification = (...args: Parameters<typeof mock.triggerNotification>) => impl.triggerNotification(...args);
