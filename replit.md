# PM Day Simulator

An interactive day-in-the-life product management simulation set inside a fictional peer-support consumer app.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared typed API server (port 8080)
- `pnpm --filter @workspace/pm-day-simulator run dev` — run the React/Vite app
- `uv run --project . -- python -m uvicorn main:app --app-dir artifacts/pm-day-simulator/engine --host 0.0.0.0 --port 8000` — run the Python simulation engine from the workspace root
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `uv sync` — install Python dependencies
- No database, account, or personal-data setup is required for the current simulation.

## Stack

- Front end: React, TypeScript, Vite
- Simulation engine: Python, FastAPI, Pydantic
- Shared API gateway: Express 5, OpenAPI, generated Orval hooks and Zod validation
- Workspace: pnpm monorepo

## Where things live

- `artifacts/pm-day-simulator/` — app UI and FastAPI scenario engine
- `artifacts/api-server/src/routes/simulation.ts` — typed API gateway to the Python engine
- `lib/api-spec/openapi.yaml` — source of truth for frontend/API contracts

## Architecture decisions

- The game is a stateless simulation: choices are evaluated by Python and are not stored.
- The Express gateway preserves the workspace's OpenAPI-generated client conventions; FastAPI owns scenario and outcome logic.
- Scenario data is fictional. The app simulates peer support; it is not a therapy product.

## Product

Players shadow an early-career or tenured PM for one workday. In the first episode, they decide whether to launch, pilot, or defer a member-requested friendship space while balancing member trust, safety readiness, moderator sustainability, and delivery progress. The end-of-day review provides tradeoffs and level-specific coaching rather than a pass/fail score.

## User preferences

- Keep the PM simulation realistic and hands-on, with PM artifacts and brief narration.
- Use a guided timeline through one day at a fictional fast-growing consumer-tech scale-up; keep the UI warm and pastel with purposeful animations and visible tech urgency.
- Let players choose an illustrated PM avatar after selecting career level; keep it local to the current playthrough and do not require a photo, account, or profile data.
- Evaluate decision reasoning across member insight, evidence balance, safety/readiness, and execution, separately from outcome impacts. Avoid pass/fail grading and engagement leaderboards.
- The in-simulation community uses anonymous posts, pseudonymous replies, topic-based spaces, strong boundaries, and a listening-first peer-support approach.
- Initial spaces are Belonging, Self-confidence, and Study Stress; the proposed new space focuses on friendship and social confidence.

## Gotchas

- The Python engine must be running alongside the API server and web app for scenario loading and decision evaluation.
- After changing `lib/api-spec/openapi.yaml`, rerun codegen before typechecking app packages.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
