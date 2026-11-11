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

  return claims?.role === 'PROFESSIONAL'
    ? 'Profesional'
    : 'Paciente';
}
