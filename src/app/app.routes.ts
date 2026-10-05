import { Routes } from '@angular/router';

/**
 * Standalone router (used when the portal runs on its own, without the
 * shell). Delegates to the domain routes so the URL structure matches
 * what the shell will produce once the remote is mounted at
 * `/appointment`.
 */
export const routes: Routes = [
  {
    path: 'appointment',
    loadChildren: () =>
      import('./appointment/appointment.routes').then((m) => m.routes),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'appointment',
  },
];