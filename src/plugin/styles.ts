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

export function applyInlineStyle(node: FrameNode, style: Record<string, string | number>): void {
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
  const h = style['height']; if (h !== undefined && typeof h === 'number') { try { node.resize(Math.max(node.width, 4), Math.max(h, 4)); node.layoutSizingVertical = 'FIXED'; } catch(_) {} }

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

export function applyContainerStyles(frame: FrameNode, classes: string[], tag: string): void {
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
  frame.layoutSizingHorizontal = 'HUG';
  frame.layoutSizingVertical = 'HUG';
  
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

