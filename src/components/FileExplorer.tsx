import { FileNode } from '../types';
import { ChevronRight, ChevronDown, FileCode, Folder, Upload, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils';

export function FileExplorer({ 
  files, 
  onSelectFile, 
  activeFileId,
  onOpenUploader
}: { 
  files: FileNode[], 
  onSelectFile: (file: FileNode) => void,
  activeFileId: string | null,
  onOpenUploader?: () => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'src': true });

  const toggleFolder = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expanded[node.id];
    const isActive = activeFileId === node.id;

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-center py-1.5 px-2 cursor-pointer text-sm rounded-md transition-colors group mb-0.5",
            isActive && !isFolder ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
          )}
          style={{ paddingLeft: `${(depth * 12) + 8}px` }}
          onClick={() => {
            if (isFolder) toggleFolder(node.id);
            else onSelectFile(node);
          }}
        >
          {isFolder ? (
            <span className="mr-1 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className={cn("mr-2 w-[14px] flex justify-center shrink-0", isActive ? "text-indigo-500" : "text-gray-400")}>
               <FileCode size={14} />
            </span>
          )}
          
          {isFolder && <Folder size={14} className="mr-2 text-indigo-400/80 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </div>
        
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar w-full">
      <div className="p-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <span>Explorer</span>
        {onOpenUploader && (
          <button
            onClick={onOpenUploader}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
            title="Upload Lua project or files"
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
        )}
      </div>
      <div className="p-2 flex-1">
        {files.map(file => renderNode(file))}
      </div>
    </div>
  );
}
