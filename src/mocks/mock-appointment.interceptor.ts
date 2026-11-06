import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import type {
  Appointment,
  CreateAppointmentPayload,
  Page,
  RescheduleAppointmentPayload,
} from '../app/appointment/model/appointment';
import {
  MOCK_APPOINTMENTS,
  makePage,
} from './fixtures/appointment.fixtures';

const LATENCY_MS = 300;
const API_PREFIX = '/api/v1/appointments';
const UUID_RE = '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';

function ok<T>(body: T): HttpResponse<T> {
  return new HttpResponse<T>({ status: 200, body });
}

function nextId(): string {
  // Deterministic `a...` prefix so new appointments stay traceable.
  const next = MOCK_APPOINTMENTS.length + 1;
  return `a0000000-0000-0000-0000-${String(next).padStart(12, '0')}`;
}

function findAppointment(id: string): Appointment | undefined {
  return MOCK_APPOINTMENTS.find((a) => a.id === id);
}

/**
 * Intercepts every `/api/v1/appointments/*` request and resolves it from
 * the in-memory fixtures. Applied only in mock mode via `mock-main.ts`.
 */
export const mockAppointmentInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  if (!url.startsWith(API_PREFIX)) {
    return next(req);
  }

  const method = req.method.toUpperCase();

  // POST /api/v1/appointments/  → create
  if (method === 'POST' && /\/api\/v1\/appointments\/?$/.test(url)) {
    const payload = req.body as CreateAppointmentPayload;
    const created: Appointment = {
      id: nextId(),
      patientId: payload.patientId,
      professionalId: payload.professionalId,
      start: payload.start,
      end: new Date(new Date(payload.start).getTime() + 30*60000).toISOString(),
      status: 'CONFIRMED',
      preconsultationSummaryId: null,
      postSummaryId: null,
      cancellationReason: null,
      createdAt: new Date().toISOString().slice(0, 19),
      updatedAt: new Date().toISOString().slice(0, 19),
    };
    MOCK_APPOINTMENTS.push(created);
    return of(ok(created)).pipe(delay(LATENCY_MS));
  }

  // GET /api/v1/appointments/patient/:id
  const byPatient = url.match(
    new RegExp(`/api/v1/appointments/patient/${UUID_RE}`),
  );
  if (method === 'GET' && byPatient) {
    const patientId = byPatient[1];
    const items = MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId);
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    const body: Page<Appointment> = makePage(items, page, limit);
    return of(ok(body)).pipe(delay(LATENCY_MS));
  }

  // GET /api/v1/appointments/professional/:id
  const byProfessional = url.match(
    new RegExp(`/api/v1/appointments/professional/${UUID_RE}`),
  );
  if (method === 'GET' && byProfessional) {
    const professionalId = byProfessional[1];
    const items = MOCK_APPOINTMENTS.filter(
      (a) => a.professionalId === professionalId,
    );
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    const body: Page<Appointment> = makePage(items, page, limit);
    return of(ok(body)).pipe(delay(LATENCY_MS));
  }

  // GET /api/v1/appointments/:id  → single
  const byId = url.match(new RegExp(`/api/v1/appointments/${UUID_RE}(?:\\?|$)`));
  if (method === 'GET' && byId) {
    const id = byId[1];
    const target = findAppointment(id);
    if (target) {
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return of(
      new HttpResponse({
        status: 404,
        body: { code: 'NOT_FOUND', message: 'Appointment not found' },
      }),
    ).pipe(delay(LATENCY_MS));
  }

  // PATCH /api/v1/appointments/:id/cancel
  const cancel = url.match(
    new RegExp(`/api/v1/appointments/${UUID_RE}/cancel`),
  );
  if (method === 'PATCH' && cancel) {
    const id = cancel[1];
    const target = findAppointment(id);
    if (target) {
      target.status = 'CANCELLED';
      target.cancellationReason =
        (req.body as { reason?: string } | null)?.reason ?? null;
      target.updatedAt = new Date().toISOString().slice(0, 19);
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return next(req);
  }

  // PATCH /api/v1/appointments/:id/reschedule
  const reschedule = url.match(
    new RegExp(`/api/v1/appointments/${UUID_RE}/reschedule`),
  );
  if (method === 'PATCH' && reschedule) {
    const id = reschedule[1];
    const target = findAppointment(id);
    if (target) {
      const payload = req.body as RescheduleAppointmentPayload;
      target.start = payload.start;
      target.end = new Date(new Date(payload.start).getTime() + 30*60000).toISOString();
      target.status = 'RESCHEDULED';
      target.updatedAt = new Date().toISOString().slice(0, 19);
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return next(req);
  }

  // PATCH /api/v1/appointments/:id/status
  const status = url.match(
    new RegExp(`/api/v1/appointments/${UUID_RE}/status`),
  );
  if (method === 'PATCH' && status) {
    const id = status[1];
    const target = findAppointment(id);
    if (target) {
      const body = req.body as { status?: Appointment['status'] } | null;
      if (body?.status) target.status = body.status;
      target.updatedAt = new Date().toISOString().slice(0, 19);
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return next(req);
  }

  console.warn('[mock] Unhandled appointment request:', method, url);
  return next(req);
};
