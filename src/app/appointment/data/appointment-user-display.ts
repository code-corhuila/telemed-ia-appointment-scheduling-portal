export interface ProfessionalDisplay {
  readonly id: string;
  readonly name: string;
  readonly specialty: string;
}

/**
 * Development directory. IDs use prefixed deterministic UUIDs so that
 * patients, professionals and appointments are easy to tell apart in
 * mock mode and fixtures.
 */
export const PROFESSIONAL_DIRECTORY: readonly ProfessionalDisplay[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Dra. Ana Martínez',
    specialty: 'Medicina General',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Dr. Roberto Silva',
    specialty: 'Cardiología',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Dra. Luisa Fernández',
    specialty: 'Dermatología',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'Dr. Miguel Torres',
    specialty: 'Pediatría',
  },
];

const PATIENT_DIRECTORY: Readonly<Record<string, string>> = {
  'b0000000-0000-0000-0000-000000000001': 'Juan Pérez',
  'b0000000-0000-0000-0000-000000000002': 'María García',
};

interface JwtPayload {
  readonly sub?: string;
  readonly name?: string;
  readonly role?: string;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const encoded = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = encoded.padEnd(
      encoded.length + ((4 - (encoded.length % 4)) % 4),
      '=',
    );

    const binary = atob(padded);

    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0),
    );

    return JSON.parse(
      new TextDecoder().decode(bytes),
    ) as JwtPayload;
  } catch {
    return null;
  }
}

export function currentUserClaims(): JwtPayload | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const token = sessionStorage.getItem(
    'telemed.access-token',
  );

  if (!token) {
    return null;
  }

  return decodePayload(token);
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function currentUserId(): string | null {
  const claims = currentUserClaims();

  if (!claims?.sub) {
    return null;
  }

  return UUID_PATTERN.test(claims.sub) ? claims.sub : null;
}

export function currentUserRole(): string | null {
  return currentUserClaims()?.role ?? null;
}

export function currentUserName(): string {
  const claims = currentUserClaims();

  if (claims?.name) {
    return claims.name;
  }

  const id = currentUserId();

  if (claims?.role === 'PROFESSIONAL' && id !== null) {
    return professionalName(id);
  }

  if (claims?.role === 'PATIENT' && id !== null) {
    return patientName(id);
  }

  return claims?.role === 'PROFESSIONAL'
    ? 'Profesional'
    : 'Paciente';
}

export function professionalName(
  professionalId: string,
): string {
  return (
    PROFESSIONAL_DIRECTORY.find(
      (professional) =>
        professional.id === professionalId,
    )?.name ?? `Profesional ${professionalId}`
  );
}

export function professionalSpecialty(
  professionalId: string,
): string {
  return (
    PROFESSIONAL_DIRECTORY.find(
      (professional) =>
        professional.id === professionalId,
    )?.specialty ?? 'Medicina General'
  );
}

export function patientName(
  patientId: string,
): string {
  return (
    PATIENT_DIRECTORY[patientId] ??
    `Paciente ${patientId}`
  );
}
