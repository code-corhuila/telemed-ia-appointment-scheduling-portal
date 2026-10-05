import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error('Federation init failed', err))
  .then(() => import('./main'));
