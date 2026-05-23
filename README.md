# Enjojo Command Center

API-first operations platform for Enjojo connectivity deployments. The dashboard is a PoC UI, but raw telemetry, account metadata, site/project data, and exports are available independently through REST endpoints.

## Run Locally

1. Install frontend dependencies: `npm install`
2. Install backend dependencies: `npm run backend:install`
3. Start the backend: `npm run backend`
4. Start the frontend: `npm run dev`

Frontend: http://localhost:3000  
Backend API: http://localhost:8000

## API Deliverables

- Swagger docs: http://localhost:8000/docs
- Redoc docs: http://localhost:8000/redoc
- Live OpenAPI JSON: http://localhost:8000/openapi.json
- Checked-in OpenAPI contract: [openapi.yaml](./openapi.yaml)

## Development Login

Backend login is currently bypassed for PoC development via `DEV_AUTH_BYPASS=true` by default. Any email/password submitted from the UI will create a local operator session. Set `DEV_AUTH_BYPASS=false` before using configured bcrypt operator accounts in a production-like environment.

## Export Endpoints

- `GET /api/platform/exports/fleet.json`
- `GET /api/platform/exports/fleet.csv`
- `GET /api/platform/exports/sites.json`
- `GET /api/platform/exports/sites.csv`
- `GET /api/platform/sites`

The platform distinguishes ranger gateways, community gateways, base-camp operations, and general operations so deployments are not flattened into one Starlink-only view.
