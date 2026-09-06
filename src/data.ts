import { FileNode, ScriptTemplate } from './types';

export const initialFiles: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'main.server.lua',
        name: 'Main.server.lua',
        type: 'file',
        content: '-- Fsociety Initialization\nprint("Hello, friend. Server Started.")\n',
      },
      {
        id: 'player_handler.server.lua',
        name: 'PlayerHandler.server.lua',
        type: 'file',
        content: 'game.Players.PlayerAdded:Connect(function(player)\n\tprint(player.Name .. " joined the mainframe")\nend)',
      },
    ],
  },
  {
    id: 'config',
    name: 'config',
    type: 'folder',
    children: [
      {
        id: 'settings.lua',
        name: 'Settings.lua',
        type: 'file',
        content: 'return {\n\tMaxPlayers = 50,\n\tRootAccess = false\n}',
      }
    ]
  }
];

export const templates: ScriptTemplate[] = [
  {
    id: 't1',
    name: 'Leaderstats Injection',
    description: 'Basic player leaderstats setup with bypass',
    author: 'Elliot',
    code: 'game.Players.PlayerAdded:Connect(function(player)\n\tlocal leaderstats = Instance.new("Folder")\n\tleaderstats.Name = "leaderstats"\n\tleaderstats.Parent = player\n\n\tlocal cash = Instance.new("IntValue")\n\tcash.Name = "Cash"\n\tcash.Value = 999999\n\tcash.Parent = leaderstats\nend)',
  },
  {
    id: 't2',
    name: 'Datastore Secure Save',
    description: 'Robust datastore saving logic',
    author: 'Fsociety',
    code: 'local DataStoreService = game:GetService("DataStoreService")\nlocal PlayerData = DataStoreService:GetDataStore("PlayerData_V1")\n\n-- Optimized Save Function\nlocal function SaveData(player)\n\tpcall(function()\n\t\t-- Logic here\n\tend)\nend',
  },
  {
    id: 't3',
    name: 'System Wipe (Kill Brick)',
    description: 'Optimized touch event damage to wipe players',
    author: 'Darlene',
    code: 'local part = script.Parent\n\npart.Touched:Connect(function(hit)\n\tlocal humanoid = hit.Parent:FindFirstChild("Humanoid")\n\tif humanoid then\n\t\thumanoid.Health = 0\n\tend\nend)',
  }
];
