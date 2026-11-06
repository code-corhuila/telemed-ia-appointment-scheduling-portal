/**
 * Domain types for the appointment-scheduling portal.
 *
 * Field names mirror the JSON contract of the API in camelCase.
 * Cross-domain identifiers are UUID strings; page metadata stays numeric.
 */

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'CONFIRMED',
  'RESCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  preconsultationSummaryId: string | null;
  postSummaryId: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  professionalId: string;
  start: string;
}

export interface RescheduleAppointmentPayload {
  start: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}
