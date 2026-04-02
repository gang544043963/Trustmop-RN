import { APP_ENV } from '../config';
import * as mock from './impl/review.mock';
import * as real from './impl/review.real';

const impl = APP_ENV === 'mock' ? mock : real;

export const createReview = (...args: Parameters<typeof mock.createReview>) => impl.createReview(...args);
export const listReviews  = (...args: Parameters<typeof mock.listReviews>)  => impl.listReviews(...args);
