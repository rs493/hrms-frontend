# HRMS Frontend

React client for the HRMS Spring Boot backend.

## Setup

```bash
npm install
npm run dev
```

Dev server runs on [http://localhost:3000](http://localhost:3000) and proxies `/api` to `http://localhost:8080`.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — oxlint
- `npm run preview` — preview production build

## Auth notes

- Login uses `POST /api/v1/auth/login`
- Roles and permissions are read from JWT claims (`roles`, `permissions`)
- Logout clears local session storage only (no backend logout API)
- Activation uses `POST /api/v1/onboarding/activate` with `?token=` from the email link
