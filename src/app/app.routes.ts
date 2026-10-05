import { Routes } from '@angular/router';
import { AppointmentListPageComponent } from './appointment/pages/appointment-list-page.component';

export const routes: Routes = [
  {
    path: 'appointment',
    component: AppointmentListPageComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'appointment',
  },
];
