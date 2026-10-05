import { Routes } from '@angular/router';
<<<<<<< Updated upstream
import { AppointmentPageComponent } from './pages/appointment-page.component';

/**
 * Routes exposed to the shell via Native Federation as `./routes`.
 *
 * The shell mounts this at /appointment. If your team's portal has more
 * pages, add them here as children of the root path.
 */
export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppointmentPageComponent,
=======

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-list-page.component').then(
        (m) => m.AppointmentListPageComponent,
      ),
>>>>>>> Stashed changes
  },
  {
    path: 'professional',
    loadComponent: () =>
      import('./pages/professional-appointment-list-page.component').then(
        (m) => m.ProfessionalAppointmentListPageComponent,
      ),
  },
];