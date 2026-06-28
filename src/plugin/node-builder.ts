import { ParsedNode } from './types';
import { applyResolvedStyle, applyResolvedTextStyle } from './figma-mapper';
import { resolveTailwindClasses, resolveInlineStyles, mergeStyles } from './style-resolver';
import { hexToRgb, getSpacing } from './styles';
import { pluginLog } from './logger';

export function layerName(node: ParsedNode): string {
  const cs = node.rawClassName;
  if (node.originalTag === 'nav' || cs.some(c => c.includes('nav')))       return 'Navigation';
  if (node.originalTag === 'header' || cs.some(c => c === 'header'))       return 'Header';
  if (node.originalTag === 'footer' || cs.some(c => c === 'footer'))       return 'Footer';
  if (cs.some(c => c.includes('progress')))                         return 'Progress Bar';
  if (cs.some(c => c.includes('card')))                             return 'Card';
  if (cs.some(c => c.includes('badge')))                            return 'Badge';
  if (cs.some(c => c.includes('modal') || c.includes('dialog')))   return 'Modal';
  if (cs.some(c => c.includes('avatar') || c.includes('profile'))) return 'Avatar';
  if (node.originalTag === 'button' || cs.some(c => c.includes('btn')))    return 'Button';
  if (node.originalTag === 'input' || cs.some(c => c.includes('input')))   return 'Input Field';
  if (cs.some(c => c.includes('search')))                           return 'Search Bar';
  if (cs.some(c => c.includes('list') || c.includes('feed')))      return 'List';
  if (cs.some(c => c.includes('tab')))                              return 'Tab';
  if (cs.some(c => c.includes('skeleton')))                         return 'Skeleton';
  if (node.originalTag === 'section' || node.originalTag === 'article')             return 'Section';
  if (node.originalTag === 'main')                                          return 'Content';
  if (cs.includes('flex') && cs.includes('flex-col'))               return 'Column';
  if (cs.includes('flex'))                                           return 'Row';
  const first = cs[0] ? '.' + cs[0] : '';
  return `${node.originalTag}${first}`;
}

export function isProgressBar(node: ParsedNode): boolean {
  const allClasses = node.rawClassName.join(' ');
  return allClasses.includes('progress') || (
    node.rawClassName.some(c => c.startsWith('w-[') && c.includes('%')) &&
    node.rawClassName.some(c => c.startsWith('bg-') && (c.includes('blue') || c.includes('green') || c.includes('accent')))
  );
}

const TEXT_TAGS = new Set(['p','span','h1','h2','h3','h4','h5','h6','label','strong','em','small','a','li','td','th','caption','figcaption','legend','blockquote','time','code','pre','mark','b','i','u','abbr','cite','dt','dd']);
const SKIP_TAGS = new Set(['script','style','link','meta','head','title','noscript','template','slot','path','circle','rect','polygon','polyline','line','ellipse','use','defs','g','symbol']);
const INLINE_TAGS = new Set(['span','strong','em','b','i','u','mark','small','abbr','code','time','cite','a']);

// ── Primitive Tag Normalizer ─────────────────────────────────
// Converts Shadcn/Radix primitive tags (e.g. AccordionPrimitive.Root)
// to their semantic HTML equivalents so the node builder treats them correctly.
function normalizePrimitiveTag(tag: string): string {
  if (!tag.includes('.') && !tag.includes('Primitive')) return tag;
  const lower = tag.toLowerCase();
  if (lower.endsWith('.root') || lower.endsWith('.portal') || lower.endsWith('.group')) return 'div';
  if (lower.endsWith('.trigger') || lower.endsWith('.action') || lower.endsWith('.cancel')) return 'button';
  if (lower.endsWith('.content') || lower.endsWith('.item') || lower.endsWith('.header') || lower.endsWith('.list')) return 'div';
  if (lower.endsWith('.overlay') || lower.endsWith('.backdrop') || lower.endsWith('.viewport')) return 'div';
  if (lower.endsWith('.title') || lower.endsWith('.description') || lower.endsWith('.label')) return 'p';
  if (lower.endsWith('.indicator') || lower.endsWith('.thumb')) return 'div';
  if (lower.endsWith('.image')) return 'img';
  if (lower.endsWith('.icon') || lower.endsWith('.arrow')) return 'span';
  // Default: treat as wrapper div
  return 'div';
}

// ── Context Provider / Transparent Wrapper Detection ───────────
// Tags like CarouselContext.Provider, ChartContext.Provider, etc.
// are React context providers — they have no visual representation.
// Render their children directly to the parent instead.
function isTransparentWrapper(tag: string): boolean {
  return (
    tag.endsWith('.Provider') ||
    tag.includes('Context.') ||
    tag.includes('.context.') ||
    tag === 'Fragment' ||
    tag === 'React.Fragment' ||
    tag === 'Slot'
  );
}

export async function buildNode(
  node: ParsedNode,
  parent: FrameNode | ComponentNode | PageNode,
  componentRegistry: Record<string, ComponentNode>,
  depth = 0
) {
  if (depth > 20) return;

  // ── FILTER: sr-only elements should not be rendered ──────────────
  // (sr-only = screen-reader only, invisible visually)
  if (node.rawClassName?.includes('sr-only')) return;

  // ── FILTER: Transparent wrappers (Context.Provider, Fragment) ──
  // Render their children directly to parent without a wrapper frame.
  if (isTransparentWrapper(node.originalTag)) {
    for (const child of node.children) {
      try { await buildNode(child, parent, componentRegistry, depth); } catch (_) {}
    }
    return;
  }

  // ── NORMALIZE: Shadcn/Radix Primitive tags ────────────────────
  // Convert e.g. AccordionPrimitive.Root → 'div' before further processing.
  const resolvedTag = normalizePrimitiveTag(node.originalTag);
  const effectiveNode = resolvedTag !== node.originalTag
    ? { ...node, originalTag: resolvedTag }
    : node;

  // ── INSTANCE CREATION for CUSTOM COMPONENTS ──────────────────
  if (effectiveNode.originalTag.match(/^[A-Z]/) && componentRegistry && componentRegistry[effectiveNode.originalTag]) {
    const mainComponent = componentRegistry[effectiveNode.originalTag];
    try {
      const instance = mainComponent.createInstance();
      instance.name = `${effectiveNode.originalTag}`;
      parent.appendChild(instance);
      if (node.props?.actionTo) instance.setPluginData('actionTo', node.props?.actionTo);
      const tailwind = resolveTailwindClasses(node.rawClassName, node.originalTag);
      const inline = node.rawInlineStyle ? resolveInlineStyles(node.rawInlineStyle) : {};
      const style = mergeStyles(tailwind, inline);
      applyResolvedStyle(instance, style, node.originalTag, node.props);
      return;
    } catch(e) {
      console.log(`Failed to create instance for ${node.originalTag}:`, e);
    }
  }
  if (SKIP_TAGS.has(effectiveNode.originalTag)) return;
  if (!effectiveNode.originalTag) return;

  const cs = new Set(node.rawClassName);
  const hasChildren = node.children.length > 0;
  const hasText = (node.text || '').trim().length > 0;

  // ── PROGRESS BAR ──────────────────────────────────────────
  if (isProgressBar(node)) {
    const track = figma.createFrame();
    track.name = 'Progress Bar';
    track.fills = [{ type: 'SOLID', color: hexToRgb('#E5E7EB') }];
    track.resize(cs.has('w-full') ? 300 : 200, 8);
    track.cornerRadius = 9999;
    track.layoutMode = 'HORIZONTAL';
    track.clipsContent = true;

    let pct = 65;
    for (const c of node.rawClassName) {
      const pm = c.match(/^w-\[(\d+)%\]$/); if (pm) { pct = parseInt(pm[1]); break; }
    }

    const fill = figma.createRectangle();
    fill.name = `${pct}% fill`;
    fill.resize(Math.round(track.width * pct / 100), 8);
    fill.cornerRadius = 9999;
    const resolvedStyle = resolveTailwindClasses(node.rawClassName, '');
    const bgColorHex = resolvedStyle.backgroundColor ?? '#4A90E2';
    let bgColorRgb = hexToRgb(bgColorHex);
    if (!bgColorRgb) bgColorRgb = hexToRgb('#4A90E2')!;
    fill.fills = [{ type: 'SOLID', color: bgColorRgb }];

    track.appendChild(fill);
    if (cs.has('w-full')) { try { track.layoutSizingHorizontal = 'FILL'; } catch(_) {} }
    parent.appendChild(track);
    return;
  }

  // ── RAW SVG NODE ───────────────────────────────────────
  // Inline <svg>...</svg> captured as rawSvg string by the parser
  if (node.originalTag === 'svg' && node.props?.rawSvg) {
    try {
      const svgNode = figma.createNodeFromSvg(node.props.rawSvg as string);
      svgNode.name = 'SVG';
      // Respect explicit size from inline style or Tailwind classes
      let svgW = 24, svgH = 24;
      for (const c of node.rawClassName) {
        const sw = c.match(/^w-(\d+(?:\.\d+)?)$/);
        if (sw) svgW = getSpacing(sw[1]) * 4;
        const sh = c.match(/^h-(\d+(?:\.\d+)?)$/);
        if (sh) svgH = getSpacing(sh[1]) * 4;
        const ss = c.match(/^size-(\d+(?:\.\d+)?)$/);
        if (ss) { svgW = svgH = getSpacing(ss[1]) * 4; }
      }
      if (node.rawInlineStyle?.width) svgW = parseFloat(String(node.rawInlineStyle.width)) || svgW;
      if (node.rawInlineStyle?.height) svgH = parseFloat(String(node.rawInlineStyle.height)) || svgH;
      try { svgNode.resize(Math.max(svgW, 4), Math.max(svgH, 4)); } catch (_) {}
      parent.appendChild(svgNode);
      return;
    } catch (e: any) {
      pluginLog(`SVG parse failed on inline <svg>: ${e?.message || e}`, 'error');
    }
  }

  // ── IMAGE PLACEHOLDER ─────────────────────────────────────
  if (['img', 'image', 'video', 'figure'].includes(node.originalTag) ||
      (node.originalTag === 'div' && (cs.has('aspect-video') || cs.has('aspect-square') || (node.props && node.props['src'])))) {
    const imgFrame = figma.createFrame();
    imgFrame.name = 'Image - ' + ((node.props && node.props['alt']) || (node.props && node.props['src']?.split('/').pop()?.split('?')[0]) || 'Image');
    imgFrame.fills = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 } }];
    imgFrame.layoutMode = 'VERTICAL';
    imgFrame.primaryAxisAlignItems = 'CENTER';
    imgFrame.counterAxisAlignItems = 'CENTER';

    let w = 120, h = 90;
    for (const c of node.rawClassName) {
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
    icon.characters = 'Image';
    icon.fontSize = 16;
    imgFrame.appendChild(icon);

    parent.appendChild(imgFrame);
    return;
  }

  // ── ICON PLACEHOLDER ──────────────────────────────────────
  if (node.isIcon) {
    const sizeVal = node.rawInlineStyle?.['width'] ?? node.rawInlineStyle?.['size'] ?? 20;
    const iconSize = typeof sizeVal === 'number' ? sizeVal : parseInt(String(sizeVal)) || 20;
    const iconColor = node.rawInlineStyle?.['color'] ? String(node.rawInlineStyle['color']) : 'currentColor';
    
    try {
      const kebabName = node.originalTag.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      const url = `https://unpkg.com/lucide-static@latest/icons/${kebabName}.svg`;
      const resp = await fetch(url);
      if (resp.ok) {
        let svg = await resp.text();
        if (iconColor !== 'currentColor') {
           svg = svg.replace(/currentColor/g, iconColor);
        }
        const iconNode = figma.createNodeFromSvg(svg);
        iconNode.name = `${node.originalTag}`;
        try { iconNode.resize(iconSize, iconSize); } catch(_) {}
        parent.appendChild(iconNode);
        return;
      }
    } catch(e) {
      console.log('Failed to fetch SVG for', node.originalTag, e);
    }

    const defaultSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    const iconNodeFallback = figma.createNodeFromSvg(defaultSvg);
    iconNodeFallback.name = `${node.originalTag}`;
    try { iconNodeFallback.resize(iconSize, iconSize); } catch(_) {}
    parent.appendChild(iconNodeFallback);
    return;
  }

  // ── PURE TEXT NODE (text tag, no children) ────────────────
  const isTextTag = TEXT_TAGS.has(node.originalTag);
  if (isTextTag && !hasChildren && hasText) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const t = figma.createText();
    t.name = `${node.originalTag}: ${(node.text || '').substring(0, 30)}`;
    t.characters = (node.text || '').substring(0, 500);
    parent.appendChild(t);
    if (node.props?.actionTo) t.setPluginData('actionTo', node.props?.actionTo);
    const tailwind = resolveTailwindClasses(node.rawClassName, node.originalTag);
    const inline = node.rawInlineStyle ? resolveInlineStyles(node.rawInlineStyle) : {};
    const style = mergeStyles(tailwind, inline);
    applyResolvedTextStyle(t, style);
    try { t.textAutoResize = 'HEIGHT'; } catch(_) {}
    if (!INLINE_TAGS.has(node.originalTag)) {
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
  if (node.props?.actionTo) frame.setPluginData('actionTo', node.props?.actionTo);

  // Apply layout + styling (Tailwind classes first, then inline style overrides)
  try {
    const tailwind = resolveTailwindClasses(node.rawClassName, node.originalTag);
    const inline = node.rawInlineStyle ? resolveInlineStyles(node.rawInlineStyle) : {};
    const style = mergeStyles(tailwind, inline);
    applyResolvedStyle(frame, style, node.originalTag, node.props);
  } catch (e: any) {
    pluginLog(`   │ Styling error on <${node.originalTag}>: ${e?.message || e}`, 'error');
  }

  // If this text tag has BOTH text and children, add text as first child
  if (hasText) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const t = figma.createText();
    t.characters = (node.text || '').substring(0, 500);
    frame.appendChild(t);
    if (node.props?.actionTo) t.setPluginData('actionTo', node.props?.actionTo);
    const tailwind = resolveTailwindClasses(node.rawClassName, node.originalTag);
    const inline = node.rawInlineStyle ? resolveInlineStyles(node.rawInlineStyle) : {};
    const style = mergeStyles(tailwind, inline);
    applyResolvedTextStyle(t, style);
    try { t.textAutoResize = 'HEIGHT'; } catch(_) {}
    if (!INLINE_TAGS.has(node.originalTag)) {
      try { t.layoutSizingHorizontal = 'FILL'; } catch(_) {}
    }
  }

  // Recurse into children (sorted by zIndex to render higher z-index layers on top)
  const childrenToRender = [...node.children].sort((a, b) => {
    const zA = a.rawInlineStyle?.['zIndex'] ? parseInt(String(a.rawInlineStyle['zIndex'])) : 0;
    const zB = b.rawInlineStyle?.['zIndex'] ? parseInt(String(b.rawInlineStyle['zIndex'])) : 0;
    return zA - zB;
  });
  
  if (childrenToRender.length > 0 && depth === 0) {
     console.log(`[code.ts] Children of ${node.originalTag} sorted by zIndex:`, childrenToRender.map(c => `${c.originalTag} (z:${c.rawInlineStyle?.['zIndex']||0})`));
  }

  for (const child of childrenToRender) {
    try { await buildNode(child, frame, componentRegistry, depth + 1); }
    catch (e: any) { 
      console.error('buildNode child error:', e); 
      pluginLog(`   │ Child build error at <${child?.originalTag}>: ${e?.message || e}`, 'error');
    }
  }

  // Ensure frames aren't invisible (0x0)
  if (frame.children.length === 0) {
    // Empty container — give it a minimum size so it's visible
    if (!hasText) {
      try {
        if (frame.width < 4 && frame.height < 4) {
          frame.resize(
            Math.max(frame.width, tLowerOrDefault(node.originalTag) === 'hr' ? 200 : 16),
            Math.max(frame.height, node.originalTag === 'hr' ? 1 : 16)
          );
        }
      } catch(_) {}
    }
    // Add a background if no fill set (makes empty containers visible)
    if (frame.fills.length === 0 && isVisualContainer(node.originalTag)) {
      frame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.97 }, opacity: 0.5 }];
    }
  }

  // Basic Grid Support
  const isGridCols2 = node.rawClassName.includes('grid-cols-2');
  const isGridCols3 = node.rawClassName.includes('grid-cols-3');
  if (isGridCols2 || isGridCols3) {
    try { frame.layoutWrap = 'WRAP'; } catch(_) {}
    const fillWidth = isGridCols2 ? 160 : 100; // approximate widths for wrap
    for (const child of frame.children) {
      if (child.type === 'FRAME' || child.type === 'INSTANCE' || child.type === 'COMPONENT') {
        try { 
          // In wrap, FILL doesn't always divide evenly without min-width in Figma plugin API, 
          // so we set a fixed width approximation, then FILL
          if ('minWidth' in child) (child as any).minWidth = fillWidth;
          child.resize(fillWidth, child.height);
          child.layoutSizingHorizontal = 'FILL'; 
        } catch(_) {}
      }
    }
  }
}

function tLowerOrDefault(tag: string): string { return tag.toLowerCase(); }

function isVisualContainer(tag: string): boolean {
  return ['div','section','article','aside','header','footer','main','nav','ul','ol'].includes(tag);
}


