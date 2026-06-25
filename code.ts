/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 440, height: 500, title: 'React → Figma Parser v2' });

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
interface ParsedNode {
  tag: string;
  classes: string[];
  text: string;
  attrs: Record<string, string>;
  children: ParsedNode[];
  inlineStyle?: Record<string, string | number>;
  isIcon?: boolean;
}

interface ParsedScreen {
  filename: string;
  name: string;
  tree: ParsedNode | null;
}

// ── LOGGING HELPER ──
function pluginLog(msg: string, type: 'info' | 'success' | 'error' = 'info') {
  figma.ui.postMessage({ type: 'log', text: msg, logType: type });
}

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════
function hexToRgb(hex: string): RGB {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 }
    : { r: 1, g: 1, b: 1 };
}

function getSpacing(key: string): number {
  const map: Record<string, number> = {
    '0': 0, 'px': 1, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10,
    '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32,
    '9': 36, '10': 40, '11': 44, '12': 48, '14': 56, '16': 64, '20': 80,
    '24': 96, '28': 112, '32': 128, '36': 144, '40': 160, '44': 176,
    '48': 192, '52': 208, '56': 224, '64': 256, '72': 288, '80': 320, '96': 384,
  };
  const arb = key.match(/^\[(\d+)px\]$/);
  if (arb) return parseInt(arb[1]);
  const num = parseFloat(key);
  if (!isNaN(num) && !map[key]) return num * 4;
  return map[key] ?? 8;
}

function getBorderRadius(key: string): number {
  const map: Record<string, number> = {
    'none': 0, 'sm': 2, 'DEFAULT': 4, 'md': 6, 'lg': 8,
    'xl': 12, '2xl': 16, '3xl': 24, 'full': 9999,
  };
  const arb = key.match(/^\[(\d+)px\]$/);
  if (arb) return parseInt(arb[1]);
  return map[key] ?? 4;
}

function getTextSize(key: string): number {
  const map: Record<string, number> = {
    'xs': 12, 'sm': 14, 'base': 16, 'lg': 18, 'xl': 20,
    '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72,
  };
  const arb = key.match(/^\[(\d+)px\]$/);
  if (arb) return parseInt(arb[1]);
  return map[key] ?? 14;
}

// ══════════════════════════════════════════════════════════════
// TAILWIND COLOR MAP
// ══════════════════════════════════════════════════════════════
const COLORS: Record<string, RGB> = {
  'white': { r: 1, g: 1, b: 1 }, 'black': { r: 0, g: 0, b: 0 },
  'transparent': { r: 0, g: 0, b: 0 },
  // Shadcn Theme Defaults (Light mode)
  'background': hexToRgb('#ffffff'),
  'foreground': hexToRgb('#020817'),
  'card': hexToRgb('#ffffff'),
  'card-foreground': hexToRgb('#020817'),
  'popover': hexToRgb('#ffffff'),
  'popover-foreground': hexToRgb('#020817'),
  'primary': hexToRgb('#0f172a'),
  'primary-foreground': hexToRgb('#f8fafc'),
  'secondary': hexToRgb('#f1f5f9'),
  'secondary-foreground': hexToRgb('#0f172a'),
  'muted': hexToRgb('#f1f5f9'),
  'muted-foreground': hexToRgb('#64748b'),
  'accent': hexToRgb('#f1f5f9'),
  'accent-foreground': hexToRgb('#0f172a'),
  'destructive': hexToRgb('#ef4444'),
  'destructive-foreground': hexToRgb('#f8fafc'),
  'border': hexToRgb('#e2e8f0'),
  'input': hexToRgb('#e2e8f0'),
  'ring': hexToRgb('#020817'),
  // Slate
  'slate-50': hexToRgb('#f8fafc'), 'slate-100': hexToRgb('#f1f5f9'),
  'slate-200': hexToRgb('#e2e8f0'), 'slate-300': hexToRgb('#cbd5e1'),
  'slate-400': hexToRgb('#94a3b8'), 'slate-500': hexToRgb('#64748b'),
  'slate-600': hexToRgb('#475569'), 'slate-700': hexToRgb('#334155'),
  'slate-800': hexToRgb('#1e293b'), 'slate-900': hexToRgb('#0f172a'),
  // Gray
  'gray-50': hexToRgb('#f9fafb'), 'gray-100': hexToRgb('#f3f4f6'),
  'gray-200': hexToRgb('#e5e7eb'), 'gray-300': hexToRgb('#d1d5db'),
  'gray-400': hexToRgb('#9ca3af'), 'gray-500': hexToRgb('#6b7280'),
  'gray-600': hexToRgb('#4b5563'), 'gray-700': hexToRgb('#374151'),
  'gray-800': hexToRgb('#1f2937'), 'gray-900': hexToRgb('#111827'),
  // Zinc
  'zinc-50': hexToRgb('#fafafa'), 'zinc-100': hexToRgb('#f4f4f5'),
  'zinc-200': hexToRgb('#e4e4e7'), 'zinc-300': hexToRgb('#d4d4d8'),
  'zinc-400': hexToRgb('#a1a1aa'), 'zinc-500': hexToRgb('#71717a'),
  'zinc-600': hexToRgb('#52525b'), 'zinc-700': hexToRgb('#3f3f46'),
  'zinc-800': hexToRgb('#27272a'), 'zinc-900': hexToRgb('#18181b'),
  // Red
  'red-50': hexToRgb('#fef2f2'), 'red-100': hexToRgb('#fee2e2'),
  'red-200': hexToRgb('#fecaca'), 'red-300': hexToRgb('#fca5a5'),
  'red-400': hexToRgb('#f87171'), 'red-500': hexToRgb('#ef4444'),
  'red-600': hexToRgb('#dc2626'), 'red-700': hexToRgb('#b91c1c'),
  'red-800': hexToRgb('#991b1b'), 'red-900': hexToRgb('#7f1d1d'),
  // Orange
  'orange-50': hexToRgb('#fff7ed'), 'orange-100': hexToRgb('#ffedd5'),
  'orange-300': hexToRgb('#fdba74'), 'orange-400': hexToRgb('#fb923c'),
  'orange-500': hexToRgb('#f97316'), 'orange-600': hexToRgb('#ea580c'),
  'orange-700': hexToRgb('#c2410c'), 'orange-800': hexToRgb('#9a3412'),
  // Amber / Yellow
  'amber-300': hexToRgb('#fcd34d'), 'amber-400': hexToRgb('#fbbf24'),
  'amber-500': hexToRgb('#f59e0b'), 'amber-600': hexToRgb('#d97706'),
  'yellow-50': hexToRgb('#fefce8'), 'yellow-200': hexToRgb('#fef08a'),
  'yellow-300': hexToRgb('#fde047'), 'yellow-400': hexToRgb('#facc15'),
  'yellow-500': hexToRgb('#eab308'), 'yellow-600': hexToRgb('#ca8a04'),
  // Green / Emerald / Teal
  'green-50': hexToRgb('#f0fdf4'), 'green-100': hexToRgb('#dcfce7'),
  'green-200': hexToRgb('#bbf7d0'), 'green-300': hexToRgb('#86efac'),
  'green-400': hexToRgb('#4ade80'), 'green-500': hexToRgb('#22c55e'),
  'green-600': hexToRgb('#16a34a'), 'green-700': hexToRgb('#15803d'),
  'green-800': hexToRgb('#166534'), 'green-900': hexToRgb('#14532d'),
  'emerald-400': hexToRgb('#34d399'), 'emerald-500': hexToRgb('#10b981'),
  'emerald-600': hexToRgb('#059669'), 'emerald-700': hexToRgb('#047857'),
  'teal-300': hexToRgb('#5eead4'), 'teal-400': hexToRgb('#2dd4bf'),
  'teal-500': hexToRgb('#14b8a6'), 'teal-600': hexToRgb('#0d9488'),
  'teal-700': hexToRgb('#0f766e'),
  // Cyan / Sky / Blue
  'cyan-300': hexToRgb('#67e8f9'), 'cyan-400': hexToRgb('#22d3ee'),
  'cyan-500': hexToRgb('#06b6d4'), 'cyan-600': hexToRgb('#0891b2'),
  'sky-300': hexToRgb('#7dd3fc'), 'sky-400': hexToRgb('#38bdf8'),
  'sky-500': hexToRgb('#0ea5e9'), 'sky-600': hexToRgb('#0284c7'),
  'blue-50': hexToRgb('#eff6ff'), 'blue-100': hexToRgb('#dbeafe'),
  'blue-200': hexToRgb('#bfdbfe'), 'blue-300': hexToRgb('#93c5fd'),
  'blue-400': hexToRgb('#60a5fa'), 'blue-500': hexToRgb('#3b82f6'),
  'blue-600': hexToRgb('#2563eb'), 'blue-700': hexToRgb('#1d4ed8'),
  'blue-800': hexToRgb('#1e40af'), 'blue-900': hexToRgb('#1e3a8a'),
  // Indigo / Violet / Purple
  'indigo-300': hexToRgb('#a5b4fc'), 'indigo-400': hexToRgb('#818cf8'),
  'indigo-500': hexToRgb('#6366f1'), 'indigo-600': hexToRgb('#4f46e5'),
  'indigo-700': hexToRgb('#4338ca'), 'indigo-800': hexToRgb('#3730a3'),
  'violet-300': hexToRgb('#c4b5fd'), 'violet-400': hexToRgb('#a78bfa'),
  'violet-500': hexToRgb('#8b5cf6'), 'violet-600': hexToRgb('#7c3aed'),
  'purple-300': hexToRgb('#d8b4fe'), 'purple-400': hexToRgb('#c084fc'),
  'purple-500': hexToRgb('#a855f7'), 'purple-600': hexToRgb('#9333ea'),
  'purple-700': hexToRgb('#7e22ce'), 'purple-800': hexToRgb('#6b21a8'),
  // Pink / Rose
  'pink-100': hexToRgb('#fce7f3'), 'pink-200': hexToRgb('#fbcfe8'),
  'pink-300': hexToRgb('#f9a8d4'), 'pink-400': hexToRgb('#f472b6'),
  'pink-500': hexToRgb('#ec4899'), 'pink-600': hexToRgb('#db2777'),
  'rose-300': hexToRgb('#fda4af'), 'rose-400': hexToRgb('#fb7185'),
  'rose-500': hexToRgb('#f43f5e'), 'rose-600': hexToRgb('#e11d48'),
};

// ══════════════════════════════════════════════════════════════
// FONT LOADER
// ══════════════════════════════════════════════════════════════
async function loadFonts(): Promise<void> {
  const fonts: FontName[] = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'SemiBold' },
    { family: 'Inter', style: 'Bold' }
  ];
  await Promise.all(fonts.map(f => figma.loadFontAsync(f).catch(() => {})));
}

async function safeLoadFont(fontName: FontName): Promise<FontName> {
  try {
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch (e) {
    const fallback: FontName = { family: 'Inter', style: 'Regular' };
    try {
      await figma.loadFontAsync(fallback);
      return fallback;
    } catch (e2) {
      return fallback;
    }
  }
}

// ══════════════════════════════════════════════════════════════
// LOCAL FIGMA STYLES (Color + Text)
// ══════════════════════════════════════════════════════════════
async function createColorStyles(): Promise<void> {
  const palette: Record<string, string> = {
    'Primary/Deep Blue':   '#0D3B66',
    'Primary/Accent Blue': '#4A90E2',
    'Background/App':      '#F4F6F9',
    'Background/Card':     '#FFFFFF',
    'Text/Primary':        '#1F2937',
    'Text/Body':           '#2D3748',
    'Text/Caption':        '#6B7280',
    'State/Alert Red':     '#EF4444',
    'State/Success Green': '#22C55E',
    'State/Warning':       '#F59E0B',
  };
  for (const [name, hex] of Object.entries(palette)) {
    try {
      const existing = figma.getLocalPaintStyles().find(s => s.name === name);
      if (!existing) {
        const style = figma.createPaintStyle();
        style.name = name;
        style.paints = [{ type: 'SOLID', color: hexToRgb(hex) }];
      }
    } catch (_) { /* skip */ }
  }
}

async function createTextStyles(): Promise<void> {
  const styles = [
    { name: 'Heading/H1',      size: 20, style: 'Bold',    color: '#1F2937' },
    { name: 'Heading/H2',      size: 16, style: 'Medium',  color: '#1F2937' },
    { name: 'Heading/H3',      size: 14, style: 'Medium',  color: '#1F2937' },
    { name: 'Body/Regular',    size: 14, style: 'Regular', color: '#2D3748' },
    { name: 'Caption/Default', size: 12, style: 'Light',   color: '#6B7280' },
    { name: 'Button/Label',    size: 14, style: 'Medium',  color: '#FFFFFF' },
  ];
  for (const s of styles) {
    try {
      const existing = figma.getLocalTextStyles().find(ts => ts.name === s.name);
      if (!existing) {
        const style = figma.createTextStyle();
        style.name = s.name;
        style.fontSize = s.size;
        try { style.fontName = { family: 'Inter', style: s.style }; }
        catch (_) { style.fontName = { family: 'Inter', style: 'Regular' }; }
        // Note: TextStyle fills not supported in this API version
      }
    } catch (_) { /* skip */ }
  }
}

// ══════════════════════════════════════════════════════════════
// INLINE STYLE → FIGMA APPLICATOR
// ══════════════════════════════════════════════════════════════
function parseColor(val: string | number): RGB | null {
  if (typeof val !== 'string') return null;
  val = val.trim();
  // Hex color
  const hex = val.match(/^#([0-9a-fA-F]{3,6})$/);
  if (hex) return hexToRgb('#' + hex[1]);
  // rgb(r,g,b) or rgba(r,g,b,a)
  const rgb = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) return { r: parseInt(rgb[1])/255, g: parseInt(rgb[2])/255, b: parseInt(rgb[3])/255 };
  return null;
}

function applyInlineStyle(node: FrameNode, style: Record<string, string | number>): void {
  if (!style || !Object.keys(style).length) return;

  // Background color
  const bg = style['backgroundColor'];
  if (bg) {
    const c = parseColor(String(bg));
    if (c) node.fills = [{ type: 'SOLID', color: c }];
  }

  // Border radius (all variants)
  const br = style['borderRadius'];
  if (br !== undefined) {
    try { node.cornerRadius = typeof br === 'number' ? br : parseFloat(String(br)); } catch(_) {}
  }
  // Individual corner radii — Figma needs cornerRadius first
  const tl = style['borderTopLeftRadius'];    if (tl !== undefined) try { (node as any).topLeftRadius    = typeof tl === 'number' ? tl : parseFloat(String(tl)); } catch(_) {}
  const tr = style['borderTopRightRadius'];   if (tr !== undefined) try { (node as any).topRightRadius   = typeof tr === 'number' ? tr : parseFloat(String(tr)); } catch(_) {}
  const bl = style['borderBottomLeftRadius']; if (bl !== undefined) try { (node as any).bottomLeftRadius  = typeof bl === 'number' ? bl : parseFloat(String(bl)); } catch(_) {}
  const bbb = style['borderBottomRightRadius'];if (bbb !== undefined) try { (node as any).bottomRightRadius = typeof bbb === 'number' ? bbb : parseFloat(String(bbb)); } catch(_) {}

  // Width / Height
  const w = style['width'];  if (w !== undefined && typeof w === 'number') { try { node.resize(Math.max(w, 4), Math.max(node.height, 4)); } catch(_) {} }
  const h = style['height']; if (h !== undefined && typeof h === 'number') { try { node.resize(Math.max(node.width, 4), Math.max(h, 4)); node.primaryAxisSizingMode = 'FIXED'; } catch(_) {} }

  // Min height
  const mh = style['minHeight']; if (mh !== undefined && typeof mh === 'number') { try { if (node.height < mh) node.resize(Math.max(node.width, 4), mh); } catch(_) {} }

  // Padding
  const p  = style['padding'];        if (p  !== undefined && typeof p  === 'number') { node.paddingTop = node.paddingBottom = node.paddingLeft = node.paddingRight = p; }
  const px = style['paddingLeft'];    if (px !== undefined && typeof px === 'number') { node.paddingLeft = px; }
  const pr = style['paddingRight'];   if (pr !== undefined && typeof pr === 'number') { node.paddingRight = pr; }
  const pt = style['paddingTop'];     if (pt !== undefined && typeof pt === 'number') { node.paddingTop = pt; }
  const pb = style['paddingBottom'];  if (pb !== undefined && typeof pb === 'number') { node.paddingBottom = pb; }

  // Gap / margin (approximate with itemSpacing)
  const gap = style['gap']; if (gap !== undefined && typeof gap === 'number') { node.itemSpacing = gap; }

  // Border / stroke
  const borderColor = style['borderColor'];
  const border = style['border'];  // e.g. "1px solid #EEF1F5"
  if (borderColor) {
    const c = parseColor(String(borderColor));
    if (c) { node.strokes = [{ type: 'SOLID', color: c }]; node.strokeWeight = 1; node.strokeAlign = 'INSIDE'; }
  } else if (border && typeof border === 'string') {
    const bm = border.match(/#[0-9a-fA-F]{3,6}/);
    if (bm) {
      const c = parseColor(bm[0]);
      if (c) { node.strokes = [{ type: 'SOLID', color: c }]; node.strokeWeight = 1; node.strokeAlign = 'INSIDE'; }
    }
  }

  // Box shadow → drop shadow effect
  const shadow = style['boxShadow'];
  if (shadow && typeof shadow === 'string') {
    // Parse simple box-shadow: Xpx Ypx Bpx rgba(...)
    const sm = shadow.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (sm) {
      node.effects = [{
        type: 'DROP_SHADOW',
        color: { r: parseInt(sm[4])/255, g: parseInt(sm[5])/255, b: parseInt(sm[6])/255, a: parseFloat(sm[7]) },
        offset: { x: parseFloat(sm[1]), y: parseFloat(sm[2]) },
        radius: parseFloat(sm[3]),
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      }];
    }
  }

  // Opacity
  const op = style['opacity']; if (op !== undefined) { node.opacity = typeof op === 'number' ? op : parseFloat(String(op)); }
}

function applyInlineTextStyle(t: TextNode, style: Record<string, string | number>): void {
  if (!style || !Object.keys(style).length) return;

  const fs = style['fontSize'];
  if (fs !== undefined) t.fontSize = typeof fs === 'number' ? fs : parseFloat(String(fs));

  const fw = style['fontWeight'];
  if (fw !== undefined) {
    const w = typeof fw === 'number' ? fw : parseFloat(String(fw));
    try {
      if (w >= 700)       t.fontName = { family: 'Inter', style: 'Bold' };
      else if (w >= 600)  t.fontName = { family: 'Inter', style: 'SemiBold' };
      else if (w >= 500)  t.fontName = { family: 'Inter', style: 'Medium' };
      else if (w >= 300)  t.fontName = { family: 'Inter', style: 'Light' };
      else                t.fontName = { family: 'Inter', style: 'Regular' };
    } catch(_) {}
  }

  const color = style['color'];
  if (color) {
    const c = parseColor(String(color));
    if (c) t.fills = [{ type: 'SOLID', color: c }];
  }

  const lh = style['lineHeight'];
  if (lh !== undefined && typeof lh === 'number') {
    try { t.lineHeight = { unit: 'PIXELS', value: lh }; } catch(_) {}
  } else if (lh !== undefined && typeof lh === 'number' && lh <= 3) {
    // Ratio like 1.5
    try { t.lineHeight = { unit: 'PERCENT', value: lh * 100 }; } catch(_) {}
  }

  const ta = style['textAlign'];
  if (ta === 'center') t.textAlignHorizontal = 'CENTER';
  else if (ta === 'right') t.textAlignHorizontal = 'RIGHT';
}

// ══════════════════════════════════════════════════════════════
// COLOR RESOLVER (handles arbitrary values too)
// ══════════════════════════════════════════════════════════════
function resolveColor(classes: string[], prefix: string): RGB | null {
  for (const cls of classes) {
    if (!cls.startsWith(prefix + '-')) continue;
    const key = cls.slice(prefix.length + 1);
    // Arbitrary hex: bg-[#0D3B66]
    const arb = key.match(/^\[#([0-9a-fA-F]{3,6})\]$/);
    if (arb) return hexToRgb('#' + arb[1]);
    // Arbitrary rgb: bg-[rgb(13,59,102)]
    if (COLORS[key]) return COLORS[key];
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// TAILWIND → FIGMA STYLE APPLICATOR (Container)
// ══════════════════════════════════════════════════════════════
function applyContainerStyles(frame: FrameNode, classes: string[], tag: string): void {
  if (!classes.length && frame.parent?.type === 'FRAME' && frame.parent.layoutMode === 'VERTICAL') {
     try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {}
     return;
  }
  const cs = new Set(classes);

  // ── Background ──
  frame.fills = [];
  const bgColor = resolveColor(classes, 'bg');
  if (bgColor && !cs.has('bg-transparent')) {
    frame.fills = [{ type: 'SOLID', color: bgColor }];
  }

  // ── Default HTML Layout ──
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  
  if (tag !== 'span' && tag !== 'a' && tag !== 'i' && tag !== 'strong' && frame.parent?.type === 'FRAME' && frame.parent.layoutMode === 'VERTICAL') {
     try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {}
  }

  // ── Smart Component Defaults (Fallbacks for unresolved tags) ──
  const tLower = tag.toLowerCase();
  if (tLower === 'row' || tLower.includes('hstack')) {
    frame.layoutMode = 'HORIZONTAL';
  } else if (tLower === 'column' || tLower.includes('vstack')) {
    frame.layoutMode = 'VERTICAL';
  } else if (tLower.includes('card')) {
    if (frame.fills.length === 0) frame.fills = [{ type: 'SOLID', color: {r:1, g:1, b:1} }];
    if (!frame.cornerRadius) frame.cornerRadius = 12;
    if (!frame.strokes || frame.strokes.length === 0) {
       frame.strokes = [{ type: 'SOLID', color: {r:0.9, g:0.9, b:0.9} }];
       frame.strokeWeight = 1;
    }
  } else if (tLower.includes('button') || tLower.includes('btn')) {
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    if (frame.fills.length === 0) frame.fills = [{ type: 'SOLID', color: {r:0.05, g:0.09, b:0.16} }];
    if (!frame.cornerRadius) frame.cornerRadius = 6;
    if (frame.paddingLeft === 0) {
      frame.paddingLeft = 16; frame.paddingRight = 16;
      frame.paddingTop = 8; frame.paddingBottom = 8;
    }
    try { frame.layoutSizingHorizontal = 'HUG'; } catch(e) {}
  } else if (tLower === 'input' || tLower.includes('textfield')) {
    if (frame.fills.length === 0) frame.fills = [{ type: 'SOLID', color: {r:1, g:1, b:1} }];
    if (!frame.cornerRadius) frame.cornerRadius = 6;
    if (!frame.strokes || frame.strokes.length === 0) {
       frame.strokes = [{ type: 'SOLID', color: {r:0.88, g:0.9, b:0.94} }];
       frame.strokeWeight = 1;
    }
    try { frame.resize(frame.width, Math.max(frame.height, 40)); } catch(e) {}
    try { frame.layoutSizingVertical = 'FIXED'; } catch(e) {}
  } else if (/^[A-Z]/.test(tag) && frame.fills.length === 0 && !cs.has('flex') && !cs.has('grid')) {
    // Unresolved icon or unknown generic component
    try { frame.layoutSizingHorizontal = 'HUG'; } catch(e) {}
    try { frame.layoutSizingVertical = 'HUG'; } catch(e) {}
  }

  // ── Flex Layout ──
  const isFlex = cs.has('flex') || cs.has('inline-flex');
  const isGrid = cs.has('grid') || cs.has('inline-grid');
  if (isFlex || isGrid) {
    frame.layoutMode = cs.has('flex-col') || cs.has('flex-column') ? 'VERTICAL' : 'HORIZONTAL';
    if (isGrid || cs.has('flex-wrap')) { try { frame.layoutWrap = 'WRAP'; } catch (_) {} }
    // if flex horizontal, child width is based on flex rules, but we leave it AUTO for now
  }

  // ── Positioning ──
  if (cs.has('absolute') || cs.has('fixed')) {
    try { frame.layoutPositioning = 'ABSOLUTE'; } catch(e) {}
  }

  // ── Alignment ──
  if (cs.has('items-center'))  frame.counterAxisAlignItems = 'CENTER';
  else if (cs.has('items-end')) frame.counterAxisAlignItems = 'MAX';
  else if (cs.has('items-start')) frame.counterAxisAlignItems = 'MIN';
  if (cs.has('justify-center'))  frame.primaryAxisAlignItems = 'CENTER';
  else if (cs.has('justify-end')) frame.primaryAxisAlignItems = 'MAX';
  else if (cs.has('justify-between')) frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
  else if (cs.has('justify-around')) frame.primaryAxisAlignItems = 'SPACE_BETWEEN';

  // ── Width ──
  if (cs.has('w-full') || cs.has('w-screen')) {
    try { frame.layoutSizingHorizontal = 'FILL'; } catch (_) {}
  } else if (cs.has('w-auto')) {
    try { frame.layoutSizingHorizontal = 'HUG'; } catch (_) {}
  } else {
    for (const c of classes) {
      const wm = c.match(/^w-(\d+(?:\.\d+)?)$/);
      if (wm) { try { frame.resize(getSpacing(wm[1]) * 4, Math.max(frame.height, 4)); } catch(_) {} }
      const wf = c.match(/^w-(\d+)\/(\d+)$/);
      if (wf) { try { frame.resize(Math.round(375 * parseInt(wf[1]) / parseInt(wf[2])), Math.max(frame.height, 4)); } catch(_) {} }
      const wa = c.match(/^w-\[(\d+)(?:px)?\]$/);
      if (wa) { try { frame.resize(parseInt(wa[1]), Math.max(frame.height, 4)); } catch(_) {} }
    }
  }

  // ── Height ──
  if (cs.has('h-full') || cs.has('h-screen')) {
    try { frame.layoutSizingVertical = 'FILL'; } catch (_) {}
  } else if (cs.has('h-auto')) {
    try { frame.layoutSizingVertical = 'HUG'; } catch (_) {}
  } else {
    for (const c of classes) {
      const hm = c.match(/^h-(\d+(?:\.\d+)?)$/);
      if (hm) { try { frame.resize(Math.max(frame.width, 4), getSpacing(hm[1]) * 4); } catch(_) {} }
      const ha = c.match(/^h-\[(\d+)(?:px)?\]$/);
      if (ha) { try { frame.resize(Math.max(frame.width, 4), parseInt(ha[1])); } catch(_) {} }
    }
  }

  // ── Padding ──
  for (const c of classes) {
    const p  = c.match(/^p-(.+)$/);   if (p)  { const v = getSpacing(p[1]);  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = v; continue; }
    const px = c.match(/^px-(.+)$/);  if (px) { const v = getSpacing(px[1]); frame.paddingLeft = frame.paddingRight = v; continue; }
    const py = c.match(/^py-(.+)$/);  if (py) { const v = getSpacing(py[1]); frame.paddingTop = frame.paddingBottom = v; continue; }
    const pt = c.match(/^pt-(.+)$/);  if (pt) { frame.paddingTop    = getSpacing(pt[1]); continue; }
    const pb = c.match(/^pb-(.+)$/);  if (pb) { frame.paddingBottom = getSpacing(pb[1]); continue; }
    const pl = c.match(/^pl-(.+)$/);  if (pl) { frame.paddingLeft   = getSpacing(pl[1]); continue; }
    const pr = c.match(/^pr-(.+)$/);  if (pr) { frame.paddingRight  = getSpacing(pr[1]); continue; }
  }

  // ── Gap ──
  for (const c of classes) {
    const g  = c.match(/^gap-(.+)$/);   if (g)  { frame.itemSpacing = getSpacing(g[1]); continue; }
    const gx = c.match(/^gap-x-(.+)$/); if (gx && frame.layoutMode === 'HORIZONTAL') { frame.itemSpacing = getSpacing(gx[1]); continue; }
    const gy = c.match(/^gap-y-(.+)$/); if (gy && frame.layoutMode === 'VERTICAL')   { frame.itemSpacing = getSpacing(gy[1]); continue; }
    const sp = c.match(/^space-(?:x|y)-(.+)$/); if (sp) { frame.itemSpacing = getSpacing(sp[1]); continue; }
  }

  // ── Border Radius ──
  for (const c of classes) {
    if (c === 'rounded') { frame.cornerRadius = 4; continue; }
    const rm = c.match(/^rounded-(.+)$/); if (rm) { try { frame.cornerRadius = getBorderRadius(rm[1]); } catch(_) {} continue; }
  }

  // ── Drop Shadow / Effects ──
  const effects: Effect[] = [];
  if (cs.has('shadow-sm'))
    effects.push({ type: 'DROP_SHADOW', color: {r:0,g:0,b:0,a:0.05}, offset:{x:0,y:1}, radius:2,  spread:0, visible:true, blendMode:'NORMAL' });
  else if (cs.has('shadow-md'))
    effects.push({ type: 'DROP_SHADOW', color: {r:0,g:0,b:0,a:0.10}, offset:{x:0,y:4}, radius:12, spread:0, visible:true, blendMode:'NORMAL' });
  else if (cs.has('shadow-lg'))
    effects.push({ type: 'DROP_SHADOW', color: {r:0,g:0,b:0,a:0.15}, offset:{x:0,y:8}, radius:20, spread:0, visible:true, blendMode:'NORMAL' });
  else if (cs.has('shadow-xl'))
    effects.push({ type: 'DROP_SHADOW', color: {r:0,g:0,b:0,a:0.20}, offset:{x:0,y:12},radius:28, spread:0, visible:true, blendMode:'NORMAL' });
  else if (cs.has('shadow'))
    effects.push({ type: 'DROP_SHADOW', color: {r:0,g:0,b:0,a:0.08}, offset:{x:0,y:4}, radius:12, spread:0, visible:true, blendMode:'NORMAL' });
  if (effects.length) frame.effects = effects;

  // ── Opacity ──
  for (const c of classes) {
    const om = c.match(/^opacity-(\d+)$/);
    if (om) { frame.opacity = parseInt(om[1]) / 100; break; }
  }

  // ── Border (Stroke) ──
  const borderColor = resolveColor(classes, 'border');
  if (borderColor) {
    frame.strokes = [{ type: 'SOLID', color: borderColor }];
    let sw = 1;
    for (const c of classes) {
      if (c === 'border-2') { sw = 2; break; }
      if (c === 'border-4') { sw = 4; break; }
    }
    frame.strokeWeight = sw;
    frame.strokeAlign = 'INSIDE';
  }

  // ── Overflow Hidden ──
  if (cs.has('overflow-hidden')) frame.clipsContent = true;
}

// ══════════════════════════════════════════════════════════════
// TAILWIND → FIGMA STYLE APPLICATOR (Text)
// ══════════════════════════════════════════════════════════════
function applyTextStyles(t: TextNode, classes: string[]): void {
  const cs = new Set(classes);

  // Font size
  for (const c of classes) {
    const sm = c.match(/^text-(.+)$/);
    if (sm) {
      const size = getTextSize(sm[1]);
      if (Object.keys({xs:1,sm:1,base:1,lg:1,xl:1,'2xl':1,'3xl':1,'4xl':1,'5xl':1,'6xl':1,'7xl':1}).includes(sm[1]) || sm[1].startsWith('[')) {
        t.fontSize = size; break;
      }
    }
  }

  // Font weight / style
  try {
    if (cs.has('font-black') || cs.has('font-extrabold') || cs.has('font-bold'))
      t.fontName = { family: 'Inter', style: 'Bold' };
    else if (cs.has('font-semibold'))
      t.fontName = { family: 'Inter', style: 'SemiBold' };
    else if (cs.has('font-medium'))
      t.fontName = { family: 'Inter', style: 'Medium' };
    else if (cs.has('font-light') || cs.has('font-thin') || cs.has('font-extralight'))
      t.fontName = { family: 'Inter', style: 'Light' };
    else
      t.fontName = { family: 'Inter', style: 'Regular' };
  } catch (_) {
    try { t.fontName = { family: 'Inter', style: 'Regular' }; } catch (_2) {}
  }

  // Text color
  const textColor = resolveColor(classes, 'text');
  if (textColor) {
    t.fills = [{ type: 'SOLID', color: textColor }];
  } else {
    t.fills = [{ type: 'SOLID', color: { r: 0.122, g: 0.161, b: 0.216 } }]; // default #1F2937
  }

  // Alignment
  if (cs.has('text-center'))        t.textAlignHorizontal = 'CENTER';
  else if (cs.has('text-right'))    t.textAlignHorizontal = 'RIGHT';
  else if (cs.has('text-justify'))  t.textAlignHorizontal = 'JUSTIFIED';

  // Line height
  if (cs.has('leading-none'))   t.lineHeight = { unit: 'PERCENT', value: 100 };
  if (cs.has('leading-tight'))  t.lineHeight = { unit: 'PERCENT', value: 125 };
  if (cs.has('leading-snug'))   t.lineHeight = { unit: 'PERCENT', value: 137 };
  if (cs.has('leading-normal')) t.lineHeight = { unit: 'PERCENT', value: 150 };
  if (cs.has('leading-relaxed'))t.lineHeight = { unit: 'PERCENT', value: 162 };
  if (cs.has('leading-loose'))  t.lineHeight = { unit: 'PERCENT', value: 200 };

  // Truncation
  if (cs.has('truncate') || cs.has('text-ellipsis')) {
    try { t.textTruncation = 'ENDING'; } catch (_) {}
  }

  // Width fill
  if (cs.has('w-full')) {
    try { t.layoutSizingHorizontal = 'FILL'; } catch (_) {}
  }
}

// ══════════════════════════════════════════════════════════════
// LAYER NAME GENERATOR
// ══════════════════════════════════════════════════════════════
function layerName(node: ParsedNode): string {
  const cs = node.classes;
  if (node.tag === 'nav' || cs.some(c => c.includes('nav')))       return '🧭 Navigation';
  if (node.tag === 'header' || cs.some(c => c === 'header'))       return '🔵 Header';
  if (node.tag === 'footer' || cs.some(c => c === 'footer'))       return '🔲 Footer';
  if (cs.some(c => c.includes('progress')))                         return '📊 Progress Bar';
  if (cs.some(c => c.includes('card')))                             return '🗂 Card';
  if (cs.some(c => c.includes('badge')))                            return '🏷 Badge';
  if (cs.some(c => c.includes('modal') || c.includes('dialog')))   return '🪟 Modal';
  if (cs.some(c => c.includes('avatar') || c.includes('profile'))) return '👤 Avatar';
  if (node.tag === 'button' || cs.some(c => c.includes('btn')))    return '🔘 Button';
  if (node.tag === 'input' || cs.some(c => c.includes('input')))   return '✏️ Input Field';
  if (cs.some(c => c.includes('search')))                           return '🔍 Search Bar';
  if (cs.some(c => c.includes('list') || c.includes('feed')))      return '📋 List';
  if (cs.some(c => c.includes('tab')))                              return '📑 Tab';
  if (cs.some(c => c.includes('skeleton')))                         return '💀 Skeleton';
  if (node.tag === 'section' || node.tag === 'article')             return '📦 Section';
  if (node.tag === 'main')                                          return '📄 Content';
  if (cs.includes('flex') && cs.includes('flex-col'))               return '📐 Column';
  if (cs.includes('flex'))                                           return '📏 Row';
  const first = cs[0] ? '.' + cs[0] : '';
  return `${node.tag}${first}`;
}

// ══════════════════════════════════════════════════════════════
// PROGRESS BAR DETECTOR
// ══════════════════════════════════════════════════════════════
function isProgressBar(node: ParsedNode): boolean {
  const allClasses = node.classes.join(' ');
  return allClasses.includes('progress') || (
    node.classes.some(c => c.startsWith('w-[') && c.includes('%')) &&
    node.classes.some(c => c.startsWith('bg-') && (c.includes('blue') || c.includes('green') || c.includes('accent')))
  );
}

// ══════════════════════════════════════════════════════════════
// NODE BUILDER (Recursive)
// ══════════════════════════════════════════════════════════════
const TEXT_TAGS = new Set(['p','span','h1','h2','h3','h4','h5','h6','label','strong','em','small','a','li','td','th','caption','figcaption','legend','blockquote','time','code','pre','mark','b','i','u','abbr','cite','dt','dd']);
const SKIP_TAGS = new Set(['script','style','link','meta','head','title','noscript','template','slot','svg','path','circle','rect','polygon','polyline','line','ellipse','use','defs','g','symbol']);
const INLINE_TAGS = new Set(['span','strong','em','b','i','u','mark','small','abbr','code','time','cite','a']);

async function buildNode(node: ParsedNode, parent: FrameNode, depth: number = 0): Promise<void> {
  if (depth > 18) return;
  if (SKIP_TAGS.has(node.tag)) return;
  if (!node.tag) return;

  const cs = new Set(node.classes);
  const hasChildren = node.children.length > 0;
  const hasText = node.text.trim().length > 0;

  // ── PROGRESS BAR ──────────────────────────────────────────
  if (isProgressBar(node)) {
    const track = figma.createFrame();
    track.name = '📊 Progress Bar';
    track.fills = [{ type: 'SOLID', color: hexToRgb('#E5E7EB') }];
    track.resize(cs.has('w-full') ? 300 : 200, 8);
    track.cornerRadius = 9999;
    track.layoutMode = 'HORIZONTAL';
    track.clipsContent = true;

    let pct = 65;
    for (const c of node.classes) {
      const pm = c.match(/^w-\[(\d+)%\]$/); if (pm) { pct = parseInt(pm[1]); break; }
    }

    const fill = figma.createRectangle();
    fill.name = `${pct}% fill`;
    fill.resize(Math.round(track.width * pct / 100), 8);
    fill.cornerRadius = 9999;
    const bgColor = resolveColor(node.classes, 'bg');
    fill.fills = [{ type: 'SOLID', color: bgColor ?? hexToRgb('#4A90E2') }];

    track.appendChild(fill);
    if (cs.has('w-full')) { try { track.layoutSizingHorizontal = 'FILL'; } catch(_) {} }
    parent.appendChild(track);
    return;
  }

  // ── IMAGE PLACEHOLDER ─────────────────────────────────────
  if (['img', 'image', 'video', 'figure'].includes(node.tag) ||
      (node.tag === 'div' && (cs.has('aspect-video') || cs.has('aspect-square') || node.attrs['src']))) {
    const imgFrame = figma.createFrame();
    imgFrame.name = '🖼 ' + (node.attrs['alt'] || node.attrs['src']?.split('/').pop()?.split('?')[0] || 'Image');
    imgFrame.fills = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 } }];
    imgFrame.layoutMode = 'VERTICAL';
    imgFrame.primaryAxisAlignItems = 'CENTER';
    imgFrame.counterAxisAlignItems = 'CENTER';

    let w = 120, h = 90;
    for (const c of node.classes) {
      const wm = c.match(/^w-(\d+)$/); if (wm) w = getSpacing(wm[1]) * 4;
      const hm = c.match(/^h-(\d+)$/); if (hm) h = getSpacing(hm[1]) * 4;
      const wa = c.match(/^w-\[(\d+)(?:px)?\]$/); if (wa) w = parseInt(wa[1]);
      const ha = c.match(/^h-\[(\d+)(?:px)?\]$/); if (ha) h = parseInt(ha[1]);
    }
    if (cs.has('aspect-video')) h = Math.round(w * 9 / 16);
    if (cs.has('aspect-square')) h = w;
    imgFrame.resize(Math.max(w, 8), Math.max(h, 8));
    if (cs.has('w-full')) { try { imgFrame.layoutSizingHorizontal = 'FILL'; } catch(_) {} }
    if (cs.has('rounded-full')) imgFrame.cornerRadius = 9999;
    else if (cs.has('rounded-xl') || cs.has('rounded-2xl') || cs.has('rounded-3xl')) imgFrame.cornerRadius = 16;
    else if (cs.has('rounded-lg')) imgFrame.cornerRadius = 8;
    else if (cs.has('rounded-md')) imgFrame.cornerRadius = 6;
    else if (cs.has('rounded')) imgFrame.cornerRadius = 4;

    // Add grey icon placeholder text
    const icon = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    icon.characters = '🖼';
    icon.fontSize = 24;
    imgFrame.appendChild(icon);

    parent.appendChild(imgFrame);
    return;
  }

  // ── ICON PLACEHOLDER ──────────────────────────────────────
  if (node.isIcon) {
    const iconFrame = figma.createFrame();
    const sizeVal = node.inlineStyle?.['width'] ?? node.inlineStyle?.['size'] ?? 20;
    const iconSize = typeof sizeVal === 'number' ? sizeVal : 20;
    iconFrame.name = `🔷 ${node.tag}`;
    iconFrame.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.65 } }];
    iconFrame.cornerRadius = 2;
    try { iconFrame.resize(iconSize, iconSize); } catch(_) { try { iconFrame.resize(20, 20); } catch(_2) {} }
    try { iconFrame.layoutSizingHorizontal = 'HUG'; } catch(_) {}
    try { iconFrame.layoutSizingVertical = 'HUG'; } catch(_) {}
    parent.appendChild(iconFrame);
    return;
  }

  // ── PURE TEXT NODE (text tag, no children) ────────────────
  const isTextTag = TEXT_TAGS.has(node.tag);
  if (isTextTag && !hasChildren && hasText) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const t = figma.createText();
    t.name = `📝 ${node.tag}: ${node.text.substring(0, 30)}`;
    t.characters = node.text.substring(0, 500);
    parent.appendChild(t);
    applyTextStyles(t, node.classes);
    if (node.inlineStyle) applyInlineTextStyle(t, node.inlineStyle);
    try { t.textAutoResize = 'HEIGHT'; } catch(_) {}
    if (!INLINE_TAGS.has(node.tag)) {
      try { t.layoutSizingHorizontal = 'FILL'; } catch(_) {}
    }
    return;
  }

  // ── CONTAINER FRAME ───────────────────────────────────────
  const frame = figma.createFrame();
  frame.name = layerName(node);
  frame.fills = [];
  frame.clipsContent = false;
  parent.appendChild(frame);

  // Apply layout + styling (Tailwind classes first, then inline style overrides)
  try {
    applyContainerStyles(frame, node.classes, node.tag);
    if (node.inlineStyle) applyInlineStyle(frame, node.inlineStyle);
  } catch (e: any) {
    pluginLog(`   │ ✗ Styling error on <${node.tag}>: ${e?.message || e}`, 'error');
  }

  // If this text tag has BOTH text and children, add text as first child
  if (hasText) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const t = figma.createText();
    t.characters = node.text.substring(0, 500);
    frame.appendChild(t);
    applyTextStyles(t, node.classes);
    if (node.inlineStyle) applyInlineTextStyle(t, node.inlineStyle);
    try { t.textAutoResize = 'HEIGHT'; } catch(_) {}
    if (!INLINE_TAGS.has(node.tag)) {
      try { t.layoutSizingHorizontal = 'FILL'; } catch(_) {}
    }
  }

  // Recurse into children
  for (const child of node.children) {
    try { await buildNode(child, frame, depth + 1); }
    catch (e: any) { 
      console.error('buildNode child error:', e); 
      pluginLog(`   │ ✗ Child build error at <${child?.tag}>: ${e?.message || e}`, 'error');
    }
  }

  // Ensure frames aren't invisible (0x0)
  if (frame.children.length === 0) {
    // Empty container — give it a minimum size so it's visible
    if (!hasText) {
      try {
        if (frame.width < 4 && frame.height < 4) {
          frame.resize(
            Math.max(frame.width, tLowerOrDefault(node.tag) === 'hr' ? 200 : 16),
            Math.max(frame.height, node.tag === 'hr' ? 1 : 16)
          );
        }
      } catch(_) {}
    }
    // Add a background if no fill set (makes empty containers visible)
    if (frame.fills.length === 0 && isVisualContainer(node.tag)) {
      frame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.97 }, opacity: 0.5 }];
    }
  }
}

function tLowerOrDefault(tag: string): string { return tag.toLowerCase(); }

function isVisualContainer(tag: string): boolean {
  return ['div','section','article','aside','header','footer','main','nav','ul','ol'].includes(tag);
}


// ══════════════════════════════════════════════════════════════
// PROTOTYPING CONNECTOR
// ══════════════════════════════════════════════════════════════
function connectPrototype(from: FrameNode, to: FrameNode, direction: 'LEFT' | 'RIGHT' = 'LEFT'): void {
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

function addPrototyping(frames: FrameNode[]): void {
  if (frames.length < 2) return;

  for (let i = 0; i < frames.length; i++) {
    const curr = frames[i];
    const next = frames[(i + 1) % frames.length];
    const prev = frames[(i - 1 + frames.length) % frames.length];

    // Try to find bottom nav within this frame for tab-by-tab connections
    const bottomNav = findBottomNav(curr);
    if (bottomNav && bottomNav.children.length > 0) {
      const navItems = Array.from(bottomNav.children);
      for (let j = 0; j < Math.min(navItems.length, frames.length); j++) {
        const target = frames[j];
        try {
          (navItems[j] as any).reactions = [{
            trigger: { type: 'ON_CLICK' },
            action: {
              type: 'NODE',
              destinationId: target.id,
              navigation: 'NAVIGATE',
              transition: {
                type: j > i ? 'MOVE_IN' : 'MOVE_OUT',
                direction: j > i ? 'LEFT' : 'RIGHT',
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

function findBottomNav(frame: FrameNode): FrameNode | null {
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

// ══════════════════════════════════════════════════════════════
// PHONE FRAME HELPERS
// Mirrors the PhoneFrame component: status bar + bottom nav
// ══════════════════════════════════════════════════════════════
async function addStatusBar(root: FrameNode): Promise<void> {
  // Status bar: 375 × 44, bg = #0D3B66, text "9:41"
  const bar = figma.createFrame();
  bar.name = '📶 Status Bar';
  bar.resize(375, 44);
  bar.fills = [{ type: 'SOLID', color: hexToRgb('#0D3B66') }];
  bar.layoutMode = 'HORIZONTAL';
  bar.primaryAxisSizingMode = 'FIXED';
  bar.counterAxisSizingMode = 'FIXED';
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
  iconsGroup.primaryAxisSizingMode = 'AUTO';
  iconsGroup.counterAxisSizingMode = 'AUTO';
  iconsGroup.counterAxisAlignItems = 'CENTER';
  iconsGroup.itemSpacing = 4;

  // Signal bars (4 rects of increasing height)
  const signalFrame = figma.createFrame();
  signalFrame.name = 'Signal';
  signalFrame.fills = [];
  signalFrame.resize(17, 11);
  signalFrame.layoutMode = 'HORIZONTAL';
  signalFrame.primaryAxisSizingMode = 'FIXED';
  signalFrame.counterAxisSizingMode = 'FIXED';
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
  battFrame.primaryAxisSizingMode = 'FIXED';
  battFrame.counterAxisSizingMode = 'FIXED';
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

async function addBottomNav(root: FrameNode): Promise<void> {
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
  nav.primaryAxisSizingMode = 'FIXED';
  nav.counterAxisSizingMode = 'FIXED';
  nav.counterAxisAlignItems = 'CENTER';
  nav.primaryAxisAlignItems = 'SPACE_BETWEEN';
  nav.primaryAxisAlignItems = 'SPACE_BETWEEN';

  const tabs = [
    { label: 'Beranda', active: true },
    { label: 'Materi', active: false },
    { label: 'Kuis', active: false },
    { label: 'Forum', active: false },
  ];

  for (const tab of tabs) {
    const tabFrame = figma.createFrame();
    tabFrame.name = tab.label;
    tabFrame.fills = [];
    tabFrame.layoutMode = 'VERTICAL';
    tabFrame.primaryAxisSizingMode = 'AUTO';
    tabFrame.counterAxisSizingMode = 'AUTO';
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

// ══════════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ══════════════════════════════════════════════════════════════
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

    for (let i = 0; i < screens.length; i++) {
      const screen = screens[i];
      const progress = 20 + Math.round((i / screens.length) * 65);
      figma.ui.postMessage({ type: 'status', text: `⚙️ Parsing: ${screen.name} (${i+1}/${screens.length})`, progress });

      // Root screen frame (375×812 — matching PhoneFrame exactly)
      const rootFrame = figma.createFrame();
      rootFrame.name = `📱 ${screen.name}`;
      rootFrame.x = startX + i * 400;
      rootFrame.y = startY;
      rootFrame.resize(375, 812);
      rootFrame.layoutMode = 'VERTICAL';
      rootFrame.primaryAxisSizingMode = 'FIXED';
      rootFrame.counterAxisSizingMode = 'FIXED';
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
      contentArea.primaryAxisSizingMode = 'FIXED';
      contentArea.counterAxisSizingMode = 'FIXED';
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
      await addBottomNav(rootFrame);

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
