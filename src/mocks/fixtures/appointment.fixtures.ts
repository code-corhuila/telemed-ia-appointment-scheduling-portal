import type {
  Appointment,
  Page,
  PageMeta,
} from '../../app/appointment/model/appointment';

/**
 * In-memory fixtures for the appointment portal mock mode.
 *
 * Coherent with `PROFESSIONAL_DIRECTORY` and `PATIENT_DIRECTORY`:
 *   - Patient 1 = Juan Pérez, Patient 2 = María García
 *   - Professionals 2..5 with the same names as the portal directory
 */

const now = new Date('2026-10-10T09:00:00');

function iso(daysFromNow: number, hour: number, minutes = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString().slice(0, 19);
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  // ── Próximas del paciente 1 ──
  {
    id: 1,
    patientId: 1,
    professionalId: 2,
    start: iso(5, 9, 0),
    end: iso(5, 9, 30),
    status: 'CONFIRMED',
    preconsultationSummaryId: 11,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-01T12:00:00',
    updatedAt: '2026-10-01T12:00:00',
  },
  {
    id: 2,
    patientId: 1,
    professionalId: 3,
    start: iso(10, 11, 0),
    end: iso(10, 11, 30),
    status: 'CONFIRMED',
    preconsultationSummaryId: null,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-02T08:15:00',
    updatedAt: '2026-10-02T08:15:00',
  },
  {
    id: 3,
    patientId: 1,
    professionalId: 4,
    start: iso(15, 15, 0),
    end: iso(15, 15, 30),
    status: 'RESCHEDULED',
    preconsultationSummaryId: null,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-09-28T10:00:00',
    updatedAt: '2026-10-05T14:00:00',
  },
  // ── Historial del paciente 1 ──
  {
    id: 4,
    patientId: 1,
    professionalId: 2,
    start: '2026-09-20T10:00:00',
    end: '2026-09-20T10:30:00',
    status: 'COMPLETED',
    preconsultationSummaryId: 12,
    postSummaryId: 102,
    cancellationReason: null,
    createdAt: '2026-09-01T12:00:00',
    updatedAt: '2026-09-20T11:00:00',
  },
  {
    id: 5,
    patientId: 1,
    professionalId: 5,
    start: '2026-08-15T14:00:00',
    end: '2026-08-15T14:30:00',
    status: 'CANCELLED',
    preconsultationSummaryId: null,
    postSummaryId: null,
    cancellationReason: 'Paciente no puede asistir',
    createdAt: '2026-08-01T12:00:00',
    updatedAt: '2026-08-14T09:00:00',
  },
  {
    id: 6,
    patientId: 1,
    professionalId: 3,
    start: '2026-07-10T08:30:00',
    end: '2026-07-10T09:00:00',
    status: 'NO_SHOW',
    preconsultationSummaryId: null,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-07-01T12:00:00',
    updatedAt: '2026-07-10T10:00:00',
  },
  // ── Otros pacientes (para cola del profesional 2) ──
  {
    id: 7,
    patientId: 2,
    professionalId: 2,
    start: iso(3, 8, 30),
    end: iso(3, 9, 0),
    status: 'CONFIRMED',
    preconsultationSummaryId: null,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-03T09:00:00',
    updatedAt: '2026-10-03T09:00:00',
  },
  {
    id: 8,
    patientId: 2,
    professionalId: 2,
    start: iso(6, 16, 0),
    end: iso(6, 16, 30),
    status: 'RESCHEDULED',
    preconsultationSummaryId: 18,
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-04T10:00:00',
    updatedAt: '2026-10-06T11:00:00',
  },
  {
    id: 9,
    patientId: 2,
    professionalId: 2,
    start: '2026-09-25T11:00:00',
    end: '2026-09-25T11:30:00',
    status: 'COMPLETED',
    preconsultationSummaryId: 19,
    postSummaryId: 109,
    cancellationReason: null,
    createdAt: '2026-09-10T10:00:00',
    updatedAt: '2026-09-25T12:00:00',
  },
];

// ─── Helper: empaquetar en Page<T> ───
export function makePage<T>(items: T[], page = 1, limit = 20): Page<T> {
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  const meta: PageMeta = {
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  };
  return { data: slice, meta };
}