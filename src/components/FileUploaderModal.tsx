import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FolderUp, FileCode, Archive, X, Check, ArrowRight, 
  Trash2, Shield, Download, CheckCircle2, AlertCircle, Loader2, Sparkles, Copy, Globe, Terminal
} from 'lucide-react';
import JSZip from 'jszip';
import { ObfuscatePreset, ObfuscateOptions } from '../types';
import { generateId } from '../utils';

export interface UploadedLuaFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  lines: number;
  selected: boolean;
  obfuscatedContent?: string;
  rawUrl?: string;
  loadstring?: string;
  status: 'pending' | 'obfuscating' | 'done' | 'uploaded' | 'error';
  errorMessage?: string;
}

interface FileUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFiles: (importedFiles: { path: string; name: string; content: string }[]) => void;
  onObfuscateFile?: (code: string, preset: ObfuscatePreset, options: ObfuscateOptions) => Promise<{ code: string; stats: any }>;
}

export function FileUploaderModal({
  isOpen,
  onClose,
  onImportFiles,
  onObfuscateFile
}: FileUploaderModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedLuaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [isBatchObfuscating, setIsBatchObfuscating] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<ObfuscatePreset>('Balanced');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const countLines = (str: string) => {
    return str.split('\n').length;
  };

  const processFileContent = (name: string, path: string, content: string): UploadedLuaFile => {
    return {
      id: generateId(),
      name,
      path: path || name,
      content,
      size: new Blob([content]).size,
      lines: countLines(content),
      selected: true,
      status: 'pending'
    };
  };

  const handleNativeFiles = async (fileList: FileList | File[]) => {
    const newItems: UploadedLuaFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relPath = (file as any).webkitRelativePath || file.name;
      
      if (file.name.endsWith('.zip')) {
        setIsProcessingZip(true);
        try {
          const zip = new JSZip();
          const zipData = await zip.loadAsync(file);
          
          for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
            if (!zipEntry.dir && (relativePath.endsWith('.lua') || relativePath.endsWith('.luau') || relativePath.endsWith('.txt'))) {
              const content = await zipEntry.async('text');
              const parts = relativePath.split('/');
              const name = parts[parts.length - 1];
              newItems.push(processFileContent(name, relativePath, content));
            }
          }
        } catch (err: any) {
          console.error('Failed to unpack zip archive:', err);
        } finally {
          setIsProcessingZip(false);
        }
      } else if (file.name.endsWith('.lua') || file.name.endsWith('.luau') || file.name.endsWith('.txt')) {
        try {
          const content = await file.text();
          newItems.push(processFileContent(file.name, relPath, content));
        } catch (err) {
          console.error(`Failed to read file ${file.name}`, err);
        }
      }
    }

    if (newItems.length > 0) {
      setUploadedFiles(prev => [...prev, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleNativeFiles(e.dataTransfer.files);
    }
  };

  const toggleSelect = (id: string) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  };

  const toggleSelectAll = () => {
    const allSelected = uploadedFiles.every(f => f.selected);
    setUploadedFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setProgressPercent(0);
    setProgressText('');
  };

  const handleImportToWorkspace = () => {
    const selected = uploadedFiles.filter(f => f.selected);
    if (selected.length === 0) return;

    const filesToImport = selected.map(f => ({
      path: f.path,
      name: f.name,
      content: f.obfuscatedContent || f.content
    }));

    onImportFiles(filesToImport);
    onClose();
  };

  const handleBatchObfuscate = async () => {
    const selected = uploadedFiles.filter(f => f.selected);
    if (selected.length === 0) return;

    setIsBatchObfuscating(true);
    setProgressPercent(0);
    setProgressText('Initializing obfuscation engine...');

    let processedCount = 0;
    const defaultOptions: ObfuscateOptions = {
      renameLocals: true,
      encryptStrings: true,
      encryptConstants: true,
      controlFlow: selectedPreset !== 'Fast',
      antiHook: selectedPreset === 'Paranoid' || selectedPreset === 'VM Ultimate',
      antiTamper: selectedPreset === 'Paranoid' || selectedPreset === 'VM Ultimate',
      watermark: true,
      polymorphic: true,
      debugProtection: true,
      antiLag: true
    };

    for (const file of selected) {
      setProgressText(`Obfuscating ${file.name}...`);
      setUploadedFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'obfuscating' } : f));

      try {
        const response = await fetch('/api/obfuscate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: file.content,
            preset: selectedPreset,
            options: defaultOptions
          })
        });

        const data = await response.json();
        if (response.ok && data.code) {
          setUploadedFiles(prev => prev.map(f => f.id === file.id ? {
            ...f,
            status: 'done',
            obfuscatedContent: data.code
          } : f));
        } else {
          throw new Error(data.message || data.error || 'Obfuscation failed');
        }
      } catch (err: any) {
        setUploadedFiles(prev => prev.map(f => f.id === file.id ? {
          ...f,
          status: 'error',
          errorMessage: err.message
        } : f));
      }

      processedCount++;
      setProgressPercent(Math.round((processedCount / selected.length) * 100));
    }

    setIsBatchObfuscating(false);
    setProgressText('Batch obfuscation complete!');
  };

  const handleUploadToRobloxCloud = async () => {
    const selected = uploadedFiles.filter(f => f.selected);
    if (selected.length === 0) return;

    setIsUploadingToCloud(true);
    setProgressPercent(0);
    setProgressText('Deploying raw scripts to permanent Roblox cloud nodes...');

    let count = 0;
    for (const file of selected) {
      const codeToUpload = file.obfuscatedContent || file.content;
      try {
        const res = await fetch('/api/raw/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: codeToUpload,
            name: file.name
          })
        });
        const data = await res.json();
        if (res.ok && data.loadstring) {
          setUploadedFiles(prev => prev.map(f => f.id === file.id ? {
            ...f,
            status: 'uploaded',
            rawUrl: data.rawUrl,
            loadstring: data.loadstring
          } : f));
        }
      } catch (err) {
        console.error(err);
      }
      count++;
      setProgressPercent(Math.round((count / selected.length) * 100));
    }

    setIsUploadingToCloud(false);
    setProgressText('Roblox Raw Loadstring generation complete!');
    setActiveTab('results');
  };

  const handleDownloadZip = async () => {
    const selected = uploadedFiles.filter(f => f.selected);
    if (selected.length === 0) return;

    const zip = new JSZip();
    for (const file of selected) {
      const textToSave = file.obfuscatedContent || file.content;
      zip.file(file.path, textToSave);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fsociety_Project_${selectedPreset}_Protected.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalBytes = uploadedFiles.reduce((acc, f) => acc + f.size, 0);
  const selectedCount = uploadedFiles.filter(f => f.selected).length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const uploadedWithLoadstrings = uploadedFiles.filter(f => Boolean(f.loadstring));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/70 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Upload size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                  Lua Project & Raw Loadstring Uploader
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                    Anti-Scraper Shield
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Upload scripts, folders, or archives to generate permanent Roblox executor loadstrings
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

          <div className="flex items-center px-5 py-2.5 bg-zinc-950/40 border-b border-white/5 shrink-0 space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload size={13} />
              <span>File Queue ({uploadedFiles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal size={13} />
              <span>Roblox Loadstrings ({uploadedWithLoadstrings.length})</span>
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5">
            {activeTab === 'upload' && (
              <>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]' 
                      : 'border-white/15 bg-zinc-950/40 hover:border-indigo-500/50 hover:bg-zinc-950/60'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".lua,.luau,.txt,.zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleNativeFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={(el) => {
                      folderInputRef.current = el;
                      if (el) {
                        el.setAttribute('webkitdirectory', 'true');
                        el.setAttribute('directory', 'true');
                      }
                    }}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleNativeFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleNativeFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />

                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <FileCode size={24} />
                    </div>
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <FolderUp size={24} />
                    </div>
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Archive size={24} />
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white mb-1">
                    Drag & Drop your Lua files, folders, or .ZIP archive here
                  </div>
                  <div className="text-xs text-zinc-400 max-w-md mb-4">
                    Supports .lua, .luau, .txt, directory structures, and zipped project hierarchies
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <FileCode size={14} />
                      Choose Files
                    </button>
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <FolderUp size={14} />
                      Upload Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => zipInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Archive size={14} />
                      Unpack .ZIP
                    </button>
                  </div>
                </div>

                {isProcessingZip && (
                  <div className="flex items-center justify-center p-4 bg-zinc-950/60 rounded-xl border border-white/10 text-indigo-400 gap-2 text-xs">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Extracting and parsing .ZIP archive hierarchy...</span>
                  </div>
                )}

                {(isBatchObfuscating || isUploadingToCloud) && (
                  <div className="p-4 bg-zinc-950/80 rounded-xl border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-indigo-400" />
                        {progressText}
                      </span>
                      <span className="font-mono text-indigo-400 font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleSelectAll}
                          className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            uploadedFiles.every(f => f.selected) 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-white/20 bg-zinc-800'
                          }`}>
                            {uploadedFiles.every(f => f.selected) && <Check size={12} />}
                          </div>
                          Select All ({selectedCount}/{uploadedFiles.length})
                        </button>
                        <span className="text-xs text-zinc-500">|</span>
                        <span className="text-xs text-zinc-400">
                          Total: {formatSize(totalBytes)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={clearAll}
                          className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          Clear List
                        </button>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950/50 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                      {uploadedFiles.map((file) => (
                        <div 
                          key={file.id} 
                          className={`flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors text-xs ${
                            file.selected ? 'bg-indigo-500/[0.03]' : 'opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => toggleSelect(file.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                file.selected 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'border-white/20 bg-zinc-800'
                              }`}
                            >
                              {file.selected && <Check size={12} />}
                            </button>
                            
                            <FileCode size={15} className="text-indigo-400 shrink-0" />
                            
                            <div className="min-w-0 flex-1">
                              <div className="text-zinc-200 font-mono truncate font-medium">{file.name}</div>
                              <div className="text-[11px] text-zinc-500 truncate">{file.path}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="text-zinc-400 font-mono">{file.lines} lines</span>
                            <span className="text-zinc-500 font-mono">{formatSize(file.size)}</span>

                            {file.status === 'obfuscating' && (
                              <span className="flex items-center gap-1 text-indigo-400">
                                <Loader2 size={13} className="animate-spin" />
                                <span>Protecting</span>
                              </span>
                            )}
                            {file.status === 'done' && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <CheckCircle2 size={13} />
                                <span>Obfuscated</span>
                              </span>
                            )}
                            {file.status === 'uploaded' && (
                              <span className="flex items-center gap-1 text-rose-400 font-mono">
                                <CheckCircle2 size={13} />
                                <span>Cloud Loadstring</span>
                              </span>
                            )}
                            {file.status === 'error' && (
                              <span className="flex items-center gap-1 text-rose-400" title={file.errorMessage}>
                                <AlertCircle size={13} />
                                <span>Error</span>
                              </span>
                            )}

                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'results' && (
              <div className="space-y-4">
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-rose-400 flex items-center gap-2">
                    <Shield size={16} />
                    <span>Roblox Loadstrings with Anti-Scraper Perimeter Active</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Direct browser visits to the raw endpoint are rejected with 403 Forbidden. Python scrapers and automated extractors are blocked. Only Roblox executor <code className="text-rose-300">loadstring(game:HttpGet(...))()</code> calls receive the script payload.
                  </p>
                </div>

                {uploadedWithLoadstrings.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-zinc-950/30">
                    <Terminal size={32} className="mx-auto text-zinc-600 mb-2" />
                    <div className="text-sm font-medium text-zinc-300">No scripts uploaded to cloud raw yet.</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Select files in the File Queue tab and click "Upload to Roblox Cloud & Get Loadstring".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uploadedWithLoadstrings.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-zinc-950/70 rounded-xl border border-white/10 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileCode size={16} className="text-indigo-400" />
                            <span className="font-mono text-xs font-bold text-white">{file.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Active Node
                          </span>
                        </div>

                        <div className="bg-black/80 p-2.5 rounded-lg border border-white/10 font-mono text-xs text-emerald-300 flex items-center justify-between gap-3 overflow-hidden">
                          <span className="truncate select-all">{file.loadstring}</span>
                          <button
                            onClick={() => file.loadstring && handleCopyText(file.id, file.loadstring)}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                          >
                            {copiedId === file.id ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                            <span>{copiedId === file.id ? 'Copied!' : 'Copy Loadstring'}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                          <span className="truncate max-w-md">Raw Link: {file.rawUrl}</span>
                          <button
                            onClick={() => file.rawUrl && handleCopyText(`raw-${file.id}`, file.rawUrl)}
                            className="text-zinc-400 hover:text-white underline ml-2 shrink-0"
                          >
                            Copy Raw URL
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-white/10 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Preset:</span>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as ObfuscatePreset)}
                className="bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Fast">Fast (Minimal Overhead)</option>
                <option value="Balanced">Balanced (Standard)</option>
                <option value="Paranoid">Paranoid (Anti-Decompiler)</option>
                <option value="VM Ultimate">VM Ultimate (Bytecode Stream)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUploadToRobloxCloud}
                disabled={selectedCount === 0 || isUploadingToCloud}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
                title="Upload to persistent raw endpoint with anti-scraper protection"
              >
                <Globe size={14} />
                <span>Upload & Get Roblox Loadstring ({selectedCount})</span>
              </button>

              <button
                onClick={handleBatchObfuscate}
                disabled={selectedCount === 0 || isBatchObfuscating}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Shield size={14} />
                <span>Obfuscate ({selectedCount})</span>
              </button>

              {uploadedFiles.some(f => f.obfuscatedContent) && (
                <button
                  onClick={handleDownloadZip}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download .ZIP</span>
                </button>
              )}

              <button
                onClick={handleImportToWorkspace}
                disabled={selectedCount === 0}
                className="px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-white/10 rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>Import to Editor</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
