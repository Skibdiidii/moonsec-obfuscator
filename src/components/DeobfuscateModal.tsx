import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Unlock, Check, X, Copy, Download, RefreshCw, BarChart2, 
  CheckCircle2, Sparkles, Layers, Cpu, ArrowRight, Eye, Code2,
  Columns, Trash2, Play
} from 'lucide-react';
import { DeobfuscateOptions, DeobfuscationStats } from '../types';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';

interface DeobfuscateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCode: (code: string) => void;
  initialCode: string;
}

const SAMPLE_SCRIPTS = {
  moonsec: `local _v = {"\\108\\111\\99\\97\\108\\32\\80\\108\\97\\121\\101\\114\\115\\32\\61\\32\\103\\97\\109\\101\\58\\71\\101\\116\\83\\101\\114\\118\\105\\99\\101\\40\\34\\80\\108\\97\\121\\101\\114\\115\\34\\41\\10\\112\\114\\105\\110\\116\\40\\34\\77\\111\\111\\110\\83\\101\\99\\32\\85\\110\\112\\97\\99\\107\\101\\100\\32\\83\\117\\99\\99\\101\\115\\115\\102\\117\\108\\108\\121\\33\\34\\41"}
local _Il1l = string.char(112, 114, 105, 110, 116)
local _v1 = game:GetService("Players")
local _0x89fa = _v1.LocalPlayer
local _result = (10 * 10) + 42
_Il1l("Value: " .. _result)
`,
  stringTable: `local _T = { [1] = "Players", [2] = "Workspace", [3] = "print", [4] = "Script Authenticated" }
local _v = game:GetService(_T[1])
local _p = _v.LocalPlayer
_T[3](_T[4])
local _num = 0x2A + (50 - 8)
`,
  escapes: `local _name = "\\x52\\x6f\\x62\\x6c\\x6f\\x78\\x20\\x53\\x65\\x63\\x75\\x72\\x69\\x74\\x79"
local _greet = "Hello " .. "World " .. "\\x21"
if not false then
    print(_name .. " " .. _greet)
end
`
};

export function DeobfuscateModal({
  isOpen,
  onClose,
  onApplyCode,
  initialCode
}: DeobfuscateModalProps) {
  const [inputCode, setInputCode] = useState(initialCode || '');
  const [outputCode, setOutputCode] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'split'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<DeobfuscationStats | null>(null);

  const [options, setOptions] = useState<DeobfuscateOptions>({
    unpackVmBytecode: true,
    normalizeIdentifiers: true,
    foldConstants: true,
    decodeHexStrings: true,
    beautify: true,
    aiAssist: true
  });

  React.useEffect(() => {
    if (isOpen && initialCode && !inputCode) {
      setInputCode(initialCode);
    }
  }, [isOpen, initialCode]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof DeobfuscateOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadSample = (key: keyof typeof SAMPLE_SCRIPTS) => {
    setInputCode(SAMPLE_SCRIPTS[key]);
    setOutputCode('');
    setStats(null);
    setActiveTab('input');
  };

  const handleDeobfuscate = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/deobfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          options
        })
      });

      const data = await res.json();
      if (res.ok && data.code) {
        setOutputCode(data.code);
        setStats(data.stats);
        if (activeTab === 'input') {
          setActiveTab('output');
        }
      } else {
        alert(data.error || 'Deobfuscation process failed');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputCode) return;
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Deobfuscated_Script.lua';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh]"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-950/70 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Unlock size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                  MoonSec & Lua Deobfuscator
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    VM Unpacker Engine
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Unpack MoonSec, Fsociety, IronBrew, and Lua VM loaders into readable source code
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-2.5 bg-zinc-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'input'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code2 size={13} />
                <span>Input</span>
              </button>
              <button
                onClick={() => setActiveTab('output')}
                disabled={!outputCode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 ${
                  activeTab === 'output'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Eye size={13} />
                <span>Result</span>
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'split'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">Quick Test:</span>
              <button
                onClick={() => loadSample('moonsec')}
                className="px-2 py-1 text-[11px] rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                MoonSec VM
              </button>
              <button
                onClick={() => loadSample('stringTable')}
                className="px-2 py-1 text-[11px] rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                String Table
              </button>
              <button
                onClick={() => loadSample('escapes')}
                className="px-2 py-1 text-[11px] rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                Hex Escapes
              </button>
              <button
                onClick={() => toggleOption('aiAssist')}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 ml-2 ${
                  options.aiAssist
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-zinc-200'
                }`}
                title="Uses AI models to reconstruct Roblox variable names and control structures"
              >
                <Sparkles size={12} className={options.aiAssist ? 'text-purple-400' : ''} />
                <span>AI Logic Recovery</span>
              </button>
            </div>
          </div>

          <div className="px-5 py-3 border-b border-white/5 bg-zinc-950/20 grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
            {[
              { key: 'unpackVmBytecode', label: 'VM Bytecode Unpack', icon: Cpu },
              { key: 'decodeHexStrings', label: 'Decode Strings & Hex', icon: Layers },
              { key: 'foldConstants', label: 'Constant Folding', icon: BarChart2 },
              { key: 'normalizeIdentifiers', label: 'Clean Identifiers', icon: Unlock },
              { key: 'beautify', label: 'Code Beautifier', icon: Code2 },
            ].map(item => {
              const key = item.key as keyof DeobfuscateOptions;
              const enabled = options[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleOption(key)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    enabled
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                    enabled ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-800'
                  }`}>
                    {enabled && <Check size={10} />}
                  </div>
                  <span className="text-[11px] font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden relative flex flex-col p-4">
            {activeTab === 'split' ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
                <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
                  <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <span>Obfuscated Input ({inputCode.length} chars)</span>
                    <button
                      onClick={() => setInputCode('')}
                      className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar p-3">
                    <Editor
                      value={inputCode}
                      onValueChange={setInputCode}
                      highlight={c => Prism.highlight(c, Prism.languages.lua, 'lua')}
                      padding={8}
                      className="font-mono text-xs leading-relaxed text-zinc-200 outline-none"
                      placeholder="Paste obfuscated Lua code here..."
                    />
                  </div>
                </div>

                <div className="border border-emerald-500/20 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
                  <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-emerald-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={13} />
                      <span>Deobfuscated Result ({outputCode.length} chars)</span>
                    </span>
                    {outputCode && (
                      <button
                        onClick={handleCopy}
                        className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar p-3">
                    <Editor
                      value={outputCode}
                      onValueChange={setOutputCode}
                      highlight={c => Prism.highlight(c, Prism.languages.lua, 'lua')}
                      padding={8}
                      className="font-mono text-xs leading-relaxed text-zinc-200 outline-none"
                      placeholder="Deobfuscated code will appear here..."
                    />
                  </div>
                </div>
              </div>
            ) : activeTab === 'input' ? (
              <div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
                <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span>Paste Obfuscated Script Below (MoonSec, Fsociety, IronBrew, etc.)</span>
                  <div className="flex items-center gap-3">
                    <span>{inputCode.length} characters</span>
                    {inputCode && (
                      <button
                        onClick={() => setInputCode('')}
                        className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-3">
                  <Editor
                    value={inputCode}
                    onValueChange={setInputCode}
                    highlight={c => Prism.highlight(c, Prism.languages.lua, 'lua')}
                    padding={12}
                    className="font-mono text-xs leading-relaxed text-zinc-200 outline-none"
                    placeholder="Paste obfuscated Lua code here..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 border border-emerald-500/20 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
                <div className="px-3.5 py-2 bg-zinc-900/80 border-b border-white/5 flex items-center justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={13} />
                    <span>Deobfuscated & Cleaned Source Code</span>
                  </span>
                  <span>{outputCode.length} characters</span>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-3">
                  <Editor
                    value={outputCode}
                    onValueChange={setOutputCode}
                    highlight={c => Prism.highlight(c, Prism.languages.lua, 'lua')}
                    padding={12}
                    className="font-mono text-xs leading-relaxed text-zinc-200 outline-none"
                  />
                </div>
              </div>
            )}

            {stats && (
              <div className="mt-3 p-3 bg-zinc-950/70 border border-emerald-500/20 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">VM Chunks</span>
                  <span className="text-emerald-400 font-mono font-bold">{stats.vmChunksUnpacked} unpacked</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Strings Decrypted</span>
                  <span className="text-white font-mono font-bold">{stats.stringsDecrypted}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Identifiers</span>
                  <span className="text-white font-mono font-bold">{stats.variablesNormalized} normalized</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Constants Folded</span>
                  <span className="text-white font-mono font-bold">{stats.expressionsFolded}</span>
                </div>
                <div className="p-2 bg-zinc-900/60 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase">Size Reduction</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatSize(stats.originalSize)} → {formatSize(stats.deobfuscatedSize)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-3.5 border-t border-white/10 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleDeobfuscate}
              disabled={isLoading || !inputCode.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Deobfuscating Pipeline...</span>
                </>
              ) : (
                <>
                  <Unlock size={14} />
                  <span>Deobfuscate Script</span>
                </>
              )}
            </button>

            {outputCode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onApplyCode(outputCode);
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <ArrowRight size={13} />
                  <span>Apply to Workspace</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Save .lua</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
