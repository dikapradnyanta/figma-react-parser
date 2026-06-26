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

export function hexToRgb(hex: string): RGB {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 } : { r: 1, g: 1, b: 1 };
}

export function getSpacing(val: string): number {
  return parseInt(val) || 0;
}

