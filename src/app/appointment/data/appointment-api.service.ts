import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointmentPayload,
  Page,
  RescheduleAppointmentPayload,
} from '../model/appointment';
import type { AppointmentStatus } from '../model/appointment';

/**
 * TEMPORARY implementation.
 *
 * The portal reads the access token from sessionStorage (where the shell
 * stores it) and calls the API through the shell's `/api/` proxy, which
 * forwards to the gateway. Once a shared contracts package exists, this
 * service is replaced by the shell's `apiClient`.
 *
 * Endpoints (contract `appointment-service.yaml`):
 *   POST   /appointments/                    create
 *   GET    /appointments/patient/{id}        list by patient (paginated)
 *   GET    /appointments/professional/{id}   list by professional (paginated)
 *   PATCH  /appointments/{id}/cancel         cancel
 *   PATCH  /appointments/{id}/reschedule     reschedule
 *   PATCH  /appointments/{id}/status         update status
 */
@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  private headers(): HttpHeaders {
    const token = sessionStorage.getItem('telemed.access-token');
    const correlationId = crypto.randomUUID();
    let h = new HttpHeaders().set('X-Correlation-Id', correlationId);
    if (token) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  create(
    payload: CreateAppointmentPayload,
    idempotencyKey: string,
  ): Observable<Appointment> {
    const h = this.headers().set('Idempotency-Key', idempotencyKey);
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/`, payload, {
      headers: h,
    });
  }

  listByPatient(
    patientId: number,
    page = 1,
    limit = 20,
  ): Observable<Page<Appointment>> {
    return this.http.get<Page<Appointment>>(
      `${this.baseUrl}/appointments/patient/${patientId}`,
      { headers: this.headers(), params: { page, limit } },
    );
  }

  listByProfessional(
    professionalId: number,
    page = 1,
    limit = 20,
  ): Observable<Page<Appointment>> {
    return this.http.get<Page<Appointment>>(
      `${this.baseUrl}/appointments/professional/${professionalId}`,
      { headers: this.headers(), params: { page, limit } },
    );
  }

  cancel(appointmentId: number, reason: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/cancel`,
      { reason },
      { headers: this.headers() },
    );
  }

  reschedule(
    appointmentId: number,
    payload: RescheduleAppointmentPayload,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/reschedule`,
      payload,
      { headers: this.headers() },
    );
  }

  updateStatus(
    appointmentId: number,
    status: AppointmentStatus,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/status`,
      { status },
      { headers: this.headers() },
    );
  }
}
