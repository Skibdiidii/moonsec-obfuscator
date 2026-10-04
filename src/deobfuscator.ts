import { DeobfuscateOptions, DeobfuscationStats } from './types';
import * as fengari from 'fengari';

const { lua, lauxlib, lualib, to_luastring } = fengari;

const LUA_KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
  'goto', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then',
  'true', 'until', 'while'
]);

const ROBLOX_GLOBALS = new Set([
  'game', 'workspace', 'script', 'Instance', 'Vector3', 'Vector2', 'CFrame',
  'Color3', 'BrickColor', 'Ray', 'UDim', 'UDim2', 'TweenInfo', 'Enum',
  'Players', 'Workspace', 'ReplicatedStorage', 'ServerStorage', 'ServerScriptService',
  'StarterGui', 'StarterPack', 'StarterPlayer', 'Lighting', 'SoundService',
  'HttpService', 'RunService', 'UserInputService', 'ContextActionService',
  'TweenService', 'MarketplaceService', 'TeleportService', 'Debris', 'PathfindingService',
  'getgenv', 'getfenv', 'setfenv', 'getrawmetatable', 'setreadonly', 'hookfunction',
  'hookmetamethod', 'newcclosure', 'loadstring', 'load', 'print', 'warn', 'error',
  'pcall', 'xpcall', 'type', 'typeof', 'assert', 'select', 'tostring', 'tonumber',
  'tick', 'time', 'wait', 'delay', 'spawn', 'task', 'string', 'table', 'math',
  'os', 'debug', 'coroutine', 'syn', 'fluxus', 'delta', 'identifyexecutor'
]);

function decodeByteEscapesInString(str: string): { text: string; count: number } {
  let count = 0;
  const decoded = str.replace(/\\(\d{1,3})/g, (_, digits) => {
    const code = parseInt(digits, 10);
    if (code >= 32 && code <= 126 && code !== 34 && code !== 92) {
      count++;
      return String.fromCharCode(code);
    }
    if (code === 10) { count++; return '\n'; }
    if (code === 9) { count++; return '\t'; }
    if (code === 13) { count++; return '\r'; }
    return '\\' + digits;
  });
  return { text: decoded, count };
}

function decodeHexEscapesInString(str: string): { text: string; count: number } {
  let count = 0;
  const decoded = str.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    if (code >= 32 && code <= 126 && code !== 34 && code !== 92) {
      count++;
      return String.fromCharCode(code);
    }
    return '\\x' + hex;
  });
  return { text: decoded, count };
}

function decodeStringCharCalls(code: string): { code: string; count: number } {
  let count = 0;
  const directRegex = /string\.char\s*\(\s*([\d\s,]+)\s*\)/g;
  let replaced = code.replace(directRegex, (_, args) => {
    const nums = args.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    if (nums.length === 0) return _;
    try {
      const chars = nums.map((n: number) => String.fromCharCode(n % 256)).join('');
      count++;
      return JSON.stringify(chars);
    } catch {
      return _;
    }
  });

  const unpackRegex = /string\.char\s*\(\s*(?:table\.)?unpack\s*\(\s*\{([\d\s,]+)\}\s*\)\s*\)/g;
  replaced = replaced.replace(unpackRegex, (_, args) => {
    const nums = args.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    if (nums.length === 0) return _;
    try {
      const chars = nums.map((n: number) => String.fromCharCode(n % 256)).join('');
      count++;
      return JSON.stringify(chars);
    } catch {
      return _;
    }
  });

  return { code: replaced, count };
}

function inlineLookupTables(code: string): { code: string; count: number } {
  let count = 0;
  let working = code;

  const tableRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*\{([^{}]+)\}/g;
  let match;
  const tables = new Map<string, Map<number, string>>();

  while ((match = tableRegex.exec(working)) !== null) {
    const tableName = match[1];
    const rawItems = match[2].trim();
    if (!rawItems || rawItems.length > 50000) continue;

    const map = new Map<number, string>();
    const isExplicitlyIndexed = /\[\s*\d+\s*\]\s*=/.test(rawItems);

    if (isExplicitlyIndexed) {
      const entryRegex = /\[\s*(\d+)\s*\]\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(\d+)|([a-zA-Z0-9_]+))/g;
      let entryMatch;
      while ((entryMatch = entryRegex.exec(rawItems)) !== null) {
        const idx = parseInt(entryMatch[1], 10);
        const val = entryMatch[2] ?? entryMatch[3] ?? entryMatch[4] ?? entryMatch[5];
        if (val !== undefined) {
          map.set(idx, val);
        }
      }
    } else {
      const itemRegex = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(\d+)/g;
      let itemMatch;
      let idx = 1;
      while ((itemMatch = itemRegex.exec(rawItems)) !== null) {
        const val = itemMatch[1] ?? itemMatch[2] ?? itemMatch[3];
        if (val !== undefined) {
          map.set(idx++, val);
        }
      }
    }

    if (map.size > 0 && map.size < 1000) {
      tables.set(tableName, map);
    }
  }

  for (const [tableName, map] of tables.entries()) {
    const lookupRegex = new RegExp(`\\b${tableName}\\[(\\d+)\\]`, 'g');
    working = working.replace(lookupRegex, (fullMatch, idxStr) => {
      const idx = parseInt(idxStr, 10);
      if (map.has(idx)) {
        count++;
        const val = map.get(idx)!;
        if (/^\d+$/.test(val)) {
          return val;
        }
        return JSON.stringify(val);
      }
      return fullMatch;
    });

    working = working.replace(/"([a-zA-Z0-9_]+)"\s*\(([^)]*)\)/g, (full, fnName, args) => {
      if (ROBLOX_GLOBALS.has(fnName) || ['print', 'warn', 'error', 'pcall', 'require', 'loadstring'].includes(fnName)) {
        count++;
        return `${fnName}(${args})`;
      }
      return full;
    });
  }

  return { code: working, count };
}

export function emulateSandboxedExecution(source: string): { code: string; success: boolean } {
  try {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const hookPreamble = `
      local intercepted = nil
      _G.getgenv = function() return _G end
      _G.getfenv = function() return _G end
      _G.setfenv = function(f, env) return f end
      _G.identifyexecutor = function() return "MoonSecDeobfuscator" end
      _G.syn = {
        loadstring = function(s) intercepted = s; return function() end end,
        request = function() return { Body = "{}" } end
      }
      _G.http = { request = function() return { Body = "{}" } end }
      _G.request = function() return { Body = "{}" } end

      local old_loadstring = _G.loadstring
      _G.loadstring = function(s)
        intercepted = s
        return function() end
      end

      local old_load = _G.load
      _G.load = function(s)
        if type(s) == "string" then
          intercepted = s
        end
        return function() end
      end

      _G.game = setmetatable({
        HttpGet = function(self, url)
          return "print('HttpGet intercepted: " .. tostring(url) .. "')"
        end,
        HttpPost = function() return "{}" end,
        GetService = function(self, svc)
          return setmetatable({ Name = svc, className = svc }, {
            __index = function(t, k)
              if k == "LocalPlayer" then
                return setmetatable({
                  Name = "LocalPlayer",
                  Character = setmetatable({}, { __index = function() return setmetatable({}, { __index = function() return function() end end }) end })
                }, { __index = function() return function() end end })
              end
              return function() return setmetatable({}, { __index = function() return function() end end }) end
            end
          })
        end
      }, {
        __index = function(t, k)
          return function() return setmetatable({}, { __index = function() return function() end end }) end
        end
      })
      _G.workspace = _G.game
      _G.script = setmetatable({}, { __index = function() return function() end end })
      _G.task = {
        wait = function() end,
        defer = function() end,
        spawn = function(f, ...) if type(f) == "function" then pcall(f, ...) end end,
        delay = function(t, f, ...) if type(f) == "function" then pcall(f, ...) end end
      }
      _G.tick = function() return 100000 end
      _G.time = function() return 100 end

      _G.__get_intercepted = function()
        return intercepted
      end
    `;

    lauxlib.luaL_dostring(L, to_luastring(hookPreamble));

    const sanitizedSource = source
      .replace(/os\.exit\s*\([^)]*\)/g, '')
      .replace(/while\s+true\s+do\s+end/g, '')
      .replace(/repeat\s+until\s+false/g, '');

    lauxlib.luaL_dostring(L, to_luastring(sanitizedSource));
    lauxlib.luaL_dostring(L, to_luastring("return _G.__get_intercepted()"));

    const intercepted = lua.lua_tojsstring(L, -1);
    if (intercepted && typeof intercepted === 'string' && intercepted.trim().length > 0) {
      return { code: intercepted.trim(), success: true };
    }
  } catch (err) {}

  return { code: source, success: false };
}

function extractIronBrewByteStringConstants(source: string): { strings: string[]; xorKey: number | null } {
  const xorMatch = source.match(/BitXOR\s*\(\s*(?:Byte\([^)]+\)|[a-zA-Z0-9_]+)\s*,\s*(\d{1,4})\s*\)/);
  const xorKey = xorMatch ? parseInt(xorMatch[1], 10) : null;

  const strings: string[] = [];

  const byteStringMatch = source.match(/(?:ByteString|Byte)\s*=\s*"((?:[^"\\]|\\.)*)"/);
  if (byteStringMatch && xorKey !== null) {
    const raw = byteStringMatch[1];
    const bytes: number[] = [];
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === '\\' && i + 1 < raw.length) {
        if (/\d/.test(raw[i + 1])) {
          let numDigits = 1;
          while (numDigits < 3 && i + 1 + numDigits <= raw.length && /\d/.test(raw[i + 1 + numDigits])) {
            numDigits++;
          }
          bytes.push(parseInt(raw.substr(i + 1, numDigits), 10));
          i += 1 + numDigits;
          continue;
        } else if (raw[i + 1] === 'x' && i + 3 <= raw.length) {
          bytes.push(parseInt(raw.substr(i + 2, 2), 16));
          i += 4;
          continue;
        }
      }
      bytes.push(raw.charCodeAt(i));
      i++;
    }

    const decryptedChars: string[] = [];
    for (let b = 0; b < bytes.length; b++) {
      decryptedChars.push(String.fromCharCode(bytes[b] ^ xorKey));
    }
    const fullDecrypted = decryptedChars.join('');

    const printableMatches = fullDecrypted.match(/[a-zA-Z0-9_.:/\\-]{3,}/g) || [];
    for (const pm of printableMatches) {
      if (!strings.includes(pm)) {
        strings.push(pm);
      }
    }
  }

  return { strings, xorKey };
}

function unpackMoonsecVmChunks(source: string): { unpackedCode: string; chunksFound: number; success: boolean } {
  const chunkArrayMatch = source.match(/\{\s*(?:"(?:[^"\\]|\\.)*"\s*,\s*)*(?:"(?:[^"\\]|\\.)*"\s*)\}/);
  if (!chunkArrayMatch) {
    return { unpackedCode: source, chunksFound: 0, success: false };
  }

  const chunkArrayStr = chunkArrayMatch[0];
  const stringLiterals = chunkArrayStr.match(/"(?:[^"\\]|\\.)*"/g);
  if (!stringLiterals || stringLiterals.length === 0) {
    return { unpackedCode: source, chunksFound: 0, success: false };
  }

  const chunksBytes: number[][] = [];
  let totalBytes = 0;

  for (const literal of stringLiterals) {
    const inner = literal.slice(1, -1);
    const bytes: number[] = [];
    let i = 0;
    while (i < inner.length) {
      if (inner[i] === '\\' && i + 1 < inner.length) {
        if (/\d/.test(inner[i + 1])) {
          let numDigits = 1;
          while (numDigits < 3 && i + 1 + numDigits <= inner.length && /\d/.test(inner[i + 1 + numDigits])) {
            numDigits++;
          }
          bytes.push(parseInt(inner.substr(i + 1, numDigits), 10));
          i += 1 + numDigits;
          continue;
        } else if (inner[i + 1] === 'x' && i + 3 <= inner.length) {
          bytes.push(parseInt(inner.substr(i + 2, 2), 16));
          i += 4;
          continue;
        } else if (inner[i + 1] === 'n') {
          bytes.push(10);
          i += 2;
          continue;
        } else if (inner[i + 1] === 'r') {
          bytes.push(13);
          i += 2;
          continue;
        } else if (inner[i + 1] === 't') {
          bytes.push(9);
          i += 2;
          continue;
        } else {
          bytes.push(inner.charCodeAt(i + 1));
          i += 2;
          continue;
        }
      }
      bytes.push(inner.charCodeAt(i));
      i++;
    }
    chunksBytes.push(bytes);
    totalBytes += bytes.length;
  }

  if (totalBytes < 5) {
    return { unpackedCode: source, chunksFound: stringLiterals.length, success: false };
  }

  const stepMatch = source.match(/\*\s*11\s*\+\s*[a-zA-Z0-9_]+\s*\+\s*(\d{1,3})\b/);
  const detectedStep = stepMatch ? parseInt(stepMatch[1], 10) : 12;

  const candidateKeys: number[] = [];
  const keyMatches = source.match(/local\s+([a-zA-Z0-9_]+)\s*=\s*(\d{1,4})/g) || [];
  for (const km of keyMatches) {
    const val = km.match(/=\s*(\d+)/);
    if (val) candidateKeys.push(parseInt(val[1], 10));
  }

  for (let k = 0; k < 256; k += 4) {
    if (!candidateKeys.includes(k)) {
      candidateKeys.push(k);
    }
  }

  const candidateSteps = [detectedStep, 12, 10, 16, 20, 23, 24, 7, 19, 31, 5, 8, 14, 22];

  for (const k of candidateKeys) {
    for (const step of candidateSteps) {
      let curKey = k;
      let idx = 1;
      const out: string[] = [];

      for (let c = 0; c < chunksBytes.length; c++) {
        const chunk = chunksBytes[c];
        for (let j = 0; j < chunk.length; j++) {
          const eb = chunk[j];
          let rb = (eb - curKey - (idx - 1) % 19) % 256;
          if (rb < 0) rb += 256;
          out.push(String.fromCharCode(rb));
          curKey = (curKey * 11 + rb + step) % 256;
          idx++;
        }
      }

      const candidate = out.join('');
      const scoreKeywords = (candidate.match(/\b(local|function|return|end|if|then|print|game|workspace|script|loadstring)\b/g) || []).length;
      if (scoreKeywords >= 1 || candidate.includes('game:GetService')) {
        return { unpackedCode: candidate, chunksFound: stringLiterals.length, success: true };
      }
    }
  }

  for (const k of [0, 42, 69, 128, 255, 137]) {
    const out: string[] = [];
    for (let c = 0; c < chunksBytes.length; c++) {
      const chunk = chunksBytes[c];
      for (let j = 0; j < chunk.length; j++) {
        out.push(String.fromCharCode(chunk[j] ^ k));
      }
    }
    const candidate = out.join('');
    const scoreKeywords = (candidate.match(/\b(local|function|return|end|if|then|print|game|workspace|script)\b/g) || []).length;
    if (scoreKeywords >= 2) {
      return { unpackedCode: candidate, chunksFound: stringLiterals.length, success: true };
    }
  }

  return { unpackedCode: source, chunksFound: stringLiterals.length, success: false };
}

function reconstructRobloxServices(code: string): { code: string; count: number } {
  let working = code;
  let count = 0;

  const serviceRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*game:GetService\(["']([a-zA-Z0-9_]+)["']\)/g;
  let match;
  const replacements = new Map<string, string>();

  while ((match = serviceRegex.exec(working)) !== null) {
    const varName = match[1];
    const serviceName = match[2];
    if (varName !== serviceName) {
      replacements.set(varName, serviceName);
    }
  }

  for (const [varName, serviceName] of replacements.entries()) {
    const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
    working = working.replace(varRegex, serviceName);
    count++;
  }

  const commonPatterns: [RegExp, string][] = [
    [/local\s+([a-zA-Z0-9_]+)\s*=\s*Players\.LocalPlayer\b/g, 'LocalPlayer'],
    [/local\s+([a-zA-Z0-9_]+)\s*=\s*LocalPlayer\.Character\s+or\s+LocalPlayer\.CharacterAdded:Wait\(\)/g, 'Character'],
    [/local\s+([a-zA-Z0-9_]+)\s*=\s*workspace\.CurrentCamera\b/g, 'Camera'],
    [/local\s+([a-zA-Z0-9_]+)\s*=\s*Character:WaitForChild\(["']HumanoidRootPart["']\)/g, 'HumanoidRootPart'],
    [/local\s+([a-zA-Z0-9_]+)\s*=\s*Character:WaitForChild\(["']Humanoid["']\)/g, 'Humanoid']
  ];

  for (const [pattern, targetName] of commonPatterns) {
    let pMatch;
    while ((pMatch = pattern.exec(working)) !== null) {
      const orig = pMatch[1];
      if (orig && orig !== targetName) {
        working = working.replace(new RegExp(`\\b${orig}\\b`, 'g'), targetName);
        count++;
      }
    }
  }

  return { code: working, count };
}

function normalizeLookalikeIdentifiers(code: string): { code: string; count: number } {
  const lookalikeRegex = /\b_[lIiO0oQ1_]{3,}\b/g;
  const longHashRegex = /\b_[a-zA-Z0-9]{12,}\b/g;
  const hexIdentRegex = /\b_0x[0-9a-fA-F]{4,}\b/g;

  const mapping = new Map<string, string>();
  let varCounter = 1;

  const replaceIdent = (match: string) => {
    if (LUA_KEYWORDS.has(match) || ROBLOX_GLOBALS.has(match)) {
      return match;
    }
    if (!mapping.has(match)) {
      mapping.set(match, `var_${varCounter++}`);
    }
    return mapping.get(match)!;
  };

  let result = code.replace(lookalikeRegex, replaceIdent);
  result = result.replace(longHashRegex, replaceIdent);
  result = result.replace(hexIdentRegex, replaceIdent);

  return { code: result, count: mapping.size };
}

function foldConstantExpressions(code: string): { code: string; count: number } {
  let count = 0;
  let current = code;

  current = current.replace(/"([^"\\]*)"\s*\.\.\s*"([^"\\]*)"/g, (_, a, b) => {
    count++;
    return JSON.stringify(a + b);
  });

  current = current.replace(/\b(\d+)\s*\+\s*(\d+)\b/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) + parseInt(b, 10));
  });

  current = current.replace(/\b(\d+)\s*-\s*(\d+)\b/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) - parseInt(b, 10));
  });

  current = current.replace(/\b(\d+)\s*\*\s*(\d+)\b/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) * parseInt(b, 10));
  });

  current = current.replace(/\b(?:bit32|bit)\.bxor\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) ^ parseInt(b, 10));
  });

  current = current.replace(/\b(?:bit32|bit)\.band\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) & parseInt(b, 10));
  });

  current = current.replace(/\b(?:bit32|bit)\.bor\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_, a, b) => {
    count++;
    return String(parseInt(a, 10) | parseInt(b, 10));
  });

  current = current.replace(/\bnot\s+false\b/g, () => {
    count++;
    return 'true';
  });

  current = current.replace(/\bnot\s+true\b/g, () => {
    count++;
    return 'false';
  });

  current = current.replace(/\b0x([0-9a-fA-F]+)\b/g, (_, hex) => {
    const val = parseInt(hex, 16);
    if (!isNaN(val)) {
      count++;
      return String(val);
    }
    return _;
  });

  return { code: current, count };
}

function stripAntiTamperTraps(code: string): string {
  let res = code;
  res = res.replace(/if\s+(?:type\([a-zA-Z0-9_]+\)\s*~=\s*"function"\s+or\s+)+type\([a-zA-Z0-9_]+\)\s*~=\s*"function"\s+then\s+return\s+end/g, '');
  res = res.replace(/local\s+[a-zA-Z0-9_]+=\(os\s+and\s+os\.clock\s+and\s+os\.clock\(\)\)[\s\S]*?then\s+return\s+end/g, '');
  res = res.replace(/if\s+[a-zA-Z0-9_]+%8000==0\s+then[\s\S]*?end\s+end/g, '');
  res = res.replace(/if\s+not\s+(?:getgenv|getfenv)\(\)\s+then\s+return\s+end/g, '');
  res = res.replace(/do\s+end/g, '');
  return res;
}

export function formatLuaIndentation(code: string): string {
  const lines = code.split('\n');
  let indent = 0;
  const formatted: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
        formatted.push('');
      }
      continue;
    }

    let dedent = false;
    if (/^(end|elseif|else|until|\}|\))\b/.test(line)) {
      dedent = true;
    }

    const currentIndent = Math.max(0, indent - (dedent ? 1 : 0));
    formatted.push('    '.repeat(currentIndent) + line);

    const opens = (line.match(/\b(then|do|repeat|function)\b/g) || []).length
                + (line.match(/[\{\(]/g) || []).length;
    const closes = (line.match(/\b(end|until)\b/g) || []).length
                 + (line.match(/[\}\)]/g) || []).length;

    indent = Math.max(0, indent + opens - closes);
  }

  return formatted.join('\n');
}

export function deobfuscateLua(
  source: string,
  options: Partial<DeobfuscateOptions> = {}
): { code: string; stats: DeobfuscationStats; extractedConstants?: string[] } {
  const opts: DeobfuscateOptions = {
    unpackVmBytecode: options.unpackVmBytecode !== false,
    normalizeIdentifiers: options.normalizeIdentifiers !== false,
    foldConstants: options.foldConstants !== false,
    decodeHexStrings: options.decodeHexStrings !== false,
    beautify: options.beautify !== false,
    aiAssist: options.aiAssist === true
  };

  const originalSize = Buffer.byteLength(source, 'utf-8');
  let workingCode = source;

  let vmChunksUnpacked = 0;
  let stringsDecrypted = 0;
  let variablesNormalized = 0;
  let expressionsFolded = 0;

  const sandboxedResult = emulateSandboxedExecution(workingCode);
  if (sandboxedResult.success && sandboxedResult.code.length > 0) {
    workingCode = sandboxedResult.code;
    vmChunksUnpacked += 1;
  }

  if (opts.unpackVmBytecode && workingCode === source) {
    const vmResult = unpackMoonsecVmChunks(workingCode);
    if (vmResult.success) {
      workingCode = vmResult.unpackedCode;
      vmChunksUnpacked = vmResult.chunksFound;
    }
  }

  const ironBrewInfo = extractIronBrewByteStringConstants(workingCode);
  const extractedConstants = ironBrewInfo.strings;

  if (opts.decodeHexStrings) {
    const charCallResult = decodeStringCharCalls(workingCode);
    workingCode = charCallResult.code;
    stringsDecrypted += charCallResult.count;

    const byteEscapeResult = decodeByteEscapesInString(workingCode);
    workingCode = byteEscapeResult.text;
    stringsDecrypted += byteEscapeResult.count;

    const hexEscapeResult = decodeHexEscapesInString(workingCode);
    workingCode = hexEscapeResult.text;
    stringsDecrypted += hexEscapeResult.count;

    const lookupResult = inlineLookupTables(workingCode);
    workingCode = lookupResult.code;
    stringsDecrypted += lookupResult.count;
  }

  workingCode = stripAntiTamperTraps(workingCode);

  if (opts.foldConstants) {
    const foldResult = foldConstantExpressions(workingCode);
    workingCode = foldResult.code;
    expressionsFolded = foldResult.count;
  }

  if (opts.normalizeIdentifiers) {
    const robloxResult = reconstructRobloxServices(workingCode);
    workingCode = robloxResult.code;
    variablesNormalized += robloxResult.count;

    const normResult = normalizeLookalikeIdentifiers(workingCode);
    workingCode = normResult.code;
    variablesNormalized += normResult.count;
  }

  if (opts.beautify) {
    workingCode = formatLuaIndentation(workingCode);
  }

  const deobfuscatedSize = Buffer.byteLength(workingCode, 'utf-8');

  return {
    code: workingCode,
    stats: {
      stringsDecrypted,
      variablesNormalized,
      expressionsFolded,
      vmChunksUnpacked,
      originalSize,
      deobfuscatedSize
    },
    extractedConstants
  };
}
