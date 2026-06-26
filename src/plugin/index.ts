import { ParsedScreen } from './types';
import { loadFonts, createColorStyles, createTextStyles, hexToRgb } from './styles';
import { buildNode } from './node-builder';
import { addStatusBar, addBottomNav, addPrototyping } from './prototyping';
import { pluginLog } from './logger';

async function createFigmaVariables(tokens: Record<string, any>) {
  if (!tokens || Object.keys(tokens).length === 0) return;
  
  let collection = figma.variables.getLocalVariableCollections().find(c => c.name === 'UI Theme');
  if (!collection) {
    collection = figma.variables.createVariableCollection('UI Theme');
  }
  
  const modeId = collection.defaultModeId;
  let added = 0;
  
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
      const varName = key.replace(/\./g, '/'); // e.g. colors.primary -> colors/primary
      let v = figma.variables.getLocalVariables().find(v => v.name === varName && v.variableCollectionId === collection!.id);
      if (!v) {
        v = figma.variables.createVariable(varName, collection.id, 'COLOR');
      }
      try {
        const rgb = hexToRgb(value);
        if (rgb) {
          v.setValueForMode(modeId, { r: rgb.r, g: rgb.g, b: rgb.b });
          added++;
        }
      } catch (e) {
        pluginLog(`Failed to set variable ${varName}: ${e}`, 'error');
      }
    }
  }
  if (added > 0) {
    pluginLog(`Created/updated ${added} Figma color variables`, 'success');
  }
}

figma.showUI(__html__, { width: 500, height: 600, themeColors: true });
figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'parse-files') return;

  const screens: ParsedScreen[] = msg.screens || [];
  const componentsList: ParsedScreen[] = msg.components || [];
  const tokens = msg.tokens || {};
  const createdFrames: FrameNode[] = [];
  const componentRegistry: Record<string, ComponentNode> = {};

  try {
    figma.ui.postMessage({ type: 'status', text: '🎨 Loading fonts & creating styles...', progress: 10 });
    await loadFonts();
    await createColorStyles();
    await createTextStyles();
    await createFigmaVariables(tokens);

    const startX = Math.round(figma.viewport.center.x - (screens.length * 400) / 2);
    const startY = Math.round(figma.viewport.center.y - 406);

    // ── Build Components First ──
    if (componentsList.length > 0) {
      figma.ui.postMessage({ type: 'status', text: `🧩 Building ${componentsList.length} component(s)...`, progress: 15 });
      
      const componentSection = figma.createSection();
      componentSection.name = '🧩 Components';
      componentSection.x = startX - 600;
      componentSection.y = startY;
      componentSection.resize(500, Math.max(812, componentsList.length * 200 + 100));

      let currentCompY = 50;
      for (const comp of componentsList) {
        if (!comp.tree) continue;
        const compNode = figma.createComponent();
        compNode.name = comp.name;
        // Basic Auto Layout for component container
        compNode.layoutMode = 'VERTICAL';
        compNode.layoutSizingHorizontal = 'HUG';
        compNode.layoutSizingVertical = 'HUG';
        compNode.fills = []; // transparent root
        
        // Build the tree inside the component
        await buildNode(comp.tree, compNode, componentRegistry, 0);
        
        compNode.x = 50;
        compNode.y = currentCompY;
        componentSection.appendChild(compNode);
        
        currentCompY += compNode.height + 50;
        componentRegistry[comp.name] = compNode;
      }
    }

    figma.ui.postMessage({ type: 'status', text: `🏗 Building ${screens.length} screen(s)...`, progress: 20 });

    console.log(`[code.ts] Starting to build ${screens.length} screens:`, screens.map(s => s.name));
    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      console.log(`[code.ts] Building screen: ${screen.name}`);
      const progress = 20 + Math.round((i / screens.length) * 65);
      figma.ui.postMessage({ type: 'status', text: `⚙️ Parsing: ${screen.name} (${i+1}/${screens.length})`, progress });

      // Root screen frame (375×812 — matching PhoneFrame exactly)
      const rootFrame = figma.createComponent();
      rootFrame.name = `📱 ${screen.name}`;
      rootFrame.x = startX + i * 400;
      rootFrame.y = startY;
      rootFrame.resize(375, 812);
      rootFrame.layoutMode = 'VERTICAL';
      rootFrame.layoutSizingHorizontal = 'FIXED';
      rootFrame.layoutSizingVertical = 'FIXED';
      rootFrame.fills = [{ type: 'SOLID', color: hexToRgb('#F4F6F9') }];
      rootFrame.clipsContent = true;
      rootFrame.cornerRadius = 0; // flat — no 40px radius on inner frame

      // ── Status Bar (like PhoneFrame) ──
      await addStatusBar(rootFrame);

      // ── Content area: flex-1 fills remaining space (812 - 44 status - 80 nav = 688px) ──
      const contentArea = figma.createFrame();
      contentArea.name = '📄 Content';
      contentArea.fills = [{ type: 'SOLID', color: hexToRgb('#F4F6F9') }];
      contentArea.resize(375, 688);
      contentArea.layoutMode = 'VERTICAL';
      contentArea.layoutSizingHorizontal = 'FIXED';
      contentArea.layoutSizingVertical = 'FIXED';
      contentArea.clipsContent = true;
      rootFrame.appendChild(contentArea);
      try { contentArea.layoutSizingHorizontal = 'FILL'; contentArea.layoutSizingVertical = 'FILL'; } catch (_) {}

      if (screen.tree) {
        try {
          pluginLog(`⚙️ Starting build for: ${screen.name}`, 'info');
          await buildNode(screen.tree, contentArea, componentRegistry, 0);
          pluginLog(`✅ Finished build for: ${screen.name}`, 'success');
        } catch (err: any) {
          pluginLog(`❌ Build crashed for ${screen.name}: ${err?.message || err}`, 'error');
          try {
            const errText = figma.createText();
            errText.fontName = { family: 'Inter', style: 'Regular' };
            errText.characters = `⚠️ Parse error in ${screen.name}`;
            errText.fills = [{ type: 'SOLID', color: { r: 1, g: 0.4, b: 0.4 } }];
            contentArea.appendChild(errText);
          } catch(_) {}
        }
      }

      // ── Bottom Nav (like PhoneFrame + BottomNav) ──
      await addBottomNav(rootFrame, screen.name);

      createdFrames.push(rootFrame);
    }

    // ── Add Prototyping ──
    figma.ui.postMessage({ type: 'status', text: '🔗 Adding prototype connections...', progress: 88 });
    await addPrototyping(createdFrames);

    // ── Zoom to fit ──
    if (createdFrames.length > 0) {
      figma.viewport.scrollAndZoomIntoView(createdFrames);
    }

    const colorStyleCount = figma.getLocalPaintStyles().length;
    const textStyleCount  = figma.getLocalTextStyles().length;

    figma.ui.postMessage({
      type: 'status',
      text: `✅ Done! ${createdFrames.length} screens · ${colorStyleCount} color styles · ${textStyleCount} text styles · prototyping linked`,
      progress: 100,
      done: true,
    });

  } catch (err: any) {
    console.error("FATAL ERROR:", err);
    figma.ui.postMessage({ type: 'status', text: '❌ Fatal Error: ' + (err?.message || String(err)), progress: 0, isError: true });
  }
};
