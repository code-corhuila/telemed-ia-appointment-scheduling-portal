/**
 * Seeds a fake JWT into sessionStorage so the portal's local JWT decoder
 * (`appointment-user-display.ts`) returns the desired user.
 *
 * Controlled via query params:
 *   ?mockRole=PATIENT&mockId=1
 *   ?mockRole=PROFESSIONAL&mockId=2&mockName=Dra.%20Ana%20Mart%C3%ADnez
 *
 * The token is unsigned — it only needs to be decodable by `atob`.
 */

interface SeedOptions {
  role: 'PATIENT' | 'PROFESSIONAL';
  id: number;
  name: string;
}

function base64UrlEncode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildFakeJwt({ role, id, name }: SeedOptions): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: String(id),
      role,
      name,
      iat: now,
      exp: now + 3600,
    }),
  );
  return `${header}.${payload}.mock`;
}

function readOptionsFromQuery(): SeedOptions {
  const params = new URLSearchParams(window.location.search);
  const role = (params.get('mockRole') ?? 'PATIENT').toUpperCase();
  const isProfessional = role === 'PROFESSIONAL';
  const defaultId = isProfessional ? 2 : 1;
  const defaultName = isProfessional ? 'Dra. Ana Martínez' : 'Juan Pérez';

  const rawId = params.get('mockId');
  const id = rawId !== null ? Number(rawId) : defaultId;

  return {
    role: isProfessional ? 'PROFESSIONAL' : 'PATIENT',
    id: Number.isFinite(id) && id > 0 ? id : defaultId,
    name: params.get('mockName') ?? defaultName,
  };
}

export function seedMockSession(): void {
  try {
    const options = readOptionsFromQuery();
    sessionStorage.setItem('telemed.access-token', buildFakeJwt(options));
    console.info('[mock] Seeded session:', options);
  } catch (error) {
    console.warn('[mock] Failed to seed session', error);
  }
}