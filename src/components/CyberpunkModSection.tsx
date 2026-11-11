import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  FileCode,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  HardDrive,
  Clock,
  Download,
  Search,
  Trash2,
  Hammer,
  Check,
  X,
  Zap,
  Database,
  Server,
  Link2,
  ExternalLink,
  Terminal,
  AlertCircle,
  Info,
} from 'lucide-react';
import { fetchMsnStatus, fetchCyberpunkModStatus, verifyModDeployment } from '../api';
import { GATEWAY_URL, GATEWAY_LINKS_ENABLED } from '../config';

interface CyberpunkModSectionProps {
  onRefresh: () => void;
  onVerify: () => void;
}

export const CyberpunkModSection: React.FC<CyberpunkModSectionProps> = ({
  onRefresh,
  onVerify,
}) => {
  const [msnStatus, setMsnStatus] = useState<{ status: string; port: number; health: boolean } | null>(null);
  const [modStatus, setModStatus] = useState<{
    deployed: boolean;
    fresh: boolean;
    logs_available: boolean;
    archives_present: boolean;
    latest_redscript: string | null;
    deployed_redscripts: number;
    deployed_tweakdb: number;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ status: string; detail: string } | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const [msn, mod] = await Promise.all([
        fetchMsnStatus(),
        fetchCyberpunkModStatus(),
      ]);
      setMsnStatus(msn);
      setModStatus(mod);
    } catch (e) {
      console.error('Failed to load mod status:', e);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyModDeployment();
      setVerificationResult(result);
      setLastVerified(new Date());
    } catch (e) {
      setVerificationResult({ status: 'error', detail: String(e) });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'ok' || status === 'deployed') return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
    if (status === 'offline' || status === 'not_deployed') return 'text-red-400 bg-red-950/50 border-red-800/60';
    return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'ok' || status === 'deployed') return <CheckCircle className="w-5 h-5" />;
    if (status === 'offline' || status === 'not_deployed') return <XCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-pink-950/50 border border-pink-800/60">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">MSN Cyberpunk Mod</h2>
              <p className="text-slate-400">Grand Theft Cyberpunk v1.2.2 • REDscript + TweakDB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={loadStatus} className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleVerify} disabled={verifying} className="btn-primary">
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Deployment
                </>
              )}
            </button>
            {GATEWAY_LINKS_ENABLED && (
              <a href={`${GATEWAY_URL}/mod-deploy`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
                Web Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MSN Integration Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          icon={<Server className="w-5 h-5" />}
          iconBg="bg-purple-950/50 border-purple-800/60"
          iconColor="text-purple-400"
          label="MSN Router"
          value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(msnStatus?.health ? 'ok' : 'offline')}`}>
              {msnStatus?.health ? 'Online' : 'Offline'}
            </span>
          }
          trend="stable"
        />
        <StatusCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-pink-950/50 border-pink-800/60"
          iconColor="text-pink-400"
          label="Mod Deployed"
          value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(modStatus?.deployed ? 'deployed' : 'not_deployed')}`}>
              {modStatus?.deployed ? 'Yes' : 'No'}
            </span>
          }
          trend="stable"
        />
        <StatusCard
          icon={<FileCode className="w-5 h-5" />}
          iconBg="bg-cyan-950/50 border-cyan-800/60"
          iconColor="text-cyan-400"
          label="REDscripts"
          value={modStatus?.deployed_redscripts || 0}
          trend="stable"
        />
        <StatusCard
          icon={<Database className="w-5 h-5" />}
          iconBg="bg-amber-950/50 border-amber-800/60"
          iconColor="text-amber-400"
          label="TweakDB Entries"
          value={modStatus?.deployed_tweakdb || 0}
          trend="stable"
        />
      </div>

      {/* Deployment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-pink-400" />
            Deployment Status
          </h3>
          
          <div className="space-y-3">
            <StatusRow
              label="Archive Files"
              value={modStatus?.archives_present ? 'Present (≥3)' : 'Missing'}
              icon={modStatus?.archives_present ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            />
            <StatusRow
              label="CET Logs Available"
              value={modStatus?.logs_available ? 'Yes' : 'No'}
              icon={modStatus?.logs_available ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            />
            <StatusRow
              label="Fresh Deploy"
              value={modStatus?.fresh ? 'Yes' : 'No'}
              icon={modStatus?.fresh ? <Sparkles className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-slate-400" />}
            />
            <StatusRow
              label="Latest REDscript"
              value={modStatus?.latest_redscript || 'None'}
              icon={<FileCode className="w-4 h-4 text-cyan-400" />}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Verification Results
          </h3>
          
          {verificationResult ? (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${verificationResult.status === 'triggered' ? 'bg-emerald-950/50 border-emerald-800/60' : 'bg-red-950/50 border-red-800/60'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.status === 'triggered' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-medium text-white capitalize">{verificationResult.status}</span>
                </div>
                <p className="text-slate-300">{verificationResult.detail}</p>
              </div>
              {lastVerified && (
                <p className="text-xs text-slate-500">Last verified: {lastVerified.toLocaleString()}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Verify Deployment" to run full mod verification.</p>
              <p className="text-xs mt-1">Runs test_all_mods.py --deployed in MSN repo.</p>
            </div>
          )}
        </div>
      </div>

      {/* File Structure */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          Mod File Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FileTreeSection
            title="scripts/"
            count={modStatus?.deployed_redscripts || 0}
            icon={<FileCode className="w-5 h-5" />}
            color="text-cyan-400"
            files={[
              'msn_main.reds',
              'msn_ui.reds',
              'msn_gameplay.reds',
              'msn_network.reds',
              'msn_utils.reds',
            ]}
          />
          <FileTreeSection
            title="tweakdb/"
            count={modStatus?.deployed_tweakdb || 0}
            icon={<Database className="w-5 h-5" />}
            color="text-amber-400"
            files={[
              'msn_items.yaml',
              'msn_vehicles.yaml',
              'msn_weapons.yaml',
              'msn_clothing.yaml',
              'msn_cyberware.yaml',
            ]}
          />
          <FileTreeSection
            title="r6/cache/modded/"
            count={modStatus?.archives_present ? 3 : 0}
            icon={<HardDrive className="w-5 h-5" />}
            color="text-purple-400"
            files={[
              'msn_integration.archive',
              'msn_patches.archive',
              'msn_assets.archive',
            ]}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Useful Commands
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <CommandCard
            cmd="python3 tools/test_all_mods.py --deployed"
            desc="Run full verification"
            icon={<Check className="w-4 h-4" />}
          />
          <CommandCard
            cmd="python3 tools/deploy_mod.py"
            desc="Deploy mod to game"
            icon={<Download className="w-4 h-4" />}
          />
          <CommandCard
            cmd="python3 tools/clean_deploy.py"
            desc="Clean deploy (rebuild)"
            icon={<Trash2 className="w-4 h-4" />}
          />
          <CommandCard
            cmd="tail -f cyber_engine_tweaks.log"
            desc="Watch CET logs live"
            icon={<Terminal className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};

const StatusCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}> = ({ icon, iconBg, iconColor, label, value, trend }) => (
  <div className="glass rounded-xl p-4 border border-slate-800/60">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg border ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
    </div>
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

const StatusRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm text-slate-300">{label}</span>
    </div>
    <span className="font-mono text-slate-200">{value}</span>
  </div>
);

const FileTreeSection: React.FC<{ title: string; count: number; icon: React.ReactNode; color: string; files: string[] }> = ({ title, count, icon, color, files }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className={color}>{icon}</span>
      <h4 className="font-medium text-white">{title} <span className="text-slate-400 font-normal">({count})</span></h4>
    </div>
    <div className="space-y-1.5">
      {files.map((file, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-sm">
          <span className="text-slate-500">├─</span>
          <code className="text-slate-200 font-mono text-xs">{file}</code>
        </div>
      ))}
      {count === 0 && (
        <div className="p-4 text-center text-slate-500 text-sm">No files deployed</div>
      )}
    </div>
  </div>
);

const CommandCard: React.FC<{ cmd: string; desc: string; icon: React.ReactNode }> = ({ cmd, desc, icon }) => (
  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-emerald-400">{icon}</span>
      <code className="text-xs font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">{cmd}</code>
    </div>
    <p className="text-[10px] text-slate-400">{desc}</p>
  </div>
);