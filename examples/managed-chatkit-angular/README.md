# Managed ChatKit Angular Demo

Minimal Angular demo for testing `@xpert-ai/chatkit-angular` with a local ChatKit UI frame.

## Quick Start

1. Start the ChatKit UI frame:

```bash
pnpm dev:ui
```

2. Start the Angular demo:

```bash
pnpm managed-chatkit-angular:dev
```

3. Open the demo:

```text
http://localhost:5175
```

## Default Configuration

- `frameUrl`: `http://localhost:5173`
- `apiUrl`: `/api/ai/`, resolved against the ChatKit frame origin
- `xpertId`: read from `frontend/.env`
- `getClientSecret()`: calls `/api/create-session` and expects `{ client_secret }`

By default:

- the ChatKit UI frame at `http://localhost:5173` proxies `/api/ai/*` to `http://localhost:3000`
- the Angular demo at `http://localhost:5175` proxies `/api/*` to `http://localhost:3000`
