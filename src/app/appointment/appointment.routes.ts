import { Routes } from '@angular/router';

/**
 * Routes exposed to the shell via Native Federation.
 *
 * The shell mounts these routes under /appointment.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-list-page.component').then(
        (m) => m.AppointmentListPageComponent,
      ),
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./pages/appointment-book-page.component').then(
        (m) => m.AppointmentBookPageComponent,
      ),
  },
  {
    path: 'reschedule/:id',
    loadComponent: () =>
      import('./pages/appointment-reschedule-page.component').then(
        (m) => m.AppointmentReschedulePageComponent,
      ),
  },
  {
    path: 'professional/schedule',
    loadComponent: () =>
      import('./pages/professional-schedule-page.component').then(
        (m) => m.ProfessionalSchedulePageComponent,
      ),
  },
  {
    path: 'professional',
    loadComponent: () =>
      import('./pages/professional-appointment-list-page.component').then(
        (m) => m.ProfessionalAppointmentListPageComponent,
      ),
  },
];