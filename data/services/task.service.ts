import { APP_ENV } from '../config';
import * as mock from './impl/task.mock';
import * as real from './impl/task.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const listTasks  = (...args: Parameters<typeof mock.listTasks>)  => impl.listTasks(...args);
export const getTask    = (...args: Parameters<typeof mock.getTask>)    => impl.getTask(...args);
export const createTask = (...args: Parameters<typeof mock.createTask>) => impl.createTask(...args);
export const updateTask = (...args: Parameters<typeof mock.updateTask>) => impl.updateTask(...args);
export const cancelTask = (...args: Parameters<typeof mock.cancelTask>) => impl.cancelTask(...args);
