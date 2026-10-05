import { Routes } from '@angular/router';
import { AppointmentListPageComponent } from './pages/appointment-list-page.component';

/**
 * Routes exposed to the shell via Native Federation as `./routes`.
 *
 * The shell mounts these at /appointment.
 */
export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    component: AppointmentListPageComponent,
  },
];
