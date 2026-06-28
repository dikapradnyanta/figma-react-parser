import { ResolvedStyle, RGB } from './types';
import { parseColor, COLORS } from './styles';

export function getSpacing(val: string): number {
  if (val === 'px') return 1;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

export function getBorderRadius(val: string): number {
  switch(val) {
    case 'none': return 0;
    case 'sm': return 2;
    case 'md': return 6;
    case 'lg': return 8;
    case 'xl': return 12;
    case '2xl': return 16;
    case '3xl': return 24;
    case 'full': return 9999;
    default:
      const arb = val.match(/^\[(\d+)px\]$/);
      return arb ? parseInt(arb[1]) : 4;
  }
}

export function resolveTailwindClasses(classes: string[], tag: string): Partial<ResolvedStyle> {
  const cs = new Set(classes);
  const style: Partial<ResolvedStyle> = {};

  // Flex / Grid
  const isFlex = cs.has('flex') || cs.has('inline-flex');
  const isGrid = cs.has('grid') || cs.has('inline-grid');
  if (isFlex || isGrid) {
    style.display = 'flex';
    style.flexDirection = (cs.has('flex-col') || cs.has('flex-column')) ? 'column' : 'row';
  }

  // Positioning
  if (cs.has('absolute') || cs.has('fixed')) {
    style.isAbsolute = true;
  }

  // Alignment
  if (cs.has('items-center')) style.alignItems = 'CENTER';
  else if (cs.has('items-end')) style.alignItems = 'MAX';
  else if (cs.has('items-start')) style.alignItems = 'MIN';

  if (cs.has('justify-center')) style.justifyContent = 'CENTER';
  else if (cs.has('justify-end')) style.justifyContent = 'MAX';
  else if (cs.has('justify-between')) style.justifyContent = 'SPACE_BETWEEN';
  else if (cs.has('justify-around')) style.justifyContent = 'SPACE_BETWEEN';

  // Width
  if (cs.has('w-full') || cs.has('w-screen')) {
    style.width = 'FILL';
  } else if (cs.has('w-auto')) {
    // handled implicitly or mapped as hug
  } else {
    for (const c of classes) {
      const wm = c.match(/^w-(\d+(?:\.\d+)?)$/);
      if (wm) style.width = getSpacing(wm[1]) * 4;
      const wf = c.match(/^w-(\d+)\/(\d+)$/);
      if (wf) style.width = Math.round(375 * parseInt(wf[1]) / parseInt(wf[2]));
      const wa = c.match(/^w-\[(\d+)(?:px)?\]$/);
      if (wa) style.width = parseInt(wa[1]);
    }
  }

  // Height
  if (cs.has('h-full') || cs.has('h-screen')) {
    style.height = 'FILL';
  } else if (cs.has('min-h-screen') || cs.has('min-h-full')) {
    if (!style.height) style.height = 'FILL';
  } else {
    for (const c of classes) {
      const hm = c.match(/^h-(\d+(?:\.\d+)?)$/);
      if (hm) style.height = getSpacing(hm[1]) * 4;
      const ha = c.match(/^h-\[(\d+)(?:px)?\]$/);
      if (ha) style.height = parseInt(ha[1]);
    }
  }

  // size-N shorthand (sets both width and height)
  // e.g. size-4 = 16px, size-full = FILL
  if (cs.has('size-full')) {
    style.width = 'FILL';
    style.height = 'FILL';
  } else {
    for (const c of classes) {
      const sm = c.match(/^size-(\d+(?:\.\d+)?)$/);
      if (sm) {
        const v = getSpacing(sm[1]) * 4;
        style.width = v;
        style.height = v;
      }
      const sa = c.match(/^size-\[(\d+)(?:px)?\]$/);
      if (sa) {
        const v = parseInt(sa[1]);
        style.width = v;
        style.height = v;
      }
    }
  }

  // flex-1 / grow = FILL sizing on both axes (stretch in parent)
  if (cs.has('flex-1') || cs.has('grow') || cs.has('flex-auto')) {
    style.width = 'FILL';
  }
  // shrink-0 — informational only (Figma handles via HUG, no explicit mapping needed)

  // Padding
  for (const c of classes) {
    const p  = c.match(/^p-(.+)$/);   if (p)  { const v = getSpacing(p[1]) * 4;  style.paddingTop = style.paddingBottom = style.paddingLeft = style.paddingRight = v; continue; }
    const px = c.match(/^px-(.+)$/);  if (px) { const v = getSpacing(px[1]) * 4; style.paddingLeft = style.paddingRight = v; continue; }
    const py = c.match(/^py-(.+)$/);  if (py) { const v = getSpacing(py[1]) * 4; style.paddingTop = style.paddingBottom = v; continue; }
    const pt = c.match(/^pt-(.+)$/);  if (pt) { style.paddingTop = getSpacing(pt[1]) * 4; continue; }
    const pb = c.match(/^pb-(.+)$/);  if (pb) { style.paddingBottom = getSpacing(pb[1]) * 4; continue; }
    const pl = c.match(/^pl-(.+)$/);  if (pl) { style.paddingLeft = getSpacing(pl[1]) * 4; continue; }
    const pr = c.match(/^pr-(.+)$/);  if (pr) { style.paddingRight = getSpacing(pr[1]) * 4; continue; }
  }

  // Gap
  for (const c of classes) {
    const g  = c.match(/^gap-(.+)$/);   if (g)  { style.gap = getSpacing(g[1]) * 4; continue; }
    const gx = c.match(/^gap-x-(.+)$/); if (gx && style.flexDirection === 'row') { style.gap = getSpacing(gx[1]) * 4; continue; }
    const gy = c.match(/^gap-y-(.+)$/); if (gy && style.flexDirection === 'column') { style.gap = getSpacing(gy[1]) * 4; continue; }
    const sp = c.match(/^space-(?:x|y)-(.+)$/); if (sp) { style.gap = getSpacing(sp[1]) * 4; continue; }
  }

  // Border Radius
  for (const c of classes) {
    if (c === 'rounded') { style.borderRadius = 4; continue; }
    const rm = c.match(/^rounded-(.+)$/); if (rm) { style.borderRadius = getBorderRadius(rm[1]); continue; }
  }

  // Colors
  for (const cls of classes) {
    if (cls.startsWith('bg-') && !cs.has('bg-transparent')) {
      const arb = cls.match(/^bg-\[#([0-9a-fA-F]{3,6})\]$/);
      if (arb) style.backgroundColor = '#' + arb[1];
      else style.backgroundColor = cls.slice(3); 
    } else if (cls.startsWith('text-')) {
      const arb = cls.match(/^text-\[#([0-9a-fA-F]{3,6})\]$/);
      if (arb) style.color = '#' + arb[1];
      else style.color = cls.slice(5);
    } else if (cls.startsWith('border-')) {
      const arb = cls.match(/^border-\[#([0-9a-fA-F]{3,6})\]$/);
      if (arb) style.borderColor = '#' + arb[1];
      else style.borderColor = cls.slice(7);
    }
  }

  if (cs.has('border') || cs.has('border-t') || cs.has('border-b') || cs.has('border-l') || cs.has('border-r')) {
    if (!style.borderWidth) style.borderWidth = 1;
  }
  for (const c of classes) {
    const bwm = c.match(/^border-(\d+)$/);
    if (bwm) style.borderWidth = parseInt(bwm[1]);
  }

  // Overflow — maps to Figma clipsContent
  if (cs.has('overflow-hidden') || cs.has('overflow-clip') || cs.has('overflow-scroll') || cs.has('overflow-auto')) {
    style.clipsContent = true;
  }

  // Text Properties
  if (cs.has('text-center')) style.textAlign = 'CENTER';
  else if (cs.has('text-right')) style.textAlign = 'RIGHT';
  else if (cs.has('text-left')) style.textAlign = 'LEFT';
  
  if (cs.has('font-bold')) style.fontWeight = 'Bold';
  else if (cs.has('font-semibold')) style.fontWeight = 'SemiBold';
  else if (cs.has('font-medium')) style.fontWeight = 'Medium';
  else if (cs.has('font-normal')) style.fontWeight = 'Regular';
  else if (cs.has('font-light')) style.fontWeight = 'Light';

  for (const c of classes) {
    if (c.startsWith('text-')) {
      const sizes: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 };
      const s = c.slice(5);
      if (sizes[s]) style.fontSize = sizes[s];
    }
  }

  return style;
}

export function resolveInlineStyles(styles: Record<string, string | number>): Partial<ResolvedStyle> {
  const resolved: Partial<ResolvedStyle> = {};
  
  if (styles.width !== undefined) {
    if (styles.width === '100%' || styles.width === '100vw') resolved.width = 'FILL';
    else if (typeof styles.width === 'number') resolved.width = styles.width;
    else if (typeof styles.width === 'string') {
      const w = parseFloat(styles.width);
      if (!isNaN(w)) resolved.width = w;
    }
  }

  if (styles.height !== undefined) {
    if (styles.height === '100%' || styles.height === '100vh') resolved.height = 'FILL';
    else if (typeof styles.height === 'number') resolved.height = styles.height;
    else if (typeof styles.height === 'string') {
      const h = parseFloat(styles.height);
      if (!isNaN(h)) resolved.height = h;
    }
  }

  if (styles.padding !== undefined) {
    const p = typeof styles.padding === 'number' ? styles.padding : parseFloat(String(styles.padding));
    if (!isNaN(p)) {
      resolved.paddingTop = resolved.paddingBottom = resolved.paddingLeft = resolved.paddingRight = p;
    }
  }
  if (styles.paddingTop !== undefined) resolved.paddingTop = parseFloat(String(styles.paddingTop));
  if (styles.paddingBottom !== undefined) resolved.paddingBottom = parseFloat(String(styles.paddingBottom));
  if (styles.paddingLeft !== undefined) resolved.paddingLeft = parseFloat(String(styles.paddingLeft));
  if (styles.paddingRight !== undefined) resolved.paddingRight = parseFloat(String(styles.paddingRight));

  if (styles.backgroundColor) resolved.backgroundColor = String(styles.backgroundColor);
  if (styles.color) resolved.color = String(styles.color);

  if (styles.borderRadius !== undefined) resolved.borderRadius = parseFloat(String(styles.borderRadius));
  if (styles.borderTopLeftRadius !== undefined) resolved.borderTopLeftRadius = parseFloat(String(styles.borderTopLeftRadius));
  if (styles.borderTopRightRadius !== undefined) resolved.borderTopRightRadius = parseFloat(String(styles.borderTopRightRadius));
  if (styles.borderBottomLeftRadius !== undefined) resolved.borderBottomLeftRadius = parseFloat(String(styles.borderBottomLeftRadius));
  if (styles.borderBottomRightRadius !== undefined) resolved.borderBottomRightRadius = parseFloat(String(styles.borderBottomRightRadius));

  if (styles.fontSize !== undefined) resolved.fontSize = parseFloat(String(styles.fontSize));
  if (styles.fontWeight !== undefined) resolved.fontWeight = String(styles.fontWeight);
  if (styles.lineHeight !== undefined) resolved.lineHeight = styles.lineHeight;

  if (styles.display === 'flex' || styles.display === 'none' || styles.display === 'block') {
    resolved.display = styles.display;
  }
  if (styles.flexDirection === 'row' || styles.flexDirection === 'column') {
    resolved.flexDirection = styles.flexDirection;
  }

  if (styles.gap !== undefined) resolved.gap = parseFloat(String(styles.gap));
  
  if (styles.alignItems) {
    const map: Record<string, any> = { 'center': 'CENTER', 'flex-start': 'MIN', 'flex-end': 'MAX' };
    if (map[String(styles.alignItems)]) resolved.alignItems = map[String(styles.alignItems)];
  }
  if (styles.justifyContent) {
    const map: Record<string, any> = { 'center': 'CENTER', 'flex-start': 'MIN', 'flex-end': 'MAX', 'space-between': 'SPACE_BETWEEN' };
    if (map[String(styles.justifyContent)]) resolved.justifyContent = map[String(styles.justifyContent)];
  }
  
  if (styles.opacity !== undefined) resolved.opacity = parseFloat(String(styles.opacity));
  
  if (styles.position === 'absolute' || styles.position === 'fixed') {
    resolved.isAbsolute = true;
    if (styles.top !== undefined) resolved.top = parseFloat(String(styles.top));
    if (styles.bottom !== undefined) resolved.bottom = parseFloat(String(styles.bottom));
    if (styles.left !== undefined) resolved.left = parseFloat(String(styles.left));
    if (styles.right !== undefined) resolved.right = parseFloat(String(styles.right));
  }

  if (styles.textAlign) {
    const map: Record<string, any> = { 'center': 'CENTER', 'left': 'LEFT', 'right': 'RIGHT', 'justify': 'JUSTIFIED' };
    if (map[String(styles.textAlign)]) resolved.textAlign = map[String(styles.textAlign)];
  }
  
  return resolved;
}

export function mergeStyles(tailwind: Partial<ResolvedStyle>, inline: Partial<ResolvedStyle>): ResolvedStyle {
  // Inline styles take precedence over tailwind
  return { ...tailwind, ...inline } as ResolvedStyle;
}
