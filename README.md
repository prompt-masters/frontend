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

## API Client

Shared API requests should use the client in `src/api/client.ts`.

The client:

- Uses `VITE_API_BASE_URL`
- Adds the Bearer token when available
- Centralizes unauthorized `401` handling
- Provides a shared API error type
