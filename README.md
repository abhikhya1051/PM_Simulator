# PM Day Simulator

An interactive, guided day in the life of a PM at Fieldnotes, a fictional fast-growing consumer-tech scale-up. Follow four time-stamped moments through a realistic product decision, with hands-on evidence, stakeholder, backlog, and rollout artifacts.

## First episode

Choose an early-career or tenured PM, then select an illustrated avatar for the playthrough. Members are requesting a new space focused on friendship and social confidence. Choose up to three evidence signals, join the cross-functional discussion, and decide whether to launch broadly, pilot with a cohort, or defer while the team prepares. The debrief evaluates member insight, evidence balance, safety and readiness, and execution separately from the four outcome areas: member trust, safety readiness, moderator sustainability, and delivery progress. Coaching adapts to the selected PM level.

The fictional product supports peer-to-peer listening. Posts are anonymous to other members, replies use stable pseudonyms, and the experience is not therapy or diagnosis. No account or personal data is required by this simulation.

## Stack

- React, TypeScript, and Vite for the interactive interface
- Python, FastAPI, and Pydantic for scenario and decision logic
- Express, OpenAPI, generated React Query hooks, and Zod for the shared API contract
- pnpm workspace with a `uv`-managed Python environment

## Run locally

From the repository root:

```bash
pnpm install
uv sync
```

Start the three services in separate terminals:

```bash
pnpm --filter @workspace/api-server run dev
```

```bash
uv run --project . -- python -m uvicorn main:app --app-dir artifacts/pm-day-simulator/engine --host 0.0.0.0 --port 8000
```

```bash
pnpm --filter @workspace/pm-day-simulator run dev
```

## API contract

`lib/api-spec/openapi.yaml` is the source of truth for the browser-to-API contract. After changing it, regenerate the client and validation schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```
