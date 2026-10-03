import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, X, RefreshCw, FileCode, Copy, Check, Download, 
  Upload, Shield, Terminal, ArrowRight, Clock, Trash2, Sparkles, AlertCircle
} from 'lucide-react';
import { FileNode } from '../types';

export interface VaultScriptItem {
  id: string;
  name: string;
  createdAt: number;
  size: number;
  rawUrl: string;
  loadstring: string;
  snippet?: string;
  code?: string;
}

interface ScriptVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreScript: (name: string, content: string) => void;
  onRestoreFullWorkspace?: (files: FileNode[], code: Record<string, string>) => void;
  currentFiles: FileNode[];
  currentCode: Record<string, string>;
}

const PRELOADED_SCRIPTS: { id: string; name: string; game: string; description: string; code: string }[] = [
  {
    id: 'blox-fruits',
    name: 'Blox_Fruits_AutoFarm.lua',
    game: 'Blox Fruits',
    description: 'Auto-Farm Level, Mastery, Fast Attack, Fruit Finder, and Player ESP.',
    code: `local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local LocalPlayer = Players.LocalPlayer

getgenv().AutoFarm = true
getgenv().FastAttack = true
getgenv().AutoFruit = true

local function getClosestMob()
    local char = LocalPlayer.Character
    if not char or not char:FindFirstChild("HumanoidRootPart") then return nil end
    local closest, minDistance = nil, math.huge
    local enemies = Workspace:FindFirstChild("Enemies")
    if enemies then
        for _, enemy in pairs(enemies:GetChildren()) do
            local hum = enemy:FindFirstChild("Humanoid")
            local hrp = enemy:FindFirstChild("HumanoidRootPart")
            if hum and hrp and hum.Health > 0 then
                local dist = (hrp.Position - char.HumanoidRootPart.Position).Magnitude
                if dist < minDistance then
                    minDistance = dist
                    closest = enemy
                end
            end
        end
    end
    return closest
end

task.spawn(function()
    while task.wait(0.1) do
        if getgenv().AutoFarm and LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart") then
            local target = getClosestMob()
            if target and target:FindFirstChild("HumanoidRootPart") then
                LocalPlayer.Character.HumanoidRootPart.CFrame = target.HumanoidRootPart.CFrame * CFrame.new(0, 15, 0)
                if getgenv().FastAttack then
                    local combat = LocalPlayer.Character:FindFirstChildOfClass("Tool")
                    if combat then
                        combat:Activate()
                    end
                end
            end
        end
    end
end)

print("[MoonSec] Blox Fruits Suite Initialized Successfully.")`
  },
  {
    id: 'blade-ball',
    name: 'Blade_Ball_AutoParry.lua',
    game: 'Blade Ball',
    description: 'Predictive Auto Parry, Curve Calculation, Visual Radius, and Ball Tracker.',
    code: `local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local VirtualInputManager = game:GetService("VirtualInputManager")
local LocalPlayer = Players.LocalPlayer

getgenv().AutoParry = true
getgenv().ParryDistance = 24.5

local function getTargetBall()
    local balls = Workspace:FindFirstChild("Balls")
    if not balls then return nil end
    for _, ball in pairs(balls:GetChildren()) do
        if ball:GetAttribute("realBall") or ball:IsA("BasePart") then
            return ball
        end
    end
    return nil
end

local function triggerParry()
    VirtualInputManager:SendMouseButtonEvent(0, 0, 0, true, game, 1)
    task.wait(0.02)
    VirtualInputManager:SendMouseButtonEvent(0, 0, 0, false, game, 1)
end

RunService.RenderStepped:Connect(function()
    if not getgenv().AutoParry then return end
    local char = LocalPlayer.Character
    if not char or not char:FindFirstChild("HumanoidRootPart") then return end
    
    local ball = getTargetBall()
    if ball then
        local distance = (ball.Position - char.HumanoidRootPart.Position).Magnitude
        local velocity = ball.Velocity.Magnitude
        local dynamicThreshold = math.clamp(getgenv().ParryDistance + (velocity * 0.12), 15, 60)
        
        if distance <= dynamicThreshold then
            triggerParry()
        end
    end
end)

print("[MoonSec] Blade Ball Predictive Engine Online.")`
  },
  {
    id: 'arsenal',
    name: 'Arsenal_Universal_Aim.lua',
    game: 'Arsenal',
    description: 'Silent Aim, Box ESP, Tracers, Anti-Spread, and Fast Fire.',
    code: `local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Camera = Workspace.CurrentCamera
local LocalPlayer = Players.LocalPlayer

getgenv().SilentAim = true
getgenv().AimFov = 160
getgenv().TargetPart = "Head"

local function isVisible(part)
    local char = LocalPlayer.Character
    if not char then return false end
    local ray = Ray.new(Camera.CFrame.Position, (part.Position - Camera.CFrame.Position).Unit * 999)
    local hit = Workspace:FindPartOnRayWithIgnoreList(ray, { char, Camera })
    return hit and hit:IsDescendantOf(part.Parent)
end

local function getClosestEnemy()
    local closest, maxFov = nil, getgenv().AimFov
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Team ~= LocalPlayer.Team and player.Character then
            local hum = player.Character:FindFirstChild("Humanoid")
            local targetPart = player.Character:FindFirstChild(getgenv().TargetPart)
            if hum and hum.Health > 0 and targetPart then
                local screenPos, onScreen = Camera:WorldToViewportPoint(targetPart.Position)
                if onScreen then
                    local mousePos = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y / 2)
                    local dist = (Vector2.new(screenPos.X, screenPos.Y) - mousePos).Magnitude
                    if dist < maxFov then
                        maxFov = dist
                        closest = targetPart
                    end
                end
            end
        end
    end
    return closest
end

local mt = getrawmetatable(game)
local oldNamecall = mt.__namecall
setreadonly(mt, false)

mt.__namecall = newcclosure(function(self, ...)
    local method = getnamecallmethod()
    local args = {...}
    if getgenv().SilentAim and tostring(method) == "FireServer" and tostring(self) == "CreateProjectile" then
        local target = getClosestEnemy()
        if target then
            args[1] = target.Position
        end
        return oldNamecall(self, unpack(args))
    end
    return oldNamecall(self, ...)
end)

setreadonly(mt, true)
print("[MoonSec] Arsenal Combat Framework Hooked.")`
  },
  {
    id: 'infinite-yield',
    name: 'Infinite_Yield_Admin.lua',
    game: 'Universal',
    description: 'Complete Universal Admin Command Suite (Fly, Noclip, Speed, ESP, Bypasses).',
    code: `loadstring(game:HttpGet("https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source"))()`
  },
  {
    id: 'dex-spy',
    name: 'DarkDex_Explorer.lua',
    game: 'Universal',
    description: 'Internal Game Hierarchy Inspector and Remote Event Logger.',
    code: `loadstring(game:HttpGet("https://raw.githubusercontent.com/infyiff/backup/main/dex.lua"))()`
  }
];

export function ScriptVaultModal({
  isOpen,
  onClose,
  onRestoreScript,
  onRestoreFullWorkspace,
  currentFiles,
  currentCode
}: ScriptVaultModalProps) {
  const [activeTab, setActiveTab] = useState<'cloud' | 'arsenal' | 'backup'>('cloud');
  const [cloudScripts, setCloudScripts] = useState<VaultScriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchCloudScripts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vault/scripts');
      const data = await res.json();
      if (res.ok && Array.isArray(data.scripts)) {
        setCloudScripts(data.scripts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudScripts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.6.0',
      exportedAt: Date.now(),
      files: currentFiles,
      code: currentCode
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoonSec_Workspace_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedbackMsg('Workspace backup downloaded successfully!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.files && parsed.code) {
          if (onRestoreFullWorkspace) {
            onRestoreFullWorkspace(parsed.files, parsed.code);
            setFeedbackMsg('Workspace restored from backup file!');
            setTimeout(() => {
              setFeedbackMsg(null);
              onClose();
            }, 1200);
          }
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/70 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                  Script Recovery Vault
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                    Permanent Persistence
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Recover lost scripts, restore cloud snapshots, and deploy pre-built exploit engines
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

          <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-950/40 border-b border-white/5 shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('cloud')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'cloud'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock size={13} />
                <span>Cloud Uploads & Pastes ({cloudScripts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('arsenal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'arsenal'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles size={13} />
                <span>Pre-Built Arsenal ({PRELOADED_SCRIPTS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'backup'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Download size={13} />
                <span>Backup & Export</span>
              </button>
            </div>

            {activeTab === 'cloud' && (
              <button
                onClick={fetchCloudScripts}
                disabled={isLoading}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                title="Refresh Cloud Vault"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {feedbackMsg && (
            <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={14} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
            {activeTab === 'cloud' && (
              <div className="space-y-3">
                {cloudScripts.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-zinc-950/30">
                    <FileCode size={32} className="mx-auto text-zinc-600 mb-2" />
                    <div className="text-sm font-medium text-zinc-300">No cloud scripts found in persistent storage yet.</div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Upload scripts via the Uploader or Obfuscator to store permanent Roblox loadstring endpoints.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {cloudScripts.map((script) => (
                      <div
                        key={script.id}
                        className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 hover:border-white/15 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <FileCode size={16} className="text-indigo-400 shrink-0" />
                            <span className="font-mono text-xs font-semibold text-white truncate">{script.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {(script.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono shrink-0 ml-3">
                            {new Date(script.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="bg-black/60 p-2 rounded-lg border border-white/5 font-mono text-[11px] text-emerald-400 flex items-center justify-between gap-2 overflow-hidden">
                          <span className="truncate select-all">{script.loadstring}</span>
                          <button
                            onClick={() => handleCopyText(script.id, script.loadstring)}
                            className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors shrink-0"
                            title="Copy Loadstring"
                          >
                            {copiedId === script.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCopyText(`raw-${script.id}`, script.rawUrl)}
                            className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Copy size={12} />
                            <span>Copy Raw URL</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const resp = await fetch(script.rawUrl);
                                const scriptText = await resp.text();
                                onRestoreScript(script.name, scriptText);
                                setFeedbackMsg(`Restored "${script.name}" to workspace editor!`);
                                setTimeout(() => setFeedbackMsg(null), 3000);
                              } catch (e) {
                                alert('Failed to fetch script content');
                              }
                            }}
                            className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <ArrowRight size={12} />
                            <span>Load to Editor</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'arsenal' && (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                  <Shield size={16} className="shrink-0 text-indigo-400" />
                  <span>
                    Essential scripts ready to restore immediately if your editor workspace was lost or cleared.
                  </span>
                </div>

                <div className="grid gap-3">
                  {PRELOADED_SCRIPTS.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 hover:border-indigo-500/20 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white font-mono">{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.game}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onRestoreScript(item.name, item.code);
                            setFeedbackMsg(`Restored "${item.name}" into workspace!`);
                            setTimeout(() => {
                              setFeedbackMsg(null);
                              onClose();
                            }, 1000);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <ArrowRight size={13} />
                          <span>Restore to Workspace</span>
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400">{item.description}</p>

                      <div className="bg-black/50 p-2 rounded-lg border border-white/5 font-mono text-[11px] text-zinc-400 max-h-20 overflow-hidden line-clamp-3">
                        {item.code.slice(0, 180)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div className="p-5 bg-zinc-950/60 rounded-xl border border-white/5 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Full Workspace Backup & Recovery</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Safeguard all files, code buffers, and active configurations. Backups can be restored at any time to guarantee no script loss across browser clears or cloud updates.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      <Download size={14} />
                      <span>Download Workspace Backup (.JSON)</span>
                    </button>

                    <label className="px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition-all flex items-center gap-2 cursor-pointer">
                      <Upload size={14} />
                      <span>Restore from Backup File</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportBackupFile}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>Automatic Local Persistence Active</span>
                  </div>
                  <p className="text-zinc-400">
                    All workspace changes are continuously saved to your browser localStorage and synchronized to the backend server.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-zinc-500 font-mono">MoonSec Storage & Vault Engine</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
