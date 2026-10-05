import { Routes } from '@angular/router';

import { AppointmentPageComponent } from './pages/appointment-page.component';

import { AppointmentListPageComponent } from './pages/appointment-list-page.component';

/**
 * Routes exposed to the shell via Native Federation as `./routes`.
 *
 * The shell mounts these at /appointment.
 */
export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-list-page.component').then(
        (m) => m.AppointmentListPageComponent,
      ),
  },
  {
    path: 'professional',
    loadComponent: () =>
      import('./pages/professional-appointment-list-page.component').then(
        (m) => m.ProfessionalAppointmentListPageComponent,
      ),
    component: AppointmentListPageComponent,
  },
];