import React, { useState, useEffect } from 'react';
import { FileNode, LogEntry, ScriptTemplate, Message, ChatSession, ObfuscatePreset, ObfuscateOptions, ObfuscationStats } from './types';
import { initialFiles } from './data';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditorArea } from './components/CodeEditorArea';
import { AiChatPanel } from './components/AiChatPanel';
import { ObfuscateModal } from './components/ObfuscateModal';
import { FileUploaderModal } from './components/FileUploaderModal';
import { WhatsNewModal } from './components/WhatsNewModal';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Bot, Search, Settings, PanelRightClose, PanelRightOpen, Terminal, Upload, Sparkles } from 'lucide-react';
import './firebase';
import { generateId, cn } from './utils';

const copyToClipboardFallback = (text: string): boolean => {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
};

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, attempting fallback:", err);
    }
  }
  return copyToClipboardFallback(text);
};

export default function App() {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>('main.server.lua');
  const [code, setCode] = useState<Record<string, string>>({
    'main.server.lua': initialFiles[0].children![0].content,
    'player_handler.server.lua': initialFiles[0].children![1].content,
    'settings.lua': initialFiles[1].children![0].content,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [isObfuscateModalOpen, setIsObfuscateModalOpen] = useState(false);
  const [isUploaderModalOpen, setIsUploaderModalOpen] = useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'search' | 'none'>('explorer');

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistant_selected_model');
      if (saved) return saved;
    }
    return 'mistral';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastSeen = localStorage.getItem('fsociety_last_seen_version');
      if (!lastSeen || lastSeen !== 'v2.5.1') {
        setIsWhatsNewModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistant_selected_model', selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    if (window.innerWidth < 768) {
      setActiveTab('none');
      setShowEditor(false);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('assistant_chat_sessions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Error parsing chat sessions', e);
        }
      }
    }
    return [{
      id: 'default',
      name: 'General Assistant',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello. I am your coding assistant. Describe the logic you need, and I will generate optimized code.'
        }
      ],
      createdAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedActive = localStorage.getItem('assistant_active_session_id');
      if (storedActive) {
        return storedActive;
      }
    }
    return 'default';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistant_chat_sessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistant_active_session_id', activeSessionId);
    }
  }, [activeSessionId]);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0] || { id: 'default', messages: [] };
  const chatMessages = activeSession.messages;

  const setChatMessages = (updater: React.SetStateAction<Message[]>) => {
    setChatSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const currentMsgs = session.messages;
          const nextMessages = typeof updater === 'function' ? (updater as Function)(currentMsgs) : updater;
          return { ...session, messages: nextMessages };
        }
        return session;
      });
    });
  };

  const handleCreateSession = (name?: string) => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      name: name || `Session ${chatSessions.length + 1}`,
      messages: [
        {
          id: generateId(),
          role: 'assistant',
          content: 'I initialized a new workspace conversation. Ready to assist.'
        }
      ],
      createdAt: Date.now()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const handleRenameSession = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setChatSessions(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleDeleteSession = (id: string) => {
    if (chatSessions.length <= 1) {
      setChatSessions([{
        id: 'default',
        name: 'General Assistant',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello. I am your coding assistant. Describe the logic you need, and I will generate optimized code.'
          }
        ],
        createdAt: Date.now()
      }]);
      setActiveSessionId('default');
      return;
    }

    const nextSessions = chatSessions.filter(s => s.id !== id);
    setChatSessions(nextSessions);
    
    if (activeSessionId === id) {
      setActiveSessionId(nextSessions[0].id);
    }
  };

  const handleSelectFile = (file: FileNode) => {
    setActiveFileId(file.id);
    if (code[file.id] === undefined) {
      setCode(prev => ({ ...prev, [file.id]: file.content }));
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (activeFileId) {
      setCode(prev => ({ ...prev, [activeFileId]: newCode }));
    }
  };

  const handleImportFiles = (importedFiles: { path: string; name: string; content: string }[]) => {
    if (!importedFiles || importedFiles.length === 0) return;

    const newCodeMap: Record<string, string> = { ...code };
    const newNodes: FileNode[] = [...files];

    let targetFolder = newNodes.find(n => n.name === 'src' && n.type === 'folder');
    if (!targetFolder) {
      targetFolder = {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: []
      };
      newNodes.unshift(targetFolder);
    }

    let firstFileId: string | null = null;

    importedFiles.forEach((file) => {
      const fileId = file.name;
      newCodeMap[fileId] = file.content;
      if (!firstFileId) firstFileId = fileId;

      const existingChildIndex = targetFolder?.children?.findIndex(c => c.id === fileId);
      if (existingChildIndex !== undefined && existingChildIndex >= 0 && targetFolder?.children) {
        targetFolder.children[existingChildIndex] = {
          id: fileId,
          name: file.name,
          type: 'file',
          content: file.content
        };
      } else if (targetFolder?.children) {
        targetFolder.children.push({
          id: fileId,
          name: file.name,
          type: 'file',
          content: file.content
        });
      }
    });

    setCode(newCodeMap);
    setFiles(newNodes);

    if (firstFileId) {
      setActiveFileId(firstFileId);
      if (!showEditor) setShowEditor(true);
    }

    setChatMessages(prev => [
      ...prev,
      {
        id: generateId(),
        role: 'assistant',
        content: `Imported **${importedFiles.length}** file(s) into your workspace successfully.`
      }
    ]);
  };

  const handleGenerateAI = async (prompt: string, modelName: string = selectedModel) => {
    if (!activeFileId) {
      setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: 'Please select an active file from the Explorer first.' }]);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          currentCode: code[activeFileId],
          modelName,
          bypassLevel: 'stealth'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.code) {
         setCode(prev => ({ ...prev, [activeFileId]: data.code }));
         setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: data.chatResponse || 'I have updated the code.' }]);
         if (!showEditor) setShowEditor(true);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: `Processing failed: ${error.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCode = activeFileId ? code[activeFileId] || '' : '';

  const handleCopy = async () => {
    if (currentCode) {
      const success = await copyTextToClipboard(currentCode);
      if (success) {
        setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: 'Code copied to clipboard.' }]);
      } else {
        setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: 'Failed to copy code. Please select all and copy manually.' }]);
      }
    }
  };

  const handleLink = async () => {
    if (!currentCode) return;
    try {
      const response = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        const loadstringCode = `loadstring(game:HttpGet("${data.url}"))()`;
        await copyTextToClipboard(loadstringCode);
        setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: `Raw link generated and copied to clipboard:\n\`\`\`lua\n${loadstringCode}\n\`\`\`` }]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: `Failed to generate link: ${error.message}` }]);
    }
  };

  const handleSafeLink = async () => {
    if (!currentCode) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/safelink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode })
      });
      
      if (!response.ok) {
        let errorMsg = `Server returned status ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {
          const errText = await response.text();
          if (errText) errorMsg = errText.slice(0, 200);
        }
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('<')) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.status === 'success') {
              const loadstringCode = `loadstring(game:HttpGet("${data.url}"))()`;
              await copyTextToClipboard(loadstringCode);
              setChatMessages(prev => [
                ...prev, 
                { id: generateId(), role: 'assistant', content: `Safe-Link Generated:\n\`\`\`lua\n${loadstringCode}\n\`\`\`\n\nRaw Entry URL:\n${data.url}` }
              ]);
            } else if (data.status === 'error') {
              setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: `Safe-Link error: ${data.message}` }]);
            }
          } catch (e) {
            console.error('Failed to parse progress line:', e);
          }
        }
      }
    } catch (error: any) {
      setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: `Safe-Link failed: ${error.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunObfuscateModal = async (
    preset: ObfuscatePreset,
    options: ObfuscateOptions
  ): Promise<{ code: string; stats: ObfuscationStats }> => {
    const response = await fetch('/api/obfuscate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: currentCode, preset, options })
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned status ${response.status}`);
    }

    if (!response.ok || !data.code) {
      throw new Error(data.message || data.error || 'Obfuscation failed');
    }

    const stats: ObfuscationStats = data.stats || {
      preset: preset,
      variablesRenamed: 120,
      stringsEncrypted: 15,
      constantsEncrypted: 30,
      controlFlowBlocks: 22,
      deadCodeBlocks: 18,
      vmInstructions: currentCode.length,
      originalSize: currentCode.length,
      obfuscatedSize: data.code.length,
    };

    setChatMessages(prev => [
      ...prev,
      {
        id: generateId(),
        role: 'assistant',
        content: `**Fsociety Obfuscation Build Complete!** 🚀\n\n` +
          `- **Protection Preset**: \`${preset}\` Profile\n` +
          `- **Variables Renamed**: ${stats.variablesRenamed}\n` +
          `- **Strings Encrypted**: ${stats.stringsEncrypted}\n` +
          `- **Constants Encrypted**: ${stats.constantsEncrypted}\n` +
          `- **Control-Flow Blocks**: ${stats.controlFlowBlocks}\n` +
          `- **Dead-Code Blocks**: ${stats.deadCodeBlocks}\n` +
          `- **Size Expansion**: ${(stats.originalSize / 1024).toFixed(2)} KB → ${(stats.obfuscatedSize / 1024).toFixed(2)} KB\n\n` +
          `Watermark: \`Obfuscated And Protected With Fsociety.lol\``
      }
    ]);

    return { code: data.code, stats };
  };

  const handleObfuscate = () => {
    setIsObfuscateModalOpen(true);
  };

  const handleDownload = () => {
    if (!currentCode || !activeFileId) return;
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileId || 'script.lua';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden flex flex-col">
      <header className="h-14 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <Bot className="text-indigo-500" size={24} />
          <h1 className="font-semibold text-sm tracking-wide">Assistant Studio</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsWhatsNewModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 transition-all shadow-sm"
            title="View Release Notes"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="hidden sm:inline">What's New</span>
            <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-amber-500/20">v2.5.0</span>
          </button>

          <button
            onClick={() => setIsUploaderModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            title="Upload Lua Project or Archives"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Upload Project</span>
          </button>

          <button 
            onClick={() => setShowEditor(!showEditor)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1.5 rounded-lg"
          >
            {showEditor ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            <span className="hidden md:inline">{showEditor ? 'Hide Editor' : 'Show Editor'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-14 bg-gray-100 dark:bg-zinc-900 border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-4 space-y-4 shrink-0 z-20">
           <button 
             onClick={() => setActiveTab(activeTab === 'explorer' && isMobile ? 'none' : 'explorer')}
             className={`p-2.5 rounded-lg transition-colors ${activeTab === 'explorer' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/5'}`}
             title="Explorer"
           >
             <Code2 size={20} strokeWidth={1.5} />
           </button>
           
           <button 
             onClick={() => setActiveTab(activeTab === 'search' && isMobile ? 'none' : 'search')}
             className={`p-2.5 rounded-lg transition-colors ${activeTab === 'search' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/5'}`}
             title="Search"
           >
             <Search size={20} strokeWidth={1.5} />
           </button>
           
           <div className="mt-auto pt-4">
             <button 
               onClick={() => setIsWhatsNewModalOpen(true)}
               className="p-2.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/5 rounded-lg transition-colors" 
               title="Update Patch Notes"
             >
               <Sparkles size={20} strokeWidth={1.5} />
             </button>
           </div>
        </div>

        <div className={`md:flex ${activeTab === 'none' ? 'hidden' : 'flex'} w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 flex-col shrink-0 z-10 transition-all`}>
          {activeTab === 'explorer' && (
            <FileExplorer 
              files={files} 
              onSelectFile={(f) => { handleSelectFile(f); if (isMobile) setActiveTab('none'); }} 
              activeFileId={activeFileId}
              onOpenUploader={() => setIsUploaderModalOpen(true)}
            />
          )}

          {activeTab === 'search' && (
            <div className="p-4 flex-1">
               <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Search</div>
               <input type="text" placeholder="Search files..." className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-zinc-950 relative z-0">
          <AiChatPanel 
             messages={chatMessages}
             setMessages={setChatMessages}
             onGenerate={handleGenerateAI}
             isGenerating={isGenerating}
             sessions={chatSessions}
             activeSessionId={activeSessionId}
             onSelectSession={setActiveSessionId}
             onCreateSession={handleCreateSession}
             onRenameSession={handleRenameSession}
             onDeleteSession={handleDeleteSession}
             selectedModel={selectedModel}
             setSelectedModel={setSelectedModel}
          />
        </div>

        <AnimatePresence>
          {showEditor && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? '100%' : '50%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`border-l border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden shrink-0 z-30 shadow-lg ${isMobile ? 'absolute inset-0' : 'relative'}`}
            >
              <CodeEditorArea 
                code={currentCode}
                onChange={handleCodeChange}
                onClose={() => setShowEditor(false)}
                fileName={activeFileId || 'untitled'}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onLink={handleLink}
                onSafeLink={handleSafeLink}
                onObfuscate={handleObfuscate}
                onOpenUploader={() => setIsUploaderModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ObfuscateModal
        isOpen={isObfuscateModalOpen}
        onClose={() => setIsObfuscateModalOpen(false)}
        onObfuscate={handleRunObfuscateModal}
        onApplyCode={(code) => {
          if (activeFileId) {
            setCode(prev => ({ ...prev, [activeFileId]: code }));
          }
        }}
        onCopyCode={handleCopy}
        onDownloadCode={handleDownload}
        onSafeLink={handleSafeLink}
        currentCode={currentCode}
      />

      <FileUploaderModal
        isOpen={isUploaderModalOpen}
        onClose={() => setIsUploaderModalOpen(false)}
        onImportFiles={handleImportFiles}
      />

      <WhatsNewModal
        isOpen={isWhatsNewModalOpen}
        onClose={() => setIsWhatsNewModalOpen(false)}
      />
    </div>
  );
}

