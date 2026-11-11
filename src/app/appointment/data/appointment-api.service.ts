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
import type { AccountNames, ProfessionalListPage } from '../model/people';

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
 *   GET    /appointments/{id}                get by id
 *   GET    /appointments/patient/{id}        list by patient (paginated)
 *   GET    /appointments/professional/{id}   list by professional (paginated)
 *   PATCH  /appointments/{id}/cancel         cancel
 *   PATCH  /appointments/{id}/reschedule     reschedule
 *   PATCH  /appointments/{id}/status         update status
 *
 * Names (appointments carry only account ids):
 *   GET    /professionals                    professionals, with their names
 *   GET    /auth/accounts/names?ids=         patient names (identity DEC-013)
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

  /** One page of up to 100 professionals; `fullName` comes from identity. */
  listProfessionals(): Observable<ProfessionalListPage> {
    return this.http.get<ProfessionalListPage>(`${this.baseUrl}/professionals`, {
      headers: this.headers(),
      params: { page: 1, limit: 100 },
    });
  }

  /** Names of 1 to 50 accounts (identity DEC-013); unknown ids are left out. */
  lookupAccountNames(accountIds: readonly string[]): Observable<AccountNames> {
    return this.http.get<AccountNames>(`${this.baseUrl}/auth/accounts/names`, {
      headers: this.headers(),
      params: { ids: accountIds.join(',') },
    });
  }

  getById(appointmentId: string): Observable<Appointment> {
    return this.http.get<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}`,
      { headers: this.headers() },
    );
  }

  listByPatient(
    patientId: string,
    page = 1,
    limit = 20,
  ): Observable<Page<Appointment>> {
    return this.http.get<Page<Appointment>>(
      `${this.baseUrl}/appointments/patient/${patientId}`,
      { headers: this.headers(), params: { page, limit } },
    );
  }

  listByProfessional(
    professionalId: string,
    page = 1,
    limit = 20,
  ): Observable<Page<Appointment>> {
    return this.http.get<Page<Appointment>>(
      `${this.baseUrl}/appointments/professional/${professionalId}`,
      { headers: this.headers(), params: { page, limit } },
    );
  }

  cancel(appointmentId: string, reason: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/cancel`,
      { reason },
      { headers: this.headers() },
    );
  }

  reschedule(
    appointmentId: string,
    payload: RescheduleAppointmentPayload,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/reschedule`,
      payload,
      { headers: this.headers() },
    );
  }

  updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/status`,
      { status },
      { headers: this.headers() },
    );
  }
}
