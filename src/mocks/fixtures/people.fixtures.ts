import type {
  AccountName,
  ProfessionalListItem,
} from '../../app/appointment/model/people';

/**
 * Names for mock mode, coherent with the appointment fixtures:
 *   - patients `b...001` Juan Pérez, `b...002` María García
 *   - professionals `c...002..005`
 * The real portal reads them from `GET /professionals` and identity DEC-013.
 */
export const MOCK_PROFESSIONALS: readonly ProfessionalListItem[] = [
  professional(2, 'Dra. Ana Martínez'),
  professional(3, 'Dr. Roberto Silva'),
  professional(4, 'Dra. Luisa Fernández'),
  professional(5, 'Dr. Miguel Torres'),
];

export const MOCK_PATIENT_NAMES: readonly AccountName[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', fullName: 'Juan Pérez' },
  { id: 'b0000000-0000-0000-0000-000000000002', fullName: 'María García' },
];

function professional(n: number, fullName: string): ProfessionalListItem {
  const suffix = String(n).padStart(12, '0');
  return {
    id: `f0000000-0000-0000-0000-${suffix}`,
    identityUserId: `c0000000-0000-0000-0000-${suffix}`,
    fullName,
    professionalType: 'GENERAL_PRACTITIONER',
    status: 'ACTIVE',
  };
}
