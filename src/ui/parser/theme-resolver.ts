    // Reads theme.ts/.js from ZIP and builds a flat token map:
    // { "colors.primary": "#0D3B66", "radii.card": 16, ... }
    // ══════════════════════════════════════════════════════════
    function buildThemeMap(zipFiles) {
      const tokenMap = {};

      // Find theme file
      const themeEntry = Object.entries(zipFiles).find(([name]) =>
        /theme\.(ts|js|tsx)$/i.test(name) && !name.includes('node_modules')
      );
      if (!themeEntry) return tokenMap;

      // We already have content as string (will be passed in)
      return tokenMap; // filled below in async context
    }

    export function parseThemeContent(content) {
      const tokenMap = {};
      if (!content) return tokenMap;

      // Extract: export const colors = { primary: "#0D3B66", ... }
      // Also handles: export const radii = { card: 16, ... }
      const objectPattern = /export\s+const\s+(\w+)\s*=\s*\{([^}]+)\}/g;
      let objMatch;
      while ((objMatch = objectPattern.exec(content)) !== null) {
        const objName = objMatch[1];
        const objBody = objMatch[2];

        // Parse key: value pairs
        const kvPattern = /(\w+)\s*:\s*("([^"]+)"|'([^']+)'|`([^`]+)`|([\d.]+))/g;
        let kvMatch;
        while ((kvMatch = kvPattern.exec(objBody)) !== null) {
          const key = kvMatch[1];
          const val = kvMatch[3] || kvMatch[4] || kvMatch[5] ||
                      (kvMatch[6] !== undefined ? parseFloat(kvMatch[6]) : undefined);
          if (val !== undefined) {
            tokenMap[`${objName}.${key}`] = val;
          }
        }
      }

      // Also handle: export const cardShadow = "..."
      const constPattern = /export\s+const\s+(\w+)\s*=\s*("([^"]+)"|'([^']+)'|([\d.]+))/g;
      let cMatch;
      while ((cMatch = constPattern.exec(content)) !== null) {
        const key = cMatch[1];
        const val = cMatch[3] || cMatch[4] || (cMatch[5] !== undefined ? parseFloat(cMatch[5]) : undefined);
        if (val !== undefined) {
          tokenMap[key] = val;
        }
      }

      return tokenMap;
    }

    // Apply theme token substitution to source code
    // Replaces: colors.primary → "#0D3B66"
    export function applyThemeTokens(code: string, tokenMap: any) {
      if (!tokenMap || Object.keys(tokenMap).length === 0) return code;

      // Clean up imports of the theme so we don't accidentally replace token names inside the import block
      code = code.replace(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]*theme[^'"]*['"];?/g, '');

      // Sort by length descending so longer keys match first
      const keys = Object.keys(tokenMap).sort((a, b) => b.length - a.length);

      for (const key of keys) {
        const val = tokenMap[key];
        const valStr = typeof val === 'number' ? String(val) : `"${val}"`;
        // Replace occurrences like: colors.primary (not inside string literals ideally)
        const escapedKey = key.replace(/\./g, '\\.').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        code = code.replace(new RegExp('\\b' + escapedKey + '\\b', 'g'), valStr);
      }
      return code;
    }

    // ══════════════════════════════════════════════════════════
    // KNOWN LUCIDE / HERO ICON NAMES (treated as icon placeholders)
    // ══════════════════════════════════════════════════════════
    
    // Konversi String HSL ("210 40% 98%") menjadi Objek Skala Float sRGB Figma
    export function parseHslStringToFigmaRgb(hslString: string) {
      const clean = hslString.replace(/%/g, "").trim();
      const parts = clean.split(/\s+/);
      
      if (parts.length < 3) return { r: 1, g: 1, b: 1 };
    
      const h = parseFloat(parts[0]) / 360;
      const s = parseFloat(parts[1]) / 100;
      const l = parseFloat(parts[2]) / 100;
    
      let r = l, g = l, b = l;
    
      if (s !== 0) {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
    
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
    
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
    
      return { r, g, b };
    }