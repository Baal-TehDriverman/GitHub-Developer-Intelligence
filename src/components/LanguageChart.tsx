import React, { useMemo } from 'react';
import { GitHubRepo } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Code2, Palette } from 'lucide-react';

interface LanguageChartProps {
  repos: GitHubRepo[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3776AB',
  'C++': '#f34b7d',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Redscript: '#ff2c4d',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Lua: '#000080',
  C: '#555555',
  CMake: '#064F8C',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  YAML: '#cb171e',
  JSON: '#292929',
  Markdown: '#083fa1',
  'C#': '#178600',
  Java: '#b07219',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Vue: '#42b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
  R: '#198CE7',
  Scala: '#DC322F',
  Haskell: '#5e5086',
  OCaml: '#EC6813',
  FSharp: '#378BBA',
  Elixir: '#6E4A7E',
  Erlang: '#B83998',
  Clojure: '#db5855',
  Zig: '#ec915c',
  Odin: '#60AFF8',
  V: '#4f87c5',
  Nim: '#ffc200',
  Crystal: '#000100',
  Julia: '#a270ba',
  Perl: '#0298c3',
  Raku: '#0000fb',
  Assembly: '#6E4C13',
  PowerShell: '#012456',
};

export const LanguageChart: React.FC<LanguageChartProps> = ({ repos }) => {
  const languageData = useMemo(() => {
    const languageBytes: Record<string, number> = {};
    let totalBytes = 0;

    repos.forEach((repo) => {
      if (repo.language) {
        // Estimate bytes based on repo size (this is approximate)
        const estimatedBytes = repo.size * 1024; // size is in KB
        languageBytes[repo.language] = (languageBytes[repo.language] || 0) + estimatedBytes;
        totalBytes += estimatedBytes;
      }
    });

    return Object.entries(languageBytes)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0',
        color: LANGUAGE_COLORS[language] || '#64748b',
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 12);
  }, [repos]);

  if (languageData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 border border-slate-800/60 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
            <Code2 className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Language Distribution</h3>
            <p className="text-xs text-slate-400">No language data available</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No repositories with language data found.</p>
        </div>
      </div>
    );
  }

  const totalBytes = languageData.reduce((sum, item) => sum + item.bytes, 0);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="glass rounded-2xl p-6 border border-slate-800/60 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-800/60">
            <Palette className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Language & Technology Distribution</h3>
            <p className="text-xs text-slate-400">Estimated from repository sizes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total: {formatBytes(totalBytes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={languageData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="language"
                width={100}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value: any, name: any) => [formatBytes(Number(value)), String(name)]}
                labelFormatter={(label: any) => String(label)}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="top"
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar
                dataKey="bytes"
                name="Bytes"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Language List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {languageData.map((entry, index) => (
            <div
              key={entry.language}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 transition-all group"
            >
              <span className="text-xs text-slate-500 font-mono w-6 text-right">{index + 1}.</span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{entry.language}</p>
                <p className="text-[10px] text-slate-500">{entry.percentage}% • {formatBytes(entry.bytes)}</p>
              </div>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${entry.percentage}%`, backgroundColor: entry.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};