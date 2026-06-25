    // Parses style={{ key: value, ... }} from JSX
    // Returns a flat object of CSS-like properties
    // ═══════════════════════════════════════════════════════════
    function parseInlineStyleStr(str) {
      // str is the content inside style={{ ... }}
      // After theme token substitution, values should be literals like "16" or '"#0D3B66"'
      const style = {};
      if (!str) return style;

      // Remove outer {{ }} if present
      str = str.trim();
      if (str.startsWith('{')) str = str.slice(1);
      if (str.endsWith('}')) str = str.slice(0, -1);

      // Parse key: value pairs
      // Handles: key: "string", key: 123, key: `template`, key: `${expr}`, key: "val" + "val"
      const kvRe = /([a-zA-Z]+[a-zA-Z0-9]*)\s*:\s*/g;
      let match;
      const positions = [];
      while ((match = kvRe.exec(str)) !== null) {
        positions.push({ key: match[1], start: match.index + match[0].length, keyEnd: match.index });
      }

      for (let i = 0; i < positions.length; i++) {
        const { key, start } = positions[i];
        const end = i + 1 < positions.length ? positions[i + 1].keyEnd : str.length;
        let rawVal = str.slice(start, end).trim().replace(/,\s*$/, '').trim();

        // Extract the value
        let val = extractStyleValue(rawVal);
        if (val !== null && val !== undefined) {
          // Convert camelCase CSS key  
          style[key] = val;
        }
      }

      return style;
    }

    function extractStyleValue(raw) {
      if (!raw) return null;
      raw = raw.trim();

      // Ternary: cond ? A : B
      if (raw.includes('?')) {
        // Split by ? and : but be careful with colons in strings?
        // Actually since we just need the last part, we can just take everything after the last colon,
        // or just use a simple regex for `cond ? A : B`
        const colonIdx = raw.lastIndexOf(':');
        if (colonIdx !== -1) {
          const fallback = raw.slice(colonIdx + 1).trim();
          return extractStyleValue(fallback);
        }
      }

      // Quoted string: "..." or '...'
      if ((raw.startsWith('"') && raw.endsWith('"')) ||
          (raw.startsWith("'") && raw.endsWith("'"))) {
        return raw.slice(1, -1);
      }
      // Template literal: `...`
      if (raw.startsWith('`') && raw.endsWith('`')) {
        return raw.slice(1, -1).replace(/\$\{[^}]+\}/g, '??');
      }
      // Pure number
      if (/^-?[\d.]+$/.test(raw)) return parseFloat(raw);
      // Expression with + concatenation like "1px solid " + "#EEF1F5"
      if (raw.includes('+')) {
        const parts = raw.split('+').map(p => {
          p = p.trim();
          if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p.slice(1,-1);
          return p;
        });
        return parts.join('');
      }
      // rgba()/rgb() function
      if (/^rgba?\(/.test(raw)) return raw;
      // Already resolved hex or named color  
      if (/^#[0-9a-fA-F]+$/.test(raw)) return raw;
      // Number with px unit
      if (/^[\d.]+px$/.test(raw)) return parseFloat(raw);
      // 999 (border radius shorthand)
      if (/^\d+$/.test(raw)) return parseInt(raw);

      return null;
    }

    // ═══════════════════════════════════════════════════════════
    