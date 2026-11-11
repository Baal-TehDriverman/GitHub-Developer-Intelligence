import fs from 'fs';
import path from 'path';
import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { execFile, execFileSync } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execFileAsync = promisify(execFile);

const app = express();
const PORT = Number(process.env.PORT || process.env.DEV_INTEL_PORT || 3010);
const HOST = process.env.HOST || "127.0.0.1";

app.use(express.json({ limit: "100kb" }));

// ===== SECURITY HEADERS =====
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// ===== CONFIGURATION =====
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const OBSIDIAN_VAULT = process.env.OBSIDIAN_VAULT_PATH || "";
const KAIROS_SCRIPT = process.env.KAIROS_SCRIPT || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Mutating routes (VM control, engine builds, app launches, LLM proxy) require a
// shared secret. Without ADMIN_TOKEN they are disabled outright.
function requireAdmin(req: express.Request, res: express.Response, next: express.Response | any) {
  if (!ADMIN_TOKEN) {
    return res.status(403).json({
      error: "Mutating routes are disabled. Set ADMIN_TOKEN in the environment to enable them.",
    });
  }
  const provided = (req.header("x-admin-token") || req.header("authorization") || "").replace(/^Bearer\s+/i, "");
  if (provided !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Invalid or missing admin token" });
  }
  next();
}

// Helper to safely get Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'github-developer-intelligence',
      }
    }
  });
}

// GitHub API proxy helper
function getGithubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "github-developer-intelligence/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  const token = process.env.GITHUB_TOKEN || "";

  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") || token.startsWith("token ")
      ? token
      : `token ${token}`;
  }

  return headers;
}

function normalizeUsername(username: string): string {
  const clean = (username || "").trim();
  const lower = clean.toLowerCase();
  if (
    lower === "thedriverman" ||
    lower === "the-driverman" ||
    lower === "the driver man" ||
    lower === "driverman" ||
    lower === "driver-man-coop"
  ) {
    return "The-Driver-Man";
  }
  if (lower === "lilithsystems" || lower === "lilith-systems") {
    return "Lilith-Systems";
  }
  if (lower === "baaltehdriverman" || lower === "baal-tehdriverman") {
    return "Baal-TehDriverman";
  }
  return clean;
}

// ===== GITHUB API ROUTES =====

// 1. Get User Profile
app.get("/api/github/user/:username", async (req, res) => {
  try {
    const rawUsername = req.params.username;
    const username = normalizeUsername(rawUsername);
    let response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: getGithubHeaders(),
    });
    if (!response.ok) {
      response = await fetch(`https://api.github.com/orgs/${encodeURIComponent(username)}`, {
        headers: getGithubHeaders(),
      });
    }
    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user profile" });
  }
});

// 2. Get User Repositories
app.get("/api/github/user/:username/repos", async (req, res) => {
  try {
    const rawUsername = req.params.username;
    const username = normalizeUsername(rawUsername);
    const headers = getGithubHeaders();

    let repos: any[] = [];

    // Strategy A: /users/:username/repos
    const userRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers }
    );
    if (userRes.ok) {
      const data = await userRes.json();
      if (Array.isArray(data) && data.length > 0) {
        repos = data;
      }
    }

    // Strategy B: /orgs/:username/repos
    if (repos.length === 0) {
      const orgRes = await fetch(
        `https://api.github.com/orgs/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
        { headers }
      );
      if (orgRes.ok) {
        const data = await orgRes.json();
        if (Array.isArray(data) && data.length > 0) {
          repos = data;
        }
      }
    }

    // Strategy C: Authenticated user repos filter
    if (repos.length === 0) {
      const authRes = await fetch(`https://api.github.com/user/repos?per_page=100&type=all`, { headers });
      if (authRes.ok) {
        const allData = await authRes.json();
        if (Array.isArray(allData)) {
          repos = allData.filter(
            (r: any) => r.owner?.login?.toLowerCase() === username.toLowerCase()
          );
        }
      }
    }

    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch repositories" });
  }
});

// 3. Get Repository README
app.get("/api/github/repo/:owner/:repo/readme", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
      headers: {
        ...getGithubHeaders(),
        Accept: "application/vnd.github.v3.raw",
      },
    });
    if (!response.ok) {
      return res.status(response.status).send("No README found or error fetching README.");
    }
    const text = await response.text();
    res.send(text);
  } catch (error: any) {
    res.status(500).send("Error fetching README.");
  }
});

// 4. Get Repository File Tree / Contents
app.get("/api/github/repo/:owner/:repo/contents*", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const pathParam = req.params[0] || "";
    const cleanPath = pathParam.startsWith("/") ? pathParam.slice(1) : pathParam;
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(cleanPath)}`;
    const response = await fetch(url, { headers: getGithubHeaders() });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch repository contents" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch contents" });
  }
});

// 5. Get Repo Commits
app.get("/api/github/repo/:owner/:repo/commits", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=15`, {
      headers: getGithubHeaders(),
    });
    if (!response.ok) {
      return res.status(response.status).json([]);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.json([]);
  }
});

// 6. Get Repo Language Breakdown
app.get("/api/github/repo/:owner/:repo/languages", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`, {
      headers: getGithubHeaders(),
    });
    if (!response.ok) {
      return res.status(response.status).json({});
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.json({});
  }
});

// ===== AI ROUTES (Gemini -> local Ollama -> deterministic synthesis) =====

async function generateWithGemini(prompt: string): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;
  try {
    const result = await client.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
    return result.text || null;
  } catch (e: any) {
    console.warn("Gemini request failed, falling back:", e?.message || e);
    return null;
  }
}

// Helper: Sovereign Local AI Generator (runs locally without external paid API quota limits)
async function generateSovereignLocalAI(prompt: string, type: 'profile' | 'repo' | 'chat', context: any): Promise<any> {
  // 1. Gemini, when an API key is configured
  const geminiText = await generateWithGemini(prompt);
  if (geminiText) {
    if (type === 'profile' || type === 'repo') {
      try {
        return JSON.parse(geminiText);
      } catch {
        return { summary: geminiText };
      }
    }
    return { text: geminiText };
  }

  // 2. Local Ollama / vLLM, when reachable
  const localGatewayUrl = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(localGatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.DEFAULT_MODEL || "gemma3-1b-jailbreak",
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (response.ok) {
      const data = await response.json();
      if (type === 'profile' || type === 'repo') {
        return JSON.parse(data.response || data.text || "{}");
      }
      return { text: data.response || data.text };
    }
  } catch (e) {
    // Local Ollama not reachable -> fall through to deterministic synthesis
  }

  // 3. Deterministic local synthesis (no network, no API key)
  if (type === 'profile') {
    const username = context.username || "Developer";
    const repoCount = context.repos?.length || 0;
    const repoNames = context.repos?.map((r: any) => r.name).join(", ") || "various systems";
    return {
      archetype: "Software Engineer",
      summary: `${username} maintains ${repoCount} public repositories (${repoNames}). This analysis was generated locally without an AI provider; set GEMINI_API_KEY or run Ollama for a full model-backed analysis.`,
      primaryDomains: ["Public repository activity"],
      signatureInnovations: [],
      technicalStrengths: [],
      suggestedCollaborations: "Set GEMINI_API_KEY to enable model-backed collaboration suggestions.",
      source: "local-synthesis"
    };
  }

  if (type === 'repo') {
    const repo = context.repo || {};
    const name = repo.name || "Repository";
    const lang = repo.language || "TypeScript";
    const desc = repo.description || "";
    return {
      architectureOverview: `The ${name} repository is written primarily in ${lang}. ${desc}`.trim(),
      coreComponents: [],
      techStackHighlights: [lang],
      useCases: [],
      potentialEnhancements: [],
      complexityScore: 0,
      source: "local-synthesis"
    };
  }

  const query = (context.userQuery || "").toLowerCase();
  let reply = `**Local Analysis (no AI provider configured):**\n\nSet GEMINI_API_KEY to enable Google Gemini, or run Ollama locally and set OLLAMA_URL.`;

  if (query.includes("hello") || query.includes("hi") || query.includes("status") || query.includes("how")) {
    reply = `**System Status:**\n\n- GitHub API proxy: available\n- Gemini: ${process.env.GEMINI_API_KEY ? "configured" : "not configured"}\n- Local Ollama: ${process.env.OLLAMA_URL || "default (localhost:11434)"}\n\nWhat would you like to inspect?`;
  } else {
    reply = `**Local Analysis:**\n\nRegarding \`${context.userQuery}\` for ${context.username || "this account"}: no AI provider is configured, so this is a placeholder response. Set GEMINI_API_KEY or run Ollama locally for a real answer.`;
  }

  return { text: reply };
}

// 7. Analyze Developer Profile & Archetype
app.post(["/api/gemini/analyze-profile", "/api/ai/analyze-profile"], async (req, res) => {
  try {
    const { username, profile, repos } = req.body;
    const prompt = `Analyze this GitHub developer profile and return JSON with keys: archetype, summary, primaryDomains (array), signatureInnovations (array), technicalStrengths (array), suggestedCollaborations.\n\nUsername: ${username}\nProfile: ${JSON.stringify(profile).slice(0, 4000)}\nRepositories: ${JSON.stringify((repos || []).slice(0, 30)).slice(0, 8000)}`;
    const data = await generateSovereignLocalAI(prompt, "profile", { username, profile, repos });
    res.json(data);
  } catch (error: any) {
    console.error("analyze-profile error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze developer profile" });
  }
});

// 8. Analyze Specific Repository
app.post(["/api/gemini/analyze-repo", "/api/ai/analyze-repo"], async (req, res) => {
  try {
    const { repo, readmeText, languageBreakdown } = req.body;
    const prompt = `Analyze this repository and return JSON with keys: architectureOverview, coreComponents (array), techStackHighlights (array), useCases (array), potentialEnhancements (array), complexityScore (number).\n\nRepository: ${JSON.stringify(repo).slice(0, 4000)}\nLanguages: ${JSON.stringify(languageBreakdown).slice(0, 2000)}\nREADME: ${(readmeText || "").slice(0, 8000)}`;
    const data = await generateSovereignLocalAI(prompt, "repo", { repo, readmeText, languageBreakdown });
    res.json(data);
  } catch (error: any) {
    console.error("analyze-repo error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze repository" });
  }
});

// 9. Interactive Q&A Chat
app.post(["/api/gemini/chat", "/api/ai/chat"], async (req, res) => {
  try {
    const { username, selectedRepo, userQuery, history } = req.body;
    const prompt = `You are a concise developer-intelligence assistant. Answer the user's question about the GitHub account ${username}${selectedRepo ? ` and the repository ${selectedRepo.name}` : ""}.\n\nQuestion: ${userQuery}`;
    const data = await generateSovereignLocalAI(prompt, "chat", { username, selectedRepo, userQuery, history });
    res.json(data);
  } catch (error: any) {
    console.error("chat error:", error);
    res.status(500).json({ error: error.message || "Query failed" });
  }
});

// ===== GATEWAY PROXY ROUTES =====

const GATEWAY_BASE = process.env.GATEWAY_URL || "http://127.0.0.1:8081";

// Proxy middleware for the local gateway
async function proxyToGateway(req: express.Request, res: express.Response, gatewayPath: string) {
  try {
    const url = `${GATEWAY_BASE}${gatewayPath}${req.url.replace('/api/gateway', '')}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    res.status(response.status).json(data);
  } catch (error: any) {
    console.warn(`Gateway proxy error for ${gatewayPath}:`, error.message);
    res.status(502).json({
      status: "offline",
      message: "Local gateway is unreachable. Set GATEWAY_URL and run the gateway service.",
    });
  }
}

// Read-only gateway routes
app.get("/api/gateway/apps", (req, res) => proxyToGateway(req, res, "/api/apps"));
app.get("/api/gateway/apps/search/:query", (req, res) => proxyToGateway(req, res, "/api/apps/search/" + req.params.query));
app.get("/api/gateway/vms", (req, res) => proxyToGateway(req, res, "/api/vms"));
app.get("/api/gateway/status", (req, res) => proxyToGateway(req, res, "/api/status"));
app.get("/api/gateway/engine/status", (req, res) => proxyToGateway(req, res, "/api/engine/status"));
app.get("/api/gateway/engine/artifacts", (req, res) => proxyToGateway(req, res, "/api/engine/artifacts"));
app.get("/api/gateway/engine/rom/status", (req, res) => proxyToGateway(req, res, "/api/engine/rom/status"));
app.get("/api/gateway/msn/status", (req, res) => proxyToGateway(req, res, "/api/msn/status"));
app.get("/api/gateway/msn/cyberpunk", (req, res) => proxyToGateway(req, res, "/api/msn/cyberpunk"));
app.get("/api/gateway/abyssal/status", (req, res) => proxyToGateway(req, res, "/api/abyssal/status"));
app.get("/api/gateway/categories", (req, res) => proxyToGateway(req, res, "/api/categories"));

// Mutating gateway routes — require admin token
app.post("/api/gateway/apps/launch/:appName", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/apps/launch/" + req.params.appName));
app.post("/api/gateway/vms/:action/:vmName", requireAdmin, (req, res) => proxyToGateway(req, res, `/api/vms/${req.params.action}/${req.params.vmName}`));
app.post("/api/gateway/vms/console/:vmName", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/vms/console/" + req.params.vmName));
app.post("/api/gateway/vms/manager", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/vms/manager"));
app.post("/api/gateway/engine/build", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/engine/build"));
app.post("/api/gateway/engine/test", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/engine/test"));
app.post("/api/gateway/verify-mod-deployment", requireAdmin, (req, res) => proxyToGateway(req, res, "/api/verify-mod-deployment"));

// LLM proxy — require admin token
app.post("/v1/chat/completions", requireAdmin, async (req, res) => {
  try {
    const response = await fetch(`${GATEWAY_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers['x-api-key'] && { 'x-api-key': req.headers['x-api-key'] as string }),
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(502).json({ error: `LLM proxy error: ${error.message}` });
  }
});

app.get("/v1/models", async (req, res) => {
  try {
    const response = await fetch(`${GATEWAY_BASE}/v1/models`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(502).json({ error: `LLM proxy error: ${error.message}` });
  }
});

// ===== KAIROS DREAM ROUTES =====

// In-memory dream storage (replace with SQLite in production)
const dreamStore: any[] = [];

app.post("/api/dream/trigger", requireAdmin, async (req, res) => {
  try {
    if (!KAIROS_SCRIPT) {
      return res.status(501).json({
        error: "Dream trigger is not configured. Set KAIROS_SCRIPT to the path of the dream scheduler script.",
      });
    }
    const { session = 'default' } = req.body;
    if (typeof session !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(session)) {
      return res.status(400).json({ error: "Invalid session identifier" });
    }

    const { stdout } = await execFileAsync("python3", [KAIROS_SCRIPT, "--session", session, "--once"], {
      cwd: path.dirname(KAIROS_SCRIPT),
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });

    res.json({ status: 'triggered', session, output: stdout.slice(0, 2000) });
  } catch (error: any) {
    console.error('Dream trigger error:', error?.message || error);
    res.status(500).json({ error: error?.message || "Dream trigger failed" });
  }
});

app.get("/api/dream/history/:session", (req, res) => {
  const session = req.params.session;
  const filtered = dreamStore.filter(d => d.session === session);
  res.json({ dreams: filtered, count: filtered.length });
});

app.get("/api/dreams", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const session = req.query.session as string;

  let filtered = dreamStore;
  if (session) {
    filtered = filtered.filter(d => d.session === session);
  }

  res.json({ dreams: filtered.slice(-limit), count: filtered.length });
});

// ===== OBSIDIAN VAULT ROUTES =====

function vaultEnabled() {
  return Boolean(OBSIDIAN_VAULT) && fs.existsSync(OBSIDIAN_VAULT);
}

app.get("/api/vault/index", (req, res) => {
  if (!vaultEnabled()) {
    return res.status(501).json({ error: "Vault is not configured. Set OBSIDIAN_VAULT_PATH to enable vault routes." });
  }
  try {
    const root = path.resolve(OBSIDIAN_VAULT);

    function scanDir(dir: string): any[] {
      const items: any[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            items.push({
              name: entry.name,
              type: 'folder',
              path: path.relative(root, fullPath),
              children: scanDir(fullPath),
            });
          }
        } else if (entry.name.endsWith('.md')) {
          const stats = fs.statSync(fullPath);
          items.push({
            name: entry.name.replace('.md', ''),
            type: 'file',
            path: path.relative(root, fullPath),
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }
      return items;
    }

    res.json({ vault: scanDir(root) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read vault" });
  }
});

app.get("/api/vault/file/*", (req, res) => {
  if (!vaultEnabled()) {
    return res.status(501).json({ error: "Vault is not configured. Set OBSIDIAN_VAULT_PATH to enable vault routes." });
  }
  try {
    const root = path.resolve(OBSIDIAN_VAULT);
    const rel = req.params[0];
    const fullPath = path.resolve(root, rel + (rel.endsWith('.md') ? '' : '.md'));

    // Contain the read inside the vault
    if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content, path: path.relative(root, fullPath) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read file" });
  }
});

app.get("/api/vault/search", (req, res) => {
  if (!vaultEnabled()) {
    return res.status(501).json({ error: "Vault is not configured. Set OBSIDIAN_VAULT_PATH to enable vault routes." });
  }
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ results: [] });
    }
    if (query.length > 200) {
      return res.status(400).json({ error: "Query too long" });
    }

    // Argument-array exec: the query is never interpreted by a shell.
    const result = execFileSync(
      "rg",
      ["-i", "-l", query, "--type", "md", "."],
      { cwd: OBSIDIAN_VAULT, encoding: 'utf-8', timeout: 10000, maxBuffer: 2 * 1024 * 1024 }
    );

    const root = path.resolve(OBSIDIAN_VAULT);
    const files = result.trim().split('\n').filter(Boolean);
    const results = files.map(file => {
      const fullPath = path.join(root, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const matchLine = lines.find(l => l.toLowerCase().includes(query.toLowerCase()));
      return {
        file,
        path: path.relative(root, fullPath),
        preview: matchLine ? matchLine.trim().slice(0, 200) : '',
      };
    });

    res.json({ results, count: results.length });
  } catch (error: any) {
    // rg exits 1 when there are no matches
    if (error?.status === 1) {
      return res.json({ results: [], count: 0 });
    }
    res.status(500).json({ error: "Search failed" });
  }
});

// ===== KNOWLEDGE GRAPH API =====

const KNOWLEDGE_GRAPH_PATH = path.join(process.cwd(), "public", "msn-knowledge-graph.json");

app.get("/api/knowledge-graph/msn", (req, res) => {
  try {
    if (fs.existsSync(KNOWLEDGE_GRAPH_PATH)) {
      const raw = fs.readFileSync(KNOWLEDGE_GRAPH_PATH, 'utf-8');
      const data = JSON.parse(raw);
      res.json(data);
    } else {
      res.json({ title: "No knowledge graph available", nodes: [], edges: [] });
    }
  } catch (error: any) {
    res.json({ title: "Error loading knowledge graph", nodes: [], edges: [], error: "Failed to parse knowledge graph" });
  }
});

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "github-developer-intelligence",
    version: "1.0.0",
    ai: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      ollama: Boolean(process.env.OLLAMA_URL) || "default",
    },
    vault: vaultEnabled(),
    adminRoutes: Boolean(ADMIN_TOKEN),
  });
});

// ===== VITE & STATIC FILE SETUP =====
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`GitHub Developer Intelligence — http://${HOST}:${PORT}`);
    console.log(`  Frontend: http://localhost:${PORT}`);
    console.log(`  API:      http://localhost:${PORT}/api/*`);
    console.log(`  AI:       Gemini ${process.env.GEMINI_API_KEY ? "configured" : "not configured"} | Ollama ${process.env.OLLAMA_URL || "default"}`);
    console.log(`  Vault:    ${vaultEnabled() ? "enabled" : "disabled"} | Admin routes: ${ADMIN_TOKEN ? "enabled" : "disabled"}`);
  });
}

startServer();
