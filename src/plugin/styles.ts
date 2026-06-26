import { ParsedNode, RGB } from './types';
import { pluginLog } from './index';

export async function loadFonts(): Promise<void> {
  const fonts: FontName[] = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'SemiBold' },
    { family: 'Inter', style: 'Bold' }
  ];
  await Promise.all(fonts.map(f => figma.loadFontAsync(f).catch(() => {})));
}

export const COLORS: Record<string, RGB> = {
  transparent: { r: 0, g: 0, b: 0 },
  current: { r: 0, g: 0, b: 0 },
  black: { r: 0, g: 0, b: 0 },
  white: { r: 1, g: 1, b: 1 },
  'slate-50': hexToRgb('#f8fafc')!, 'slate-100': hexToRgb('#f1f5f9')!, 'slate-200': hexToRgb('#e2e8f0')!,
  'slate-300': hexToRgb('#cbd5e1')!, 'slate-400': hexToRgb('#94a3b8')!, 'slate-500': hexToRgb('#64748b')!,
  'slate-600': hexToRgb('#475569')!, 'slate-700': hexToRgb('#334155')!, 'slate-800': hexToRgb('#1e293b')!,
  'slate-900': hexToRgb('#0f172a')!, 'gray-50': hexToRgb('#f9fafb')!, 'gray-100': hexToRgb('#f3f4f6')!,
  'gray-200': hexToRgb('#e5e7eb')!, 'gray-300': hexToRgb('#d1d5db')!, 'gray-400': hexToRgb('#9ca3af')!,
  'gray-500': hexToRgb('#6b7280')!, 'gray-600': hexToRgb('#4b5563')!, 'gray-700': hexToRgb('#374151')!,
  'gray-800': hexToRgb('#1f2937')!, 'gray-900': hexToRgb('#111827')!, 'zinc-50': hexToRgb('#fafafa')!,
  'zinc-100': hexToRgb('#f4f4f5')!, 'zinc-200': hexToRgb('#e4e4e7')!, 'zinc-300': hexToRgb('#d4d4d8')!,
  'zinc-400': hexToRgb('#a1a1aa')!, 'zinc-500': hexToRgb('#71717a')!, 'zinc-600': hexToRgb('#52525b')!,
  'zinc-700': hexToRgb('#3f3f46')!, 'zinc-800': hexToRgb('#27272a')!, 'zinc-900': hexToRgb('#18181b')!,
  'neutral-50': hexToRgb('#fafafa')!, 'neutral-100': hexToRgb('#f5f5f5')!, 'neutral-200': hexToRgb('#e5e5e5')!,
  'neutral-300': hexToRgb('#d4d4d4')!, 'neutral-400': hexToRgb('#a3a3a3')!, 'neutral-500': hexToRgb('#737373')!,
  'neutral-600': hexToRgb('#525252')!, 'neutral-700': hexToRgb('#404040')!, 'neutral-800': hexToRgb('#262626')!,
  'neutral-900': hexToRgb('#171717')!, 'stone-50': hexToRgb('#fafaf9')!, 'stone-100': hexToRgb('#f4f4f5')!,
  'stone-200': hexToRgb('#e4e4e7')!, 'stone-300': hexToRgb('#d4d4d8')!, 'stone-400': hexToRgb('#a1a1aa')!,
  'stone-500': hexToRgb('#71717a')!, 'stone-600': hexToRgb('#52525b')!, 'stone-700': hexToRgb('#3f3f46')!,
  'stone-800': hexToRgb('#27272a')!, 'stone-900': hexToRgb('#18181b')!, 'red-50': hexToRgb('#fef2f2')!,
  'red-100': hexToRgb('#fee2e2')!, 'red-200': hexToRgb('#fecaca')!, 'red-300': hexToRgb('#fca5a5')!,
  'red-400': hexToRgb('#f87171')!, 'red-500': hexToRgb('#ef4444')!, 'red-600': hexToRgb('#dc2626')!,
  'red-700': hexToRgb('#b91c1c')!, 'red-800': hexToRgb('#991b1b')!, 'red-900': hexToRgb('#7f1d1d')!,
  'orange-50': hexToRgb('#fff7ed')!, 'orange-100': hexToRgb('#ffedd5')!, 'orange-200': hexToRgb('#fed7aa')!,
  'orange-300': hexToRgb('#fdba74')!, 'orange-400': hexToRgb('#fb923c')!, 'orange-500': hexToRgb('#f97316')!,
  'orange-600': hexToRgb('#ea580c')!, 'orange-700': hexToRgb('#c2410c')!, 'orange-800': hexToRgb('#9a3412')!,
  'orange-900': hexToRgb('#7c2d12')!, 'amber-50': hexToRgb('#fffbeb')!, 'amber-100': hexToRgb('#fef3c7')!,
  'amber-200': hexToRgb('#fde68a')!, 'amber-300': hexToRgb('#fcd34d')!, 'amber-400': hexToRgb('#fbbf24')!,
  'amber-500': hexToRgb('#f59e0b')!, 'amber-600': hexToRgb('#d97706')!, 'amber-700': hexToRgb('#b45309')!,
  'amber-800': hexToRgb('#92400e')!, 'amber-900': hexToRgb('#78350f')!, 'yellow-50': hexToRgb('#fefce8')!,
  'yellow-100': hexToRgb('#fef9c3')!, 'yellow-200': hexToRgb('#fef08a')!, 'yellow-300': hexToRgb('#fde047')!,
  'yellow-400': hexToRgb('#facc15')!, 'yellow-500': hexToRgb('#eab308')!, 'yellow-600': hexToRgb('#ca8a04')!,
  'yellow-700': hexToRgb('#a16207')!, 'yellow-800': hexToRgb('#854d0e')!, 'yellow-900': hexToRgb('#713f12')!,
  'lime-50': hexToRgb('#f7fee7')!, 'lime-100': hexToRgb('#ecfccb')!, 'lime-200': hexToRgb('#d9f99d')!,
  'lime-300': hexToRgb('#bef264')!, 'lime-400': hexToRgb('#a3e635')!, 'lime-500': hexToRgb('#84cc16')!,
  'lime-600': hexToRgb('#65a30d')!, 'lime-700': hexToRgb('#4d7c0f')!, 'lime-800': hexToRgb('#3f6212')!,
  'lime-900': hexToRgb('#365314')!, 'green-50': hexToRgb('#f0fdf4')!, 'green-100': hexToRgb('#dcfce7')!,
  'green-200': hexToRgb('#bbf7d0')!, 'green-300': hexToRgb('#86efac')!, 'green-400': hexToRgb('#4ade80')!,
  'green-500': hexToRgb('#22c55e')!, 'green-600': hexToRgb('#16a34a')!, 'green-700': hexToRgb('#15803d')!,
  'green-800': hexToRgb('#166534')!, 'green-900': hexToRgb('#14532d')!, 'emerald-50': hexToRgb('#ecfdf5')!,
  'emerald-100': hexToRgb('#d1fae5')!, 'emerald-200': hexToRgb('#a7f3d0')!, 'emerald-300': hexToRgb('#6ee7b7')!,
  'emerald-400': hexToRgb('#34d399')!, 'emerald-500': hexToRgb('#10b981')!, 'emerald-600': hexToRgb('#059669')!,
  'emerald-700': hexToRgb('#047857')!, 'emerald-800': hexToRgb('#065f46')!, 'emerald-900': hexToRgb('#064e3b')!,
  'teal-50': hexToRgb('#f0fdfa')!, 'teal-100': hexToRgb('#ccfbf1')!, 'teal-200': hexToRgb('#99f6e4')!,
  'teal-300': hexToRgb('#5eead4')!, 'teal-400': hexToRgb('#2dd4bf')!, 'teal-500': hexToRgb('#14b8a6')!,
  'teal-600': hexToRgb('#0d9488')!, 'teal-700': hexToRgb('#0f766e')!, 'teal-800': hexToRgb('#115e59')!,
  'teal-900': hexToRgb('#134e4a')!, 'cyan-50': hexToRgb('#ecfeff')!, 'cyan-100': hexToRgb('#cffafe')!,
  'cyan-200': hexToRgb('#a5f3fc')!, 'cyan-300': hexToRgb('#67e8f9')!, 'cyan-400': hexToRgb('#22d3ee')!,
  'cyan-500': hexToRgb('#06b6d4')!, 'cyan-600': hexToRgb('#0891b2')!, 'cyan-700': hexToRgb('#0e7490')!,
  'cyan-800': hexToRgb('#155e75')!, 'cyan-900': hexToRgb('#164e63')!, 'sky-50': hexToRgb('#f0f9ff')!,
  'sky-100': hexToRgb('#e0f2fe')!, 'sky-200': hexToRgb('#bae6fd')!, 'sky-300': hexToRgb('#7dd3fc')!,
  'sky-400': hexToRgb('#38bdf8')!, 'sky-500': hexToRgb('#0ea5e9')!, 'sky-600': hexToRgb('#0284c7')!,
  'sky-700': hexToRgb('#0369a1')!, 'sky-800': hexToRgb('#075985')!, 'sky-900': hexToRgb('#0c4a6e')!,
  'blue-50': hexToRgb('#eff6ff')!, 'blue-100': hexToRgb('#dbeafe')!, 'blue-200': hexToRgb('#bfdbfe')!,
  'blue-300': hexToRgb('#93c5fd')!, 'blue-400': hexToRgb('#60a5fa')!, 'blue-500': hexToRgb('#3b82f6')!,
  'blue-600': hexToRgb('#2563eb')!, 'blue-700': hexToRgb('#1d4ed8')!, 'blue-800': hexToRgb('#1e40af')!,
  'blue-900': hexToRgb('#1e3a8a')!, 'indigo-50': hexToRgb('#eef2ff')!, 'indigo-100': hexToRgb('#e0e7ff')!,
  'indigo-200': hexToRgb('#c7d2fe')!, 'indigo-300': hexToRgb('#a5b4fc')!, 'indigo-400': hexToRgb('#818cf8')!,
  'indigo-500': hexToRgb('#6366f1')!, 'indigo-600': hexToRgb('#4f46e5')!, 'indigo-700': hexToRgb('#4338ca')!,
  'indigo-800': hexToRgb('#3730a3')!, 'indigo-900': hexToRgb('#312e81')!, 'violet-50': hexToRgb('#f5f3ff')!,
  'violet-100': hexToRgb('#ede9fe')!, 'violet-200': hexToRgb('#ddd6fe')!, 'violet-300': hexToRgb('#c4b5fd')!,
  'violet-400': hexToRgb('#a78bfa')!, 'violet-500': hexToRgb('#8b5cf6')!, 'violet-600': hexToRgb('#7c3aed')!,
  'violet-700': hexToRgb('#6d28d9')!, 'violet-800': hexToRgb('#5b21b6')!, 'violet-900': hexToRgb('#4c1d95')!,
  'purple-50': hexToRgb('#faf5ff')!, 'purple-100': hexToRgb('#f3e8ff')!, 'purple-200': hexToRgb('#e9d5ff')!,
  'purple-300': hexToRgb('#d8b4fe')!, 'purple-400': hexToRgb('#c084fc')!, 'purple-500': hexToRgb('#a855f7')!,
  'purple-600': hexToRgb('#9333ea')!, 'purple-700': hexToRgb('#7e22ce')!, 'purple-800': hexToRgb('#6b21a8')!,
  'purple-900': hexToRgb('#581c87')!, 'fuchsia-50': hexToRgb('#fdf4ff')!, 'fuchsia-100': hexToRgb('#fae8ff')!,
  'fuchsia-200': hexToRgb('#f5d0fe')!, 'fuchsia-300': hexToRgb('#f0abfc')!, 'fuchsia-400': hexToRgb('#e879f9')!,
  'fuchsia-500': hexToRgb('#d946ef')!, 'fuchsia-600': hexToRgb('#c026d3')!, 'fuchsia-700': hexToRgb('#a21caf')!,
  'fuchsia-800': hexToRgb('#86198f')!, 'fuchsia-900': hexToRgb('#701a75')!, 'pink-50': hexToRgb('#fdf2f8')!,
  'pink-100': hexToRgb('#fce7f3')!, 'pink-200': hexToRgb('#fbcfe8')!, 'pink-300': hexToRgb('#f9a8d4')!,
  'pink-400': hexToRgb('#f472b6')!, 'pink-500': hexToRgb('#ec4899')!, 'pink-600': hexToRgb('#db2777')!,
  'pink-700': hexToRgb('#be185d')!, 'pink-800': hexToRgb('#9d174d')!, 'pink-900': hexToRgb('#831843')!,
  'rose-50': hexToRgb('#fff1f2')!, 'rose-100': hexToRgb('#ffe4e6')!, 'rose-200': hexToRgb('#fecdd3')!,
  'rose-300': hexToRgb('#fda4af')!, 'rose-400': hexToRgb('#fb7185')!, 'rose-500': hexToRgb('#f43f5e')!,
  'rose-600': hexToRgb('#e11d48')!, 'rose-700': hexToRgb('#be123c')!, 'rose-800': hexToRgb('#9f1239')!,
  'rose-900': hexToRgb('#881337')!,
};

export function getTextSize(val: string): number {
  const sizes: Record<string, number> = {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 20,
    '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72
  };
  if (sizes[val]) return sizes[val];
  const arb = val.match(/^\[(\d+)px\]$/);
  if (arb) return parseInt(arb[1]);
  return 16;
}

export async function safeLoadFont(fontName: FontName): Promise<FontName> {
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

export async function createColorStyles(): Promise<void> {
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

export async function createTextStyles(): Promise<void> {
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

export function parseColor(val: string | number): RGB | null {
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

export function applyInlineStyle(node: FrameNode | ComponentNode | InstanceNode, style: Record<string, string | number>): void {
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
  const w = style['width'];  
  if (w !== undefined) { 
    if (typeof w === 'number') { 
      try { node.resize(Math.max(w, 4), Math.max(node.height, 4)); node.layoutSizingHorizontal = 'FIXED'; } catch(_) {} 
    } else if (typeof w === 'string') {
      if (w === '100%') { try { node.layoutSizingHorizontal = 'FILL'; } catch(_) {} }
      else if (w.endsWith('%')) {
        const pct = parseFloat(w);
        if (!isNaN(pct)) {
          if (pct === 100) { try { node.layoutSizingHorizontal = 'FILL'; } catch(_) {} }
          else { 
            const parentW = node.parent && 'width' in node.parent ? node.parent.width : 300;
            try { node.resize(Math.max((parentW * pct) / 100, 4), Math.max(node.height, 4)); node.layoutSizingHorizontal = 'FIXED'; } catch(_) {} 
          }
        }
      }
    }
  }

  const h = style['height']; 
  if (h !== undefined) { 
    if (typeof h === 'number') { 
      try { node.resize(Math.max(node.width, 4), Math.max(h, 4)); node.layoutSizingVertical = 'FIXED'; } catch(_) {} 
    } else if (typeof h === 'string') {
      if (h === '100%') { try { node.layoutSizingVertical = 'FILL'; } catch(_) {} }
      else if (h.endsWith('%')) {
        const pct = parseFloat(h);
        if (!isNaN(pct)) {
          const parentH = node.parent && 'height' in node.parent ? node.parent.height : 100;
          try { node.resize(Math.max(node.width, 4), Math.max((parentH * pct) / 100, 4)); node.layoutSizingVertical = 'FIXED'; } catch(_) {}
        }
      }
    }
  }

  // Min height
  const mh = style['minHeight'];
  if (mh !== undefined) {
     const mhv = typeof mh === 'number' ? mh : parseFloat(String(mh));
     if (!isNaN(mhv)) {
       try { (node as any).minHeight = mhv; } catch(_) {
         if (node.height < mhv) {
           try { node.resize(Math.max(node.width, 4), mhv); node.layoutSizingVertical = 'FIXED'; } catch(_) {}
         }
       }
     }
  }

  // Padding
  const p  = style['padding'];        if (p  !== undefined && typeof p  === 'number') { node.paddingTop = node.paddingBottom = node.paddingLeft = node.paddingRight = p; }
  const px = style['paddingLeft'];    if (px !== undefined && typeof px === 'number') { node.paddingLeft = px; }
  const pr = style['paddingRight'];   if (pr !== undefined && typeof pr === 'number') { node.paddingRight = pr; }
  const pt = style['paddingTop'];     if (pt !== undefined && typeof pt === 'number') { node.paddingTop = pt; }
  const pb = style['paddingBottom'];  if (pb !== undefined && typeof pb === 'number') { node.paddingBottom = pb; }

  // Gap / margin (approximate with itemSpacing)
  const gap = style['gap']; if (gap !== undefined && typeof gap === 'number') { node.itemSpacing = gap; }

  // Margin (especially negative margin overrides)
  const mt = style['marginTop'];
  if (mt !== undefined && typeof mt === 'number') {
    // Figma Auto Layout does not natively support individual negative margins well without breaking flow.
  }

  // Absolute positioning support
  const pos = style['position'];
  if (pos === 'absolute' || pos === 'fixed') {
    try { node.layoutPositioning = 'ABSOLUTE'; } catch(e) {}
    let t = style['top'];
    let b = style['bottom'];
    let l = style['left'];
    let r = style['right'];
    
    // Convert string to number if needed
    if (typeof t === 'string') t = parseFloat(t) || 0;
    if (typeof b === 'string') b = parseFloat(b) || 0;
    if (typeof l === 'string') l = parseFloat(l) || 0;
    if (typeof r === 'string') r = parseFloat(r) || 0;

    let hConstraint: ConstraintType = 'MIN';
    let vConstraint: ConstraintType = 'MIN';
    
    if (l !== undefined && r !== undefined) hConstraint = 'STRETCH';
    else if (r !== undefined) hConstraint = 'MAX';
    else if (l !== undefined) hConstraint = 'MIN';

    if (t !== undefined && b !== undefined) vConstraint = 'STRETCH';
    else if (b !== undefined) vConstraint = 'MAX';
    else if (t !== undefined) vConstraint = 'MIN';

    try {
       node.constraints = { horizontal: hConstraint, vertical: vConstraint };
       
       if (hConstraint === 'MAX' && r !== undefined && typeof r === 'number') {
           const parentW = node.parent && 'width' in node.parent ? node.parent.width : 375;
           node.x = parentW - node.width - r;
       } else if (hConstraint === 'STRETCH' && typeof l === 'number' && typeof r === 'number') {
           const parentW = node.parent && 'width' in node.parent ? node.parent.width : 375;
           node.x = l;
           node.resize(Math.max(parentW - l - r, 4), Math.max(node.height, 4));
       } else if (typeof l === 'number') {
           node.x = l;
       }
       
       if (vConstraint === 'MAX' && b !== undefined && typeof b === 'number') {
           const parentH = node.parent && 'height' in node.parent ? node.parent.height : 812;
           node.y = parentH - node.height - b;
       } else if (vConstraint === 'STRETCH' && typeof t === 'number' && typeof b === 'number') {
           const parentH = node.parent && 'height' in node.parent ? node.parent.height : 812;
           node.y = t;
           node.resize(Math.max(node.width, 4), Math.max(parentH - t - b, 4));
       } else if (typeof t === 'number') {
           node.y = t;
       }
    } catch (_) {}
  }

  // Border / stroke
  const borderColor = style['borderColor'];
  const border = style['border'];  // e.g. "1px solid #EEF1F5"
  if (borderColor) {
    const c = parseColor(String(borderColor));
    if (c) { node.strokes = [{ type: 'SOLID', color: c }]; node.strokeWeight = 1; node.strokeAlign = 'INSIDE'; }
  } else if (border && typeof border === 'string') {
    const bm = border.match(/#[0-9a-fA-F]{3,6}/);
    const wm = border.match(/([\d.]+)px/);
    if (bm) {
      const c = parseColor(bm[0]);
      if (c) { 
        node.strokes = [{ type: 'SOLID', color: c }]; 
        node.strokeWeight = wm ? parseFloat(wm[1]) : 1; 
        node.strokeAlign = 'INSIDE'; 
      }
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

export function applyInlineTextStyle(t: TextNode, style: Record<string, string | number>): void {
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

  // Font family
  const ff = style['fontFamily'];
  if (ff !== undefined && typeof ff === 'string') {
    // Basic mapping, assuming Inter is loaded
    if (ff.toLowerCase().includes('serif')) {
      try { t.fontName = { family: 'Georgia', style: t.fontName.style }; } catch(_) {}
    }
  }

  // Line height
  const lh = style['lineHeight'];
  if (lh !== undefined && typeof lh === 'number') {
    if (lh <= 3) {
       try { t.lineHeight = { unit: 'PERCENT', value: lh * 100 }; } catch(_) {}
    } else {
       try { t.lineHeight = { unit: 'PIXELS', value: lh }; } catch(_) {}
    }
  }

  const ta = style['textAlign'];
  if (ta === 'center') t.textAlignHorizontal = 'CENTER';
  else if (ta === 'right') t.textAlignHorizontal = 'RIGHT';
}

export function resolveColor(classes: string[], prefix: string): RGB | null {
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

export function applyContainerStyles(frame: FrameNode | ComponentNode | InstanceNode, classes: string[], tag: string): void {
  if (!classes.length && frame.parent?.type === 'FRAME' && frame.parent.layoutMode === 'VERTICAL') {
     try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {}
     // Allow it to fall through to set default layoutMode
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
  frame.layoutSizingHorizontal = 'HUG';
  frame.layoutSizingVertical = 'HUG';
  
  if (tag !== 'span' && tag !== 'a' && tag !== 'i' && tag !== 'strong' && frame.parent?.type === 'FRAME' && frame.parent.layoutMode === 'VERTICAL') {
     try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {}
     try { (frame as any).layoutAlign = 'STRETCH'; } catch(e) {}
  }

  // ── Smart Component Defaults (Fallbacks for unresolved tags) ──
  const tLower = (tag || "").toLowerCase();
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

  // ── Flex Grow (flex-1) ──
  if (cs.has('flex-1') || cs.has('grow')) {
    if (frame.parent && 'layoutMode' in frame.parent) {
      if (frame.parent.layoutMode === 'HORIZONTAL') { try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {} }
      if (frame.parent.layoutMode === 'VERTICAL') { try { frame.layoutSizingVertical = 'FILL'; } catch(e) {} }
    }
  }

  // ── Positioning ──
  if (cs.has('absolute') || cs.has('fixed')) {
    try { frame.layoutPositioning = 'ABSOLUTE'; } catch(e) {}
  }

  // ── Auto Margins (mt-auto, ml-auto) ──
  if (cs.has('mt-auto') && frame.parent && 'layoutMode' in frame.parent && frame.parent.layoutMode === 'VERTICAL') {
    const spacer = figma.createFrame();
    spacer.name = 'Spacer (mt-auto)';
    spacer.fills = [];
    try { spacer.layoutSizingVertical = 'FILL'; } catch(e){}
    const index = frame.parent.children.indexOf(frame);
    if (index >= 0) frame.parent.insertChild(index, spacer);
  }
  if (cs.has('ml-auto') && frame.parent && 'layoutMode' in frame.parent && frame.parent.layoutMode === 'HORIZONTAL') {
    const spacer = figma.createFrame();
    spacer.name = 'Spacer (ml-auto)';
    spacer.fills = [];
    try { spacer.layoutSizingHorizontal = 'FILL'; } catch(e){}
    const index = frame.parent.children.indexOf(frame);
    if (index >= 0) frame.parent.insertChild(index, spacer);
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
    try { (frame as any).layoutAlign = 'STRETCH'; } catch (_) {}
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
    const p  = c.match(/^p-(.+)$/);   if (p)  { const v = getSpacing(p[1]) * 4;  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = v; continue; }
    const px = c.match(/^px-(.+)$/);  if (px) { const v = getSpacing(px[1]) * 4; frame.paddingLeft = frame.paddingRight = v; continue; }
    const py = c.match(/^py-(.+)$/);  if (py) { const v = getSpacing(py[1]) * 4; frame.paddingTop = frame.paddingBottom = v; continue; }
    const pt = c.match(/^pt-(.+)$/);  if (pt) { frame.paddingTop    = getSpacing(pt[1]) * 4; continue; }
    const pb = c.match(/^pb-(.+)$/);  if (pb) { frame.paddingBottom = getSpacing(pb[1]) * 4; continue; }
    const pl = c.match(/^pl-(.+)$/);  if (pl) { frame.paddingLeft   = getSpacing(pl[1]) * 4; continue; }
    const pr = c.match(/^pr-(.+)$/);  if (pr) { frame.paddingRight  = getSpacing(pr[1]) * 4; continue; }
  }

  // ── Gap ──
  for (const c of classes) {
    const g  = c.match(/^gap-(.+)$/);   if (g)  { frame.itemSpacing = getSpacing(g[1]) * 4; continue; }
    const gx = c.match(/^gap-x-(.+)$/); if (gx && frame.layoutMode === 'HORIZONTAL') { frame.itemSpacing = getSpacing(gx[1]) * 4; continue; }
    const gy = c.match(/^gap-y-(.+)$/); if (gy && frame.layoutMode === 'VERTICAL')   { frame.itemSpacing = getSpacing(gy[1]) * 4; continue; }
    const sp = c.match(/^space-(?:x|y)-(.+)$/); if (sp) { frame.itemSpacing = getSpacing(sp[1]) * 4; continue; }
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

export function applyTextStyles(t: TextNode, classes: string[]): void {
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


export function hexToRgb(hex: string): RGB {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 } : { r: 1, g: 1, b: 1 };
}

export function getSpacing(val: string): number {
  return parseInt(val) || 0;
}

