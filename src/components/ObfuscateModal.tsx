import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Zap, Skull, Cpu, Check, X, Lock, Copy, Download, Link as LinkIcon, 
  BarChart2, RefreshCw, FileText, CheckCircle2, AlertTriangle, ChevronRight
} from 'lucide-react';
import { ObfuscatePreset, ObfuscateOptions, ObfuscationStats } from '../types';

interface ObfuscateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onObfuscate: (preset: ObfuscatePreset, options: ObfuscateOptions) => Promise<{ code: string; stats: ObfuscationStats }>;
  onApplyCode: (code: string) => void;
  onCopyCode: (code: string) => void;
  onDownloadCode: (code: string) => void;
  onSafeLink: () => void;
  currentCode: string;
}

export function ObfuscateModal({
  isOpen,
  onClose,
  onObfuscate,
  onApplyCode,
  onCopyCode,
  onDownloadCode,
  onSafeLink,
  currentCode
}: ObfuscateModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<ObfuscatePreset>('Balanced');
  const [options, setOptions] = useState<ObfuscateOptions>({
    renameLocals: true,
    encryptStrings: true,
    encryptConstants: true,
    controlFlow: true,
    antiHook: true,
    antiTamper: true,
    watermark: true,
    polymorphic: true,
    debugProtection: true,
    minify: true,
    weirdSpacing: true,
    realtimeGuard: true,
    antiLag: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [obfuscatedResult, setObfuscatedResult] = useState<{ code: string; stats: ObfuscationStats } | null>(null);

  const presets: { id: ObfuscatePreset; name: string; icon: any; desc: string; color: string }[] = [
    { id: 'Fast', name: 'Fast', icon: Zap, desc: 'Lightweight protection with minimal execution overhead.', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { id: 'Balanced', name: 'Balanced', icon: Shield, desc: 'Optimal ratio of reverse engineering resistance & speed.', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'Paranoid', name: 'Paranoid', icon: Skull, desc: 'Max transformations, opaque predicates & anti-decompiler traps.', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
    { id: 'VM Ultimate', name: 'VM Ultimate', icon: Cpu, desc: 'Virtual Machine dispatch, bytecode mutation & register shuffling.', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' }
  ];

  const handlePresetSelect = (preset: ObfuscatePreset) => {
    setSelectedPreset(preset);
    if (preset === 'Fast') {
      setOptions({
        renameLocals: true,
        encryptStrings: true,
        encryptConstants: false,
        controlFlow: false,
        antiHook: false,
        antiTamper: false,
        watermark: true,
        polymorphic: true,
        debugProtection: false,
        antiLag: true,
      });
    } else if (preset === 'Balanced') {
      setOptions({
        renameLocals: true,
        encryptStrings: true,
        encryptConstants: true,
        controlFlow: true,
        antiHook: true,
        antiTamper: false,
        watermark: true,
        polymorphic: true,
        debugProtection: true,
        antiLag: true,
      });
    } else if (preset === 'Paranoid') {
      setOptions({
        renameLocals: true,
        encryptStrings: true,
        encryptConstants: true,
        controlFlow: true,
        antiHook: true,
        antiTamper: true,
        watermark: true,
        polymorphic: true,
        debugProtection: true,
        antiLag: true,
      });
    } else if (preset === 'VM Ultimate') {
      setOptions({
        renameLocals: true,
        encryptStrings: true,
        encryptConstants: true,
        controlFlow: true,
        antiHook: true,
        antiTamper: true,
        watermark: true,
        polymorphic: true,
        debugProtection: true,
        antiLag: true,
      });
    }
  };

  const toggleOption = (key: keyof ObfuscateOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunObfuscation = async () => {
    setIsLoading(true);
    try {
      const result = await onObfuscate(selectedPreset, options);
      setObfuscatedResult(result);
    } catch (err) {
      console.error('Obfuscation modal run failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatKB = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-zinc-950/60 shrink-0">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
                  Fsociety Obfuscator <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">v6.0</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">Commercial-grade Luau & Lua 5.1 Protection Pipeline</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 custom-scrollbar flex-1">
            {/* Presets Selection */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                Protection Profile Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`flex flex-col p-2.5 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? preset.color + ' ring-1 ring-indigo-500/50'
                          : 'bg-zinc-800/40 border-white/5 hover:bg-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <Icon size={16} className={`sm:w-4 sm:h-4 ${isSelected ? '' : 'text-zinc-400'}`} />
                        {isSelected && <Check size={14} className="text-indigo-400" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-white mb-0.5">{preset.name}</span>
                      <span className="text-[10px] sm:text-[11px] text-zinc-400 leading-tight line-clamp-2">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Toggles */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                Security Protections & Transforms
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {[
                  { key: 'renameLocals', label: 'Rename Identifiers & Locals', desc: 'Randomize variables with lookalike characters' },
                  { key: 'encryptStrings', label: 'Encrypt Environment & Strings', desc: 'Converts literals to dynamic byte decryptors' },
                  { key: 'encryptConstants', label: 'Encrypt Constants & Numbers', desc: 'Split numbers into runtime math expressions' },
                  { key: 'controlFlow', label: 'Control-Flow Flattening', desc: 'Dispatchers & state-machine execution flow' },
                  { key: 'antiHook', label: 'Active Anti-Hook & Integrity Guard', desc: 'Inspects getfenv, type hooks & checksums' },
                  { key: 'realtimeGuard', label: 'Real-Time Timing & Heartbeat Guard', desc: 'Live execution delta probe to block step-debuggers' },
                  { key: 'weirdSpacing', label: 'Weird Spaced Layout Format', desc: 'Alien spaced tokens, nested brackets & multi-line arrays' },
                  { key: 'antiTamper', label: 'Anti-Decompiler Traps', desc: 'Inject opaque predicates & bogus bytecode' },
                  { key: 'polymorphic', label: 'Polymorphic Seed Generation', desc: 'Rotates keys & decoder layout per build' },
                  { key: 'antiLag', label: 'Anti-Lag Engine Execution', desc: 'Slices long decryption runs to protect FPS and framerate' },
                  { key: 'watermark', label: 'Fsociety Permanent Watermark', desc: 'Preserves verified Fsociety header comment' },
                ].map((item) => {
                  const key = item.key as keyof ObfuscateOptions;
                  const enabled = options[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleOption(key)}
                      className={`flex items-start p-2.5 sm:p-3 rounded-xl border text-left transition-all active:scale-[0.99] min-h-[52px] ${
                        enabled
                          ? 'bg-zinc-800/80 border-indigo-500/30 text-white'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <div className={`mt-0.5 mr-2.5 sm:mr-3 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        enabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-800'
                      }`}>
                        {enabled && <Check size={12} />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{item.label}</div>
                        <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Obfuscated Build Statistics Output */}
            {obfuscatedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 sm:p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs sm:text-sm">
                    <BarChart2 size={16} />
                    <span>Build Protection Statistics</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                    {obfuscatedResult.stats.preset} Profile
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[9px] sm:text-[10px] uppercase">Variables Renamed</span>
                    <span className="text-white font-mono font-bold text-xs sm:text-sm">{obfuscatedResult.stats.variablesRenamed}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[9px] sm:text-[10px] uppercase">Strings Encrypted</span>
                    <span className="text-white font-mono font-bold text-xs sm:text-sm">{obfuscatedResult.stats.stringsEncrypted}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[9px] sm:text-[10px] uppercase">Control Blocks</span>
                    <span className="text-white font-mono font-bold text-xs sm:text-sm">{obfuscatedResult.stats.controlFlowBlocks}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                    <span className="text-zinc-400 block text-[9px] sm:text-[10px] uppercase">Dead Code Blocks</span>
                    <span className="text-white font-mono font-bold text-xs sm:text-sm">{obfuscatedResult.stats.deadCodeBlocks}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-zinc-300 font-mono">
                  <span>File Expansion:</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatKB(obfuscatedResult.stats.originalSize)} → {formatKB(obfuscatedResult.stats.obfuscatedSize)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/10 bg-zinc-950/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={handleRunObfuscation}
              disabled={isLoading || !currentCode}
              className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer min-h-[42px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin mr-2" />
                  Obfuscating...
                </>
              ) : (
                <>
                  <Shield size={15} className="mr-2" />
                  {obfuscatedResult ? 'Re-Obfuscate Code' : 'Obfuscate Code'}
                </>
              )}
            </button>

            {obfuscatedResult && (
              <div className="grid grid-cols-3 sm:flex items-center gap-2">
                <button
                  onClick={() => {
                    onApplyCode(obfuscatedResult.code);
                    onClose();
                  }}
                  className="flex items-center justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors min-h-[40px]"
                >
                  <CheckCircle2 size={13} className="mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Apply to Editor</span>
                  <span className="sm:hidden">Apply</span>
                </button>
                <button
                  onClick={() => onCopyCode(obfuscatedResult.code)}
                  className="flex items-center justify-center px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 rounded-xl text-xs font-medium transition-colors min-h-[40px]"
                >
                  <Copy size={13} className="mr-1 sm:mr-1.5" />
                  Copy
                </button>
                <button
                  onClick={() => onDownloadCode(obfuscatedResult.code)}
                  className="flex items-center justify-center px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 rounded-xl text-xs font-medium transition-colors min-h-[40px]"
                >
                  <Download size={13} className="mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
