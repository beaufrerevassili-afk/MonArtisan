import { setupWorker } from 'msw/browser';
import { authHandlers }   from './handlers/auth';
import { clientHandlers } from './handlers/client';
import { patronHandlers } from './handlers/patron';
import { adminHandlers }  from './handlers/admin';

export const worker = setupWorker(
  ...authHandlers,
  ...clientHandlers,
  ...patronHandlers,
  ...adminHandlers,
);
