# telemed-ia-appointment-scheduling-portal

Angular 21 + Native Federation portal for the `appointment-scheduling` domain of TeleMed IA.

## Scope

- **Patient view** — list, create, cancel and reschedule own appointments.
- **Professional view** — list assigned appointments and change their status (`CONFIRMED → COMPLETED | NO_SHOW | CANCELLED`).

The portal is mounted by the shell (`telemed-ia-front`) at `/appointment`, with an internal route for the professional view at `/appointment/professional`.

## Stack

- Angular 21 (standalone components, signals, new control flow).
- `@angular-architects/native-federation`.
- `nginx:alpine` for production serving.
- Port: `4203`.
- Remote name: `appointment`.

## Local development (without Docker)

```bash
npm install
npm run build
npx http-server dist/telemed-ia-appointment-scheduling-portal/browser -p 4203 -c-1
```

The portal calls `/api/v1/appointments/*` relative to the origin. To reach the real API you need either the shell's nginx proxy or a local proxy. See `nginx.local.conf` (gitignored) if you use the latter.

### Local token

The portal reads the access token from `sessionStorage.getItem('telemed.access-token')`. Set it in the browser console:

```js
sessionStorage.setItem('telemed.access-token', 'eyJ...');
```

## Docker

```bash
cd deploy
docker compose up -d --build
```

The container joins the external platform network to reach the gateway at `http://telemed-ia-api-gateway:80`.

## Known technical debt

- The portal consumes its own `AppointmentApiService` and local `ApiError` type instead of `shell/apiClient` and `shell/apiError` (norm 5.4.1). Same pattern used by the patient portal. Will be replaced when a shared contracts package exists.
- `professionalId` is hardcoded in the professional page. Will be read from the session/JWT once `identity-and-access` exposes it.