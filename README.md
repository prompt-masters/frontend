# PromptArena Frontend

React + TypeScript frontend for PromptArena.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest
- Testing Library

## Local Development

Install dependencies:

    npm install

Create a local environment file:

    cp .env.example .env

Configure the backend API URL in `.env`:

    VITE_API_BASE_URL=http://localhost:8080

Start the frontend:

    npm run dev

The application runs at:

    http://localhost:5173

## Environment Configuration

The backend URL is configured through:

    VITE_API_BASE_URL

Backend URLs must not be hard-coded in frontend source code.

## Project Structure

    src/
    ├── api/
    ├── app/
    ├── components/
    ├── features/
    │   ├── auth/
    │   ├── game/
    │   ├── lobby/
    │   ├── profile/
    │   └── results/
    ├── hooks/
    ├── pages/
    ├── routes/
    ├── stores/
    ├── websocket/
    └── utils/

## Code Quality

Run all frontend checks:

    npm run check

Individual commands:

    npm run format:check
    npm run lint
    npm run typecheck
    npm run test
    npm run build

## CI

`.github/workflows/frontend.yml` runs on pull requests into `dev` and `main`:
`lint` (format check, ESLint, typecheck) → `test` → `build`, each only if the
one before passed. A `changes` job skips them when the PR touches no frontend
files (`src/`, `public/`, `index.html`, package and tool config).

To block merging on failures, protect `dev` and `main` in _Settings →
Branches_ and require the `lint`, `test` and `build` checks. Skipped jobs
count as passed, so a PR that changes nothing here is not blocked.

## API Client

Shared API requests should use the client in `src/api/client.ts`.

The client:

- Uses `VITE_API_BASE_URL`
- Adds the Bearer token when available
- Centralizes unauthorized `401` handling
- Provides a shared API error type
