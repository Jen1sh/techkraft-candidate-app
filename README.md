# TechKraft Candidate Score

A full-stack application for scoring tech candidates. The backend runs on Python 3.12 with FastAPI and SQLite, while the frontend is built with React, Vite, TypeScript, Tailwind v4, and daisyUI v5.

```
techkraft-candidate-score/
├── backend/
│   ├── app/
│   │   ├── api/         # Route handlers (auth, candidates)
│   │   ├── core/        # Config and security
│   │   ├── db/          # Database models and seed data
│   │   ├── schemas/     # Request/response models
│   │   └── services/    # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # API client and utilities
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Getting started with Docker Compose

Before you run `docker compose up`, there are a few things you need to set up.

### 1. Backend environment variables

Copy the example env file and keep the default secret key (or generate your own):

```bash
cp backend/.env.example backend/.env
```

### 2. Frontend environment variables

Same deal — copy the example file:

```bash
cp frontend/.env.example frontend/.env
```

`VITE_API_URL` is already set to `http://localhost:8000`, which is what the Docker setup expects.

### 3. Install backend dependencies

This creates a virtual environment and installs the Python packages. You'll also need this if you ever run the backend locally.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Install frontend dependencies

Docker needs a `package-lock.json` file to build the frontend container, so run an install first:

```bash
cd frontend
npm install
cd ..
```

### 5. Fire it up

```bash
docker compose up --build
```

Once everything is running:

- **Frontend app** → [http://localhost:5173](http://localhost:5173)
- **Backend API** → [http://localhost:8000](http://localhost:8000)
- **API docs (Swagger)** → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Seed users

The backend automatically creates two users when it starts up:

| Email                  | Password    | Role     |
| ---------------------- | ----------- | -------- |
| admin@techkraft.com    | password123 | admin    |
| reviewer@techkraft.com | password123 | reviewer |

---

## Architecture Decision Records

These are the key technical choices we made while building this project and the reasoning behind them.

### ADR 1: Vite proxy for API routing

**Context.** During development, the frontend runs on its own dev server (port 5173) while the backend API runs separately (port 8000). Normally, a browser talking to two different ports would run into something called a **CORS** (Cross-Origin Resource Sharing) error — it's a security mechanism that blocks requests from one origin to another. We also had a practical problem: the backend URL that the frontend needs to call is different depending on where you're running — it's `http://localhost:8000` when developing locally, but `http://backend:8000` when running inside Docker Compose (where `backend` is the name of the backend container).

**Decision.** We configured Vite's dev server to act as a **proxy**. Any request starting with `/api` that hits the frontend on port 5173 is automatically forwarded to the backend by Vite behind the scenes. The target URL is controlled by an environment variable (`VITE_API_PROXY`) so it can switch between local dev and Docker without changing code. On the frontend side, the API client (built with Axios) always sends requests to `/api/...` relative to wherever it's loaded from — it never needs to know the backend's actual address. In `Dockerfile`, this is handled purely by the dev server, so no extra build-time config is needed.

**Trade-offs.** Having two layers of routing (the Vite proxy and then Axios's base URL) can feel confusing when you're new to the project — you might wonder "where is `/api` actually going?" It's also a development-only solution; a production build would need a different strategy (like a reverse proxy or serving the frontend from the same domain as the backend). But in return, our frontend code never hardcodes a backend URL, CORS never interrupts our workflow during development, and switching between local and Docker environments is just a matter of setting a different environment variable.

### ADR 2: SQLite with async SQLAlchemy

**Context.** We needed a database, but we didn't want every developer who clones this repo to have to install PostgreSQL (or any other database server) just to get the app running. We also wanted the database to work with FastAPI's asynchronous nature so that slow database queries don't block the server from handling other requests.

**Decision.** We chose **SQLite** paired with an async driver (`aiosqlite`) and the **SQLAlchemy** ORM (Object-Relational Mapper — it lets you work with database tables using Python classes instead of writing raw SQL). The database lives in a single file (`techkraft.db`) that gets created automatically the first time the backend starts. All the tables and sample data are also created at that point, so there's no manual setup step for the database. The async part means multiple requests can be processed concurrently while waiting for the database.

**Trade-offs.** SQLite is not designed for high-concurrency scenarios — it locks the entire file when writing, so if two people try to write at the exact same time, one of them will have to wait. It also lacks some advanced features that PostgreSQL offers (like full-text search, array operations, or JSONB indexes). For a candidate-scoring tool at this scale, none of those limitations matter — the simplicity of having zero infrastructure to set up outweighs everything else.

### ADR 3: JWT authentication with role-based access control

**Context.** The app has two types of users: **admins** (who can create candidates, update statuses, and view all reviews) and **reviewers** (who can score candidates and view their own scores). We needed a way to authenticate users (verify who they are) and authorize them (check if they're allowed to do something) without managing session data on the server — we wanted the authentication to be self-contained.

**Decision.** We implemented **JWT** (JSON Web Token — a token that encodes user information in a cryptographically signed string) for authentication. When a user logs in, the server creates a JWT that contains their user ID and role, signs it with a secret key, and sends it back. The frontend stores this token in `localStorage` and sends it along with every request in an `Authorization` header. The backend verifies the signature on each request to confirm it's genuine. For authorization, we use FastAPI's **dependency injection** system — a function called `require_role(Role.ADMIN)` acts as a guard: if you attach it to a route, that route will only execute if the logged-in user has the admin role. Passwords are hashed using **bcrypt** before storage, so even if the database were exposed, the actual passwords wouldn't be readable.

**Trade-offs.** JWTs cannot be revoked server-side — if a token is stolen before it expires, the attacker can use it until it expires (we set tokens to expire after 60 minutes by default). There's no way to "log out all sessions" without changing the secret key (which would invalidate everyone's tokens). This is a well-known limitation of the JWT approach. Session-based auth (storing sessions on the server) would solve this, but it adds server-side storage requirements and doesn't scale as easily across multiple server instances. For this application, the trade-off is acceptable — we keep token lifetimes short, and the simplicity of not needing session storage is worth it.

---

## Debugging Signal: the problem with filtering and paginating in Python

Consider this function that searches for candidates by status and keyword:

```python
def search_candidates(status: str, keyword: str, page: int, page_size: int):
    all_candidates = db.execute("SELECT * FROM candidates").fetchall()
    filtered = [c for c in all_candidates if c["status"] == status]
    # ... also filter by keyword in Python ...
    offset = (page - 1) * page_size
    return filtered[offset : offset + page_size]
```

### What's the bug?

The function looks like it works — and with a small dataset like our seed data (15 candidates), it will return the right results. But there are two serious problems hiding under the surface.

**Problem 1: It loads every single row from the database into memory.** The query `SELECT * FROM candidates` has no `WHERE` clause, so it fetches every candidate row from the table. If your candidates table has 50,000 rows, it pulls all 50,000 rows across the network (or from disk, in SQLite's case), stores them in a Python list, and _then_ starts filtering. Those 50,000 rows are loaded every time someone makes a search, even if they only want the first page of 20 results.

**Problem 2: Filtering and pagination happen in application code instead of the database.** The database is built for exactly this kind of work — it can filter rows, sort them, and return just the page you asked for, all without moving unnecessary data. By doing `[c for c in all_candidates if c["status"] == status]` in Python, you're ignoring the database's ability to use indexes and query optimizations. The database could answer this query by scanning just an index (a data structure that speeds up lookups) and returning only the matching rows.

### Why does it matter at scale?

Imagine the company grows and the candidates table hits 100,000 rows. Every time a reviewer visits the candidates list, this function:

- Reads 100,000 rows from the database
- Stores them in Python objects, consuming memory on the server
- Loops through all 100,000 rows to find matching statuses
- Loops through the remaining rows again to filter by keyword
- Then slices out a tiny page of results and throws away the rest

If 20 reviewers hit the page at the same time, that's 2 million rows read from the database and 2 million loops in Python. The server's memory usage spikes, response times grow linearly with the table size, and what worked with 15 records collapses under real data.

### The correct approach

Push the filtering and pagination work into the database using SQL `WHERE`, `LIMIT`, and `OFFSET` clauses — or better yet, use your ORM (Object-Relational Mapper) to build the query safely:

```python
def search_candidates(db, status: str, keyword: str, page: int, page_size: int):
    stmt = select(Candidate).where(Candidate.status == status)

    if keyword:
        pattern = f"%{keyword}%"
        stmt = stmt.where(Candidate.name.ilike(pattern))

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    result = db.execute(stmt)
    return list(result.scalars().all())
```

This version:

- Lets the database do the filtering via `WHERE` — it only reads matching rows
- Uses `LIMIT` and `OFFSET` so the database returns just the one page of results
- Uses parameterized queries (via the ORM) so there's no **SQL injection** risk (an attack where malicious input tricks the database into running unintended commands)
- Keeps memory usage constant regardless of table size — if you ask for page 1 of 20, you get exactly 20 rows back from the database, not 100,000

You'll also benefit from database **indexes** — if you index the `status` column, the database can find matching rows in milliseconds without scanning the entire table. That's something you cannot replicate by filtering in Python.

---

## Reflection

This project was my first real encounter with FastAPI, Docker, and Server-Sent Events. My prior backend experience (working with APIs, databases, and structuring server-side code) helped me move faster — I wasn't starting from scratch on the core concepts — but getting comfortable with the tooling around each of these technologies took time. If I had more runway, I'd dig deeper into Docker — as currently I only configured Dockerfile to run the frontend and backend projects on other devices. I know there's more to docker that needs to be learned and experienced. On the SSE side, I'd love to explore more real-time patterns: things like broadcasting events across multiple server instances, reconnection strategies on the client, and combining SSE with WebSockets when bidirectional communication is needed.

---

## Example API calls

All endpoints are under `http://localhost:8000/api`. Here are the key ones you can run with `curl` to explore the API.

### Login and save the token

```bash
curl -s http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@techkraft.com", "password": "password123"}'
```

The response includes an `access_token`. Save it for subsequent calls:

```bash
TOKEN=$(curl -s http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@techkraft.com", "password": "password123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
```

### List candidates (with pagination and filtering)

```bash
curl -s http://localhost:8000/api/candidates \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl -s "http://localhost:8000/api/candidates?status=reviewed&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Search by keyword (matches name or email)
curl -s "http://localhost:8000/api/candidates?keyword=alice" \
  -H "Authorization: Bearer $TOKEN"

# Filter by skill
curl -s "http://localhost:8000/api/candidates?skill=Python" \
  -H "Authorization: Bearer $TOKEN"
```

### Get candidate summary

```bash
curl -s http://localhost:8000/api/candidates/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Get a single candidate

```bash
curl -s http://localhost:8000/api/candidates/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Score a candidate

```bash
curl -s -X POST http://localhost:8000/api/candidates/1/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"categories": [{"category": "Technical Skills", "score": 4}, {"category": "Communication", "score": 3}]}'
```

### Create a candidate (admin only)

```bash
curl -s -X POST http://localhost:8000/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "role_applied": "Backend Engineer", "skills": ["Python", "FastAPI"]}'
```

### Update candidate status (admin only)

```bash
curl -s -X PATCH http://localhost:8000/api/candidates/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "hired"}'
```

### Register a new reviewer

```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "New Reviewer", "email": "new@example.com", "password": "password123"}'
```
