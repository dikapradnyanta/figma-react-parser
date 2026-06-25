import { ParsedNode } from './types';
import { applyContainerStyles, applyInlineStyle, applyTextStyles, applyInlineTextStyle, hexToRgb, resolveColor, getSpacing } from './styles';
import { pluginLog } from './logger';

export function layerName(node: ParsedNode): string {
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

export function isProgressBar(node: ParsedNode): boolean {
  const allClasses = node.classes.join(' ');
  return allClasses.includes('progress') || (
    node.classes.some(c => c.startsWith('w-[') && c.includes('%')) &&
    node.classes.some(c => c.startsWith('bg-') && (c.includes('blue') || c.includes('green') || c.includes('accent')))
  );
}

const TEXT_TAGS = new Set(['p','span','h1','h2','h3','h4','h5','h6','label','strong','em','small','a','li','td','th','caption','figcaption','legend','blockquote','time','code','pre','mark','b','i','u','abbr','cite','dt','dd']);
const SKIP_TAGS = new Set(['script','style','link','meta','head','title','noscript','template','slot','svg','path','circle','rect','polygon','polyline','line','ellipse','use','defs','g','symbol']);
const INLINE_TAGS = new Set(['span','strong','em','b','i','u','mark','small','abbr','code','time','cite','a']);

export async function buildNode(node: ParsedNode, parent: FrameNode, depth: number = 0): Promise<void> {
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

  // Recurse into children (sorted by zIndex to render higher z-index layers on top)
  const childrenToRender = [...node.children].sort((a, b) => {
    const zA = a.inlineStyle?.['zIndex'] ? parseInt(String(a.inlineStyle['zIndex'])) : 0;
    const zB = b.inlineStyle?.['zIndex'] ? parseInt(String(b.inlineStyle['zIndex'])) : 0;
    return zA - zB;
  });
  
  if (childrenToRender.length > 0 && depth === 0) {
     console.log(`[code.ts] Children of ${node.tag} sorted by zIndex:`, childrenToRender.map(c => `${c.tag} (z:${c.inlineStyle?.['zIndex']||0})`));
  }

  for (const child of childrenToRender) {
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


