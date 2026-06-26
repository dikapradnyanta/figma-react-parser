import { ResolvedStyle } from './types';
import { hexToRgb } from './styles';

export function applyResolvedStyle(frame: FrameNode | ComponentNode | InstanceNode, style: ResolvedStyle, tag: string): void {
  // ── Layout Mode & Alignment ──
  frame.layoutMode = style.flexDirection === 'row' ? 'HORIZONTAL' : 'VERTICAL';
  
  if (style.display === 'none') {
    frame.visible = false;
  }
  
  // Smart component defaults if no layout explicitly set
  const tLower = (tag || "").toLowerCase();
  if (!style.display) {
    if (tLower === 'row' || tLower.includes('hstack')) {
      frame.layoutMode = 'HORIZONTAL';
    } else if (tLower === 'column' || tLower.includes('vstack')) {
      frame.layoutMode = 'VERTICAL';
    } else if (tLower.includes('card')) {
      if (Array.isArray(frame.fills) && frame.fills.length === 0) frame.fills = [{ type: 'SOLID', color: {r:1, g:1, b:1} }];
      if (!style.borderRadius) frame.cornerRadius = 12;
      if (!style.borderWidth) {
         frame.strokes = [{ type: 'SOLID', color: {r:0.9, g:0.9, b:0.9} }];
         frame.strokeWeight = 1;
      }
    } else if (tLower.includes('button') || tLower.includes('btn')) {
      frame.layoutMode = 'HORIZONTAL';
      frame.primaryAxisAlignItems = 'CENTER';
      frame.counterAxisAlignItems = 'CENTER';
      if (!style.borderRadius) frame.cornerRadius = 6;
      if (style.paddingLeft === undefined) {
        frame.paddingLeft = 16; frame.paddingRight = 16;
        frame.paddingTop = 8; frame.paddingBottom = 8;
      }
    } else if (tLower === 'input' || tLower.includes('textfield')) {
      if (Array.isArray(frame.fills) && frame.fills.length === 0) frame.fills = [{ type: 'SOLID', color: {r:1, g:1, b:1} }];
      if (!style.borderRadius) frame.cornerRadius = 6;
      if (!style.borderWidth) {
         frame.strokes = [{ type: 'SOLID', color: {r:0.88, g:0.9, b:0.94} }];
         frame.strokeWeight = 1;
      }
      try { frame.layoutSizingVertical = 'FIXED'; } catch(_) {}
    }
  }

  // ── Size ──
  if (style.width === 'FILL') {
    try { frame.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    try { (frame as any).layoutAlign = 'STRETCH'; } catch (_) {}
  } else if (typeof style.width === 'number') {
    try { frame.resize(Math.max(style.width, 4), Math.max(frame.height, 4)); frame.layoutSizingHorizontal = 'FIXED'; } catch(_) {}
  } else {
    try { frame.layoutSizingHorizontal = 'HUG'; } catch (_) {}
    if (tag !== 'span' && tag !== 'a' && tag !== 'i' && tag !== 'strong' && frame.parent?.type === 'FRAME' && frame.parent.layoutMode === 'VERTICAL') {
       try { frame.layoutSizingHorizontal = 'FILL'; } catch(e) {}
       try { (frame as any).layoutAlign = 'STRETCH'; } catch(e) {}
    }
  }

  if (style.height === 'FILL') {
    try { frame.layoutSizingVertical = 'FILL'; } catch (_) {}
  } else if (typeof style.height === 'number') {
    try { frame.resize(Math.max(frame.width, 4), Math.max(style.height, 4)); frame.layoutSizingVertical = 'FIXED'; } catch(_) {}
  } else {
    try { frame.layoutSizingVertical = 'HUG'; } catch (_) {}
  }

  // ── Padding & Gap ──
  if (style.paddingTop !== undefined) frame.paddingTop = style.paddingTop;
  if (style.paddingRight !== undefined) frame.paddingRight = style.paddingRight;
  if (style.paddingBottom !== undefined) frame.paddingBottom = style.paddingBottom;
  if (style.paddingLeft !== undefined) frame.paddingLeft = style.paddingLeft;
  
  if (style.gap !== undefined) {
    frame.itemSpacing = style.gap;
  }

  // ── Fills & Strokes ──
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    let rgb = hexToRgb(style.backgroundColor);
    if (!rgb) rgb = {r:0, g:0, b:0}; // fallback or map named colors later
    frame.fills = [{ type: 'SOLID', color: rgb }];
  } else if (style.backgroundColor === 'transparent') {
    frame.fills = [];
  }

  if (style.borderColor || style.borderWidth) {
    let rgb = style.borderColor ? hexToRgb(style.borderColor) : {r:0.8, g:0.8, b:0.8};
    if (rgb) frame.strokes = [{ type: 'SOLID', color: rgb }];
    frame.strokeWeight = style.borderWidth || 1;
  }

  // ── Border Radius ──
  if (style.borderRadius !== undefined) {
    try { frame.cornerRadius = style.borderRadius; } catch(_) {}
  }
  if (style.borderTopLeftRadius !== undefined) try { (frame as any).topLeftRadius = style.borderTopLeftRadius; } catch(_) {}
  if (style.borderTopRightRadius !== undefined) try { (frame as any).topRightRadius = style.borderTopRightRadius; } catch(_) {}
  if (style.borderBottomLeftRadius !== undefined) try { (frame as any).bottomLeftRadius = style.borderBottomLeftRadius; } catch(_) {}
  if (style.borderBottomRightRadius !== undefined) try { (frame as any).bottomRightRadius = style.borderBottomRightRadius; } catch(_) {}

  // ── Alignment ──
  if (style.alignItems && style.alignItems !== 'SPACE_BETWEEN') {
    frame.counterAxisAlignItems = style.alignItems as "MIN" | "MAX" | "CENTER" | "BASELINE";
  }
  if (style.justifyContent) {
    frame.primaryAxisAlignItems = style.justifyContent;
  }

  // ── Positioning ──
  if (style.isAbsolute) {
    try { frame.layoutPositioning = 'ABSOLUTE'; } catch(e) {}
    let hConstraint: ConstraintType = 'MIN';
    let vConstraint: ConstraintType = 'MIN';
    
    if (style.left !== undefined && style.right !== undefined) hConstraint = 'STRETCH';
    else if (style.right !== undefined) hConstraint = 'MAX';
    else if (style.left !== undefined) hConstraint = 'MIN';

    if (style.top !== undefined && style.bottom !== undefined) vConstraint = 'STRETCH';
    else if (style.bottom !== undefined) vConstraint = 'MAX';
    else if (style.top !== undefined) vConstraint = 'MIN';

    try {
       frame.constraints = { horizontal: hConstraint, vertical: vConstraint };
       
       if (hConstraint === 'MAX' && style.right !== undefined) {
           const parentW = frame.parent && 'width' in frame.parent ? frame.parent.width : 375;
           frame.x = parentW - frame.width - style.right;
       } else if (hConstraint === 'STRETCH' && style.left !== undefined && style.right !== undefined) {
           const parentW = frame.parent && 'width' in frame.parent ? frame.parent.width : 375;
           frame.x = style.left;
           frame.resize(Math.max(parentW - style.left - style.right, 4), Math.max(frame.height, 4));
       } else if (style.left !== undefined) {
           frame.x = style.left;
       }
       
       if (vConstraint === 'MAX' && style.bottom !== undefined) {
           const parentH = frame.parent && 'height' in frame.parent ? frame.parent.height : 812;
           frame.y = parentH - frame.height - style.bottom;
       } else if (vConstraint === 'STRETCH' && style.top !== undefined && style.bottom !== undefined) {
           const parentH = frame.parent && 'height' in frame.parent ? frame.parent.height : 812;
           frame.y = style.top;
           frame.resize(Math.max(frame.width, 4), Math.max(parentH - style.top - style.bottom, 4));
       } else if (style.top !== undefined) {
           frame.y = style.top;
       }
    } catch (_) {}
  }

  if (style.opacity !== undefined) {
    frame.opacity = style.opacity;
  }
}

export function applyResolvedTextStyle(t: TextNode, style: ResolvedStyle): void {
  if (style.fontSize !== undefined) {
    t.fontSize = style.fontSize;
  }
  
  if (style.fontWeight !== undefined) {
    try {
      t.fontName = { family: 'Inter', style: style.fontWeight };
    } catch(_) {}
  }

  if (style.color) {
    let rgb = hexToRgb(style.color);
    if (!rgb) rgb = {r:0, g:0, b:0};
    t.fills = [{ type: 'SOLID', color: rgb }];
  }

  if (style.textAlign) {
    t.textAlignHorizontal = style.textAlign;
  }

  if (style.lineHeight !== undefined) {
    if (typeof style.lineHeight === 'number') {
      if (style.lineHeight <= 3) {
         try { t.lineHeight = { unit: 'PERCENT', value: style.lineHeight * 100 }; } catch(_) {}
      } else {
         try { t.lineHeight = { unit: 'PIXELS', value: style.lineHeight }; } catch(_) {}
      }
    }
  }
}
