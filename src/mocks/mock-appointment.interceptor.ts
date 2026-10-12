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

function ok<T>(body: T): HttpResponse<T> {
  return new HttpResponse<T>({ status: 200, body });
}

function nextId(): number {
  return Math.max(0, ...MOCK_APPOINTMENTS.map((a) => a.id)) + 1;
}

function findAppointment(id: number): Appointment | undefined {
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
      end: payload.end,
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
  const byPatient = url.match(/\/api\/v1\/appointments\/patient\/(\d+)/);
  if (method === 'GET' && byPatient) {
    const patientId = Number(byPatient[1]);
    const items = MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId);
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    const body: Page<Appointment> = makePage(items, page, limit);
    return of(ok(body)).pipe(delay(LATENCY_MS));
  }

  // GET /api/v1/appointments/professional/:id
  const byProfessional = url.match(/\/api\/v1\/appointments\/professional\/(\d+)/);
  if (method === 'GET' && byProfessional) {
    const professionalId = Number(byProfessional[1]);
    const items = MOCK_APPOINTMENTS.filter(
      (a) => a.professionalId === professionalId,
    );
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    const body: Page<Appointment> = makePage(items, page, limit);
    return of(ok(body)).pipe(delay(LATENCY_MS));
  }

  // PATCH /api/v1/appointments/:id/cancel
  const cancel = url.match(/\/api\/v1\/appointments\/(\d+)\/cancel/);
  if (method === 'PATCH' && cancel) {
    const id = Number(cancel[1]);
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
  const reschedule = url.match(/\/api\/v1\/appointments\/(\d+)\/reschedule/);
  if (method === 'PATCH' && reschedule) {
    const id = Number(reschedule[1]);
    const target = findAppointment(id);
    if (target) {
      const payload = req.body as RescheduleAppointmentPayload;
      target.start = payload.start;
      target.end = payload.end;
      target.status = 'RESCHEDULED';
      target.updatedAt = new Date().toISOString().slice(0, 19);
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return next(req);
  }

  // PATCH /api/v1/appointments/:id/status
  const status = url.match(/\/api\/v1\/appointments\/(\d+)\/status/);
  if (method === 'PATCH' && status) {
    const id = Number(status[1]);
    const target = findAppointment(id);
    if (target) {
      const body = req.body as { status?: Appointment['status'] } | null;
      if (body?.status) target.status = body.status;
      target.updatedAt = new Date().toISOString().slice(0, 19);
      return of(ok(target)).pipe(delay(LATENCY_MS));
    }
    return next(req);
  }

  // Fallback: no matcheó ninguna ruta de mock
  console.warn('[mock] Unhandled appointment request:', method, url);
  return next(req);
};