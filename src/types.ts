export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatSession = {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
};

export type FileNode = {
  id: string;
  name: string;
  content?: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

export type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
};

export type ScriptTemplate = {
  id: string;
  name: string;
  description: string;
  code: string;
  author: string;
};

export type ObfuscatePreset = 'Fast' | 'Balanced' | 'Paranoid' | 'VM Ultimate';

export type ObfuscateOptions = {
  renameLocals: boolean;
  encryptStrings: boolean;
  encryptConstants: boolean;
  controlFlow: boolean;
  antiHook: boolean;
  antiTamper: boolean;
  watermark: boolean;
  polymorphic: boolean;
  debugProtection: boolean;
  minify?: boolean;
  weirdSpacing?: boolean;
  realtimeGuard?: boolean;
  antiLag?: boolean;
};

export type ObfuscationStats = {
  preset: string;
  variablesRenamed: number;
  stringsEncrypted: number;
  constantsEncrypted: number;
  controlFlowBlocks: number;
  deadCodeBlocks: number;
  vmInstructions: number;
  originalSize: number;
  obfuscatedSize: number;
};

export type DeobfuscateOptions = {
  unpackVmBytecode: boolean;
  normalizeIdentifiers: boolean;
  foldConstants: boolean;
  decodeHexStrings: boolean;
  beautify: boolean;
  aiAssist: boolean;
};

export type DeobfuscationStats = {
  stringsDecrypted: number;
  variablesNormalized: number;
  expressionsFolded: number;
  vmChunksUnpacked: number;
  originalSize: number;
  deobfuscatedSize: number;
};
