# TechCraft Candidate Score — Agent Guide

Monorepo: `backend/` (Python 3.12 + FastAPI) + `frontend/` (React + Vite + Tailwind v4 + daisyUI v5).

## Backend

- **Python venv:** `backend/.venv/` — activate with `source backend/.venv/bin/activate`.
- **Install deps:** `pip install -r requirements.txt` after activating venv.
- **Run:** `uvicorn app.main:app --reload --port 8000` from `backend/`.
- **Port:** 8000. All endpoints under `/api/`.

### Architecture

`backend/app/` — async SQLAlchemy + SQLite (`techcraft.db` auto-created, auto-seeded on startup).
| Layer | Path |
|---|---|
| Entrypoint | `main.py` — lifespan creates tables + seeds |
| API routers | `api/routers/auth.py`, `api/routers/candidates.py` |
| Dependencies | `api/deps.py` — `get_db`, `get_current_user`, `require_role` |
| Config | `core/config.py` — `Settings` via `pydantic-settings` (reads `.env`) |
| Security | `core/security.py` — bcrypt hashing (`passlib`), JWT (`python-jose`) |
| DB models | `db/models/user.py`, `candidate.py`, `score.py` |
| Schemas | `schemas/auth.py`, `candidate.py` — Pydantic request/response DTOs |
| Services | `services/auth_service.py`, `candidate_service.py` — stateless classes |
| Seed data | `db/seed.py` — users, candidates, scores |

### Auth

- `POST /api/auth/register` — creates reviewer, returns user
- `POST /api/auth/login` — returns `{access_token, token_type, user}`
- Protected endpoints use `Authorization: Bearer <token>`
- Roles: `admin`, `reviewer` — `require_role(Role.ADMIN)` in `deps.py`

**Seed users (auto-created):**
| Email | Password | Role |
|---|---|---|
| admin@techcraft.com | password123 | admin |
| reviewer@techcraft.com | password123 | reviewer |

### Key deps (not obvious)

`python-jose[cryptography]`, `passlib[bcrypt]`, `aiosqlite`, `watchfiles` (for `--reload`).

### `.agents` reference files

`backend/.agents/rules/` contains reference FastAPI architecture and coding convention guides (aspirational — may not match actual code). Load with `skill` tool.

## Frontend

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (typecheck **required** before build)
- `npm run lint` — ESLint v10
- TypeScript ~6.0 — `erasableSyntaxOnly` is on (**no enums, no parameter properties**)
- `verbatimModuleSyntax` — use `import type` for type-only imports
- `noUnusedLocals`/`noUnusedParameters` — dead code is an error

### Tailwind v4 + daisyUI v5

- Tailwind is a Vite plugin (`@tailwindcss/vite`), **no** `tailwind.config.js`
- Add `@import "tailwindcss"` at top of your CSS entry file
- daisyUI 5 is a Tailwind plugin added in CSS: `@plugin "daisyui"` after the import
- daisyUI skill preloaded at `frontend/.agents/skills/daisyui/` — load it with `skill` tool when writing UI

### `.agents` reference files

`frontend/.agents/rules/` contains reference React + Vite project structure and convention guides. The daisyUI skill at `frontend/.agents/skills/daisyui/` includes install, usage, config, colors, and 60 component docs — load it with the `skill` tool.

## No CI, no Docker, no tests yet

No CI workflows, Dockerfiles, or test framework configured. `httpx` is available for FastAPI `TestClient`.
