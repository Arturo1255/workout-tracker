# Workout Tracker

A full-stack workout logging app. Create an account, log workouts with any number of sets, review your history, chart your progress per exercise, and get flagged when you hit a personal record.

<!--
Add screenshots to docs/screenshots/ and uncomment this section:

![Home page](docs/screenshots/home.png)
![Log workout](docs/screenshots/log-workout.png)
![Progress chart](docs/screenshots/progress.png)
-->

## Features

- **Authentication.** Sign up and log in with a username and password. Passwords are hashed with bcrypt, and sessions use signed JWTs through NextAuth.
- **Workout logging.** Record a date, optional notes, and any number of sets (exercise, reps, weight). Set numbers are assigned and renumbered automatically.
- **Workout history.** Browse past workouts as cards, with each set shown in a table and exercise names resolved from the exercise library.
- **Progress charts.** Pick an exercise and see your average weight per workout over time.
- **PR detection.** Every new set is compared against your heaviest previous set for that exercise. The API returns a flag per set, and the form celebrates when you set a record.
- **Per-user data.** Workout routes are protected, and a user can only read and write their own workouts.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | NextAuth v4 (credentials provider), bcrypt |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | Prisma Next (`@prisma/orm-postgres`, release candidate) |
| Charts | Recharts |
| Dates | `@js-temporal/polyfill` |
| Containers | Docker (multi-stage build using Next.js standalone output) |

## Data model

```
User  1 ──── *  Workout  1 ──── *  WorkoutSet  * ──── 1  Exercise
```

- **User:** username, hashed password, name, email
- **Workout:** belongs to a user, with a date, optional notes, and a created timestamp
- **WorkoutSet:** belongs to a workout and references an exercise, with reps, weight, and set number
- **Exercise:** a shared library of exercises, with a name, category, and muscle group

The schema lives in `src/prisma/contract.prisma`.

## Design decisions

- **The session decides who you are.** The workout API reads the user ID from the server-side session. It never accepts a user ID from the request body.
- **PR status is computed, not stored.** Each submission is checked against the user's existing workouts before the new one is saved, so a workout never counts as its own history. Computing on the fly avoids stale flags if workouts are ever edited or deleted. The trade-off is a little extra work per request, which is fine at this scale.
- **Nested writes.** A workout and all of its sets are created in a single call, so a workout can't end up half-saved.
- **Chart values are per-workout averages.** The chart plots the average weight across an exercise's sets in each workout, which gives one point per session. PR detection uses the heaviest single set instead, since that is what a record means.
- **Shared styles.** Button, card, and input styles live in `lib/styles.ts`, so a color change is a one-line edit.

## Getting started

### Prerequisites

- Node.js 22 (LTS)
- A PostgreSQL 15+ database. A free Supabase project works well.

### Setup

```bash
git clone https://github.com/Arturo1255/workout-tracker.git
cd workout-tracker
npm install
```

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="generate one with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Create the tables, then start the dev server:

```bash
npx prisma db init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you change `src/prisma/contract.prisma`, regenerate the contract files with `npx prisma contract emit`.

### Add some exercises

The exercise library starts empty, and there's no exercise management page yet. Add exercises through the API:

```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name":"Bench Press","category":"Push","muscleGroup":"Chest"}'
```

Then sign up, log in, and log your first workout.

## Running with Docker

The app can also run in a container, so you don't need Node installed locally. The image is built in two stages. The first stage installs dependencies and runs `next build`. The second stage starts from a clean Node image and copies in only the standalone server that Next.js produces (`output: "standalone"` in `next.config.ts`), then runs it with `node server.js`.

The container only runs the web app. The database stays external (Supabase, in this setup), so the tables must already exist before you start it. If you haven't created them yet, run `npx prisma db init` once from your machine, as described in the setup steps above.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any Docker engine), running
- A PostgreSQL 15+ database that already has the tables created

### 1. Create an env file for Docker

Create a file named `.env.docker` in the project root:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=paste-a-secret-generated-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

Don't wrap the values in quotes. Unlike the `.env` loader used by the app itself, `docker run --env-file` takes values literally, so the quote characters would become part of the value and break the connection string.

`.env.docker` is covered by the `.env*` patterns in both `.gitignore` and `.dockerignore`, so it won't be committed or copied into the image. Secrets are supplied when the container starts, never baked into the image.

### 2. Build the image

```bash
docker build -t workout-tracker .
```

### 3. Run the container

```bash
docker run --rm -p 3000:3000 --env-file ./.env.docker workout-tracker
```

Open [http://localhost:3000](http://localhost:3000). Press `Ctrl+C` to stop it. The `--rm` flag deletes the container when it stops.

To run it in the background instead:

```bash
docker run -d --name tracker -p 3000:3000 --env-file ./.env.docker workout-tracker
docker logs -f tracker    # follow the logs
docker stop tracker       # stop it
docker rm tracker         # remove it
```

### Docker notes

- **Port mapping is `host:container`.** The app always listens on 3000 inside the container. To use a different port on your machine, change only the first number (for example `-p 8080:3000`), and set `NEXTAUTH_URL` to `http://localhost:8080` so login redirects match the address in your browser.
- **The server binds to `0.0.0.0`.** The Dockerfile sets `HOSTNAME=0.0.0.0`. Without it, the standalone server listens only on the container's loopback interface, and your browser can't reach it even though the logs look healthy.
- **A database on your own machine.** Inside a container, `localhost` means the container itself. If Postgres runs on your Mac, use `host.docker.internal` as the host in `DATABASE_URL`.
- **Rebuilding.** After you change code, run `docker build` again. Dependency installation is cached, so rebuilds are fast unless `package.json` or `package-lock.json` changed.

## API reference

| Method | Route | Auth required | Description |
| --- | --- | --- | --- |
| POST | `/api/signup` | No | Create an account |
| GET, POST | `/api/auth/[...nextauth]` | No | NextAuth sign-in, session, and sign-out handlers |
| GET | `/api/exercises` | No | List all exercises |
| POST | `/api/exercises` | No | Create an exercise |
| GET | `/api/workouts` | Yes | List the current user's workouts, including sets |
| POST | `/api/workouts` | Yes | Create a workout with sets. The response includes `prFlags`, one boolean per set |

Example request body for `POST /api/workouts`:

```json
{
  "date": "2026-09-07",
  "notes": "Felt strong today",
  "sets": [
    { "exerciseId": 1, "reps": 10, "weight": 135, "setNumber": 1 },
    { "exerciseId": 1, "reps": 8, "weight": 145, "setNumber": 2 }
  ]
}
```

## Project structure

```
app/
├── api/
│   ├── auth/[...nextauth]/   NextAuth configuration
│   ├── exercises/            Exercise list and creation
│   ├── signup/               Account creation
│   └── workouts/             Workout list and creation (with PR detection)
├── components/Nav.tsx        Navigation bar
├── login/                    Login page
├── signup/                   Signup page
├── workouts/
│   ├── new/                  Log a workout
│   └── page.tsx              Workout history
├── progress/                 Progress chart
└── page.tsx                  Home page
lib/
├── chartData.ts              Turns workouts into per-exercise chart data
├── prDetection.ts            Personal record logic
└── styles.ts                 Shared Tailwind class constants
src/prisma/
├── contract.prisma           Data model
└── db.ts                     Database client and connection helper
migrations/                   Migration history
Dockerfile                    Two-stage build (build, then a minimal runtime image)
.dockerignore                 Keeps secrets, node_modules, and git history out of the image
next.config.ts                Enables standalone output for the Docker build
```

## Known limitations and roadmap

- Add edit and delete for workouts
- Add an exercise management page, and restrict exercise creation to signed-in users
- Support decimal weights in the form (the database already stores weight as a float)
- Paginate the workout history
- Add automated tests, starting with the PR detection and chart data functions
- Run the Docker container as a non-root user
- Investigate the Docker image size, which is larger than a typical Next.js standalone image
- Add a Docker Compose file so one command starts the app with its settings
- Deploy to Vercel

## Notes

Prisma Next is a release candidate, so its API may change. The project was developed on Node 22, and a few early Node 24 builds had compatibility problems with Next.js 16 in development.
