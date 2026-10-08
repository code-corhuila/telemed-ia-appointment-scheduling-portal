export interface ProfessionalDisplay {
  readonly id: number;
  readonly name: string;
  readonly specialty: string;
}

export const PROFESSIONAL_DIRECTORY: readonly ProfessionalDisplay[] = [
  {
    id: 2,
    name: 'Dra. Ana Martínez',
    specialty: 'Medicina General',
  },
  {
    id: 3,
    name: 'Dr. Roberto Silva',
    specialty: 'Cardiología',
  },
  {
    id: 4,
    name: 'Dra. Luisa Fernández',
    specialty: 'Dermatología',
  },
  {
    id: 5,
    name: 'Dr. Miguel Torres',
    specialty: 'Pediatría',
  },
];

const PATIENT_DIRECTORY: Readonly<Record<number, string>> = {
  1: 'Juan Pérez',
  2: 'María García',
};

interface JwtPayload {
  readonly sub?: string | number;
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

export function currentUserId(): number | null {
  const claims = currentUserClaims();

  if (!claims?.sub) {
    return null;
  }

  const id = Number(claims.sub);

  return Number.isInteger(id) && id > 0 ? id : null;
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
  professionalId: number,
): string {
  return (
    PROFESSIONAL_DIRECTORY.find(
      (professional) =>
        professional.id === professionalId,
    )?.name ?? `Profesional ${professionalId}`
  );
}

export function professionalSpecialty(
  professionalId: number,
): string {
  return (
    PROFESSIONAL_DIRECTORY.find(
      (professional) =>
        professional.id === professionalId,
    )?.specialty ?? 'Medicina General'
  );
}

export function patientName(
  patientId: number,
): string {
  return (
    PATIENT_DIRECTORY[patientId] ??
    `Paciente ${patientId}`
  );
}