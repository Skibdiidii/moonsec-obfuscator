import { Library, Search, Copy, PlusCircle, Globe, Image as ImageIcon, Box, Sparkles, Cpu, Layers, Compass, ExternalLink, Loader2, Check, ChevronUp, ChevronDown, User, Heart } from 'lucide-react';
import { ScriptTemplate } from '../types';
import { useState, useEffect } from 'react';
import { cn } from '../utils';

export function TemplatesLibrary({ 
  templates, 
  onUseTemplate,
  initialTab = 'templates'
}: { 
  templates: ScriptTemplate[],
  onUseTemplate: (template: ScriptTemplate) => void,
  initialTab?: 'templates' | 'polyhaven'
}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'polyhaven'>(initialTab);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  

  const [selectedCategory, setSelectedCategory] = useState<'hdris' | 'textures' | 'models'>('textures');
  const [polyhavenAssets, setPolyhavenAssets] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'polyhaven') return;
    
    let isMounted = true;
    const fetchAssets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/polyhaven?t=${selectedCategory}`);
        if (!response.ok) {
          throw new Error('Failed to load Poly Haven asset registry');
        }
        const data = await response.json();
        if (isMounted) {
          setPolyhavenAssets(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Tunnel communication error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAssets();
    return () => { isMounted = false; };
  }, [activeTab, selectedCategory]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCompileAsset = (assetId: string, asset: any, copyOnly = false) => {
    let code = '';
    const authorsStr = Object.keys(asset.authors || {}).join(', ') || 'Poly Haven Contributors';
    const categoriesStr = (asset.categories || []).join(', ') || 'Uncategorized';
    
    if (selectedCategory === 'hdris') {
      code = `-- [[
-- Fsociety Poly Haven HDRI Skybox Loader
-- Asset Name: ${asset.name}
-- Creator: ${authorsStr}
-- Categories: ${categoriesStr}
-- Description: ${asset.description || 'Dynamic skies environment mapped from Poly Haven'}
--
-- [FSOCIETY REAL ROBLOX STUDIO COMPILER v3.5]
-- ]]

local Lighting = game:GetService("Lighting")
local Sky = Lighting:FindFirstChildOfClass("Sky") or Instance.new("Sky")
Sky.Name = "FsocietySky_${assetId}"

-- Mapping high-fidelity environment maps onto the six cubic sky face vectors
local previewUrl = "${asset.thumbnail_url || ''}"
Sky.SkyboxBk = previewUrl
Sky.SkyboxDn = previewUrl
Sky.SkyboxFt = previewUrl
Sky.SkyboxLf = previewUrl
Sky.SkyboxRt = previewUrl
Sky.SkyboxUp = previewUrl

-- Auto configure active lighting presets
Lighting.Ambient = Color3.fromRGB(150, 150, 160)
Lighting.OutdoorAmbient = Color3.fromRGB(120, 120, 130)
Lighting.ClockTime = 14 -- Clear afternoon contrast

Sky.Parent = Lighting
print("[Fsociety Compiler] Environment HDRI loaded: ${asset.name}")
`;
    } else if (selectedCategory === 'textures') {
      code = `-- [[
-- Fsociety Poly Haven PBR Material Variant Generator
-- Asset Name: ${asset.name}
-- Creator: ${authorsStr}
-- Categories: ${categoriesStr}
-- Description: ${asset.description || 'PBR Material textures maps'}
--
-- [FSOCIETY REAL ROBLOX STUDIO COMPILER v3.5]
-- ]]

local MaterialService = game:GetService("MaterialService")

-- Instantiate modern Roblox MaterialVariant
local mv = MaterialService:FindFirstChild("Fsociety_${assetId}")
if not mv then
    mv = Instance.new("MaterialVariant")
    mv.Name = "Fsociety_${assetId}"
    mv.BaseMaterial = Enum.Material.Concrete
    
    -- Assign texture map channels
    local texUrl = "${asset.thumbnail_url || ''}"
    mv.ColorMap = texUrl
    -- In Roblox Studio, you can map dedicated normal, roughness, and metalness maps
    mv.NormalMap = texUrl
    mv.RoughnessMap = texUrl
    
    mv.Parent = MaterialService
end

-- Spawn test platform slab to display material
local slab = workspace:FindFirstChild("Fsociety_MaterialSlab")
if not slab then
    slab = Instance.new("Part")
    slab.Name = "Fsociety_MaterialSlab"
    slab.Size = Vector3.new(24, 1, 24)
    slab.Position = Vector3.new(0, 5, 0)
    slab.Anchored = true
    slab.Material = Enum.Material.Concrete
    slab.Parent = workspace
end

slab.MaterialVariant = "Fsociety_${assetId}"
print("[Fsociety Compiler] Texture mapped. MaterialVariant created for: ${asset.name}")
`;
    } else {

      const w = asset.dimensions ? (asset.dimensions[0] / 100).toFixed(2) : '8.50';
      const h = asset.dimensions ? (asset.dimensions[1] / 100).toFixed(2) : '7.60';
      const d = asset.dimensions ? (asset.dimensions[2] / 100).toFixed(2) : '10.60';
      
      code = `-- [[
-- Fsociety Poly Haven 3D Mesh Spawn Engine
-- Asset Name: ${asset.name}
-- Creator: ${authorsStr}
-- Polycount: ${asset.polycount || 'N/A'} polygons
-- Size (Studs): ${w} x ${h} x ${d}
-- Description: ${asset.description || 'Custom 3D model asset from Poly Haven CC0 library'}
--
-- [FSOCIETY REAL ROBLOX STUDIO COMPILER v3.5]
-- ]]

-- Create MeshPart containing raw vertex information
local mesh = Instance.new("MeshPart")
mesh.Name = "FsocietyMesh_${assetId}"
mesh.Size = Vector3.new(${w}, ${h}, ${d})
mesh.TextureID = "${asset.thumbnail_url || ''}"
mesh.Anchored = true
mesh.Position = Vector3.new(0, 10, 0)
mesh.Parent = workspace

-- Force camera viewport focus on spawn
local currentCamera = workspace.CurrentCamera
if currentCamera then
    currentCamera.Focus = mesh.CFrame
end

print("[Fsociety Compiler] Mesh element spawned: ${asset.name}")
`;
    }

    if (copyOnly) {
      handleCopyCode(code, assetId);
    } else {
      const template: ScriptTemplate = {
        id: `polyhaven_${assetId}`,
        name: `${asset.name} Loader`,
        description: asset.description || `Loader script for Poly Haven asset: ${asset.name}`,
        author: authorsStr,
        code: code
      };
      onUseTemplate(template);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const assetList = Object.entries(polyhavenAssets).map(([id, details]) => ({
    id,
    ...details
  }));

  const filteredAssets = assetList.filter(asset => 
    asset.name.toLowerCase().includes(search.toLowerCase()) ||
    (asset.tags && asset.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))) ||
    (asset.categories && asset.categories.some((c: string) => c.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="flex flex-col h-full shrink-0 w-full bg-[#060609]">
      
      <div className="grid grid-cols-2 border-b border-white/5 bg-black/40 shrink-0">
        <button
          type="button"
          onClick={() => { setActiveTab('templates'); setSearch(''); }}
          className={cn(
            "py-2.5 text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer focus:outline-none uppercase text-center border-b-2",
            activeTab === 'templates'
              ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
              : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
        >
          [01] Custom Scripts
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('polyhaven'); setSearch(''); }}
          className={cn(
            "py-2.5 text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer focus:outline-none uppercase text-center border-b-2 flex items-center justify-center space-x-1",
            activeTab === 'polyhaven'
              ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
              : "border-transparent text-gray-500 hover:text-emerald-400 hover:bg-white/5"
          )}
        >
          <Sparkles size={11} className={activeTab === 'polyhaven' ? "text-emerald-400 animate-pulse" : "text-gray-600"} />
          <span>[02] Real Roblox Studio</span>
        </button>
      </div>

      
      {activeTab === 'polyhaven' && (
        <div className="px-3 py-1 bg-emerald-950/10 border-b border-white/5 flex items-center justify-between text-[9px] font-mono text-emerald-500 shrink-0 select-none">
          <div className="flex items-center space-x-1">
            <Globe size={10} className="text-emerald-500" />
            <span>PROVIDER: polyhaven.com</span>
          </div>
          <span className="text-[8px] px-1 bg-emerald-500/20 rounded border border-emerald-500/30 font-semibold">CC0 PUBLIC</span>
        </div>
      )}

      
      <div className="p-3 border-b border-white/5 bg-black/20 shrink-0 space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder={activeTab === 'templates' ? "Search scripts..." : "Search assets & tags..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded py-1 pl-7 pr-3 text-[11px] text-gray-300 focus:outline-none focus:border-cyan-500/40 transition-colors placeholder:text-gray-600"
          />
        </div>

        
        {activeTab === 'polyhaven' && (
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => { setSelectedCategory('textures'); setExpandedAssetId(null); }}
              className={cn(
                "py-1 rounded border transition-all flex items-center justify-center space-x-1 cursor-pointer",
                selectedCategory === 'textures'
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                  : "border-white/5 bg-black/40 text-gray-500 hover:text-gray-300"
              )}
            >
              <Layers size={10} />
              <span>Textures</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCategory('models'); setExpandedAssetId(null); }}
              className={cn(
                "py-1 rounded border transition-all flex items-center justify-center space-x-1 cursor-pointer",
                selectedCategory === 'models'
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                  : "border-white/5 bg-black/40 text-gray-500 hover:text-gray-300"
              )}
            >
              <Box size={10} />
              <span>Models</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedCategory('hdris'); setExpandedAssetId(null); }}
              className={cn(
                "py-1 rounded border transition-all flex items-center justify-center space-x-1 cursor-pointer",
                selectedCategory === 'hdris'
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                  : "border-white/5 bg-black/40 text-gray-500 hover:text-gray-300"
              )}
            >
              <Compass size={10} />
              <span>Skyboxes</span>
            </button>
          </div>
        )}
      </div>
      
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {activeTab === 'templates' ? (

          <>
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-black/20 border border-white/5 rounded-md p-2.5 hover:bg-white/5 hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-xs font-semibold text-gray-300">{template.name}</h3>
                  <button 
                    type="button"
                    onClick={() => onUseTemplate(template)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-cyan-400 hover:bg-cyan-400/10 rounded transition-all cursor-pointer"
                    title="Import Script"
                  >
                    <PlusCircle size={13} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mb-1.5 line-clamp-2 leading-tight">{template.description}</p>
                <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                  <span className="bg-white/5 px-1.5 py-0.2 rounded text-[8px]">BY: {template.author}</span>
                  <button 
                    type="button"
                    onClick={() => handleCopyCode(template.code, template.id)}
                    className="flex items-center hover:text-gray-400 transition-colors"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check size={9} className="mr-1 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={9} className="mr-1" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="text-center text-[10px] text-gray-600 font-mono py-8">
                [ NO CUSTOM TEMPLATES FOUND ]
              </div>
            )}
          </>
        ) : (

          <>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 font-mono space-y-2">
                <Loader2 size={20} className="text-emerald-500 animate-spin" />
                <span className="text-[9px] tracking-wider animate-pulse uppercase">[ DECRYPTING MATRIX TUNNEL... ]</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded text-red-400 text-center font-mono text-[9px]">
                <div className="font-bold uppercase mb-1">TUNNEL FAIL</div>
                <div>{error}</div>
                <button
                  type="button"
                  onClick={() => {

                    setPolyhavenAssets({});
                    setSelectedCategory(selectedCategory);
                  }}
                  className="mt-2 bg-red-500/10 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[8px] uppercase hover:bg-red-500/20 cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!isLoading && !error && filteredAssets.length === 0 && (
              <div className="text-center text-[10px] text-gray-600 font-mono py-8">
                [ NO ASSETS CONFORMING TO SELECTION ]
              </div>
            )}

            {!isLoading && !error && filteredAssets.map(asset => {
              const isExpanded = expandedAssetId === asset.id;
              return (
                <div 
                  key={asset.id} 
                  className={cn(
                    "border rounded transition-all duration-200 overflow-hidden",
                    isExpanded 
                      ? "border-emerald-500/40 bg-emerald-950/10" 
                      : "border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  
                  <div 
                    onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                    className="p-2 flex items-center space-x-2.5 cursor-pointer select-none"
                  >
                    <div className="w-10 h-10 rounded bg-zinc-900 border border-white/5 overflow-hidden shrink-0 relative">
                      <img 
                        src={asset.thumbnail_url} 
                        alt={asset.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-gray-300 truncate">{asset.name}</h4>
                      <p className="text-[9px] text-gray-500 truncate font-mono">
                        by {Object.keys(asset.authors || {})[0] || 'Contributor'}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[8px] bg-black/40 text-gray-400 px-1 py-0.1 border border-white/5 rounded">
                          {(asset.categories || [])[0] || 'Asset'}
                        </span>
                        {asset.download_count && (
                          <span className="text-[8px] text-gray-600 font-mono">
                            ↓ {asset.download_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-500 shrink-0">
                      {isExpanded ? <ChevronUp size={12} className="text-emerald-400" /> : <ChevronDown size={12} />}
                    </div>
                  </div>

                  
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-0.5 border-t border-white/5 bg-black/40 font-mono text-[10px] text-gray-400 space-y-2">
                      <p className="text-[9px] text-gray-500 leading-normal italic">
                        "{asset.description || 'CC0 high quality simulation resource.'}"
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 text-[8px] border-t border-b border-white/5 py-1.5 text-gray-500">
                        <div>
                          <span className="text-gray-600">RESOLUTION:</span> {asset.max_resolution ? `${asset.max_resolution[0]}x${asset.max_resolution[1]}` : 'Unknown'}
                        </div>
                        {selectedCategory === 'models' ? (
                          <div>
                            <span className="text-gray-600">POLYCOUNT:</span> {asset.polycount ? `${asset.polycount.toLocaleString()}` : 'N/A'}
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-600">DIMENSIONS:</span> {asset.dimensions ? `${asset.dimensions[0]}x${asset.dimensions[1]}` : 'N/A'}
                          </div>
                        )}
                        <div className="col-span-2 truncate">
                          <span className="text-gray-600">CREATOR:</span> {Object.keys(asset.authors || {}).join(', ')}
                        </div>
                      </div>

                      
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCompileAsset(asset.id, asset, false)}
                          className="py-1 px-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-bold text-[9px] rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <PlusCircle size={10} />
                          <span>COMPILE & INJECT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompileAsset(asset.id, asset, true)}
                          className="py-1 px-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-300 border border-white/10 text-[9px] rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          {copiedId === asset.id ? (
                            <>
                              <Check size={10} className="text-emerald-400" />
                              <span className="text-emerald-400">COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>COPY LUA LOADER</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
