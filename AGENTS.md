# TechCraft Candidate Score — Agent Guide

## Setup

- **Python**: 3.12. Virtual environment at `backend/.venv/`.
- **Activate**: `source backend/.venv/bin/activate` (or run commands with `backend/.venv/bin/` prefix).
- **No pyproject.toml, no requirements.txt.** Add new deps with `pip install <pkg>` and consider freezing: `pip freeze > backend/requirements.txt`.
- **Zed** expects Python path in `.zed/settings.json` pointing to `.venv/bin/python`. Already configured — open Command Palette (`Cmd+Shift+P`) → "python: select interpreter" to verify `.venv/bin/python` is selected.

## Run

```sh
source backend/.venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Run from `backend/` directory. `--reload` is available (watchfiles installed).

## Project structure

See `backend/.agents/rules/project-structure.md` for the target modular architecture (services, schemas, api routers, core config, db layer).

Current state is minimal — only `app/main.py` with `GET /health` exists. Migrate toward the reference structure as features are added.

## Dependencies (key)

- `fastapi==0.136.3`, `uvicorn==0.49.0`, `starlette==1.2.1`
- `pydantic`, `pydantic-settings` (available for config/schemas)
- `httpx` (async HTTP client, likely for tests or outbound calls)
- `sentry-sdk` (error tracking)
- `python-dotenv`, `python-multipart`
- `email-validator`

## Testing

No tests exist yet. No test framework is configured. `httpx` is available if using FastAPI's `TestClient`.

## Conventions

- App name: `"TechCraft Candidate Score API"`.
- Use `source backend/.venv/bin/activate` before running any Python commands.
- No linting, formatting, or type-checking config exists yet.
- The repo is at an early stage — add config files (pyproject.toml, etc.) as the project grows.

See `backend/.agents/rules/convention.md` for the FastAPI production standards and style guide (architecture, config management, layer separation, DI, service layer, async handling, error handling, testing strategy).
