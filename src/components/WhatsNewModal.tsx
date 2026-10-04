import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Shield, Zap, Upload, CheckCircle2, History, 
  Flame, Lock, Database, Unlock, ChevronUp, ChevronDown, Play, Pause 
} from 'lucide-react';

export interface ChangelogRelease {
  version: string;
  date: string;
  isLatest?: boolean;
  tag: string;
  tagColor: string;
  summary: string;
  highlights: {
    iconName?: 'zap' | 'shield' | 'upload' | 'sparkles' | 'check' | 'lock' | 'database' | 'unlock';
    title: string;
    description: string;
  }[];
}

const RELEASES: ChangelogRelease[] = [
  {
    version: 'v2.7.0',
    date: 'October 2026',
    isLatest: true,
    tag: 'MoonSec Deobfuscator',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'Full-scale Lua & MoonSec Deobfuscation Suite featuring multi-stage VM bytecode unpacking, identifier normalization, and constant folding.',
    highlights: [
      {
        iconName: 'unlock',
        title: 'MoonSec & VM Bytecode Unpacker',
        description: 'Automatically analyzes and decrypts virtualized chunk tables, rolling ciphers, and string tables from MoonSec, Fsociety, IronBrew, and Lua VM loaders.'
      },
      {
        iconName: 'zap',
        title: 'Identifier Normalizer & Lookalike Cleaner',
        description: 'Replaces indecipherable lookalike variable names and obfuscated hashes with clean sequential identifiers while strictly preserving Roblox globals and services.'
      },
      {
        iconName: 'sparkles',
        title: 'Constant Folding & AST Beautifier',
        description: 'Simplifies mathematical expressions, merges concatenated string literals, inlines constant lookup tables, and reformats into clean Lua syntax.'
      }
    ]
  },
  {
    version: 'v2.6.0',
    date: 'October 2026',
    tag: 'Roblox Cloud & Anti-Scraper',
    tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    summary: 'Roblox raw loadstring cloud endpoint, anti-scraper inspection shield, and permanent backend persistence with script recovery vault.',
    highlights: [
      {
        iconName: 'zap',
        title: 'Roblox Raw Loadstring Cloud',
        description: 'Upload scripts and immediately generate permanent loadstring(game:HttpGet("https://.../raw/ID"))() endpoints configured specifically for Roblox executors.'
      },
      {
        iconName: 'lock',
        title: 'Anti-Scraper & Anti-Inspection Shield',
        description: 'Automated 403 rejection perimeter blocks direct browser navigation, web scrapers, and Python request libraries from extracting raw code payloads.'
      },
      {
        iconName: 'database',
        title: 'Permanent Persistence & Script Recovery Vault',
        description: 'Multi-tier storage engine with local autosave snapshots, permanent cloud mirrors, and instant 1-click restore vault ensuring scripts never disappear.'
      }
    ]
  },
  {
    version: 'v2.5.1',
    date: 'September 2026',
    tag: 'Bug Fix & Stability',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'Resolved script generation pipeline errors, enhanced AI model routing with auto-failover, and fortified identifier uniqueness.',
    highlights: [
      {
        iconName: 'zap',
        title: 'Multi-Model Resilient AI Engine',
        description: 'Switched generation to ultra-fast Codestral with intelligent multi-stage fallback across Gemini 3.1 Flash-Lite and Gemini 3.8 Flash to guarantee continuous generation without 403 or 404 errors.'
      },
      {
        iconName: 'shield',
        title: 'Collision-Proof Variable Generator',
        description: 'Enforced cryptographic set uniqueness on lookalike variable generation to prevent any potential scoping conflicts or VM syntax issues in complex scripts.'
      },
      {
        iconName: 'check',
        title: 'Execution & Obfuscator Stabilization',
        description: 'Enhanced compatibility across all major executor runtimes with verified byte decoders and anti-tamper routines.'
      }
    ]
  },
  {
    version: 'v2.5.0',
    date: 'September 2026',
    tag: 'Big Update',
    tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    summary: 'Massive performance overhaul with high-capacity Lua project uploader and instant batch obfuscation.',
    highlights: [
      {
        iconName: 'zap',
        title: 'High-Speed Bytecode Chunking Engine',
        description: 'Optimized chunked stream encoding and non-blocking VM decrypter. Processes multi-megabyte Lua projects in milliseconds without memory exhaustion or browser freezing.'
      },
      {
        iconName: 'upload',
        title: 'Huge Project & .ZIP Archive Uploader',
        description: 'Upload standalone files, nested directory trees, or .zip project archives. Extract full project structures and batch-obfuscate entire packages in one click.'
      },
      {
        iconName: 'shield',
        title: 'Dynamic Anti-Lag Yielding',
        description: 'Smart executor yielding with task.wait and task.defer preventing client frame drops or game freezes during runtime execution.'
      },
      {
        iconName: 'sparkles',
        title: 'SafeLink 3-Stage Chained Loader',
        description: 'Automated 3-tier encrypted proxy deployment with custom alias shorteners and direct loadstring clipboard export.'
      }
    ]
  },
  {
    version: 'v2.4.0',
    date: 'September 2026',
    tag: 'Optimization',
    tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    summary: 'Execution performance and lag prevention updates.',
    highlights: [
      {
        iconName: 'zap',
        title: 'Client FPS Protection',
        description: 'Integrated execution pacing into the obfuscator VM loop to keep game frame rates high during initial script initialization.'
      },
      {
        iconName: 'shield',
        title: 'Lookalike Variable Density',
        description: 'Enhanced entropy of identifier generation using indistinguishable lookalike patterns to defeat decompilers and AST reconstruction.'
      }
    ]
  },
  {
    version: 'v2.3.0',
    date: 'August 2026',
    tag: 'Security Presets',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    summary: 'Added four security profile presets with specialized hardening layers.',
    highlights: [
      {
        iconName: 'shield',
        title: 'Four Security Profiles',
        description: 'Choose between Fast (minimal overhead), Balanced (production standard), Paranoid (maximum anti-tamper), and VM Ultimate (custom bytecode interpreter).'
      },
      {
        iconName: 'sparkles',
        title: 'Anti-Hook & Environment Sandboxing',
        description: 'Prevents runtime inspection of pcall, string.char, string.byte, and table.concat functions.'
      }
    ]
  },
  {
    version: 'v2.2.0',
    date: 'July 2026',
    tag: 'AI Assistant',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    summary: 'Integrated custom AI script generation and code assistance.',
    highlights: [
      {
        iconName: 'sparkles',
        title: 'Multi-Model Script AI',
        description: 'Generate, debug, and optimize Roblox exploit scripts with live search grounding and workspace path scraping.'
      },
      {
        iconName: 'upload',
        title: 'Workspace File Explorer',
        description: 'Multi-file editor tabs, folder hierarchy management, and local session caching.'
      }
    ]
  },
  {
    version: 'v2.1.0',
    date: 'June 2026',
    tag: 'Cloud Integration',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    summary: 'Added cloud pastebin hosting and 1-click loadstring link generation.',
    highlights: [
      {
        iconName: 'zap',
        title: 'Instant Loadstring Generator',
        description: 'Publish obfuscated scripts to raw paste services and generate ready-to-run loadstring(game:HttpGet(...))() snippets.'
      }
    ]
  },
  {
    version: 'v2.0.0',
    date: 'May 2026',
    tag: 'Core Release',
    tagColor: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    summary: 'Fsociety Obfuscator core engine release with modern dark interface.',
    highlights: [
      {
        iconName: 'shield',
        title: 'Full VM Obfuscator',
        description: 'Complete AST transformations, control-flow flattening, and string table encryption.'
      }
    ]
  }
];

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('fsociety_last_seen_version', RELEASES[0].version);
    }
  }, [isOpen]);

  useEffect(() => {
    let intervalId: any;
    if (isAutoScrolling && scrollRef.current) {
      intervalId = setInterval(() => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 2) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTop += 2;
        }
      }, 30);
    }
    return () => clearInterval(intervalId);
  }, [isAutoScrolling]);

  if (!isOpen) return null;

  const scrollToTop = () => {
    setIsAutoScrolling(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    setIsAutoScrolling(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const renderIcon = (name?: string) => {
    switch (name) {
      case 'unlock': return <Unlock size={14} className="text-emerald-400" />;
      case 'zap': return <Zap size={14} className="text-amber-400" />;
      case 'shield': return <Shield size={14} className="text-indigo-400" />;
      case 'upload': return <Upload size={14} className="text-emerald-400" />;
      case 'sparkles': return <Sparkles size={14} className="text-purple-400" />;
      case 'lock': return <Lock size={14} className="text-rose-400" />;
      case 'database': return <Database size={14} className="text-cyan-400" />;
      default: return <CheckCircle2 size={14} className="text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/70 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
                <Flame size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                  What's New in Fsociety
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                    {RELEASES[0].version}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Changelog and historical update patch notes
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

          <div className="px-5 py-2 bg-zinc-950/40 border-b border-white/5 flex items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <History size={13} />
              <span>Scroll history to explore all releases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border transition-colors ${
                  isAutoScrolling 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-zinc-800 text-zinc-400 border-white/5 hover:text-white'
                }`}
              >
                {isAutoScrolling ? <Pause size={10} /> : <Play size={10} />}
                <span>{isAutoScrolling ? 'Pause Scroll' : 'Auto Scroll'}</span>
              </button>
              <button
                onClick={scrollToTop}
                className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"
                title="Scroll to Latest (v2.7.0)"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={scrollToBottom}
                className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"
                title="Scroll to Oldest (v2.0.0)"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef} 
            className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6 scroll-smooth"
          >
            <div className="relative border-l border-zinc-800 ml-3.5 space-y-8 pl-5">
              {RELEASES.map((release) => (
                <div key={release.version} className="relative group">
                  <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                    release.isLatest 
                      ? 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-500/20' 
                      : 'bg-zinc-800 border-zinc-600 group-hover:border-zinc-400'
                  }`} />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white tracking-wide">
                        {release.version}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${release.tagColor}`}>
                        {release.tag}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {release.date}
                      </span>
                      {release.isLatest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          Current Version
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 font-medium">
                      {release.summary}
                    </p>

                    <div className="grid gap-2 pt-1">
                      {release.highlights.map((h, i) => (
                        <div 
                          key={i} 
                          className="p-3 bg-zinc-950/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors space-y-1"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                            {renderIcon(h.iconName)}
                            <span>{h.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed pl-5">
                            {h.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-zinc-500 font-mono">
              v2.7.0 • Scroll up or down to review changelogs
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
