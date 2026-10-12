import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { AppComponent } from '../app/app.component';
import { routes } from '../app/app.routes';
import { mockAppointmentInterceptor } from './mock-appointment.interceptor';
import { seedMockSession } from './mock-session-seed';

// 1. Seed a fake JWT before the app reads it from sessionStorage.
seedMockSession();

// 2. Bootstrap with the mock interceptor.
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockAppointmentInterceptor])),
  ],
}).catch((err) => console.error('[mock] Bootstrap failed', err));