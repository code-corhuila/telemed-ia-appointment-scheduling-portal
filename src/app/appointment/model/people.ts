/**
 * Names of the people in an appointment. Appointments carry only account ids:
 * - professionals come from `GET /api/v1/professionals` (`identityUserId` is the
 *   account id the appointment stores);
 * - patient names come from identity `GET /api/v1/auth/accounts/names` (DEC-013).
 */
export interface ProfessionalListItem {
  readonly id: string;
  readonly identityUserId: string;
  readonly fullName?: string | null;
  readonly professionalType: string;
  readonly status: 'ACTIVE' | 'INACTIVE';
}

export interface ProfessionalListPage {
  readonly data: readonly ProfessionalListItem[];
}

export interface AccountName {
  readonly id: string;
  readonly fullName: string;
}

export interface AccountNames {
  readonly data: readonly AccountName[];
}

/** A professional the patient can book, keyed by its account id. */
export interface ProfessionalOption {
  readonly id: string;
  readonly name: string;
  readonly specialty: string;
}
