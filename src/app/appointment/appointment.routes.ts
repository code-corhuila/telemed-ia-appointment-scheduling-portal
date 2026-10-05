import { Routes } from '@angular/router';

/**
 * Routes exposed to the shell via Native Federation as `./routes`.
 *
 * The shell mounts these at /appointment.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-list-page.component').then(
        (m) => m.AppointmentListPageComponent,
      ),
  },
];
