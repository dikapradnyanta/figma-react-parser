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
    export function applyThemeTokens(code, tokenMap) {
      if (!tokenMap || Object.keys(tokenMap).length === 0) return code;

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
    