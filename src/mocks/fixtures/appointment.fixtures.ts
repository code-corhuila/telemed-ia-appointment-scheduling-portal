import type {
  Appointment,
  Page,
  PageMeta,
} from '../../app/appointment/model/appointment';

/**
 * In-memory fixtures for the appointment portal mock mode.
 *
 * ID prefixes:
 *   - `a0000000-...` appointments
 *   - `b0000000-...` patients
 *   - `c0000000-...` professionals
 *   - `d0000000-...` preconsultation summaries
 *   - `e0000000-...` post-consultation summaries
 *
 * Coherent with `PROFESSIONAL_DIRECTORY` and `PATIENT_DIRECTORY`:
 *   - Patient `b...001` = Juan Pérez, `b...002` = María García
 *   - Professionals `c...002..005` with the same names as the portal directory
 */

const now = new Date('2026-10-10T09:00:00');

function iso(daysFromNow: number, hour: number, minutes = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minutes, 0, 0);
  return d.toISOString().slice(0, 19);
}

const P1 = 'b0000000-0000-0000-0000-000000000001'; // Juan Pérez
const P2 = 'b0000000-0000-0000-0000-000000000002'; // María García
const DR2 = 'c0000000-0000-0000-0000-000000000002'; // Dra. Ana Martínez
const DR3 = 'c0000000-0000-0000-0000-000000000003'; // Dr. Roberto Silva
const DR4 = 'c0000000-0000-0000-0000-000000000004'; // Dra. Luisa Fernández
const DR5 = 'c0000000-0000-0000-0000-000000000005'; // Dr. Miguel Torres

export const MOCK_APPOINTMENTS: Appointment[] = [
  // ── Próximas del paciente 1 ──
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    patientId: P1,
    professionalId: DR2,
    start: iso(5, 9, 0),
    end: iso(5, 9, 30),
    status: 'CONFIRMED',
    preconsultationSummaryId: 'd0000000-0000-0000-0000-000000000011',
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-01T12:00:00',
    updatedAt: '2026-10-01T12:00:00',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    patientId: P1,
    professionalId: DR3,
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
    id: 'a0000000-0000-0000-0000-000000000003',
    patientId: P1,
    professionalId: DR4,
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
    id: 'a0000000-0000-0000-0000-000000000004',
    patientId: P1,
    professionalId: DR2,
    start: '2026-09-20T10:00:00',
    end: '2026-09-20T10:30:00',
    status: 'COMPLETED',
    preconsultationSummaryId: 'd0000000-0000-0000-0000-000000000012',
    postSummaryId: 'e0000000-0000-0000-0000-000000000102',
    cancellationReason: null,
    createdAt: '2026-09-01T12:00:00',
    updatedAt: '2026-09-20T11:00:00',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    patientId: P1,
    professionalId: DR5,
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
    id: 'a0000000-0000-0000-0000-000000000006',
    patientId: P1,
    professionalId: DR3,
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
    id: 'a0000000-0000-0000-0000-000000000007',
    patientId: P2,
    professionalId: DR2,
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
    id: 'a0000000-0000-0000-0000-000000000008',
    patientId: P2,
    professionalId: DR2,
    start: iso(6, 16, 0),
    end: iso(6, 16, 30),
    status: 'RESCHEDULED',
    preconsultationSummaryId: 'd0000000-0000-0000-0000-000000000018',
    postSummaryId: null,
    cancellationReason: null,
    createdAt: '2026-10-04T10:00:00',
    updatedAt: '2026-10-06T11:00:00',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    patientId: P2,
    professionalId: DR2,
    start: '2026-09-25T11:00:00',
    end: '2026-09-25T11:30:00',
    status: 'COMPLETED',
    preconsultationSummaryId: 'd0000000-0000-0000-0000-000000000019',
    postSummaryId: 'e0000000-0000-0000-0000-000000000109',
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
