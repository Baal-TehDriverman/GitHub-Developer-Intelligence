# GitHub Developer Intelligence

A developer intelligence dashboard: explore any GitHub user or organization, browse
their repositories, and generate AI-powered profile and repository analyses.

React + Vite + Tailwind frontend, Express backend, optional Google Gemini or local
Ollama inference.

## Features

- **GitHub exploration** — user profiles, repositories, READMEs, file trees, commits
  and language breakdowns for any public account or organization.
- **AI analysis** — developer archetype briefings, repository architecture reviews and
  an interactive Q&A assistant. Uses Google Gemini when `GEMINI_API_KEY` is set, a local
  Ollama model when one is reachable, and a deterministic local fallback otherwise.
- **Username normalization** — resolves common aliases for the Lilith Systems orgs.
- **Optional local integrations** — gateway proxy (apps, VMs, engine builds), Obsidian
  vault reader and a dream-cycle trigger. All are off unless explicitly configured.

## Quick start

```bash
npm install
cp .env.example .env   # optional — the app runs with no configuration
npm run dev
```

Open http://localhost:3010

Production:

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with the Express API |
| `npm run typecheck` | Type-check the project |
| `npm run build` | Type-check, build the frontend, bundle the server |
| `npm start` | Run the production build |

## Configuration

Every variable is optional — the dashboard works out of the box with unauthenticated
GitHub API access.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` / `DEV_INTEL_PORT` | `3010` | Server port |
| `HOST` | `127.0.0.1` | Interface to bind. Change to `0.0.0.0` only if you intend to expose the service. |
| `GEMINI_API_KEY` | — | Google Gemini API key. Enables model-backed analysis. |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model to use |
| `GITHUB_TOKEN` | — | GitHub token, raises API rate limits |
| `OLLAMA_URL` | `http://localhost:11434/api/generate` | Local Ollama endpoint |
| `DEFAULT_MODEL` | `gemma3-1b-jailbreak` | Local model name |
| `ADMIN_TOKEN` | — | Shared secret required by mutating routes. Until set, those routes return `403`. |
| `GATEWAY_URL` | `http://127.0.0.1:8081` | Base URL of the optional local gateway |
| `OBSIDIAN_VAULT_PATH` | — | Absolute path to a vault. Unset disables the vault routes. |
| `KAIROS_SCRIPT` | — | Path to the dream scheduler script. Unset disables the trigger. |
| `VITE_GATEWAY_URL` | — | Build-time URL of a separate gateway dashboard; shows the "open gateway" links |

## AI providers

Analysis requests try providers in order and stop at the first that answers:

1. **Google Gemini** — when `GEMINI_API_KEY` is set.
2. **Local Ollama / vLLM** — when `OLLAMA_URL` is reachable.
3. **Deterministic local synthesis** — no network, no API key. Returns a structural
   summary of the data rather than a model-generated one, and says so in the response.

## API

### GitHub proxy

| Method | Path |
|--------|------|
| GET | `/api/github/user/:username` |
| GET | `/api/github/user/:username/repos` |
| GET | `/api/github/repo/:owner/:repo/readme` |
| GET | `/api/github/repo/:owner/:repo/contents/*` |
| GET | `/api/github/repo/:owner/:repo/commits` |
| GET | `/api/github/repo/:owner/:repo/languages` |

### Analysis

| Method | Path |
|--------|------|
| POST | `/api/gemini/analyze-profile` (alias `/api/ai/analyze-profile`) |
| POST | `/api/gemini/analyze-repo` (alias `/api/ai/analyze-repo`) |
| POST | `/api/gemini/chat` (alias `/api/ai/chat`) |

### Gateway proxy

Read-only routes are open. Mutating routes — `POST /api/gateway/apps/launch/:name`,
`/api/gateway/vms/*`, `/api/gateway/engine/build`, `/api/gateway/engine/test`,
`/api/gateway/verify-mod-deployment`, `POST /v1/chat/completions` — require an
`x-admin-token` header matching `ADMIN_TOKEN`.

### Local integrations

`/api/vault/*` and `/api/dream/trigger` return `501` until `OBSIDIAN_VAULT_PATH` and
`KAIROS_SCRIPT` are configured.

### Health

`GET /health` reports service status and which integrations are enabled.

## Repository register

The "All Repositories" tab renders `public/repo-register.json`, which is gitignored.
Copy `public/repo-register.example.json` to get started:

```bash
cp public/repo-register.example.json public/repo-register.json
```

This keeps a deployment's curated list out of source control.

## Security notes

- The server binds to `127.0.0.1` by default. Exposing it publicly requires an explicit
  `HOST=0.0.0.0`, and mutating routes stay locked until `ADMIN_TOKEN` is set.
- Vault reads are contained to the configured directory; the search endpoint passes the
  query as an `rg` argument, never through a shell.
- No credentials are committed. `.env` is gitignored.

## License

MIT — see [LICENSE](./LICENSE).
