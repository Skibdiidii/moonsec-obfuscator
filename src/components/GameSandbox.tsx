import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Gamepad2, Play, RefreshCw, Layers, ShieldAlert, Cpu, Eye, EyeOff, Trash2, Box, Compass, Users, Sun, Moon, HelpCircle, ChevronRight, CornerDownRight, Maximize2, Minimize2, Tag, Plus, Sliders, PlayCircle, Info, Folder, Server } from 'lucide-react';
import { cn } from '../utils';

export interface SandboxObject {
  id: string;
  name: string;
  type: 'Part' | 'MeshPart' | 'Sky' | 'MaterialVariant' | 'ScreenGui' | 'Script';
  thumbnailUrl?: string;
  color?: string;
  dimensions?: [number, number, number];
  polycount?: number;
  properties: Record<string, string | number | boolean>;
  attributes?: Record<string, string | number | boolean>;
  tags?: string[];
}

interface GameSandboxProps {
  logs: Array<{ id: string; message: string; type: string; timestamp: string }>;
  activeCode: string;
  sandboxObjects: SandboxObject[];
  onAddObject: (obj: SandboxObject) => void;
  onRemoveObject: (id: string) => void;
  onClearObjects: () => void;
  onUpdateObjects: (objs: SandboxObject[]) => void;
  onAddLog: (message: string, type: 'info' | 'error' | 'success' | 'warning') => void;
}

function createProceduralModel(obj: SandboxObject): THREE.Object3D {
  const group = new THREE.Group();
  group.name = obj.name;
  const name = (obj.name || "").toLowerCase();

  // Helper to add child mesh with standard properties
  const createBlock = (w: number, h: number, d: number, color: number, posY: number = 0, posX: number = 0, posZ: number = 0, rotX: number = 0, rotY: number = 0, rotZ: number = 0): THREE.Mesh => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(posX, posY, posZ);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const createCylinder = (radiusTop: number, radiusBottom: number, height: number, color: number, posY: number = 0, posX: number = 0, posZ: number = 0, rotX: number = 0, rotY: number = 0, rotZ: number = 0): THREE.Mesh => {
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(posX, posY, posZ);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const createSphere = (radius: number, color: number, posY: number = 0, posX: number = 0, posZ: number = 0): THREE.Mesh => {
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(posX, posY, posZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // We customize the colors of our model elements:
  const themeColor = obj.color ? parseInt(obj.color.replace('#', '0x')) : 0x0891B2;

  // Pattern Matching for 3D Assemblies
  if (name.includes('chair') || name.includes('stool') || name.includes('bench') || name.includes('sofa') || name.includes('seat')) {
    // 3D CHAIRS & SEATS ASSEMBLY
    const wood = obj.color ? themeColor : 0x7c2d12; // deep warm redwood/brown
    const cushion = 0x1e293b; // slate charcoal cushion
    
    // Legs
    const legW = 0.08;
    const legH = 0.6;
    createBlock(legW, legH, legW, wood, -0.3 + legH/2, -0.35, -0.35);
    createBlock(legW, legH, legW, wood, -0.3 + legH/2, 0.35, -0.35);
    createBlock(legW, legH, legW, wood, -0.3 + legH/2, -0.35, 0.35);
    createBlock(legW, legH, legW, wood, -0.3 + legH/2, 0.35, 0.35);

    // Seat Board
    createBlock(0.9, 0.1, 0.9, wood, 0.35, 0, 0);
    // Cushion
    createBlock(0.82, 0.08, 0.82, cushion, 0.41, 0, 0);

    // Backrest supports
    const backH = 0.8;
    createBlock(0.08, backH, 0.08, wood, 0.35 + backH/2, -0.35, -0.35);
    createBlock(0.08, backH, 0.08, wood, 0.35 + backH/2, 0.35, -0.35);
    // Backrest slats
    createBlock(0.65, 0.22, 0.06, wood, 0.9, 0, -0.35);
    createBlock(0.65, 0.15, 0.06, cushion, 0.65, 0, -0.35);

  } else if (name.includes('gun') || name.includes('cannon') || name.includes('blunderbuss') || name.includes('rifle') || name.includes('pistol') || name.includes('weapon') || name.includes('blaster') || name.includes('revolver')) {
    // 3D WEAPONS & BLASTER ASSEMBLY
    const metal = 0x374151; // steel gray
    const accent = obj.color ? themeColor : 0xeab308; // neon theme or gold brass
    const stock = 0x451a03; // mahogany wood stock

    if (name.includes('cannon')) {
      // Magnificent Historic Field Cannon
      createCylinder(0.18, 0.25, 1.6, metal, 0.4, 0, 0, Math.PI / 2, 0, 0);
      createCylinder(0.24, 0.24, 0.1, accent, 0.4, 0, -0.75, Math.PI / 2, 0, 0); // back rim
      createCylinder(0.2, 0.2, 0.08, accent, 0.4, 0, 0.75, Math.PI / 2, 0, 0); // tip rim
      createSphere(0.12, metal, 0.4, 0, -0.85); // fuse sphere
      
      // Wooden carriages
      createBlock(0.7, 0.4, 1.2, stock, 0.1, 0, -0.1);
      
      // Giant gold-trimmed wooden wheels
      const wRad = 0.45;
      createCylinder(wRad, wRad, 0.12, accent, 0.15, -0.42, 0, 0, 0, Math.PI / 2);
      createCylinder(wRad, wRad, 0.12, accent, 0.15, 0.42, 0, 0, 0, Math.PI / 2);
      createCylinder(wRad - 0.08, wRad - 0.08, 0.16, stock, 0.15, -0.42, 0, 0, 0, Math.PI / 2);
      createCylinder(wRad - 0.08, wRad - 0.08, 0.16, stock, 0.15, 0.42, 0, 0, 0, Math.PI / 2);
    } else {
      // Compact Handgun or Long rifle
      const isRifle = name.includes('rifle') || name.includes('blunderbuss');
      const bLen = isRifle ? 1.4 : 0.7;

      // Barrel (aligned along Z axis, extending forward)
      createCylinder(0.06, 0.06, bLen, metal, 0.25, 0, bLen / 4, Math.PI / 2, 0, 0);
      // Scope attachment
      createCylinder(0.03, 0.03, bLen * 0.4, metal, 0.36, 0, 0, Math.PI / 2, 0, 0);
      createBlock(0.02, 0.06, 0.02, accent, 0.32, 0, -bLen * 0.1);
      createBlock(0.02, 0.06, 0.02, accent, 0.32, 0, bLen * 0.1);

      // Gun Receiver Body
      createBlock(0.14, 0.22, bLen * 0.4, stock, 0.18, 0, -bLen * 0.15);
      // Grip Handle
      createBlock(0.1, 0.32, 0.1, stock, -0.05, 0, -bLen * 0.25, 0.25, 0, 0);
      // Trigger details
      createBlock(0.02, 0.1, 0.12, accent, 0.05, 0, -bLen * 0.08);

      if (name.includes('blunderbuss') || name.includes('shotgun')) {
        createCylinder(0.15, 0.06, 0.28, accent, 0.25, 0, bLen/2 + 0.1, Math.PI / 2, 0, 0);
      } else {
        createCylinder(0.08, 0.06, 0.08, accent, 0.25, 0, bLen / 2 + 0.02, Math.PI / 2, 0, 0);
      }
    }

  } else if (name.includes('sword') || name.includes('blade') || name.includes('dagger') || name.includes('knife') || name.includes('axe') || name.includes('mace') || name.includes('shield') || name.includes('spear')) {
    // 3D MELEE WEAPONS & SHIELDS
    const steel = 0xf3f4f6; // silver steel
    const gold = 0xd97706; // brass gold highlights
    const handle = 0x451a03; // leather grip

    if (name.includes('shield')) {
      createCylinder(0.65, 0.65, 0.08, steel, 0.2, 0, 0, Math.PI / 2, 0, 0);
      createCylinder(0.45, 0.45, 0.1, obj.color ? themeColor : 0xb91c1c, 0.2, 0, 0, Math.PI / 2, 0, 0); // colored crest
      createSphere(0.12, gold, 0.2, 0, 0.05); // center steel spike
      createBlock(0.06, 0.32, 0.04, handle, 0.2, 0, -0.06); // back handler
    } else if (name.includes('axe')) {
      createCylinder(0.05, 0.05, 1.5, handle, 0.15, 0, 0);
      createCylinder(0.07, 0.07, 0.18, gold, 0.7, 0, 0); // hilt bands
      createCylinder(0.07, 0.07, 0.18, gold, -0.4, 0, 0);
      
      createBlock(0.7, 0.5, 0.04, steel, 0.52, 0.35, 0);
      createBlock(0.7, 0.5, 0.04, steel, 0.52, -0.35, 0);
      createBlock(0.08, 0.45, 0.03, obj.color ? themeColor : 0x06b6d4, 0.52, 0.68, 0);
      createBlock(0.08, 0.45, 0.03, obj.color ? themeColor : 0x06b6d4, 0.52, -0.68, 0);
    } else {
      const isDagger = name.includes('dagger') || name.includes('knife');
      const bLen = isDagger ? 0.7 : 1.7;

      createCylinder(0.04, 0.04, 0.35, handle, -0.3, 0, 0);
      createSphere(0.07, gold, -0.48, 0, 0);
      createBlock(0.45, 0.06, 0.1, gold, -0.1, 0, 0);
      createSphere(0.06, obj.color ? themeColor : 0x06b6d4, -0.1, 0, 0.04); // center element socket

      createBlock(0.09, bLen, 0.03, steel, -0.1 + bLen / 2, 0, 0);
      createBlock(0.015, bLen * 0.85, 0.04, obj.color ? themeColor : 0x06b6d4, -0.1 + bLen * 0.45, 0, 0);
      createCylinder(0.0, 0.045, 0.15, steel, -0.1 + bLen + 0.075, 0, 0);
    }

  } else if (name.includes('table') || name.includes('desk') || name.includes('bench') || name.includes('counter') || name.includes('shelf') || name.includes('cabinet')) {
    const mahogany = 0x451a03; 
    const support = 0x1f2937; // powder coated iron

    const width = 1.8;
    const depth = 1.0;
    const height = 0.8;

    createBlock(width, 0.1, depth, mahogany, height - 0.05, 0, 0);

    const legW = 0.08;
    const legH = height - 0.1;
    createBlock(legW, legH, legW, support, legH/2, -width/2 + 0.12, -depth/2 + 0.12);
    createBlock(legW, legH, legW, support, legH/2, width/2 - 0.12, -depth/2 + 0.12);
    createBlock(legW, legH, legW, support, legH/2, -width/2 + 0.12, depth/2 - 0.12);
    createBlock(legW, legH, legW, support, legH/2, width/2 - 0.12, depth/2 - 0.12);

    if (name.includes('desk') || name.includes('cabinet')) {
      createBlock(0.45, legH - 0.06, depth - 0.15, mahogany, legH/2 + 0.03, width/2 - 0.35, 0);
      createBlock(0.3, 0.04, 0.05, 0xeab308, legH/2 + 0.16, width/2 - 0.35, depth/2 - 0.06);
      createBlock(0.3, 0.04, 0.05, 0xeab308, legH/2 - 0.12, width/2 - 0.35, depth/2 - 0.06);
    }

  } else if (name.includes('chest') || name.includes('box') || name.includes('crate') || name.includes('barrel') || name.includes('container') || name.includes('case')) {
    const wood = obj.color ? themeColor : 0x854d0e; // rich raw timber
    const bands = 0x111827; // dark steel strapping bands
    const lock = 0xeab308; // heavy gold lock

    if (name.includes('barrel')) {
      createCylinder(0.42, 0.48, 1.0, wood, 0.5, 0, 0);
      createCylinder(0.49, 0.49, 0.05, bands, 0.82, 0, 0);
      createCylinder(0.5, 0.5, 0.05, bands, 0.5, 0, 0);
      createCylinder(0.49, 0.49, 0.05, bands, 0.18, 0, 0);
    } else if (name.includes('chest')) {
      createBlock(1.2, 0.5, 0.8, wood, 0.25, 0, 0);
      createBlock(1.22, 0.52, 0.04, bands, 0.25, 0, 0.38);
      createBlock(1.22, 0.52, 0.04, bands, 0.25, 0, -0.38);
      
      createBlock(1.2, 0.3, 0.8, wood, 0.65, 0, 0);
      createBlock(1.15, 0.12, 0.75, bands, 0.8, 0, 0); // strap down center
      
      createBlock(0.15, 0.2, 0.06, lock, 0.4, 0, 0.4);
      createSphere(0.04, 0x020617, 0.36, 0, 0.42); // keyhole
    } else {
      createBlock(1.0, 1.0, 1.0, wood, 0.5, 0, 0);
      
      const fW = 0.08;
      const fD = 1.02;
      createBlock(fD, fW, fD, bands, 0.05, 0, 0); // bottom band
      createBlock(fD, fW, fD, bands, 0.95, 0, 0); // top band
      createBlock(fW, 0.8, fD, bands, 0.5, -0.46, 0); // left vertical
      createBlock(fW, 0.8, fD, bands, 0.5, 0.46, 0); // right vertical
      
      createBlock(1.15, fW, 0.03, bands, 0.5, 0, 0.51, 0, 0, Math.PI / 4);
      createBlock(1.15, fW, 0.03, bands, 0.5, 0, -0.51, 0, 0, -Math.PI / 4);
    }

  } else if (name.includes('lamp') || name.includes('lantern') || name.includes('torch') || name.includes('light') || name.includes('chandelier') || name.includes('candle')) {
    const metal = 0x334155; 
    const bulb = 0xfef08a; 

    if (name.includes('candle')) {
      createCylinder(0.18, 0.18, 0.03, 0xd97706, 0.015, 0, 0); 
      createCylinder(0.05, 0.05, 0.32, 0xfef3c7, 0.17, 0, 0); 
      const flame = createSphere(0.05, 0xf97316, 0.355, 0, 0); 
      if (flame.material instanceof THREE.MeshStandardMaterial) {
        flame.material.emissive.setHex(0xf97316);
        flame.material.emissiveIntensity = 2.0;
      }
    } else {
      createCylinder(0.06, 0.1, 1.8, metal, 0.9, 0, 0); 
      createBlock(0.5, 0.06, 0.06, metal, 1.7, 0.22, 0); 
      
      createCylinder(0.15, 0.1, 0.3, metal, 1.45, 0.45, 0);
      const lightMesh = createCylinder(0.12, 0.08, 0.24, bulb, 1.45, 0.45, 0);
      if (lightMesh.material instanceof THREE.MeshStandardMaterial) {
        lightMesh.material.emissive.setHex(0xfef08a);
        lightMesh.material.emissiveIntensity = 2.0;
      }
      createCylinder(0.18, 0.16, 0.05, 0xd97706, 1.6, 0.45, 0); 
    }

  } else if (name.includes('tree') || name.includes('plant') || name.includes('bush') || name.includes('pot') || name.includes('cactus') || name.includes('flower')) {
    const wood = 0x78350f; 
    const pine = 0x166534; 
    const lime = 0x22c55e; 

    if (name.includes('pot') || name.includes('plant') || name.includes('flower') || name.includes('cactus')) {
      createCylinder(0.24, 0.18, 0.35, 0xca8a04, 0.175, 0, 0); 
      createCylinder(0.22, 0.22, 0.03, 0x451a03, 0.34, 0, 0); 
      
      if (name.includes('cactus')) {
        createCylinder(0.07, 0.07, 0.45, pine, 0.56, 0, 0);
        createCylinder(0.05, 0.05, 0.2, pine, 0.62, 0.08, 0, 0, 0, Math.PI / 2);
        createCylinder(0.05, 0.05, 0.2, lime, 0.52, -0.08, 0, 0, 0, Math.PI / 2);
      } else {
        createBlock(0.1, 0.25, 0.35, lime, 0.46, 0.06, 0.06, 0.3, 0, 0.3);
        createBlock(0.1, 0.25, 0.35, pine, 0.46, -0.06, -0.06, -0.3, 0, -0.3);
        createSphere(0.08, 0xdb2777, 0.52, 0, 0); 
      }
    } else {
      createCylinder(0.15, 0.2, 2.2, wood, 1.1, 0, 0); 
      
      createSphere(0.65, pine, 2.1, 0, 0);
      createSphere(0.5, lime, 2.5, 0.15, 0.1);
      createSphere(0.45, pine, 2.6, -0.15, -0.1);
      createSphere(0.35, lime, 2.9, 0, 0);
    }

  } else if (name.includes('rock') || name.includes('stone') || name.includes('boulder') || name.includes('pebble')) {
    const stone = 0x4b5563; 
    const moss = 0x15803d;

    createBlock(1.0, 0.85, 1.0, stone, 0.42, 0, 0, 0.2, 0.5, -0.1);
    createBlock(0.65, 0.55, 0.75, stone, 0.28, -0.45, -0.15, -0.3, -0.1, 0.45);
    createBlock(0.75, 0.35, 0.65, moss, 0.18, 0.35, 0.25, 0.1, -0.7, 0.1);

  } else if (name.includes('car') || name.includes('vehicle') || name.includes('buggy') || name.includes('wheel')) {
    const metal = obj.color ? themeColor : 0xd97706; 
    const glass = 0x38bdf8; 
    const tire = 0x1e293b; 

    createBlock(0.9, 0.25, 1.6, 0x1e293b, 0.22, 0, 0);
    createBlock(0.85, 0.2, 1.4, metal, 0.42, 0, 0.05);
    createBlock(0.75, 0.3, 0.45, glass, 0.65, 0, -0.15, -0.4, 0, 0);
    createBlock(0.75, 0.25, 0.5, metal, 0.6, 0, -0.5); 
    
    const tRad = 0.22;
    const tW = 0.14;
    createCylinder(tRad, tRad, tW, tire, 0.15, -0.52, 0.45, 0, 0, Math.PI / 2);
    createCylinder(tRad, tRad, tW, tire, 0.15, 0.52, 0.45, 0, 0, Math.PI / 2);
    createCylinder(tRad, tRad, tW, tire, 0.15, -0.52, -0.45, 0, 0, Math.PI / 2);
    createCylinder(tRad, tRad, tW, tire, 0.15, 0.52, -0.45, 0, 0, Math.PI / 2);

  } else if (name.includes('character') || name.includes('dummy') || name.includes('player') || name.includes('npc') || name.includes('mob') || name.includes('zombie')) {
    const skin = name.includes('zombie') ? 0x15803d : 0xfcd34d; 
    const shirt = obj.color ? themeColor : 0x0284c7; 
    const pants = 0x4b5563; 

    createBlock(0.4, 0.4, 0.4, skin, 1.2, 0, 0);
    createBlock(0.65, 0.8, 0.32, shirt, 0.6, 0, 0);
    createBlock(0.24, 0.75, 0.24, shirt, 0.58, -0.45, 0);
    createBlock(0.24, 0.75, 0.24, shirt, 0.58, 0.45, 0);
    createBlock(0.26, 0.6, 0.26, pants, 0.2, -0.18, 0);
    createBlock(0.26, 0.6, 0.26, pants, 0.2, 0.18, 0);

  } else {
    const steel = 0x1f2937; 
    const led = obj.color ? themeColor : 0x06b6d4; 
    
    createBlock(0.9, 0.9, 0.9, steel, 0.45, 0, 0);
    createBlock(0.94, 0.94, 0.1, 0x111827, 0.45, 0, 0);
    createBlock(0.1, 0.94, 0.94, 0x111827, 0.45, 0, 0);
    
    createBlock(0.3, 0.04, 0.05, led, 0.75, 0, 0.46);
    createBlock(0.3, 0.04, 0.05, led, 0.55, 0, 0.46);
    createBlock(0.3, 0.04, 0.05, led, 0.35, 0, 0.46);
    createSphere(0.06, led, 0.15, 0, 0.47); 
  }

  // Adjust overall scale
  if (obj.dimensions) {
    const scaleFactor = 0.35;
    group.scale.set(
      obj.dimensions[0] * scaleFactor,
      obj.dimensions[1] * scaleFactor,
      obj.dimensions[2] * scaleFactor
    );
  }

  return group;
}

function extractGltfUrl(filesData: any): string | null {
  if (!filesData) return null;
  const formats = ['gltf', 'glb', 'gltf_embedded'];
  for (const format of formats) {
    if (filesData[format]) {
      const formatObj = filesData[format];
      for (const res of Object.keys(formatObj)) {
        const resObj = formatObj[res];
        if (resObj.gltf && resObj.gltf.url) {
          return resObj.gltf.url;
        }
        if (resObj.glb && resObj.glb.url) {
          return resObj.glb.url;
        }
        if (resObj.url) {
          return resObj.url;
        }
      }
    }
  }
  return null;
}

export function GameSandbox({
  logs,
  activeCode,
  sandboxObjects,
  onAddObject,
  onRemoveObject,
  onClearObjects,
  onUpdateObjects,
  onAddLog
}: GameSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingAssetIdsRef = useRef<Set<string>>(new Set());

  // Viewport & Physics state
  const [clockTime, setClockTime] = useState<number>(14); // 24-hour cycle
  const [isFlying, setIsFlying] = useState(false);
  const [aimbotActive, setAimbotActive] = useState(false);
  const [showF9Console, setShowF9Console] = useState(true);
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('Workspace');
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);

  // Roblox dynamic states
  const [luauInput, setLuauInput] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Attributes states
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrType, setNewAttrType] = useState<'String' | 'Number' | 'Boolean'>('String');
  const [newAttrVal, setNewAttrVal] = useState('');
  const [isAddingAttr, setIsAddingAttr] = useState(false);

  // Tags states
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Toggle fullscreen function
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (isLocalFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsLocalFullscreen(false);
    } else {
      containerRef.current.requestFullscreen()
        .then(() => {
          setIsLocalFullscreen(true);
        })
        .catch(() => {
          // Fallback if browser fullscreen is blocked in iframe
          setIsLocalFullscreen(true);
        });
    }
  };

  // Sync state if user exits via Esc key in browser fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement && document.fullscreenElement === containerRef.current;
      setIsLocalFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const runLuau = (snippet: string) => {
    if (!snippet.trim()) return;
    
    onAddLog(`> ${snippet}`, 'info');

    try {
      const commands = snippet.split(/[;\n]/);
      
      for (let command of commands) {
        command = command.trim();
        if (!command || command.startsWith('--')) continue;

        // 1. Instance creation: Instance.new("Part")
        const instanceNewMatch = command.match(/Instance\.new\(\s*["'](\w+)["']\s*\)/i);
        if (instanceNewMatch) {
          const className = instanceNewMatch[1];
          if (className.toLowerCase() === 'part') {
            const newObj: SandboxObject = {
              id: 'part-' + Date.now() + Math.random().toString(36).substr(2, 4),
              name: 'Part',
              type: 'Part',
              properties: { name: 'Part', type: 'Part' },
              attributes: {},
              tags: []
            };
            onAddObject(newObj);
            onAddLog(`[Luau] Successfully created part instance.`, 'success');
          } else if (className.toLowerCase() === 'sky') {
            const newSkyObj: SandboxObject = {
              id: 'sky-' + Date.now(),
              name: 'Sky',
              type: 'Sky',
              properties: { name: 'Sky', type: 'Sky' },
              attributes: {},
              tags: []
            };
            onUpdateObjects([newSkyObj, ...sandboxObjects.filter(o => o.type !== 'Sky')]);
            onAddLog(`[Luau] Successfully created Sky instance.`, 'success');
          } else if (className.toLowerCase() === 'script') {
            const newScriptObj: SandboxObject = {
              id: 'script-' + Date.now(),
              name: 'Script',
              type: 'Script',
              properties: { name: 'Script', type: 'Script' },
              attributes: {},
              tags: []
            };
            onAddObject(newScriptObj);
            onAddLog(`[Luau] Successfully created Script instance.`, 'success');
          } else {
            onAddLog(`[Luau Warning] Unsupported instance class: ${className}`, 'warning');
          }
          continue;
        }

        // 2. Loop execution: for i = 1, N do Instance.new("Part") end
        const loopMatch = command.match(/for\s+i\s*=\s*1\s*,\s*(\d+)\s+do\s+(.*?)\s+end/i);
        if (loopMatch) {
          const iterations = parseInt(loopMatch[1]);
          const innerCommand = loopMatch[2].trim();
          onAddLog(`[Luau] Starting loop of ${iterations} iterations`, 'info');
          for (let i = 0; i < iterations; i++) {
            try {
              if (innerCommand.toLowerCase().includes('instance.new("part")')) {
                onAddObject({
                  id: 'part-' + Date.now() + '-' + i + Math.random().toString(36).substr(2, 4),
                  name: `Part_${i+1}`,
                  type: 'Part',
                  properties: { name: `Part_${i+1}`, type: 'Part' },
                  attributes: {},
                  tags: []
                });
              }
            } catch (loopErr) {}
          }
          onAddLog(`[Luau] Successfully executed loop.`, 'success');
          continue;
        }

        // 3. Method execution: SetAttribute
        const setAttrMatch = command.match(/workspace\.([\w-]+):SetAttribute\(\s*["']([^"']+)["']\s*,\s*(.*?)\s*\)/i) || 
                             command.match(/game\.Workspace\.([\w-]+):SetAttribute\(\s*["']([^"']+)["']\s*,\s*(.*?)\s*\)/i);
        if (setAttrMatch) {
          const name = setAttrMatch[1];
          const key = setAttrMatch[2];
          let valRaw = setAttrMatch[3].trim();
          let val: string | number | boolean = valRaw;
          if (valRaw === 'true') val = true;
          else if (valRaw === 'false') val = false;
          else if (!isNaN(Number(valRaw))) val = Number(valRaw);
          else val = valRaw.replace(/['"]/g, '');

          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            const attributes = { ...(found.attributes || {}), [key]: val };
            const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, attributes } : o);
            onUpdateObjects(updated);
            onAddLog(`[Luau] ${found.name}:SetAttribute("${key}", ${val}) executed`, 'success');
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found in Workspace`, 'error');
          }
          continue;
        }

        // 4. Method execution: GetAttribute
        const getAttrMatch = command.match(/workspace\.([\w-]+):GetAttribute\(\s*["']([^"']+)["']\s*\)/i) || 
                             command.match(/game\.Workspace\.([\w-]+):GetAttribute\(\s*["']([^"']+)["']\s*\)/i);
        if (getAttrMatch) {
          const name = getAttrMatch[1];
          const key = getAttrMatch[2];
          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            const val = found.attributes?.[key];
            onAddLog(`[Print] ${found.name}:GetAttribute("${key}") = ${val !== undefined ? val : 'nil'}`, 'info');
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found`, 'error');
          }
          continue;
        }

        // 5. CollectionService:AddTag
        const addTagMatch = command.match(/workspace\.([\w-]+):AddTag\(\s*["']([^"']+)["']\s*\)/i) || 
                            command.match(/game\.Workspace\.([\w-]+):AddTag\(\s*["']([^"']+)["']\s*\)/i) ||
                            command.match(/CollectionService:AddTag\(\s*(?:workspace|game\.Workspace)\.([\w-]+)\s*,\s*["']([^"']+)["']\s*\)/i);
        if (addTagMatch) {
          const name = addTagMatch[1];
          const tag = addTagMatch[2];
          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            const tags = Array.from(new Set([...(found.tags || []), tag]));
            const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, tags } : o);
            onUpdateObjects(updated);
            onAddLog(`[Luau] CollectionService:AddTag(workspace.${found.name}, "${tag}")`, 'success');
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found`, 'error');
          }
          continue;
        }

        // 6. CollectionService:RemoveTag
        const removeTagMatch = command.match(/workspace\.([\w-]+):RemoveTag\(\s*["']([^"']+)["']\s*\)/i) || 
                               command.match(/game\.Workspace\.([\w-]+):RemoveTag\(\s*["']([^"']+)["']\s*\)/i) ||
                               command.match(/CollectionService:RemoveTag\(\s*(?:workspace|game\.Workspace)\.([\w-]+)\s*,\s*["']([^"']+)["']\s*\)/i);
        if (removeTagMatch) {
          const name = removeTagMatch[1];
          const tag = removeTagMatch[2];
          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            const tags = (found.tags || []).filter(t => t !== tag);
            const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, tags } : o);
            onUpdateObjects(updated);
            onAddLog(`[Luau] CollectionService:RemoveTag(workspace.${found.name}, "${tag}")`, 'success');
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found`, 'error');
          }
          continue;
        }

        // 7. Property assignments
        // 7a. Name renames
        const renameMatch = command.match(/workspace\.([\w-]+)\.Name\s*=\s*["']([^"']+)["']/i) || 
                            command.match(/game\.Workspace\.([\w-]+)\.Name\s*=\s*["']([^"']+)["']/i);
        if (renameMatch) {
          const oldName = renameMatch[1];
          const newName = renameMatch[2];
          const found = sandboxObjects.find(o => o.name.toLowerCase() === oldName.toLowerCase());
          if (found) {
            const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, name: newName, properties: { ...o.properties, name: newName } } : o);
            onUpdateObjects(updated);
            onAddLog(`[Luau] Renamed ${oldName} to ${newName}`, 'success');
          } else {
            onAddLog(`[Luau Error] Instance "${oldName}" not found`, 'error');
          }
          continue;
        }

        // 7b. Color3 assignments
        const colorMatch = command.match(/workspace\.([\w-]+)\.Color\s*=\s*(.*)/i) || 
                           command.match(/game\.Workspace\.([\w-]+)\.Color\s*=\s*(.*)/i);
        if (colorMatch) {
          const name = colorMatch[1];
          const colorVal = colorMatch[2].trim();
          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            let hexColor = '#0891B2';
            if (colorVal.includes('fromRGB')) {
              const rgb = colorVal.match(/fromRGB\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
              if (rgb) {
                const r = parseInt(rgb[1]);
                const g = parseInt(rgb[2]);
                const b = parseInt(rgb[3]);
                hexColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
              }
            } else if (colorVal.startsWith('"') || colorVal.startsWith("'")) {
              const cleanName = colorVal.replace(/['"]/g, '').toLowerCase();
              const colors: Record<string, string> = {
                red: '#EF4444', rose: '#F43F5E', blue: '#3B82F6', cyan: '#06B6D4', green: '#10B981', emerald: '#10B981',
                yellow: '#F59E0B', orange: '#F97316', purple: '#8B5CF6', white: '#FFFFFF', black: '#111827', gray: '#6B7280'
              };
              hexColor = colors[cleanName] || hexColor;
            } else if (colorVal.startsWith('#')) {
              hexColor = colorVal;
            }
            const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, color: hexColor, properties: { ...o.properties, color: hexColor } } : o);
            onUpdateObjects(updated);
            onAddLog(`[Luau] Set Color of ${found.name} to ${hexColor}`, 'success');
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found`, 'error');
          }
          continue;
        }

        // 7c. Vector3 Size assignments
        const sizeMatch = command.match(/workspace\.([\w-]+)\.Size\s*=\s*(.*)/i) || 
                           command.match(/game\.Workspace\.([\w-]+)\.Size\s*=\s*(.*)/i);
        if (sizeMatch) {
          const name = sizeMatch[1];
          const sizeVal = sizeMatch[2].trim();
          const found = sandboxObjects.find(o => o.name.toLowerCase() === name.toLowerCase());
          if (found) {
            const v3Match = sizeVal.match(/Vector3\.new\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/);
            if (v3Match) {
              const dims: [number, number, number] = [parseFloat(v3Match[1]), parseFloat(v3Match[2]), parseFloat(v3Match[3])];
              const updated = sandboxObjects.map(o => o.id === found.id ? { ...o, dimensions: dims, properties: { ...o.properties, dimensions: dims.join(' x ') } } : o);
              onUpdateObjects(updated);
              onAddLog(`[Luau] Set Size of ${found.name} to Vector3.new(${dims.join(', ')})`, 'success');
            } else {
              onAddLog(`[Luau Error] Invalid Vector3 params`, 'error');
            }
          } else {
            onAddLog(`[Luau Error] Instance "${name}" not found`, 'error');
          }
          continue;
        }

        // 7d. Lighting ClockTime assignments
        const clockMatch = command.match(/game\.Lighting\.ClockTime\s*=\s*(\d+)/i) || 
                           command.match(/game:GetService\(\s*["']Lighting["']\s*\)\.ClockTime\s*=\s*(\d+)/i);
        if (clockMatch) {
          const time = parseInt(clockMatch[1]);
          setClockTime(time % 24);
          onAddLog(`[Luau] Set game.Lighting.ClockTime = ${time}`, 'success');
          continue;
        }

        // 8. General printing: print("msg")
        const printMatch = command.match(/print\(\s*["']?([^"']*)["']?\s*\)/i);
        if (printMatch) {
          onAddLog(`[Print] ${printMatch[1]}`, 'info');
          continue;
        }

        // 9. Unrecognized commands
        onAddLog(`[Luau Error] Unknown or unsupported command: "${command}"`, 'error');
      }
    } catch (err: any) {
      onAddLog(`[Luau Error] Execution failed: ${err.message}`, 'error');
    }
    setLuauInput('');
  };

  // Player position in virtual 3D coords
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0.5, z: 0 });
  const [playerTargetY, setPlayerTargetY] = useState(0.5);
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [joystickDir, setJoystickDir] = useState<{ x: number; y: number } | null>(null);

  // Target practice dummies (for aimbot)
  const [targets, setTargets] = useState<Array<{ id: string; x: number; y: number; z: number; health: number; maxHealth: number; pulse: number }>>([]);

  const [activeLaser, setActiveLaser] = useState<{ from: { x: number; y: number }; to: { x: number; y: number }; targetId: string } | null>(null);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; x: number; y: number; text: string; age: number }>>([]);

  // Auto-detect flight & aimbot in active script
  useEffect(() => {
    const codeLower = activeCode.toLowerCase();
    if (codeLower.includes('fly') || codeLower.includes('flight') || codeLower.includes('float')) {
      setIsFlying(true);
      setPlayerTargetY(6);
    } else {
      setIsFlying(false);
      setPlayerTargetY(0.5);
    }

    if (codeLower.includes('aim') || codeLower.includes('silent') || codeLower.includes('lock')) {
      setAimbotActive(true);
    } else {
      setAimbotActive(false);
    }
  }, [activeCode]);

  // Handle keys for player WASD movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        setKeysPressed(prev => ({ ...prev, [k]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        setKeysPressed(prev => ({ ...prev, [k]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Refs for high-performance Three.js rendering
  const clockTimeRef = useRef(clockTime);
  const isFlyingRef = useRef(isFlying);
  const aimbotActiveRef = useRef(aimbotActive);
  const sandboxObjectsRef = useRef(sandboxObjects);
  const keysPressedRef = useRef(keysPressed);
  const targetsRef = useRef(targets);
  const joystickDirRef = useRef(joystickDir);
  const playerPosRef = useRef({ x: 0, y: 0.5, z: 0 });
  const playerTargetYRef = useRef(playerTargetY);

  useEffect(() => { clockTimeRef.current = clockTime; }, [clockTime]);
  useEffect(() => { isFlyingRef.current = isFlying; }, [isFlying]);
  useEffect(() => { aimbotActiveRef.current = aimbotActive; }, [aimbotActive]);
  useEffect(() => { sandboxObjectsRef.current = sandboxObjects; }, [sandboxObjects]);
  useEffect(() => { keysPressedRef.current = keysPressed; }, [keysPressed]);
  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { joystickDirRef.current = joystickDir; }, [joystickDir]);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { playerTargetYRef.current = playerTargetY; }, [playerTargetY]);

  // Three.js 3D Virtual Workspace simulation loop
  useEffect(() => {
    let animId: number;
    let frameCount = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 18);
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls for modern, responsive, cross-platform camera control (mobile, tablet, desktop)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // Avoid camera clipping below baseplate
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.target.set(0, 0.5, 0);
    controls.update();

    // Resize Handler
    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const dSize = 30;
    dirLight.shadow.camera.left = -dSize;
    dirLight.shadow.camera.right = dSize;
    dirLight.shadow.camera.top = dSize;
    dirLight.shadow.camera.bottom = -dSize;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Setup Baseplate (Classic Roblox Studio Gray Baseplate)
    const baseplateGeo = new THREE.BoxGeometry(80, 0.5, 80);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa, // elegant neutral gray
      roughness: 0.9,
      metalness: 0.1
    });
    const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
    baseplate.position.y = -0.25;
    baseplate.receiveShadow = true;
    scene.add(baseplate);

    // Add Grid overlay (Roblox style studs grid)
    const gridHelper = new THREE.GridHelper(80, 80, 0x71717a, 0xd4d4d8);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Starfield Particle system for Night sky
    const starsCount = 150;
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta2 = u * 2.0 * Math.PI;
      const phi2 = Math.acos(2.0 * v - 1.0);
      const r = 120;
      starsPos[i * 3] = r * Math.sin(phi2) * Math.cos(theta2);
      starsPos[i * 3 + 1] = Math.abs(r * Math.sin(phi2) * Math.sin(theta2));
      starsPos[i * 3 + 2] = r * Math.cos(phi2);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0 });
    const starfield = new THREE.Points(starsGeo, starsMat);
    scene.add(starfield);

    // Aimbot Laser cylinder
    const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
    laserGeo.translate(0, 0.5, 0); // pivot bottom
    laserGeo.rotateX(Math.PI / 2); // along Z
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.9 });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.visible = false;
    scene.add(laserMesh);

    // Player Group Setup (Roblox classic blocky character)
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // Yellow head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFCD34D, roughness: 0.5 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.35;
    headMesh.castShadow = true;
    playerGroup.add(headMesh);

    // Custom Emerald green hoodie cap
    const hoodGeo = new THREE.BoxGeometry(0.54, 0.35, 0.54);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x065F46, roughness: 0.5 });
    const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
    hoodMesh.position.set(0, 1.45, -0.05);
    hoodMesh.castShadow = true;
    playerGroup.add(hoodMesh);

    // Emerald Green hoodie torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.0, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x065F46, roughness: 0.6 });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 0.6;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    playerGroup.add(torsoMesh);

    // Limbs Setup
    const legGeo = new THREE.BoxGeometry(0.35, 0.7, 0.35);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.7 });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    const armGeo = new THREE.BoxGeometry(0.32, 0.9, 0.32);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x065F46, roughness: 0.6 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Maps for spawned assets & target practice dummies
    const partMeshes = new Map<string, THREE.Object3D>();
    const targetMeshes = new Map<string, THREE.Group>();

    // Helper to create a 3D target practice dummy
    const createTargetDummy = (t: typeof targets[0]) => {
      const group = new THREE.Group();

      const standGeo = new THREE.CylinderGeometry(0.05, 0.05, t.y, 8);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.6 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = t.y / 2;
      stand.castShadow = true;
      group.add(stand);

      const plateGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16);
      plateGeo.rotateX(Math.PI / 2);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = t.y;
      plate.castShadow = true;
      group.add(plate);

      const bullseyeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
      bullseyeGeo.rotateX(Math.PI / 2);
      const bullseyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const bullseye = new THREE.Mesh(bullseyeGeo, bullseyeMat);
      bullseye.position.set(0, t.y, 0.015);
      bullseye.castShadow = true;
      group.add(bullseye);

      group.position.set(t.x, 0, t.z);
      scene.add(group);
      targetMeshes.set(t.id, group);
    };

    // Flying particles structures
    interface FlyParticle {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      age: number;
      maxAge: number;
    }
    const particles: FlyParticle[] = [];

    // Screen projector helper
    const tempProjV = new THREE.Vector3();
    const projectToScreen = (pos3d: THREE.Vector3, out: { x: number; y: number }) => {
      tempProjV.copy(pos3d).project(camera);
      if (tempProjV.z > 1) return false;
      out.x = (tempProjV.x * 0.5 + 0.5) * canvas.clientWidth;
      out.y = (-(tempProjV.y * 0.5) + 0.5) * canvas.clientHeight;
      return true;
    };

    // Floating HTML damage numbers animations
    interface DamageItem {
      element: HTMLDivElement;
      pos: THREE.Vector3;
      age: number;
      maxAge: number;
      offsetY: number;
    }
    const activeDamages: DamageItem[] = [];

    // Main animation loop tick
    const tick = () => {
      frameCount++;

      // 1. Physics & Player movement logic
      let dx = 0;
      let dz = 0;
      const speed = isFlyingRef.current ? 0.15 : 0.08;

      if (keysPressedRef.current['w'] || keysPressedRef.current['arrowup']) dz -= speed;
      if (keysPressedRef.current['s'] || keysPressedRef.current['arrowdown']) dz += speed;
      if (keysPressedRef.current['a'] || keysPressedRef.current['arrowleft']) dx -= speed;
      if (keysPressedRef.current['d'] || keysPressedRef.current['arrowright']) dx += speed;

      if (joystickDirRef.current) {
        dx += joystickDirRef.current.x * speed;
        dz += joystickDirRef.current.y * speed;
      }

      const prevX = playerPosRef.current.x;
      const prevY = playerPosRef.current.y;
      const prevZ = playerPosRef.current.z;

      const nextX = Math.max(-14, Math.min(14, prevX + dx));
      const nextZ = Math.max(-14, Math.min(14, prevZ + dz));

      let nextY = prevY;
      if (isFlyingRef.current) {
        const hoverOffset = Math.sin(frameCount * 0.05) * 0.15;
        nextY = prevY + (playerTargetYRef.current + hoverOffset - prevY) * 0.1;
      } else {
        nextY = prevY + (playerTargetYRef.current - prevY) * 0.1;
      }

      const newPos = { x: nextX, y: nextY, z: nextZ };
      playerPosRef.current = newPos;
      setPlayerPos(newPos);

      // Rotate player group to face movement direction
      playerGroup.position.set(newPos.x, newPos.y, newPos.z);
      if (dx !== 0 || dz !== 0) {
        const targetAngle = Math.atan2(dx, dz);
        // Smooth interpolation
        let diff = targetAngle - playerGroup.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        playerGroup.rotation.y += diff * 0.2;
      }

      // 2. Character walk limbs animation
      const moving = dx !== 0 || dz !== 0;
      if (moving) {
        const swing = Math.sin(frameCount * 0.15) * 0.55;
        leftLeg.position.set(-0.22, 0.15, swing * 0.25);
        leftLeg.rotation.x = swing;

        rightLeg.position.set(0.22, 0.15, -swing * 0.25);
        rightLeg.rotation.x = -swing;

        leftArm.position.set(-0.58, 0.65, -swing * 0.2);
        leftArm.rotation.x = -swing * 0.8;

        rightArm.position.set(0.58, 0.65, swing * 0.2);
        rightArm.rotation.x = swing * 0.8;
        
        torsoMesh.rotation.x = 0.08;
      } else {
        leftLeg.position.set(-0.22, 0.15, 0);
        leftLeg.rotation.set(0, 0, 0);
        rightLeg.position.set(0.22, 0.15, 0);
        rightLeg.rotation.set(0, 0, 0);
        leftArm.position.set(-0.58, 0.65, 0);
        leftArm.rotation.set(0, 0, 0);
        rightArm.position.set(0.58, 0.65, 0);
        rightArm.rotation.set(0, 0, 0);
        torsoMesh.rotation.x = 0;
      }

      // Flying particle emitters
      if (isFlyingRef.current && frameCount % 3 === 0) {
        const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.8 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(
          newPos.x + (Math.random() * 0.4 - 0.2),
          newPos.y - 0.1,
          newPos.z + (Math.random() * 0.4 - 0.2)
        );
        scene.add(pMesh);
        particles.push({
          mesh: pMesh,
          velocity: new THREE.Vector3((Math.random() - 0.5) * 0.015, -(Math.random() * 0.02 + 0.015), (Math.random() - 0.5) * 0.015),
          age: 0,
          maxAge: 25 + Math.random() * 15
        });
      }

      // Update flight particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.velocity);
        p.age++;
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1.0 - p.age / p.maxAge;
        p.mesh.scale.multiplyScalar(0.96);
        if (p.age >= p.maxAge) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          particles.splice(i, 1);
        }
      }

      // 3. Targets Practice sway & healing physics
      setTargets(prev => {
        const next = prev.map(t => {
          const nextPulse = t.pulse + 0.02;
          const offsetZ = Math.sin(nextPulse) * 0.03;
          const offsetX = Math.cos(nextPulse * 1.5) * 0.03;
          
          let nextH = t.health;
          if (t.health < t.maxHealth && frameCount % 30 === 0) {
            nextH = Math.min(t.maxHealth, t.health + 3);
          }

          return {
            ...t,
            pulse: nextPulse,
            x: t.x + offsetX,
            z: t.z + offsetZ,
            health: nextH
          };
        });
        return next;
      });

      // Update 3D targets in Three.js scene
      targetsRef.current.forEach(t => {
        let dummy = targetMeshes.get(t.id);
        if (!dummy) {
          createTargetDummy(t);
          dummy = targetMeshes.get(t.id);
        }
        if (dummy) {
          if (t.health <= 0) {
            dummy.visible = false;
          } else {
            dummy.visible = true;
            dummy.position.set(t.x, 0, t.z);
            dummy.rotation.z = Math.sin(t.pulse) * 0.1;
          }
        }
      });

      // 4. Aimbot automated target acquisition and shooting
      if (aimbotActiveRef.current && frameCount % 20 === 0 && targetsRef.current.length > 0) {
        const livingTargets = targetsRef.current.filter(t => t.health > 0);
        if (livingTargets.length > 0) {
          const nearest = livingTargets[0];
          
          const dmg = Math.floor(Math.random() * 15) + 12;
          setTargets(curr => curr.map(t => {
            if (t.id === nearest.id) {
              return { ...t, health: Math.max(0, t.health - dmg) };
            }
            return t;
          }));

          // Render Glowing laser beam cylinder
          const startVec = new THREE.Vector3(newPos.x, newPos.y + 0.6, newPos.z);
          const endVec = new THREE.Vector3(nearest.x, nearest.y + 0.2, nearest.z);
          const distance = startVec.distanceTo(endVec);

          laserMesh.scale.set(1, 1, distance);
          laserMesh.position.copy(startVec);
          laserMesh.lookAt(endVec);
          laserMesh.visible = true;

          setTimeout(() => {
            laserMesh.visible = false;
          }, 100);

          // Spawn DOM damage overlay
          const dmgDiv = document.createElement('div');
          dmgDiv.className = "absolute text-rose-500 font-mono text-[11px] font-black pointer-events-none transform -translate-x-1/2 select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 animate-pulse";
          dmgDiv.textContent = `-${dmg}`;

          const damageItem: DamageItem = {
            element: dmgDiv,
            pos: new THREE.Vector3(nearest.x, nearest.y + 0.3, nearest.z),
            age: 0,
            maxAge: 35,
            offsetY: 0
          };

          const dmgContainer = document.getElementById('sb-damage-container');
          if (dmgContainer) {
            dmgContainer.appendChild(dmgDiv);
            activeDamages.push(damageItem);
          }
        }
      }

      // Update Floating damage DOM overlays
      for (let i = activeDamages.length - 1; i >= 0; i--) {
        const d = activeDamages[i];
        d.age++;
        d.offsetY -= 0.6;

        const p3d = d.pos.clone();
        p3d.y += d.offsetY * 0.02;

        const screenPos = { x: 0, y: 0 };
        if (projectToScreen(p3d, screenPos)) {
          d.element.style.display = 'block';
          d.element.style.left = `${screenPos.x}px`;
          d.element.style.top = `${screenPos.y}px`;
          d.element.style.opacity = `${1.0 - d.age / d.maxAge}`;
        } else {
          d.element.style.display = 'none';
        }

        if (d.age >= d.maxAge) {
          if (d.element.parentNode) {
            d.element.parentNode.removeChild(d.element);
          }
          activeDamages.splice(i, 1);
        }
      }

      // 5. Spawned Sandbox objects syncing
      const activePartIds = new Set(sandboxObjectsRef.current.map(o => o.id));
      partMeshes.forEach((mesh, id) => {
        if (!activePartIds.has(id)) {
          scene.remove(mesh);
          mesh.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          partMeshes.delete(id);
        }
      });

      const parts = sandboxObjectsRef.current.filter(o => o.type === 'Part' || o.type === 'MeshPart');
      parts.forEach((obj, idx) => {
        let mesh = partMeshes.get(obj.id);

        const oX = ((idx % 3) - 1) * 7;
        const oZ = -(Math.floor(idx / 3) + 1) * 8;
        const height = obj.dimensions ? obj.dimensions[1] * 0.4 : 1.2;
        const baseOffset = height / 2;

        if (!mesh) {
          if (obj.type === 'MeshPart') {
            if (!loadingAssetIdsRef.current.has(obj.id)) {
              loadingAssetIdsRef.current.add(obj.id);

              const width = obj.dimensions ? obj.dimensions[0] * 0.4 : 1.2;
              const depth = obj.dimensions ? obj.dimensions[2] * 0.4 : 1.2;
              const pGeo = new THREE.BoxGeometry(width, height, depth);
              const pMat = new THREE.MeshStandardMaterial({
                color: 0x06b6d4,
                transparent: true,
                opacity: 0.35,
                wireframe: true
              });
              const placeholderMesh = new THREE.Mesh(pGeo, pMat);
              placeholderMesh.position.set(oX, baseOffset, oZ);
              scene.add(placeholderMesh);
              partMeshes.set(obj.id, placeholderMesh);

              fetch(`/api/polyhaven-files?id=${obj.id.replace('polyhaven_', '')}`)
                .then(res => {
                  if (!res.ok) throw new Error("CORS or Proxy resolve failure");
                  return res.json();
                })
                .then(filesData => {
                  const gltfUrl = extractGltfUrl(filesData);
                  if (!gltfUrl) throw new Error("No GLTF download link in Poly Haven files list");

                  const gltfLoader = new GLTFLoader();
                  gltfLoader.load(gltfUrl, (gltf) => {
                    scene.remove(placeholderMesh);
                    pGeo.dispose();
                    pMat.dispose();

                    const model = gltf.scene;

                    const box = new THREE.Box3().setFromObject(model);
                    const size = new THREE.Vector3();
                    box.getSize(size);

                    const targetMax = Math.max(width, height, depth);
                    const modelMax = Math.max(size.x, size.y, size.z);
                    if (modelMax > 0) {
                      const scale = targetMax / modelMax;
                      model.scale.set(scale, scale, scale);
                    }

                    const newBox = new THREE.Box3().setFromObject(model);
                    model.position.set(oX, -newBox.min.y, oZ);

                    model.traverse(child => {
                      if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                          // Try to support child materials correctly
                          if (Array.isArray(child.material)) {
                            child.material.forEach(m => {
                              if ('roughness' in m) (m as any).roughness = 0.7;
                            });
                          } else {
                            if ('roughness' in child.material) (child.material as any).roughness = 0.7;
                          }
                        }
                      }
                    });

                    scene.add(model);
                    partMeshes.set(obj.id, model);
                    onAddLog(`[Poly Haven API] Real 3D GLTF loaded: ${obj.name}`, 'success');
                  }, undefined, (gltfErr) => {
                    console.error("GLTF load error:", gltfErr);
                    onAddLog(`[Loader Warning] Could not load GLTF. Falling back to procedural geometry for ${obj.name}.`, 'warning');
                    fallbackToProcedural();
                  });
                })
                .catch(err => {
                  console.error("Files API resolve error:", err);
                  fallbackToProcedural();
                });

              const fallbackToProcedural = () => {
                scene.remove(placeholderMesh);
                pGeo.dispose();
                pMat.dispose();

                const fallbackMesh = createProceduralModel(obj);
                fallbackMesh.position.set(oX, baseOffset, oZ);
                scene.add(fallbackMesh);
                partMeshes.set(obj.id, fallbackMesh);
              };
            }
          } else {
            const width = obj.dimensions ? obj.dimensions[0] * 0.4 : 1.2;
            const depth = obj.dimensions ? obj.dimensions[2] * 0.4 : 1.2;

            let geo: THREE.BufferGeometry;
            if (obj.name.toLowerCase().includes('sphere') || obj.name.toLowerCase().includes('ball')) {
              geo = new THREE.SphereGeometry(width / 2, 16, 16);
            } else if (obj.name.toLowerCase().includes('wedge') || obj.name.toLowerCase().includes('roof')) {
              geo = new THREE.CylinderGeometry(width / 2, width / 2, height, 4);
              geo.rotateY(Math.PI / 4);
            } else {
              geo = new THREE.BoxGeometry(width, height, depth);
            }

            let mat: THREE.Material;
            if (obj.thumbnailUrl) {
              const texLoader = new THREE.TextureLoader();
              texLoader.setCrossOrigin('anonymous');
              const texture = texLoader.load(obj.thumbnailUrl);
              texture.colorSpace = THREE.SRGBColorSpace;
              mat = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.4,
                metalness: 0.2
              });
            } else {
              mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(obj.color || '#0891B2'),
                roughness: 0.5,
                metalness: 0.1
              });
            }

            mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(oX, baseOffset, oZ);
            scene.add(mesh);
            partMeshes.set(obj.id, mesh);
          }
        } else {
          // Static, stable placement - no bobbing or rotation animation
          if (obj.type !== 'MeshPart') {
            mesh.position.set(oX, baseOffset, oZ);
            mesh.rotation.set(0, 0, 0);
          }
        }
      });

      // 6. Day/Night sky & ambient lighting cycle
      const currentClockTime = clockTimeRef.current;
      const isNight = currentClockTime < 6 || currentClockTime > 18;

      let skyColor = new THREE.Color(0x0C4A6E);
      if (isNight) {
        skyColor = new THREE.Color(0x020205);
      } else {
        if (currentClockTime >= 6 && currentClockTime < 8) {
          const t = (currentClockTime - 6) / 2;
          skyColor.set(0xFC9F4D).lerp(new THREE.Color(0x0284C7), t);
        } else if (currentClockTime >= 16 && currentClockTime <= 18) {
          const t = (currentClockTime - 16) / 2;
          skyColor.set(0x0284C7).lerp(new THREE.Color(0xFD5E53), t);
        } else {
          skyColor.set(0x0284C7);
        }
      }

      // Overrides if Sky template exists
      const activeSky = sandboxObjectsRef.current.find(o => o.type === 'Sky');
      if (activeSky && activeSky.thumbnailUrl) {
        skyColor.set(0x1B1530);
      }
      scene.background = skyColor;

      // Lighting updates
      if (isNight) {
        ambientLight.color.setHex(0x1e1b4b);
        ambientLight.intensity = 0.35;
        dirLight.color.setHex(0x38bdf8);
        dirLight.intensity = 0.25;
        dirLight.position.set(-15, 12, -10);
        starsMat.opacity = Math.min(0.85, starsMat.opacity + 0.03);
      } else {
        ambientLight.color.setHex(0xffffff);
        ambientLight.intensity = 0.5;
        dirLight.color.setHex(0xfef08a);
        dirLight.intensity = 1.0;
        const sunAngle = ((currentClockTime - 6) / 12) * Math.PI;
        dirLight.position.set(Math.cos(sunAngle) * 20, Math.sin(sunAngle) * 20, 5);
        starsMat.opacity = Math.max(0, starsMat.opacity - 0.03);
      }

      // Baseplate Material textures
      const activeMaterial = sandboxObjectsRef.current.find(o => o.type === 'MaterialVariant');
      if (activeMaterial && activeMaterial.thumbnailUrl) {
        if (!baseplateMat.map) {
          const texLoader = new THREE.TextureLoader();
          texLoader.setCrossOrigin('anonymous');
          const texture = texLoader.load(activeMaterial.thumbnailUrl);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(8, 8);
          baseplateMat.map = texture;
          baseplateMat.color.setHex(0x555555);
          baseplateMat.needsUpdate = true;
        }
      } else {
        if (baseplateMat.map) {
          baseplateMat.map = null;
          baseplateMat.needsUpdate = true;
        }
        baseplateMat.color.setHex(isNight ? 0x0B132B : 0x111827);
      }

      // 7. Interactive camera orbital tracking (OrbitControls update)
      controls.update();

      // 8. Projection overlays positioning
      // Player Tag
      const playerTagEl = document.getElementById('sb-player-tag');
      const playerTagTextEl = document.getElementById('sb-player-tag-text');
      if (playerTagEl) {
        const tagPos = new THREE.Vector3(newPos.x, newPos.y + 1.8, newPos.z);
        const screenPos = { x: 0, y: 0 };
        if (projectToScreen(tagPos, screenPos)) {
          playerTagEl.style.display = 'flex';
          playerTagEl.style.left = `${screenPos.x}px`;
          playerTagEl.style.top = `${screenPos.y}px`;
          if (playerTagTextEl) {
            playerTagTextEl.textContent = `Fsociety_Player [${isFlyingRef.current ? 'FLY' : 'OK'}]`;
          }
        } else {
          playerTagEl.style.display = 'none';
        }
      }

      // Targets
      targetsRef.current.forEach((t, index) => {
        const idNum = index + 1;
        const lockEl = document.getElementById(`sb-target-lock-${idNum}`);
        const hbEl = document.getElementById(`sb-target-hb-${idNum}`);
        const hbFillEl = document.getElementById(`sb-target-hb-fill-${idNum}`);

        if (t.health <= 0) {
          if (lockEl) lockEl.style.display = 'none';
          if (hbEl) hbEl.style.display = 'none';
          return;
        }

        const tPos = new THREE.Vector3(t.x, t.y, t.z);
        const screenPos = { x: 0, y: 0 };
        const onScreen = projectToScreen(tPos, screenPos);

        if (onScreen) {
          if (aimbotActiveRef.current) {
            if (lockEl) {
              lockEl.style.display = 'flex';
              lockEl.style.left = `${screenPos.x}px`;
              lockEl.style.top = `${screenPos.y - 15}px`;
            }
          } else {
            if (lockEl) lockEl.style.display = 'none';
          }

          if (hbEl) {
            hbEl.style.display = 'block';
            hbEl.style.left = `${screenPos.x}px`;
            hbEl.style.top = `${screenPos.y - 40}px`;
          }
          if (hbFillEl) {
            hbFillEl.style.width = `${(t.health / t.maxHealth) * 100}%`;
          }
        } else {
          if (lockEl) lockEl.style.display = 'none';
          if (hbEl) hbEl.style.display = 'none';
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      controls.dispose();

      const dmgContainer = document.getElementById('sb-damage-container');
      if (dmgContainer) dmgContainer.innerHTML = '';

      partMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });

      targetMeshes.forEach(group => {
        scene.remove(group);
        group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });

      particles.forEach(p => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });

      scene.remove(playerGroup);
      headGeo.dispose();
      headMat.dispose();
      hoodGeo.dispose();
      hoodMat.dispose();
      torsoGeo.dispose();
      torsoMat.dispose();
      legGeo.dispose();
      legMat.dispose();
      armGeo.dispose();
      armMat.dispose();

      scene.remove(baseplate);
      baseplateGeo.dispose();
      baseplateMat.dispose();

      scene.remove(gridHelper);
      gridHelper.dispose();

      scene.remove(starfield);
      starsGeo.dispose();
      starsMat.dispose();

      scene.remove(laserMesh);
      laserGeo.dispose();
      laserMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className={cn(
        "bg-[#08080C] flex flex-col min-w-0 transition-all duration-300",
        isLocalFullscreen 
          ? "fixed inset-0 w-screen h-screen z-[9999] border-none" 
          : "h-full w-full border-l border-white/10"
      )} 
      ref={containerRef}
    >
      {/* Sandbox Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/10 shrink-0 font-mono text-[10px] select-none text-gray-400">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Gamepad2 size={13} className="animate-pulse" />
          <span className="font-bold tracking-wider">ROBLOX STUDIO VIRTUAL SANDBOX</span>
        </div>
        <div className="flex items-center space-x-3 text-[9px]">
          <span className="flex items-center text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
            ACTIVE: 60 FPS
          </span>
          <span className="hidden md:inline text-gray-500">PING: 14ms</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer font-bold text-[8px]"
            title={isLocalFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isLocalFullscreen ? (
              <>
                <Minimize2 size={10} />
                <span>MINIMIZE</span>
              </>
            ) : (
              <>
                <Maximize2 size={10} />
                <span>FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Viewer workspace */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden min-h-0">
        {/* Canvas Engine Viewer */}
        <div className="flex-1 relative min-h-0 bg-black select-none overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

          {/* Screen Projected Overlay elements */}
          {/* Player Tag */}
          <div 
            id="sb-player-tag" 
            className="absolute hidden -translate-x-1/2 -translate-y-full pointer-events-none select-none flex-col items-center z-10"
          >
            <div className="bg-emerald-500/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.3)] flex items-center space-x-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              <span id="sb-player-tag-text">Fsociety_Player [OK]</span>
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-500/90 rotate-45 -mt-0.5" />
          </div>

          {/* Target Indicators (Lock & Health bar pairs) */}
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              {/* Target Lock Ring */}
              <div 
                id={`sb-target-lock-${num}`} 
                className="absolute hidden -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex-col items-center justify-center z-10"
              >
                <div className="w-6 h-6 border-2 border-dashed border-rose-500 rounded-full animate-spin flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                </div>
                <span className="text-[7px] text-rose-500 font-mono font-bold mt-1 bg-black/60 px-0.5 rounded leading-none">AIM_LOCK</span>
              </div>

              {/* Target Health Bar */}
              <div 
                id={`sb-target-hb-${num}`} 
                className="absolute hidden -translate-x-1/2 -translate-y-full pointer-events-none select-none w-14 bg-black/80 border border-white/10 p-0.5 rounded z-10"
              >
                <div className="h-1 bg-zinc-800 rounded overflow-hidden">
                  <div id={`sb-target-hb-fill-${num}`} className="h-full bg-rose-500 transition-all duration-75" style={{ width: '100%' }} />
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Floating Screen-Projected damage numbers container */}
          <div id="sb-damage-container" className="absolute inset-0 pointer-events-none overflow-hidden z-20" />

          {/* Floating Workspace overlay controller */}
          <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md border border-white/10 p-2 rounded font-mono text-[10px] space-y-1.5 z-20 text-gray-400 select-none max-w-[150px]">
            <div className="text-white font-bold text-[9px] border-b border-white/5 pb-1">LIGHTING PRESET</div>
            <div className="flex items-center justify-between">
              <span>TIME: {clockTime}:00</span>
              <div className="flex space-x-1 ml-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setClockTime(14)}
                  className={cn("p-0.5 rounded cursor-pointer", clockTime === 14 ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-white/5")}
                  title="Daytime"
                >
                  <Sun size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => setClockTime(23)}
                  className={cn("p-0.5 rounded cursor-pointer", clockTime === 23 ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-white/5")}
                  title="Nighttime"
                >
                  <Moon size={10} />
                </button>
              </div>
            </div>
            
            <div className="text-white font-bold text-[9px] border-b border-white/5 pt-1 pb-1">COMPILER OVERRIDES</div>
            <div className="flex flex-col space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span>FLIGHT:</span>
                <span className={isFlying ? "text-purple-400 font-semibold" : "text-gray-500"}>{isFlying ? "ACTIVE" : "OFF"}</span>
              </div>
              <div className="flex justify-between">
                <span>AIMBOT:</span>
                <span className={aimbotActive ? "text-emerald-400 font-semibold" : "text-gray-500"}>{aimbotActive ? "ACTIVE" : "OFF"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard Walk Guide Overlay / Joystick */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur border border-white/5 px-2 py-1.5 rounded font-mono text-[8px] text-gray-500 select-none z-10 text-right">
            <div>CLICK VIEWPORT TO CONTROL</div>
            <div className="text-cyan-400 font-bold mt-0.5">[WASD] / [ARROWS] WALK</div>
          </div>

          {/* Consolidated Roblox Studio Dev Dock at bottom of Viewport */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 h-7 bg-zinc-950/90 border border-white/10 rounded-md flex items-center px-2 py-1 space-x-2 z-20 font-mono text-[9px]">
            <button
              type="button"
              onClick={() => setShowF9Console(!showF9Console)}
              className={cn(
                "px-2 py-0.5 rounded border text-[8px] font-bold cursor-pointer shrink-0 transition-colors",
                showF9Console ? "bg-cyan-900/40 text-cyan-400 border-cyan-500/30" : "bg-black/60 text-gray-400 border-white/10 hover:text-white"
              )}
            >
              F9 Console
            </button>
            <div className="h-3 w-[1px] bg-white/10 shrink-0"></div>
            <span className="text-cyan-400 font-bold shrink-0">LUAU &gt;</span>
            <input
              type="text"
              value={luauInput}
              onChange={(e) => setLuauInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runLuau(luauInput);
                }
              }}
              placeholder="Instance.new('Part') or workspace.Part.Color = Color3.fromRGB(255,0,0) or game.Lighting.ClockTime = 18..."
              className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-gray-600 text-[8px]"
            />
            <button
              type="button"
              onClick={() => runLuau(luauInput)}
              className="bg-cyan-600/80 hover:bg-cyan-500 border border-cyan-500/30 text-white font-bold text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              RUN
            </button>
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] cursor-pointer transition-all",
                showCheatSheet ? "bg-cyan-500 text-black" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
              title="View Supported Roblox Luau Syntax Cheat Sheet"
            >
              ?
            </button>
          </div>

          {/* Floating F9 Console positioned directly above Dev Dock */}
          {showF9Console && (
            <div className="absolute bottom-[40px] left-2.5 w-80 h-36 bg-black/95 border border-white/10 rounded-md overflow-hidden flex flex-col font-mono text-[9px] z-20 text-gray-400 shadow-xl">
              <div className="bg-zinc-900 px-2.5 py-1 border-b border-white/5 flex items-center justify-between text-gray-300 font-bold shrink-0">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse"></span>
                  Roblox Developer Console (F9)
                </span>
                <button
                  type="button"
                  onClick={() => setShowF9Console(false)}
                  className="text-gray-500 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  X
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar bg-black/40">
                {logs.slice(-6).map((log, i) => (
                  <div key={log.id || i} className={cn(
                    "flex items-start",
                    log.type === 'error' && "text-red-400",
                    log.type === 'success' && "text-emerald-400",
                    log.type === 'warning' && "text-yellow-400",
                    log.type === 'info' && "text-gray-300"
                  )}>
                    <span className="text-gray-600 mr-1.5 shrink-0">[{log.timestamp}]</span>
                    <span className="break-all">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-600 italic">Console initialized. Executing scripts prints here.</div>
                )}
              </div>
            </div>
          )}

          {/* Cheat Sheet Popover */}
          {showCheatSheet && (
            <div className="absolute bottom-[40px] right-2.5 w-72 max-h-52 bg-zinc-950/95 border border-cyan-500/30 rounded p-2.5 z-30 font-mono text-[8px] text-gray-400 overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="flex items-center justify-between font-bold text-cyan-400 border-b border-white/5 pb-1 mb-1.5 uppercase text-[9px]">
                <span className="flex items-center"><Info size={10} className="mr-1 text-cyan-400" /> Luau Scripting Cheat Sheet</span>
                <button type="button" onClick={() => setShowCheatSheet(false)} className="text-gray-500 hover:text-white bg-transparent border-none cursor-pointer">X</button>
              </div>
              <div className="space-y-1 text-[8px] leading-relaxed">
                <div><span className="text-emerald-400 font-bold">Instance.new("Part")</span> <span className="text-gray-600">-</span> Spawns box in Workspace</div>
                <div><span className="text-emerald-400 font-bold">Instance.new("Sky")</span> <span className="text-gray-600">-</span> Spawns a procedural Skybox</div>
                <div><span className="text-emerald-400 font-bold">Instance.new("Script")</span> <span className="text-gray-600">-</span> Spawns a lua script instance</div>
                <div><span className="text-emerald-400 font-bold">workspace.Part.Name = "Chair"</span> <span className="text-gray-600">-</span> Renames Part</div>
                <div><span className="text-emerald-400 font-bold">workspace.Part.Color = Color3.fromRGB(244,63,94)</span> <span className="text-gray-600">-</span> Color</div>
                <div><span className="text-emerald-400 font-bold">workspace.Part.Size = Vector3.new(5,5,5)</span> <span className="text-gray-600">-</span> Sets Size</div>
                <div><span className="text-emerald-400 font-bold">workspace.Part:SetAttribute("Health", 100)</span> <span className="text-gray-600">-</span> Attribute</div>
                <div><span className="text-emerald-400 font-bold">workspace.Part:GetAttribute("Health")</span> <span className="text-gray-600">-</span> Prints Attribute</div>
                <div><span className="text-emerald-400 font-bold">CollectionService:AddTag(workspace.Part, "Enemy")</span> <span className="text-gray-600">-</span> Tag</div>
                <div><span className="text-emerald-400 font-bold">for i = 1, 5 do Instance.new("Part") end</span> <span className="text-gray-600">-</span> Spawns 5 parts</div>
                <div><span className="text-emerald-400 font-bold">game.Lighting.ClockTime = 18</span> <span className="text-gray-600">-</span> Updates Clock/hour</div>
              </div>
            </div>
          )}
        </div>

        {/* Roblox Hierarchy Explorer sidebar (Right Side inside Sandbox) */}
        <div className="w-full lg:w-48 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col font-mono text-[10px] text-gray-400 shrink-0 select-none">
          <div className="px-2.5 py-1.5 bg-black/60 border-b border-white/10 text-[9px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>Explorer Tree</span>
            {sandboxObjects.length > 0 && (
              <button
                type="button"
                onClick={onClearObjects}
                className="text-gray-500 hover:text-red-400 cursor-pointer"
                title="Clear Workspace Objects"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
            {/* Core Game tree folder structures */}
            <div className="space-y-0.5">
              {/* Workspace tree */}
              <div 
                onClick={() => setSelectedHierarchy('Workspace')}
                className={cn("flex items-center px-1.5 py-0.5 rounded cursor-pointer", selectedHierarchy === 'Workspace' ? "bg-white/5 text-white" : "hover:bg-white/5")}
              >
                <ChevronRight size={10} className="mr-0.5 text-gray-600 rotate-90" />
                <Layers size={10} className="mr-1.5 text-cyan-500" />
                <span className="font-semibold">Workspace</span>
              </div>
              {/* Workspace children */}
              <div className="pl-4 space-y-0.5">
                <div className="flex items-center text-[9px] text-gray-500">
                  <CornerDownRight size={8} className="mr-1" />
                  <Box size={9} className="mr-1" />
                  <span>Terrain</span>
                </div>
                <div className="flex items-center text-[9px] text-gray-500">
                  <CornerDownRight size={8} className="mr-1" />
                  <Box size={9} className="mr-1" />
                  <span>Camera</span>
                </div>
                
                {/* Custom Spawned workspace items */}
                {sandboxObjects.filter(o => o.type === 'Part' || o.type === 'MeshPart').map(obj => (
                  <div 
                    key={obj.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedObjId(obj.id); }}
                    className={cn(
                      "flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer text-[9px] group",
                      selectedObjId === obj.id ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center truncate">
                      <CornerDownRight size={8} className="mr-1 text-gray-700 shrink-0" />
                      <Box size={9} className="mr-1.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{obj.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemoveObject(obj.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Players tree */}
              <div 
                onClick={() => setSelectedHierarchy('Players')}
                className={cn("flex items-center px-1.5 py-0.5 rounded cursor-pointer mt-1", selectedHierarchy === 'Players' ? "bg-white/5 text-white" : "hover:bg-white/5")}
              >
                <ChevronRight size={10} className="mr-0.5 text-gray-600 rotate-90" />
                <Users size={10} className="mr-1.5 text-amber-500" />
                <span className="font-semibold">Players</span>
              </div>
              <div className="pl-4 text-[9px] text-gray-500 flex items-center">
                <CornerDownRight size={8} className="mr-1" />
                <Users size={9} className="mr-1.5 text-amber-500" />
                <span>Fsociety_Player (LocalPlayer)</span>
              </div>

              {/* Lighting tree */}
              <div 
                onClick={() => setSelectedHierarchy('Lighting')}
                className={cn("flex items-center px-1.5 py-0.5 rounded cursor-pointer mt-1", selectedHierarchy === 'Lighting' ? "bg-white/5 text-white" : "hover:bg-white/5")}
              >
                <ChevronRight size={10} className="mr-0.5 text-gray-600 rotate-90" />
                <Sun size={10} className="mr-1.5 text-purple-500" />
                <span className="font-semibold">Lighting</span>
              </div>
              <div className="pl-4 space-y-0.5">
                {sandboxObjects.filter(o => o.type === 'Sky').map(obj => (
                  <div 
                    key={obj.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedObjId(obj.id); }}
                    className={cn(
                      "flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer text-[9px] group",
                      selectedObjId === obj.id ? "bg-purple-950/40 text-purple-400 border border-purple-500/20" : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center truncate">
                      <CornerDownRight size={8} className="mr-1 text-gray-700 shrink-0" />
                      <Compass size={9} className="mr-1.5 text-purple-400 shrink-0" />
                      <span className="truncate">{obj.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemoveObject(obj.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>

              {/* MaterialService tree */}
              <div 
                onClick={() => setSelectedHierarchy('MaterialService')}
                className={cn("flex items-center px-1.5 py-0.5 rounded cursor-pointer mt-1", selectedHierarchy === 'MaterialService' ? "bg-white/5 text-white" : "hover:bg-white/5")}
              >
                <ChevronRight size={10} className="mr-0.5 text-gray-600 rotate-90" />
                <Layers size={10} className="mr-1.5 text-emerald-500" />
                <span className="font-semibold">MaterialService</span>
              </div>
              <div className="pl-4 space-y-0.5">
                {sandboxObjects.filter(o => o.type === 'MaterialVariant').map(obj => (
                  <div 
                    key={obj.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedObjId(obj.id); }}
                    className={cn(
                      "flex items-center justify-between px-1.5 py-0.5 rounded cursor-pointer text-[9px] group",
                      selectedObjId === obj.id ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center truncate">
                      <CornerDownRight size={8} className="mr-1 text-gray-700 shrink-0" />
                      <Layers size={9} className="mr-1.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{obj.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemoveObject(obj.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Properties Panel (bottom tree sidebar) */}
          <div className="h-28 bg-[#0D0D14] border-t border-white/10 flex flex-col min-h-0">
            <div className="px-2 py-1 bg-black/40 border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-gray-400">
              Properties Box
            </div>
            <div className="flex-1 overflow-y-auto p-2 text-[8px] font-mono space-y-1.5 custom-scrollbar text-gray-500 leading-normal">
              {selectedObjId ? (() => {
                const obj = sandboxObjects.find(o => o.id === selectedObjId);
                if (!obj) return <div className="italic">No selected Workspace element.</div>;
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">CLASS:</span> <span className="text-cyan-400 font-bold">{obj.type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">NAME:</span> <span className="text-white truncate max-w-[100px]">{obj.name}</span></div>
                    {obj.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SIZE (STUDS):</span> 
                        <span className="text-white">{obj.dimensions.join(' x ')}</span>
                      </div>
                    )}
                    {obj.polycount && (
                      <div className="flex justify-between"><span className="text-gray-600">POLYCOUNT:</span> <span className="text-white">{obj.polycount}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-600">ARCHIVABLE:</span> <span className="text-emerald-500">True</span></div>
                  </div>
                );
              })() : (
                <div className="italic">Select any element in the Explorer Tree to view its engine specifications.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
