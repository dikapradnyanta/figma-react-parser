import { hexToRgb, safeLoadFont } from './styles';

export async function connectPrototype(from: FrameNode, to: FrameNode, direction: 'LEFT' | 'RIGHT' = 'LEFT'): Promise<void> {
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

    await (from as any).setReactionsAsync([reaction]);
  } catch (_) { /* prototyping not critical */ }
}

export async function addPrototyping(frames: FrameNode[]): Promise<void> {
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
          await (navItems[j] as any).setReactionsAsync([{
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
          }]);
        } catch (_) {}
      }
    } else {
      // Fallback: connect frame to next in sequence
      await connectPrototype(curr, next, 'LEFT');
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
  const time = figma.createText();
  time.fontName = await safeLoadFont({ family: 'Inter', style: 'Semi Bold' });
  time.characters = '9:41';
  time.fills = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
  time.fontSize = 15;
  bar.appendChild(time);

  // Icons placeholder (right)
  const icons = figma.createFrame();
  icons.name = 'Icons';
  icons.layoutMode = 'HORIZONTAL';
  icons.itemSpacing = 6;
  icons.fills = [];
  icons.layoutSizingHorizontal = 'HUG';
  icons.layoutSizingVertical = 'HUG';
  icons.counterAxisAlignItems = 'CENTER';

  for (const sym of ['cellular', 'wifi', 'battery']) {
    const p = figma.createFrame();
    p.name = sym;
    p.resize(18, 12);
    p.fills = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
    p.cornerRadius = 2;
    icons.appendChild(p);
  }
  bar.appendChild(icons);

  root.appendChild(bar);
}

export async function addBottomNav(root: FrameNode, activeScreen: string): Promise<void> {
  // 375 × 80
  const nav = figma.createFrame();
  nav.name = '🔽 Bottom Nav';
  nav.resize(375, 80);
  nav.fills = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
  nav.layoutMode = 'HORIZONTAL';
  nav.layoutSizingHorizontal = 'FIXED';
  nav.layoutSizingVertical = 'FIXED';
  nav.primaryAxisAlignItems = 'SPACE_BETWEEN';
  nav.counterAxisAlignItems = 'MIN';
  nav.paddingTop = 16;
  
  // top shadow (stroke)
  nav.strokes = [{ type: 'SOLID', color: hexToRgb('#E5E7EB') }];
  nav.strokeTopWeight = 1;

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'material', label: 'Materi', icon: '📚' },
    { id: 'quiz', label: 'Kuis', icon: '✏️' },
    { id: 'forum', label: 'Forum', icon: '💬' }
  ];

  await safeLoadFont({ family: 'Inter', style: 'Medium' });

  for (const tab of tabs) {
    const isActive = activeScreen.toLowerCase().includes(tab.id);
    const color = isActive ? '#0D3B66' : '#9CA3AF';

    const item = figma.createFrame();
    item.name = `Tab ${tab.label}`;
    item.layoutMode = 'VERTICAL';
    item.itemSpacing = 4;
    item.fills = [];
    item.layoutSizingHorizontal = 'HUG';
    item.layoutSizingVertical = 'HUG';
    item.counterAxisAlignItems = 'CENTER';
    item.paddingLeft = 16;
    item.paddingRight = 16;
    item.paddingTop = 4;
    item.paddingBottom = 4;

    const icon = figma.createText();
    icon.characters = tab.icon;
    icon.fontSize = 20;
    icon.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
    
    const label = figma.createText();
    label.fontName = await safeLoadFont({ family: 'Inter', style: 'Medium' });
    label.characters = tab.label;
    label.fontSize = 11;
    label.fills = [{ type: 'SOLID', color: hexToRgb(color) }];

    item.appendChild(icon);
    item.appendChild(label);
    nav.appendChild(item);
  }

  root.appendChild(nav);
}
