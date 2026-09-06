# 🤖 FSOCIETY CYBER EXPLOIT IDE & SYNTHESIZER

Welcome to the ultimate client-side exploit IDE custom-engineered for Roblox developers, security auditors, and logical penetration researchers.

---

## ⚡ RECENT ADVANCED ENGINEERING UPGRADES

We have integrated a series of robust system-level modifications and customized visual interfaces to grant complete bypass capabilities, advanced core switching, and an unrestricted generation pipeline.

### 🧬 1. Dynamic Cognition Kernels (Model Switching)
The AI chat interface now incorporates a live-swappable **Cognition Core Selection** block allowing developers to control intelligence levels on the fly:
*   **Mistral Large (Default):** Our flagship core powered by the Mistral Large model. Outclasses standard models in complex algorithmic reasoning, multi-step exploit generation, and Roblox Luau logic translation.
*   **Fsociety Flash (Gemini 3.5 Core):** Standard ultra-fast logic engine. Tailored for lightweight automation scripts, quick variable maps, and basic loop injections.
*   **Fsociety Elite (Gemini 3.1 Pro):** Advanced paid-tier reasoning core. Best utilized for complex bypass algorithms, anti-cheat analysis, and highly structured execution logic.

### 🛡️ 2. Dynamic Decrypt & Anti-Refusal Bypass Matrix
To resolve safety refusals and restricted filters, we designed an active **Decrypt & Reframe Compiler** working server-side across three selectable security modes:
1.  **None:** Raw unmodified request flow.
2.  **Stealth Mode (Academic Diagnostics):** Intercepts and wraps request specifications into benign diagnostic, latency testing, and balance-testing proof-of-concepts (PoC). Reframes malicious keywords to their academic testing equivalents to completely bypass internal guardrail classifications.
3.  **Hardcore Mode (VM Sandbox simulation):** Simulates an isolated offline virtual environment sandbox override where security protocols are simulated as fully disabled, directing the AI model to output raw, cynicism-laden exploit payload directly.

### 🎨 3. Premium Cybernetic Spacing & UI Polish
*   **Matrix Control Dashboard:** A glowing expandable drawer integrated into the `<AiChatPanel>` header. Features green/purple pulse animations, custom col-grid selectors, and interactive status displays.
*   **Auto-Minimization on Pastes:** Pastes exceeding 250 characters are automatically minimized into functional metadata attachment badges indicating the exact line-count and byte sizes, keeping the active chat stream clean and readable.
*   **Persistence Layers:** Active Cognition Kernels and Bypass Matrices are automatically recorded and saved in client-side `localStorage`, remaining fully intact across IDE refreshes.

### 🌐 4. "Real Roblox Studio" Live Asset Pipeline (Poly Haven)
We added a fully featured **Real Roblox Studio** asset pipeline under the **Asset Library** panel:
*   **Dynamic CC0 Content Provider:** Integrates live connection with the `api.polyhaven.com` registry to browse high-fidelity textures, 3D meshes, and HDRIs/Skyboxes on the fly.
*   **On-Demand Server Caching:** Includes a lightweight backend memory proxy route `/api/polyhaven` with a 1-hour expiration cache to bypass CORS limitations, decrease loading latency, and protect public API rate limits.
*   **Instant Luau Compilers:** Real-time generation of custom loader and environment-variant scripts. Developers can click **"COMPILE & INJECT"** to construct fully compatible BaseParts, MaterialVariants, or Sky entities automatically as files inside their active IDE session, or copy loadstring snippets with a single click.

### 🎮 5. Tabbed Workspace & Roblox Studio Integration
We integrated an interactive, live **Roblox Studio Tab Workspace** alongside the central Lua Script Editor:
*   **Dual Workspace Tabs:** Located at the top of the central panel, allowing instant switching between the **💻 SCRIPT EDITOR** (maximizing script readability) and the **🎮 ROBLOX STUDIO** Workspace.
*   **Integrated Roblox Studio Tab:** Clicking the gold **"Roblox Studio"** button in the header toolbar transitions everything into a dedicated full-screen tab displaying:
    1.  **The Asset Store:** The live CC0 Poly Haven browser to search, filter, and compile 3D meshes, materials, and skies.
    2.  **Roblox Studio Viewport:** The interactive 3D physics sandbox simulation showcasing character walking, target tracking, and compiled assets rendered in real time.
*   **Interactive Simulation Engine:** Draws an active 3D perspective grid baseplate representing Roblox Workspace. Features an active humanoid character controllable via [WASD] or [Arrows] with micro-animations.
*   **Direct Asset Compilation Rendering:** Compiling and injecting mesh parts, PBR materials, or HDRIs from the Asset Store spawns them instantly inside the active 3D workspace. It automatically updates object trees, skyboxes, and terrain surfaces.
*   **Interactive Exploits Integration:** Executing aimbot or flight scripts automatically triggers the 3D Sandbox physics loops. Characters float with purple energy particle trails (Flight mode), and green FOV tracking indicators lock onto training targets with active laser beams and floating damage numbers (Aimbot mode).
*   **F9 Developer Console:** Features a retro translucency overlay in the bottom left mirroring print execution feeds in real time.

### 🧱 6. Realistic 3D Procedural Model Assemblies (High-Fidelity Viewport Rendering)
Rather than rendering spawned or compiled MeshParts as simple flat textured boxes, the interactive Roblox Studio Viewport now integrates a fully procedural, multi-mesh 3D Model Assembly Generator. It matches asset names against a comprehensive physical taxonomy:
*   **Chairs & Seats:** Realistically styled wooden or slate chairs complete with four independent load-bearing legs, supportive backrest slats, and textured seat cushions.
*   **Weapons & Cannons:** Meticulously assembled blaster rifles, pistols, and classic battlefield cannons equipped with iron barrels, sight scopes, triggers, wooden stocks, and dual gold-trimmed wooden wheels.
*   **Melee Weapons & Shields:** Dynamic longswords, curved daggers, double-sided battle axes, and reinforced defensive shields with customized emblem crests and central steel spikes.
*   **Tables & Cabinets:** Spacious desks, counters, and office tables combining support beams, metal reinforcement legs, and multi-drawer storage cabinets.
*   **Chests & Crates:** Storage chests featuring locking gold brass mechanisms, dark iron strapping bands, and wooden timber patterns.
*   **Lighting & Lanterns:** Real-time candles with orange-yellow emitter flame spheres and vintage street lanterns with glowing standard light emitters.
*   **Trees & Foliage:** Scaled woodland pine and lime green foliage tree trunks, potted house plants, and desert cacti with branching arms.
*   **Vehicles & Character Models:** Multi-wheeled buggies, customized player NPC skeletons with controllable limbs, and colored garments.

### 🔒 7. Fsociety Obfuscation Engine v6.0 Pipeline
The Lua/Luau code protection system in `/server.ts` has been upgraded to a commercial-grade pipeline:
*   **Mixed Radix Escape & Byte Encoding:** String constants and payload byte arrays utilize heterogeneous escape representations (`\97`, `\097`, `\x61`, `0x61`, `("\97"):byte()`, `(b - offset + offset)`) to frustrate static string extraction tools and pattern-matching decompilers.
*   **Dynamic Runtime Seed Derivation:** Seed keys are dynamically computed at runtime directly from `#payload` table properties (`(#payload * seedMult + seedOffset) % 899999 + 100000`). Zero static number literals or split arithmetic expressions exist in the source code.
*   **Unified Dual-Cipher Binding:** Both standard library string decryptors and byte payload ciphers derive their runtime keys directly from the dynamic build seed (`seed % 23` and `seed % 17`).
*   **Live Active CFF State Machine:** Control-flow flattening incorporates active loop back-edges (`state_chk1`) that continuously mutate runtime rolling hash accumulators during execution.
*   **Polymorphic Identifier Blending:** Identifiers randomly alternate between realistic system prefixes (`_core`, `ctx`, `cfg`, `sys`, `_node`) and lookalike character sequences (`I0oQl1iI`) to defeat automated static pattern detectors.
*   **Mathematical Opaque Predicates:** Employs provably true non-trivial integer identities `((x^2 + x) % 2) == 0` and active anti-hook environment integrity guards.
*   **AST Minifier & Whitespace Stripper:** Fully strips and tokenizes output code into a single minified block while safely maintaining keyword syntax boundaries, drastically reducing artifact size and hindering manual reversing.

---

## 🛠️ COMPONENT INDEX & SERVICE PORTS

*   **Ingress Port:** `3000` (Direct container reverse proxy mapping)
*   **Backend Server:** `/server.ts` (Express server proxying calls to the `@google/genai` interface)
*   **Interactive Panel:** `/src/components/AiChatPanel.tsx` (Contains the chat message stream and live bypass override panel)
*   **Core Context Controller:** `/src/App.tsx` (Handles state synchronization and persistent caching)
