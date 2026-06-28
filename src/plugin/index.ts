import { ParsedScreen } from './types';
import { loadFonts, createColorStyles, createTextStyles, hexToRgb } from './styles';
import { buildNode } from './node-builder';
import { addStatusBar, addBottomNav, addPrototyping } from './prototyping';
import { pluginLog } from './logger';
import { setTokenVariableMap } from './figma-mapper';

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
  const framework: string = msg.framework || 'generic';
  const createdFrames: FrameNode[] = [];
  const componentRegistry: Record<string, ComponentNode> = {};

  pluginLog(`Framework: ${framework}`, 'info');


  try {
    figma.ui.postMessage({ type: 'status', text: 'Loading fonts & creating styles...', progress: 10 });
    await loadFonts();
    await createColorStyles();
    await createTextStyles();
    await createFigmaVariables(tokens);

    // Populate token-to-variable map so figma-mapper can bind colors to Local Variables
    const varMap: Record<string, string> = {};
    for (const v of figma.variables.getLocalVariables()) {
      // Support both slash-separated ('colors/primary') and dot-separated ('colors.primary') formats
      varMap[v.name.replace(/\//g, '.')] = v.id;     // 'colors/primary' -> 'colors.primary'
      const shortName = v.name.split('/').pop();
      if (shortName) varMap[shortName] = v.id;        // 'colors/primary' -> 'primary'
    }
    setTokenVariableMap(varMap);

    const startX = Math.round(figma.viewport.center.x - (screens.length * 400) / 2);
    const startY = Math.round(figma.viewport.center.y - 406);

    // ── Build Components First ──
    if (componentsList.length > 0) {
      figma.ui.postMessage({ type: 'status', text: `Building ${componentsList.length} component(s)...`, progress: 15 });

      const componentPage = figma.createPage();
      componentPage.name = '🧩 Components';

      const componentSection = figma.createSection();
      componentSection.name = 'UI Components';
      componentSection.x = 0;
      componentSection.y = 0;
      componentSection.resize(500, Math.max(812, componentsList.length * 200 + 100));

      let currentCompY = 50;
      for (const comp of componentsList as any[]) {
        if (!comp.tree) continue;

        if (comp.variants && Object.keys(comp.variants).length > 0) {
          // HAS VARIANTS
          const defaultComp = figma.createComponent();
          defaultComp.name = "Property 1=Default";
          defaultComp.layoutMode = 'VERTICAL';
          defaultComp.layoutSizingHorizontal = 'HUG';
          defaultComp.layoutSizingVertical = 'HUG';
          defaultComp.fills = [];
          await buildNode(comp.tree, defaultComp, componentRegistry, 0);

          const variantsArray = [defaultComp];

          for (const [vName, vTree] of Object.entries(comp.variants)) {
            const variantComp = figma.createComponent();
            variantComp.name = `Property 1=${vName}`;
            variantComp.layoutMode = 'VERTICAL';
            variantComp.layoutSizingHorizontal = 'HUG';
            variantComp.layoutSizingVertical = 'HUG';
            variantComp.fills = [];
            await buildNode(vTree as any, variantComp, componentRegistry, 0);
            variantsArray.push(variantComp);
          }

          const componentSet = figma.combineAsVariants(variantsArray, componentSection);
          componentSet.name = comp.name;
          componentSet.x = 50;
          componentSet.y = currentCompY;
          // combineAsVariants usually lays out the variants automatically.

          // Add Reaction
          if (comp.variants["Hover"]) {
            const hoverVariant = variantsArray.find(v => v.name === "Property 1=Hover");
            if (hoverVariant) {
              await defaultComp.setReactionsAsync([{
                trigger: { type: "ON_HOVER" },
                actions: [{ type: "NODE", destinationId: hoverVariant.id, navigation: "CHANGE_TO", transition: null }]
              }]);
            }
          }

          currentCompY += componentSet.height + 50;
          componentRegistry[comp.name] = defaultComp; // We map to default variant so instances are correct
        } else {
          // NO VARIANTS
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
      
      componentPage.appendChild(componentSection);
    }

    figma.ui.postMessage({ type: 'status', text: `Building ${screens.length} screen(s)...`, progress: 20 });

    const frameTemplate = msg.frameTemplate || '375x812';
    const [templateWidth, templateHeight] = frameTemplate.split('x').map((n: string) => parseInt(n, 10));

    // --- [START] FIX UNTUK UNPACKING ROOT 'App' ---
    let actualScreens = screens;
    if (screens.length === 1 && screens[0].name === 'App' && screens[0].tree?.children) {
      actualScreens = screens[0].tree.children.map((childNode: any) => {
        return {
          filename: screens[0].filename,
          name: childNode.originalTag || 'Screen',
          tree: childNode,
        };
      });
    }
    // --- [END] FIX UNTUK UNPACKING ROOT 'App' ---

    // Gunakan actualScreens untuk looping pembuatan frame
    for (let i = 0; i < actualScreens.length; i++) {
      await new Promise(res => setTimeout(res, 15)); // Yield to main thread for UI updates
      const screen = actualScreens[i]; // Ambil dari actualScreens
      const progress = 20 + Math.round((i / actualScreens.length) * 65);
      figma.ui.postMessage({ type: 'status', text: `Parsing: ${screen.name} (${i + 1}/${actualScreens.length})`, progress });

      // Root screen frame
      const rootFrame = figma.createFrame();
      rootFrame.name = `${screen.name}`;
      rootFrame.x = startX + i * (templateWidth + 25);
      rootFrame.y = startY;
      rootFrame.resize(templateWidth, templateHeight);
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
      try { contentArea.layoutSizingHorizontal = 'FILL'; contentArea.layoutSizingVertical = 'FILL'; } catch (_) { }

      if (screen.tree) {
        try {
          pluginLog(`Starting build for: ${screen.name}`, 'info');
          await buildNode(screen.tree, contentArea, componentRegistry, 0);
          pluginLog(`Finished build for: ${screen.name}`, 'success');
        } catch (err: any) {
          pluginLog(`Build crashed for ${screen.name}: ${err?.message || err}`, 'error');
          try {
            const errText = figma.createText();
            errText.fontName = { family: 'Inter', style: 'Regular' };
            errText.characters = `Parse error in ${screen.name}`;
            errText.fills = [{ type: 'SOLID', color: { r: 1, g: 0.4, b: 0.4 } }];
            contentArea.appendChild(errText);
          } catch (_) { }
        }
      }

      // ── Bottom Nav (like PhoneFrame + BottomNav) ──
      await addBottomNav(rootFrame, screen.name);

      createdFrames.push(rootFrame);
    }

    // ── Add Prototyping ──
    figma.ui.postMessage({ type: 'status', text: 'Adding prototype connections...', progress: 88 });
    await addPrototyping(createdFrames);

    // ── Zoom to fit ──
    if (createdFrames.length > 0) {
      figma.viewport.scrollAndZoomIntoView(createdFrames);
    }

    const colorStyleCount = figma.getLocalPaintStyles().length;
    const textStyleCount = figma.getLocalTextStyles().length;

    figma.ui.postMessage({
      type: 'status',
      text: `Done! ${createdFrames.length} screens · ${colorStyleCount} color styles · ${textStyleCount} text styles · prototyping linked`,
      progress: 100,
      done: true,
    });

  } catch (err: any) {
    console.error("FATAL ERROR:", err);
    figma.ui.postMessage({ type: 'status', text: 'Fatal Error: ' + (err?.message || String(err)), progress: 0, isError: true });
  }
};
