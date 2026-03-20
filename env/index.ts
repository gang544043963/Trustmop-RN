import { environment as release } from './release';
import { environment as develop } from './develop';
import { environment as mock } from './mock';

const ENV = process.env.EXPO_PUBLIC_ENV || 'develop';

export const config = ENV === 'release' 
  ? release 
  : ENV === 'mock' 
  ? mock 
  : develop;