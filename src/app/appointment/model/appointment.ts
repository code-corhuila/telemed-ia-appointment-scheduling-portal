/**
 * Domain types for the appointment-scheduling portal.
 *
 * Field names mirror the JSON contract of the API in camelCase.
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
  id: number;
  patientId: number;
  professionalId: number;
  start: string;
  end: string;
  status: AppointmentStatus;
  preconsultationSummaryId: number | null;
  postSummaryId: number | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  patientId: number;
  professionalId: number;
  start: string;
  end: string;
}

export interface RescheduleAppointmentPayload {
  start: string;
  end: string;
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
