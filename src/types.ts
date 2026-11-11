export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  site_admin?: boolean;
  twitter_username?: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  visibility: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  open_issues_count: number;
  archived: boolean;
  disabled: boolean;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

export interface AiProfileAnalysis {
  archetype: string;
  summary: string;
  primaryDomains: string[];
  signatureInnovations: string[];
  technicalStrengths: string[];
  suggestedCollaborations: string;
}

export interface RepoAnalysis {
  architectureOverview: string;
  coreComponents: string[];
  techStackHighlights: string[];
  useCases: string[];
  potentialEnhancements: string[];
  complexityScore: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SystemStatus {
  status: string;
  service: string;
  version: string;
  cpu_load?: string;
  memory_used?: string;
  timestamp: string;
  gateway_version: string;
  vms_available: boolean;
}

export interface AppInfo {
  name: string;
  exec: string;
  description: string;
  categories: string[];
  terminal: boolean;
  icon: string;
}

export interface AppsData {
  apps: AppInfo[];
  count: number;
  timestamp: string;
}

export interface VMInfo {
  name: string;
  state: string;
  autostart: boolean;
  persistent: boolean;
  vcpu: number;
  memory: number;
}

export interface VmsData {
  vms: VMInfo[];
  count: number;
}

export interface EngineStatus {
  status: string;
  current_step: string;
  progress: number;
  last_build: string | null;
  last_logs: BuildLogEntry[];
  artifacts: EngineArtifacts;
  engine_root: string;
  build_dir: string;
}

export interface BuildLogEntry {
  type: 'build_log';
  timestamp: string;
  level: 'info' | 'debug' | 'error' | 'success';
  message: string;
}

export interface EngineArtifacts {
  executables: EngineArtifact[];
  libraries: EngineArtifact[];
  tests: EngineArtifact[];
}

export interface EngineArtifact {
  name: string;
  path: string;
  size: number;
}

export interface BuildRequest {
  build_type: string;
  clean: boolean;
  target: string;
}

export interface DreamEntry {
  id: number;
  timestamp: string;
  session: string;
  patterns: Record<string, any>;
  insights: string[];
  context_snapshot: Record<string, any>;
  created_at: string;
}

export interface DreamData {
  dreams: DreamEntry[];
  count: number;
}

export interface WebSocketMessage {
  type: 'build_log' | 'build_state' | 'pong' | 'error' | 'inventory' | 'auth';
  payload?: any;
  timestamp?: string;
}

export interface LanguageStats {
  language: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface GitHubLanguageData {
  [language: string]: number;
}

export type TabId =
  | 'overview'
  | 'github'
  | 'gateway'
  | 'engine'
  | 'cyberpunk'
  | 'dreams'
  | 'knowledge'
  | 'telemetry'
  | 'council'
  | 'all-repos';