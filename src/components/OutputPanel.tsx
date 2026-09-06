import { Terminal, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';
import { cn } from '../utils';

export function OutputPanel({ logs, onClear }: { logs: LogEntry[], onClear: () => void }) {
  return (
    <div className="h-full w-full bg-[#0D0D12] border-t border-white/10 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40">
        <div className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
          <Terminal size={14} className="mr-2" />
          Terminal / Output
        </div>
        <button onClick={onClear} className="text-gray-500 hover:text-white transition-colors" title="Clear Logs">
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-gray-600 flex items-center justify-center h-full italic">
            No output yet. Run debugger or deploy to see logs.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className={cn(
                "flex items-start p-1.5 rounded hover:bg-white/5 transition-colors group",
                log.type === 'error' && "text-red-400",
                log.type === 'success' && "text-green-400",
                log.type === 'warning' && "text-yellow-400",
                log.type === 'info' && "text-gray-300"
              )}>
                <span className="text-gray-600 mr-3 shrink-0">[{log.timestamp}]</span>
                <span className="mr-2 shrink-0 mt-0.5">
                  {log.type === 'error' && <AlertCircle size={12} />}
                  {log.type === 'success' && <CheckCircle2 size={12} />}
                  {log.type === 'warning' && <AlertCircle size={12} />}
                  {log.type === 'info' && <Info size={12} />}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
