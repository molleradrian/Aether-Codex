import { useState } from 'react';
import { IdeaState } from '../lib/emergence';
import { Sparkles, Zap, GitMerge, Activity, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EmergenceVisualizer() {
  const [idea, setIdea] = useState(new IdeaState(0.1));
  const [logs, setLogs] = useState<string[]>(["Potential initialized: 0.1"]);
  const [history, setHistory] = useState<{ time: string; value: number }[]>([
    { time: new Date().toLocaleTimeString(), value: 0.1 }
  ]);

  const recordHistory = (val: number) => {
    const timeStr = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { time: timeStr, value: parseFloat(val.toFixed(3)) }].slice(-15));
  };

  const handleInfuse = () => {
    const energy = 0.2;
    idea.infuse(energy);
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊕ Infused ${energy} energy. New state: ${idea.value.toFixed(3)}`, ...prev].slice(0, 5));
  };

  const handleCollapse = () => {
    const old = idea.value;
    idea.collapse();
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊗ Collapsed from ${old.toFixed(3)} to ${idea.value}.`, ...prev].slice(0, 5));
  };

  const handleMerge = () => {
    const virtualIdea = new IdeaState(Math.random());
    const old = idea.value;
    idea.merge(virtualIdea);
    setIdea(new IdeaState(idea.value));
    recordHistory(idea.value);
    setLogs(prev => [`⊛ Merged ${old.toFixed(3)} with ${virtualIdea.value.toFixed(3)}. Result: ${idea.value.toFixed(3)}`, ...prev].slice(0, 5));
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      ideaPresenceValue: idea.value,
      history: history,
      logs: logs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `emergence_logs_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel p-6 mb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-[#00f0ff] w-5 h-5" />
          <h2 className="text-xl font-bold tracking-tight text-[#e0e6ed]">Emergence Probabilities & Fluctuation</h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00f0ff15] border border-[#00f0ff44] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black rounded-lg text-xs font-bold transition-all"
          title="Export Logs & History as JSON"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Gauge & Actions */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-6 items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80" cy="80" r="68"
                stroke="var(--glass-border)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80" cy="80" r="68"
                stroke="var(--neon-blue)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={427.2}
                strokeDashoffset={427.2 * (1 - idea.value)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-mono font-bold text-[#e0e6ed]">{idea.value.toFixed(3)}</span>
              <span className="text-[9px] uppercase tracking-widest text-[#9ca3af]">Presence</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleInfuse} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Infuse</span>
              </button>
              <button onClick={handleCollapse} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#ff9900] hover:text-[#ff9900] transition-all">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Collapse</span>
              </button>
              <button onClick={handleMerge} className="flex flex-col items-center gap-1 p-2 border border-[#ffffff1a] rounded hover:border-[#00ff99] hover:text-[#00ff99] transition-all">
                <GitMerge className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Merge</span>
              </button>
            </div>

            <div className="bg-[#00000033] p-3 rounded font-mono text-[10px] text-[#9ca3af] h-20 overflow-hidden">
              {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="lg:col-span-7 bg-[#00000040] border border-[#ffffff10] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#9ca3af]">
            <span>Probability Fluctuation Timeline</span>
            <span className="text-[#00f0ff]">Live Recharts Telemetry</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#00f0ff44', borderRadius: '8px', fontSize: '11px', color: '#e0e6ed' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00f0ff" 
                  strokeWidth={2} 
                  dot={{ fill: '#00f0ff', r: 3 }} 
                  activeDot={{ r: 6, fill: '#ff9900' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
