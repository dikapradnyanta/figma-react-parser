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

  for (const root of frames) {
    const triggerNodes = root.findAll(node => !!node.getPluginData('actionTo'));
    
    for (const triggerNode of triggerNodes) {
      const rawAction = triggerNode.getPluginData('actionTo');
      // Normalize rawAction (e.g. "/dashboard" -> "dashboard")
      let route = rawAction.replace(/^\//, '').toLowerCase();
      // Try exact match first, then partial match
      let targetFrame = frames.find(f => f.name.toLowerCase() === route);
      if (!targetFrame) {
         targetFrame = frames.find(f => f.name.toLowerCase().includes(route));
      }
      
      if (targetFrame) {
        try {
          const reaction = {
            trigger: { type: 'ON_CLICK' },
            action: {
              type: 'NODE',
              destinationId: targetFrame.id,
              navigation: 'NAVIGATE',
              transition: {
                type: 'SMART_ANIMATE',
                duration: 0.3,
                easing: { type: 'EASE_IN_AND_OUT' }
              }
            }
          };
          // Cast to any to avoid strict type issues with Reaction types if they're outdated in TS
          (triggerNode as any).reactions = [reaction];
        } catch (e) {
          console.error(`[code.ts] Failed to link prototype for ${rawAction}:`, e);
        }
      }
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
  const customStatusBar = figma.root.findOne(node => node.type === 'COMPONENT' && node.name === '_TemplateStatusBar') as ComponentNode | null;
  if (customStatusBar) {
    const instance = customStatusBar.createInstance();
    root.appendChild(instance);
    try { instance.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    return;
  }

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
  const customBottomNav = figma.root.findOne(node => node.type === 'COMPONENT' && node.name === '_TemplateBottomNav') as ComponentNode | null;
  if (customBottomNav) {
    const instance = customBottomNav.createInstance();
    root.appendChild(instance);
    try { instance.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    return;
  }

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
    { id: 'home', label: 'Home', svg: (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { id: 'material', label: 'Materi', svg: (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>` },
    { id: 'quiz', label: 'Kuis', svg: (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>` },
    { id: 'forum', label: 'Forum', svg: (c: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>` }
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

    const icon = figma.createNodeFromSvg(tab.svg(color));
    icon.name = 'Icon';
    
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
