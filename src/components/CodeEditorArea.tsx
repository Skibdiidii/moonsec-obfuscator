import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import 'prismjs/themes/prism-tomorrow.css';
import { Download, Copy, Code2, Shield, Lock, AlignLeft, Upload, Globe } from 'lucide-react';

function formatLua(code: string): string {
  const lines = code.split('\n');
  let indent = 0;
  const formatted = [];
  let inMultiline = false;

  for (let i = 0; i < lines.length; i++) {
    if (inMultiline) {
      formatted.push(lines[i]);
      if (lines[i].includes(']]')) {
        inMultiline = false;
      }
      continue;
    }

    let line = lines[i].trim();
    if (!line) {
      formatted.push('');
      continue;
    }

    if (line.includes('--[[') || (line.includes('[[') && !line.includes('--'))) {
      let currentIndent = Math.max(0, indent);
      formatted.push(currentIndent > 0 ? '    '.repeat(currentIndent) + line : line);
      if (!line.includes(']]')) {
        inMultiline = true;
      }
      continue;
    }

    let cleanedLine = line.replace(/--.*/, '').replace(/(["'])(?:\\.|[^\\])*?\1/g, '');

    let dedentCurrent = false;
    if (/^(end|elseif|else|until|\}|\]|\))/.test(line)) {
      dedentCurrent = true;
    }

    let currentIndent = Math.max(0, indent - (dedentCurrent ? 1 : 0));
    formatted.push(currentIndent > 0 ? '    '.repeat(currentIndent) + line : line);

    const opens = (cleanedLine.match(/\b(then|do|repeat|function|else)\b/g) || []).length 
                + (cleanedLine.match(/[\{\[\(]/g) || []).length;
                
    const closes = (cleanedLine.match(/\b(end|until|elseif|else)\b/g) || []).length 
                 + (cleanedLine.match(/[\}\]\)]/g) || []).length;

    indent = Math.max(0, indent + opens - closes);
  }
  return formatted.join('\n');
}

export function CodeEditorArea({
  code,
  onChange,
  onClose,
  fileName,
  onCopy,
  onDownload,
  onLink,
  onSafeLink,
  onObfuscate,
  onOpenUploader
}: {
  code: string;
  onChange: (code: string) => void;
  onClose: () => void;
  fileName: string;
  onCopy?: () => void;
  onDownload?: () => void;
  onLink?: () => void;
  onSafeLink?: () => void;
  onObfuscate?: () => void;
  onOpenUploader?: () => void;
}) {
  const editorRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector('textarea');
      if (textarea) {
        textarea.setAttribute('enterkeyhint', 'enter');
        textarea.setAttribute('autocapitalize', 'none');
        textarea.setAttribute('autocomplete', 'off');
        textarea.setAttribute('autocorrect', 'off');
        textarea.setAttribute('spellcheck', 'false');

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || (e.keyCode === 229 && (e.code === 'Enter' || e.key === 'Enter'))) {
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            if (isMobile) {
              e.stopPropagation();
              e.preventDefault();
              
              if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, '\n');
              } else {
                const { selectionStart, selectionEnd, value } = textarea;
                const newValue = value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd);
                textarea.value = newValue;
                
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);
                
                textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
              }
            }
          }
        };

        const handlePaste = (e: ClipboardEvent) => {
          e.preventDefault();
          const pasteText = e.clipboardData?.getData('text') || '';
          const { selectionStart, selectionEnd, value } = textarea;
          const newValue = value.substring(0, selectionStart) + pasteText + value.substring(selectionEnd);
          
          const formatted = formatLua(newValue);
          onChange(formatted);
        };
        
        textarea.addEventListener('keydown', handleKeyDown, true);
        textarea.addEventListener('paste', handlePaste);
        
        return () => {
          textarea.removeEventListener('keydown', handleKeyDown, true);
          textarea.removeEventListener('paste', handlePaste);
        };
      }
    }
  }, [onChange]);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-white/10 z-10 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center space-x-3 shrink-0 pr-4">
           <Code2 size={18} className="text-gray-400" />
           <span className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-wide">{fileName}</span>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          {onOpenUploader && (
            <button onClick={onOpenUploader} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Upload Lua project">
              <Upload size={14} className="mr-1.5 text-indigo-500" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
          <button onClick={() => onChange(formatLua(code))} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Format code">
            <AlignLeft size={14} className="mr-1.5 text-blue-500" />
            <span className="hidden lg:inline">Format</span>
          </button>
          {onObfuscate && (
            <button onClick={onObfuscate} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Obfuscate code">
              <Lock size={14} className="mr-1.5 text-indigo-500" />
              <span className="hidden sm:inline">Obfuscate</span>
            </button>
          )}
          {onLink && (
            <button onClick={onLink} className="flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-500/20 rounded-md transition-colors shadow-sm" title="Generate protected Roblox loadstring">
              <Globe size={14} className="mr-1.5 text-rose-500" />
              <span className="hidden sm:inline">Roblox Raw</span>
            </button>
          )}
          {onSafeLink && (
            <button onClick={onSafeLink} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Generate chained safe link">
              <Shield size={14} className="mr-1.5 text-emerald-500" />
              <span className="hidden lg:inline">Safe Link</span>
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Copy code">
              <Copy size={14} className="mr-1.5" />
              <span className="hidden sm:inline">Copy</span>
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md transition-colors" title="Download file">
              <Download size={14} className="mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative" ref={editorRef}>
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={code => Prism.highlight(code, Prism.languages.lua, 'lua')}
          padding={24}
          className="font-mono text-[15px] editor-override h-full min-h-full leading-relaxed"
          style={{
            backgroundColor: 'transparent',
            outline: 'none',
          }}
        />
      </div>
      
      <style>{`
        .editor-override textarea { outline: none !important; color: transparent !important; caret-color: #6366f1; }
        .editor-override pre { margin: 0 !important; background: transparent !important; color: #1f2937; }
        @media (prefers-color-scheme: dark) {
          .editor-override pre { color: #e5e7eb; }
        }
        .token.comment { color: #9ca3af !important; font-style: italic; }
        .token.keyword { color: #4f46e5 !important; font-weight: 500; }
        @media (prefers-color-scheme: dark) {
          .token.keyword { color: #818cf8 !important; }
        }
        .token.string { color: #059669 !important; }
        @media (prefers-color-scheme: dark) {
          .token.string { color: #34d399 !important; }
        }
        .token.function { color: #2563eb !important; font-weight: 500; }
        @media (prefers-color-scheme: dark) {
          .token.function { color: #60a5fa !important; }
        }
        .token.number { color: #d97706 !important; }
        @media (prefers-color-scheme: dark) {
          .token.number { color: #fbbf24 !important; }
        }
        .token.operator { color: #4b5563 !important; }
        @media (prefers-color-scheme: dark) {
          .token.operator { color: #9ca3af !important; }
        }
      `}</style>
    </div>
  );
}
