import { ParsedScreen } from './types';
import { loadFonts, createColorStyles, createTextStyles, hexToRgb } from './styles';
import { buildNode } from './node-builder';
import { addStatusBar, addBottomNav, addPrototyping } from './prototyping';
import { pluginLog } from './logger';

figma.showUI(__html__, { width: 500, height: 600, themeColors: true });
figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'parse-files') return;

  const screens: ParsedScreen[] = msg.screens;
  const createdFrames: FrameNode[] = [];

  try {
    figma.ui.postMessage({ type: 'status', text: '🎨 Loading fonts & creating styles...', progress: 10 });
    await loadFonts();
    await createColorStyles();
    await createTextStyles();

    const startX = Math.round(figma.viewport.center.x - (screens.length * 400) / 2);
    const startY = Math.round(figma.viewport.center.y - 406);

    figma.ui.postMessage({ type: 'status', text: `🏗 Building ${screens.length} screen(s)...`, progress: 20 });

    console.log(`[code.ts] Starting to build ${screens.length} screens:`, screens.map(s => s.name));
    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      console.log(`[code.ts] Building screen: ${screen.name}`);
      const progress = 20 + Math.round((i / screens.length) * 65);
      figma.ui.postMessage({ type: 'status', text: `⚙️ Parsing: ${screen.name} (${i+1}/${screens.length})`, progress });

      // Root screen frame (375×812 — matching PhoneFrame exactly)
      const rootFrame = figma.createFrame();
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
          await buildNode(screen.tree, contentArea, 0);
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
    addPrototyping(createdFrames);

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
