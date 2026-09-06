import React, { useState } from 'react';
import { Bot, Loader2, Send, X, Code2, MessageSquare, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, generateId } from '../utils';
import { Message, ChatSession } from '../types';

interface PastedBlock {
  id: string;
  title: string;
  content: string;
  isCollapsed: boolean;
}

function CollapsiblePastedMessage({ title, code }: { title: string; code: string }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n').length;
  const sizeBytes = code.length;
  const sizeText = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;

  return (
    <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden mt-1 max-w-full">
      <div
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-zinc-800 text-xs font-mono text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-white/10"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-1 flex items-center truncate max-w-[75%] text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none cursor-pointer"
        >
          <Code2 size={14} className="mr-2 shrink-0 text-indigo-500" />
          <span className="truncate font-medium">{title}</span>
          <span className="text-[10px] text-gray-400 ml-2 hidden sm:inline">({lines} lines, {sizeText})</span>
        </button>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none cursor-pointer"
            title="Copy pasted content"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none cursor-pointer"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 bg-white dark:bg-zinc-900 text-xs font-mono text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto whitespace-pre custom-scrollbar select-text leading-relaxed"
          >
            {code}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RenderUserMessage = ({ content }: { content: string }) => {
  const regex = /\[PASTED CONTENT:\s*(.*?)\]\n```\n([\s\S]*?)\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'pasted',
      title: match[1],
      code: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  if (parts.length === 0) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return <div key={idx} className="whitespace-pre-wrap">{part.content}</div>;
        } else {
          return <CollapsiblePastedMessage key={idx} title={part.title || 'Pasted Code'} code={part.code || ''} />;
        }
      })}
    </div>
  );
};

export function AiChatPanel({
  messages,
  setMessages,
  onGenerate,
  isGenerating,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  selectedModel,
  setSelectedModel,
}: {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onGenerate: (prompt: string, modelName?: string) => void;
  isGenerating: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: (name?: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onDeleteSession: (id: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [pastedBlocks, setPastedBlocks] = useState<PastedBlock[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [enterToSend, setEnterToSend] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistant_enter_to_send');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  const handleToggleEnterToSend = () => {
    setEnterToSend(prev => {
      const next = !prev;
      localStorage.setItem('assistant_enter_to_send', String(next));
      return next;
    });
  };

  const handleSend = () => {
    if ((!prompt.trim() && pastedBlocks.length === 0) || isGenerating) return;
    
    let finalPrompt = prompt;
    if (pastedBlocks.length > 0) {
      const formattedBlocks = pastedBlocks.map(block => 
        `\n\n[PASTED CONTENT: ${block.title}]\n\`\`\`\n${block.content}\n\`\`\``
      ).join('');
      finalPrompt = (prompt.trim() ? prompt : "Here is my pasted code/text:") + formattedBlocks;
    }

    setMessages(prev => [...prev, { id: generateId(), role: 'user', content: finalPrompt }]);
    setPrompt('');
    setPastedBlocks([]);
    onGenerate(finalPrompt, selectedModel);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const activeSessionName = activeSession ? activeSession.name : 'General Assistant';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
       {/* Session Switching Bar */}
       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-900/50 shrink-0">
          <button 
            onClick={() => setShowSessions(!showSessions)} 
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors focus:outline-none"
          >
             <MessageSquare size={16} className="mr-2 text-indigo-500" />
             <span className="truncate max-w-[200px]">{activeSessionName}</span>
             {showSessions ? <ChevronUp size={16} className="ml-1 text-gray-400" /> : <ChevronDown size={16} className="ml-1 text-gray-400" />}
          </button>
          
          <button 
            onClick={() => {
              onCreateSession();
              setShowSessions(false);
            }} 
            className="flex items-center text-xs bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-white/10 rounded-md px-2.5 py-1.5 transition-colors shadow-sm"
            title="Create New Chat"
          >
             <Plus size={14} className="mr-1.5" />
             New Chat
          </button>
       </div>

       {/* Sessions List Dropdown */}
       <AnimatePresence>
         {showSessions && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-hidden shrink-0 z-10 max-h-64 flex flex-col shadow-lg"
           >
             <div className="p-2 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 flex justify-between items-center px-4">
               <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase">Recent Chats</span>
             </div>
             
             <div className="overflow-y-auto p-2 custom-scrollbar max-h-56">
               {sessions.map(session => {
                 const isActive = session.id === activeSessionId;
                 const isEditing = editingSessionId === session.id;
                 
                 return (
                   <div 
                     key={session.id} 
                     className={cn(
                       "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 cursor-pointer",
                       isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                     )}
                     onClick={() => {
                        if (!isEditing) {
                          onSelectSession(session.id);
                          setShowSessions(false);
                        }
                     }}
                   >
                     {isEditing ? (
                       <div className="flex items-center space-x-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
                         <input
                           type="text"
                           value={editingName}
                           onChange={e => setEditingName(e.target.value)}
                           onKeyDown={e => {
                             if (e.key === 'Enter') {
                               onRenameSession(session.id, editingName);
                               setEditingSessionId(null);
                             } else if (e.key === 'Escape') {
                               setEditingSessionId(null);
                             }
                           }}
                           className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-indigo-500/50 rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                           autoFocus
                         />
                         <button 
                           onClick={() => {
                             onRenameSession(session.id, editingName);
                             setEditingSessionId(null);
                           }}
                           className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                         >
                           <Check size={16} />
                         </button>
                         <button 
                           onClick={() => setEditingSessionId(null)}
                           className="p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 transition-colors"
                         >
                           <X size={16} />
                         </button>
                       </div>
                     ) : (
                       <div className="flex-1 text-left truncate mr-2 flex items-center">
                         <MessageSquare size={14} className={cn("mr-2.5 shrink-0", isActive ? "text-indigo-500" : "text-gray-400")} />
                         <span className="truncate">{session.name}</span>
                       </div>
                     )}
                     
                     {!isEditing && (
                       <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setEditingSessionId(session.id);
                             setEditingName(session.name);
                           }}
                           className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                           title="Rename"
                         >
                           <Edit2 size={14} />
                         </button>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             onDeleteSession(session.id);
                           }}
                           className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                           title="Delete"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
       
       {/* Chat Message Stream */}
       <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col space-y-6">
          {messages.map(msg => (
             <div key={msg.id} className={cn(
               "flex w-full",
               msg.role === 'user' ? "justify-end" : "justify-start"
             )}>
               <div className={cn(
                 "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 text-[15px] shadow-sm overflow-hidden break-words",
                 msg.role === 'user' 
                   ? "bg-indigo-600 text-white rounded-br-sm" 
                   : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-bl-sm"
               )}>
                 {msg.role === 'user' ? (
                   <RenderUserMessage content={msg.content} />
                 ) : (
                   <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/10 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 overflow-x-auto">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                   </div>
                 )}
               </div>
             </div>
          ))}
          
          {isGenerating && (
             <div className="flex justify-start w-full">
               <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-2xl rounded-bl-sm p-4 text-[15px] flex items-center space-x-3 text-gray-500 dark:text-gray-400 shadow-sm">
                 <Loader2 size={18} className="animate-spin text-indigo-500 shrink-0" />
                 <span>Assistant is thinking...</span>
               </div>
             </div>
          )}
       </div>
       
       {/* Prompt Input Area */}
       <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-white/10 shrink-0">
          <div className="max-w-4xl mx-auto w-full relative">
            {pastedBlocks.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                <AnimatePresence initial={false}>
                  {pastedBlocks.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="flex items-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full pl-3 pr-1 py-1 text-xs font-medium"
                    >
                      <Code2 size={12} className="mr-1.5" />
                      <span className="truncate max-w-[120px]">{block.title}</span>
                      <button
                        onClick={() => setPastedBlocks(prev => prev.filter(b => b.id !== block.id))}
                        className="ml-2 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="relative shadow-sm rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
               <textarea
                 value={prompt}
                 onChange={e => setPrompt(e.target.value)}
                 onPaste={e => {
                   const pastedText = e.clipboardData.getData('text');
                   if (pastedText.length > 250 || pastedText.split('\n').length > 5) {
                     e.preventDefault();
                     const cleanPasted = pastedText.trim();
                     const titleLine = cleanPasted.split('\n')[0].substring(0, 40) || 'Pasted Content';
                     const newBlock: PastedBlock = {
                       id: generateId(),
                       title: titleLine.length < cleanPasted.length ? titleLine + '...' : titleLine,
                       content: cleanPasted,
                       isCollapsed: true,
                     };
                     setPastedBlocks(prev => [...prev, newBlock]);
                   }
                 }}
                 onKeyDown={e => {
                   if (e.key === 'Enter' && e.keyCode !== 229) {
                     if (enterToSend) {
                       if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                         e.preventDefault();
                         handleSend();
                       }
                     } else {
                       if (e.ctrlKey || e.metaKey) {
                         e.preventDefault();
                         handleSend();
                       }
                     }
                   }
                 }}
                 placeholder="Message Assistant..."
                 className="w-full bg-transparent border-0 py-3.5 pl-4 pr-12 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-0 resize-none max-h-48 min-h-[56px] custom-scrollbar"
                 style={{ height: Math.max(56, Math.min(prompt.split('\n').length * 24 + 32, 192)) + 'px' }}
               />
               <button 
                 onClick={handleSend}
                 disabled={isGenerating || (!prompt.trim() && pastedBlocks.length === 0)}
                 className="absolute right-2 bottom-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-zinc-800 dark:disabled:text-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
               >
                 <Send size={18} />
               </button>
            </div>
            
            <div className="flex justify-between items-center mt-3 px-1">
              <button onClick={handleToggleEnterToSend} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none">
                {enterToSend ? "Enter to send" : "Return to send"}
              </button>
              <div className="text-[10px] text-gray-400 flex items-center space-x-3">
                 <span>Model: <span className="font-medium text-gray-600 dark:text-gray-300 ml-1">Codestral AI</span></span>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}
