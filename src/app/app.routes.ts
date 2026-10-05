import { Routes } from '@angular/router';
import { AppointmentPageComponent } from './appointment/pages/appointment-page.component';

/**
 * Routes for local development of the portal.
 *
 * In production, the shell mounts the portal at /appointment and
 * consumes this same component tree via federation.
 */
export const routes: Routes = [
  {
    path: 'appointment',
    component: AppointmentPageComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'appointment',
  },
];
