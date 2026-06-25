import { hexToRgb, safeLoadFont } from './styles';

export function connectPrototype(from: FrameNode, to: FrameNode, direction: 'LEFT' | 'RIGHT' = 'LEFT'): void {
  try {
    const reaction = {
      trigger: { type: 'ON_CLICK' } as Trigger,
      action: {
        type: 'NODE',
        destinationId: to.id,
        navigation: 'NAVIGATE' as Navigation,
        transition: {
          type: 'MOVE_IN',
          direction,
          matchLayers: false,
          duration: 0.3,
          easing: { type: 'EASE_IN_AND_OUT' },
        } as Transition,
        preserveScrollPosition: false,
      } as unknown as Action,
    } as Reaction;

    (from as any).reactions = [reaction];
  } catch (_) { /* prototyping not critical */ }
}

export function addPrototyping(frames: FrameNode[]): void {
  if (frames.length < 2) return;

  for (let i = 0; i < frames.length; i++) {
    const curr = frames[i];
    const next = frames[(i + 1) % frames.length];
    const prev = frames[(i - 1 + frames.length) % frames.length];

    // Try to find bottom nav within this frame for tab-by-tab connections
    const bottomNav = findBottomNav(curr);
    if (bottomNav && bottomNav.children.length > 0) {
      const navItems = Array.from(bottomNav.children);
      const tabKeywords = ['home', 'material', 'quiz', 'forum'];
      
      for (let j = 0; j < navItems.length; j++) {
        const keyword = tabKeywords[j];
        // Find the matching screen for this tab
        const targetIndex = frames.findIndex(f => f.name.toLowerCase().includes(keyword));
        if (targetIndex === -1) continue;
        const target = frames[targetIndex];
        
        console.log(`[code.ts] Prototyping: Linking tab ${keyword} to screen ${target.name}`);
        try {
          (navItems[j] as any).reactions = [{
            trigger: { type: 'ON_CLICK' },
            action: {
              type: 'NODE',
              destinationId: target.id,
              navigation: 'NAVIGATE',
              transition: {
                type: targetIndex > i ? 'MOVE_IN' : 'MOVE_OUT',
                direction: targetIndex > i ? 'LEFT' : 'RIGHT',
                matchLayers: false,
                duration: 0.3,
                easing: { type: 'EASE_IN_AND_OUT' },
              },
              preserveScrollPosition: false,
            }
          }];
        } catch (_) {}
      }
    } else {
      // Fallback: connect frame to next in sequence
      connectPrototype(curr, next, 'LEFT');
    }
  }
}

export function findBottomNav(frame: FrameNode): FrameNode | null {
  for (const child of frame.children) {
    if (child.type !== 'FRAME') continue;
    const f = child as FrameNode;
    const name = f.name.toLowerCase();
    if (name.includes('nav') || name.includes('bottom') || name.includes('tab bar')) return f;
    // Positional heuristic: near the bottom of a 812-height frame
    if (f.y > 700 && f.width > 300) return f;
  }
  return null;
}


export async function addStatusBar(root: FrameNode): Promise<void> {
  // Status bar: 375 × 44, bg = #0D3B66, text "9:41"
  const bar = figma.createFrame();
  bar.name = '📶 Status Bar';
  bar.resize(375, 44);
  bar.fills = [{ type: 'SOLID', color: hexToRgb('#0D3B66') }];
  bar.layoutMode = 'HORIZONTAL';
  bar.layoutSizingHorizontal = 'FIXED';
  bar.layoutSizingVertical = 'FIXED';
  bar.counterAxisAlignItems = 'CENTER';
  bar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  bar.paddingLeft = 24;
  bar.paddingRight = 24;
  bar.paddingRight = 24;

  // Time label
  const font = await safeLoadFont({ family: 'Inter', style: 'SemiBold' });
  const time = figma.createText();
  try { time.fontName = font; } catch(_) {}
  time.fontSize = 13;
  time.characters = '9:41';
  time.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  bar.appendChild(time);

  // Right icons group (signal + wifi + battery)
  const iconsGroup = figma.createFrame();
  iconsGroup.name = 'Icons';
  iconsGroup.fills = [];
  iconsGroup.layoutMode = 'HORIZONTAL';
  iconsGroup.layoutSizingHorizontal = 'HUG';
  iconsGroup.layoutSizingVertical = 'HUG';
  iconsGroup.counterAxisAlignItems = 'CENTER';
  iconsGroup.itemSpacing = 4;

  // Signal bars (4 rects of increasing height)
  const signalFrame = figma.createFrame();
  signalFrame.name = 'Signal';
  signalFrame.fills = [];
  signalFrame.resize(17, 11);
  signalFrame.layoutMode = 'HORIZONTAL';
  signalFrame.layoutSizingHorizontal = 'FIXED';
  signalFrame.layoutSizingVertical = 'FIXED';
  signalFrame.counterAxisAlignItems = 'MAX';
  signalFrame.itemSpacing = 1;
  const barHeights = [4, 6, 8.5, 11];
  for (const bh of barHeights) {
    const b = figma.createRectangle();
    b.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    b.resize(3, bh);
    b.cornerRadius = 1;
    signalFrame.appendChild(b);
  }
  iconsGroup.appendChild(signalFrame);

  // Wifi icon placeholder
  const wifiRect = figma.createEllipse();
  wifiRect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  wifiRect.resize(12, 9);
  iconsGroup.appendChild(wifiRect);

  // Battery icon
  const battFrame = figma.createFrame();
  battFrame.name = 'Battery';
  battFrame.fills = [];
  battFrame.resize(25, 12);
  battFrame.layoutMode = 'HORIZONTAL';
  battFrame.layoutSizingHorizontal = 'FIXED';
  battFrame.layoutSizingVertical = 'FIXED';
  battFrame.counterAxisAlignItems = 'CENTER';
  const battBody = figma.createRectangle();
  battBody.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  battBody.resize(17, 8);
  battBody.cornerRadius = 1.5;
  battFrame.appendChild(battBody);
  iconsGroup.appendChild(battFrame);

  bar.appendChild(iconsGroup);
  root.appendChild(bar);
  try { bar.layoutSizingHorizontal = 'FILL'; } catch (_) {}
}

export async function addBottomNav(root: FrameNode, screenName: string): Promise<void> {
  const regularFont = await safeLoadFont({ family: 'Inter', style: 'Regular' });
  const semiBoldFont = await safeLoadFont({ family: 'Inter', style: 'SemiBold' });

  // Bottom nav: 375 × 80, bg = white, border top
  const nav = figma.createFrame();
  nav.name = '🔨 Bottom Nav';
  nav.resize(375, 80);
  nav.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  nav.strokes = [{ type: 'SOLID', color: hexToRgb('#EEF1F5') }];
  nav.strokeWeight = 1;
  nav.strokeAlign = 'INSIDE';
  nav.layoutMode = 'HORIZONTAL';
  nav.layoutSizingHorizontal = 'FIXED';
  nav.layoutSizingVertical = 'FIXED';
  nav.counterAxisAlignItems = 'CENTER';
  nav.primaryAxisAlignItems = 'SPACE_BETWEEN';
  nav.primaryAxisAlignItems = 'SPACE_BETWEEN';

  const lowerName = screenName.toLowerCase();
  const tabs = [
    { label: 'Beranda', active: lowerName.includes('home') },
    { label: 'Materi', active: lowerName.includes('material') },
    { label: 'Kuis', active: lowerName.includes('quiz') },
    { label: 'Forum', active: lowerName.includes('forum') },
  ];
  if (!tabs.some(t => t.active)) {
    if (tabs.length > 0) tabs[0].active = true;
  }

  for (const tab of tabs) {
    const tabFrame = figma.createFrame();
    tabFrame.name = tab.label;
    tabFrame.fills = [];
    tabFrame.layoutMode = 'VERTICAL';
    tabFrame.layoutSizingHorizontal = 'HUG';
    tabFrame.layoutSizingVertical = 'HUG';
    tabFrame.counterAxisAlignItems = 'CENTER';
    tabFrame.primaryAxisAlignItems = 'CENTER';
    tabFrame.itemSpacing = 2;
    tabFrame.paddingTop = 10;
    tabFrame.paddingBottom = 16;

    // Icon placeholder (24×24 square)
    const icon = figma.createRectangle();
    icon.resize(24, 24);
    icon.cornerRadius = 4;
    icon.fills = [{ type: 'SOLID', color: tab.active ? hexToRgb('#0D3B66') : hexToRgb('#6B7280') }];
    tabFrame.appendChild(icon);

    // Label
    const label = figma.createText();
    try { label.fontName = tab.active ? semiBoldFont : regularFont; } catch(_) {}
    label.fontSize = 11;
    label.characters = tab.label;
    label.fills = [{ type: 'SOLID', color: tab.active ? hexToRgb('#0D3B66') : hexToRgb('#6B7280') }];
    tabFrame.appendChild(label);

    nav.appendChild(tabFrame);
    try { tabFrame.layoutSizingHorizontal = 'FILL'; } catch (_) {}
  }

  root.appendChild(nav);
  try { nav.layoutSizingHorizontal = 'FILL'; } catch (_) {}
}
