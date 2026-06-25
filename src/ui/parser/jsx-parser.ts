import { parseInlineStyles } from './inline-style-parser';

    // ═══════════════════════════════════════════════════════════
    export const ICON_NAMES = new Set([
      'Bell','Search','BookText','Home','BookOpen','ClipboardList','MessagesSquare',
      'Clock','ChevronLeft','ChevronRight','ArrowRight','ArrowLeft','FileQuestion',
      'Star','Heart','Share','Plus','Minus','X','Check','Info','AlertCircle',
      'User','Settings','Menu','Grid','List','Filter','Download','Upload',
      'Phone','Mail','Map','Camera','Image','Video','Music','File','Folder',
      'Edit','Trash','Copy','Clipboard','Lock','Unlock','Eye','EyeOff',
      'Loader','RefreshCw','MoreHorizontal','MoreVertical','ChevronDown','ChevronUp',
      'Send','Mic','Paperclip','Smile','Globe','Wifi','Battery','Bluetooth',
      'Sun','Moon','Cloud','Zap','Gift','Tag','Bookmark','Flag','Award',
      'TrendingUp','TrendingDown','BarChart','PieChart','Activity',
      'ShoppingCart','ShoppingBag','CreditCard','DollarSign','Package',
    ]);

    function cleanCode(code) {
      let cleaned = code.replace(/\/\/[^\n]*/g, '');
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      return cleaned;
    }

    export function parseAllComponents(code) {
      const src = cleanCode(code);
      const components = [];
      
      const pattern = /(?:(?:export\s+(?:default\s+)?)?(?:async\s+)?function|(?:export\s+)?const)\s+([A-Z][a-zA-Z0-9_]*)\s*(?:=\s*(?:async\s+)?(?:\([^\)]*\)|[a-zA-Z0-9_]+)\s*=>|\([^\)]*\))/g;
      
      let match;
      const matches = [];
      while ((match = pattern.exec(src)) !== null) {
        matches.push({ name: match[1], index: match.index });
      }
      
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const nextIdx = i + 1 < matches.length ? matches[i+1].index : src.length;
        const block = src.slice(current.index, nextIdx);
        
        const m = block.match(/(?:return|=>)\s*[\(\s]*(<[a-zA-Z<\/])/);
        if (m) {
          const startIdx = current.index + m.index + m[0].length - m[1].length;
          try {
            const parser = new JSXParser(src, startIdx);
            const result = parser.parseElement();
            if (result) components.push({ name: current.name, tree: result });
          } catch(e) {}
        }
      }
      return components;
    }

    export class JSXParser {
      constructor(src, pos = 0) {
        this.src = src;
        this.pos = pos;
      }

      skipWS() {
        while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++;
      }

      skipExprAndExtractJSX() {
        if (this.src[this.pos] !== '{') return [];
        const exprStart = this.pos;
        this.pos++;
        let depth = 1;
        let jsxChildren = [];

        // Check if this is a .map() expression
        const exprPreview = this.src.slice(exprStart, Math.min(this.src.length, exprStart + 80));
        const isMapExpr = /\.(map|filter|flatMap)\s*\(/.test(exprPreview);

        while (this.pos < this.src.length && depth > 0) {
          const ch = this.src[this.pos];
          if (ch === '{') { depth++; this.pos++; continue; }
          if (ch === '}') {
            depth--;
            if (depth === 0) { this.pos++; break; }
            this.pos++; continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') {
            const q = ch; this.pos++;
            while (this.pos < this.src.length) {
              const c2 = this.src[this.pos];
              this.pos++;
              if (c2 === '\\') { this.pos++; continue; }
              if (c2 === q) break;
            }
            continue;
          }
          if (ch === '<') {
            const next = this.src[this.pos + 1];
            if (/[a-zA-Z\/!]/.test(next)) {
              const savedPos = this.pos;
              try {
                const child = this.parseElement();
                if (child) {
                  // If .map(), duplicate 2x extra as placeholders
                  if (isMapExpr && jsxChildren.length === 0) {
                    jsxChildren.push(child);
                    jsxChildren.push(JSON.parse(JSON.stringify(child)));
                    jsxChildren.push(JSON.parse(JSON.stringify(child)));
                  } else {
                    jsxChildren.push(child);
                  }
                  continue;
                }
              } catch (_) {}
              this.pos = savedPos;
            }
          }
          this.pos++;
        }

        // Add dummy text for simple expressions
        if (jsxChildren.length === 0) {
          const exprContent = this.src.slice(exprStart + 1, this.pos - 1).trim();
          if (exprContent.length > 0 && exprContent.length < 60 && !exprContent.includes('=>')) {
            jsxChildren.push({
              tag: '_text',
              classes: [],
              text: '…',
              attrs: {},
              children: [],
              inlineStyle: {},
              _textOnly: true,
            });
          }
        }
        return jsxChildren;
      }

      readTagName() {
        const s = this.pos;
        while (this.pos < this.src.length && /[a-zA-Z0-9_\-\.]/.test(this.src[this.pos])) this.pos++;
        return this.src.slice(s, this.pos);
      }

      // Read the raw string content of an attribute value (for style={{}})
      readAttrValueRaw() {
        const ch = this.src[this.pos];
        if (ch === '"' || ch === "'") {
          const q = ch; this.pos++;
          const s = this.pos;
          while (this.pos < this.src.length && this.src[this.pos] !== q) this.pos++;
          const v = this.src.slice(s, this.pos);
          this.pos++;
          return { type: 'string', value: v };
        }
        if (ch === '{') {
          this.pos++;
          let depth = 1;
          const start = this.pos;
          while (this.pos < this.src.length && depth > 0) {
            const c = this.src[this.pos];
            if (c === '{') depth++;
            else if (c === '}') { depth--; if (depth === 0) { this.pos++; break; } }
            else if (c === '"' || c === "'" || c === '`') {
              const q = c; this.pos++;
              while (this.pos < this.src.length) {
                const c2 = this.src[this.pos++];
                if (c2 === '\\') { this.pos++; continue; }
                if (c2 === q) break;
              }
              continue;
            }
            this.pos++;
          }
          return { type: 'expr', value: this.src.slice(start, this.pos - 1) };
        }
        return { type: 'string', value: '' };
      }

      readAttrValue() {
        const raw = this.readAttrValueRaw();
        if (raw.type === 'string') return raw.value;
        // For expr, try to extract string literals
        const expr = raw.value;
        const strLits = [];
        const re = /['"`]([^'"`]+)['"`]/g;
        let m;
        while ((m = re.exec(expr)) !== null) strLits.push(m[1]);
        return strLits.length > 0 ? strLits.join(' ') : expr.trim().replace(/[^a-zA-Z0-9\s\-_]/g, ' ').trim();
      }

      readAttrs() {
        const attrs = {};
        let styleRaw = null;

        while (this.pos < this.src.length) {
          this.skipWS();
          const ch = this.src[this.pos];
          if (ch === '>' || ch === '/') break;
          if (this.pos >= this.src.length) break;

          const ns = this.pos;
          while (this.pos < this.src.length && !/[\s=>/\n{]/.test(this.src[this.pos])) this.pos++;
          const name = this.src.slice(ns, this.pos).trim();
          if (!name) { this.pos++; continue; }

          this.skipWS();
          if (this.src[this.pos] === '=') {
            this.pos++;
            this.skipWS();

            // Special handling for style={{ }}
            if (name === 'style' && this.src[this.pos] === '{') {
              // Read outer { of style={
              this.pos++;
              this.skipWS();
              // Now read inner { of {{
              if (this.src[this.pos] === '{') {
                let depth = 1; this.pos++;
                const start = this.pos;
                while (this.pos < this.src.length && depth > 0) {
                  const c = this.src[this.pos];
                  if (c === '{') depth++;
                  else if (c === '}') { depth--; if (depth === 0) break; }
                  else if (c === '"' || c === "'" || c === '`') {
                    const q = c; this.pos++;
                    while (this.pos < this.src.length) {
                      const c2 = this.src[this.pos++];
                      if (c2 === '\\') { this.pos++; continue; }
                      if (c2 === q) break;
                    }
                    continue;
                  }
                  this.pos++;
                }
                styleRaw = this.src.slice(start, this.pos);
                this.pos++; // closing }
                this.skipWS();
                if (this.src[this.pos] === '}') this.pos++; // closing outer }
              } else {
                // style={ expr } without double brace
                let depth = 1;
                const start = this.pos;
                while (this.pos < this.src.length && depth > 0) {
                  const c = this.src[this.pos];
                  if (c === '{') depth++;
                  else if (c === '}') { depth--; if (depth === 0) break; }
                  this.pos++;
                }
                styleRaw = this.src.slice(start, this.pos);
                this.pos++;
              }
            } else {
              attrs[name] = this.readAttrValue();
            }
          } else if (this.src[this.pos] === '{') {
            this.skipExprAndExtractJSX();
          } else {
            attrs[name] = 'true';
          }
        }

        // Parse styleRaw into inlineStyle object
        if (styleRaw) {
          attrs['__inlineStyle'] = parseInlineStyles(styleRaw);
        }

        return attrs;
      }

      parseElement() {
        this.skipWS();
        if (this.pos >= this.src.length || this.src[this.pos] !== '<') return null;
        if (this.src[this.pos + 1] === '/') return null;
        if (this.src.startsWith('<!--', this.pos)) {
          const end = this.src.indexOf('-->', this.pos);
          this.pos = end !== -1 ? end + 3 : this.src.length;
          return null;
        }
        if (this.src[this.pos + 1] === '>') {
          this.pos += 2;
          const children = this.parseChildren('');
          return this.makeNode('div', {}, children, '');
        }

        this.pos++;
        this.skipWS();
        const tag = this.readTagName();
        if (!tag) { this.pos--; return null; }

        const attrs = this.readAttrs();
        this.skipWS();

        if (this.src[this.pos] === '/') {
          this.pos += 2;
          return this.makeNode(tag, attrs, [], '');
        }
        if (this.src[this.pos] !== '>') return null;
        this.pos++;

        if (tag === 'script' || tag === 'style') {
          const ct = `</${tag}>`;
          const ci = this.src.indexOf(ct, this.pos);
          this.pos = ci !== -1 ? ci + ct.length : this.src.length;
          return null;
        }

        const children = this.parseChildren(tag);
        return this.makeNode(tag, attrs, children, '');
      }

      parseChildren(parentTag) {
        const children = [];
        let safetyLimit = 2000;

        while (this.pos < this.src.length && safetyLimit-- > 0) {
          const ch = this.src[this.pos];

          if (ch === '<') {
            if (this.src[this.pos + 1] === '/') {
              while (this.pos < this.src.length && this.src[this.pos] !== '>') this.pos++;
              this.pos++;
              break;
            }
            if (this.src[this.pos + 1] === '>' && parentTag === '') {
              this.pos += 2; break;
            }
            const savedPos = this.pos;
            const child = this.parseElement();
            if (child) {
              children.push(child);
            } else if (this.pos === savedPos) {
              this.pos++;
            }
          } else if (ch === '{') {
            const innerJSX = this.skipExprAndExtractJSX();
            for (const n of innerJSX) children.push(n);
          } else {
            const s = this.pos;
            while (this.pos < this.src.length && this.src[this.pos] !== '<' && this.src[this.pos] !== '{') {
              this.pos++;
            }
            const rawText = this.src.slice(s, this.pos).trim();
            if (rawText && !/\b(function|const|let|export)\b/.test(rawText)) {
              if (children.length > 0 && children[children.length - 1]._textOnly) {
                children[children.length - 1].text += ' ' + rawText;
              } else if (rawText.length > 0 && rawText.length < 500) {
                children.push({ tag: '_text', classes: [], text: rawText, attrs: {}, children: [], _textOnly: true });
              }
            }
          }
        }
        return children;
      }

      makeNode(tag, attrs, children, text) {
        const classStr = attrs['className'] || attrs['class'] || '';
        const classes = classStr
          .split(/\s+/)
          .map(c => c.trim())
          .filter(c => c.length > 0 && !/[(){},]/.test(c));

        const inlineStyle = attrs['__inlineStyle'] || {};

        const cleanAttrs = {};
        for (const [k, v] of Object.entries(attrs)) {
          if (k !== 'className' && k !== 'class' && k !== '__inlineStyle') cleanAttrs[k] = v;
        }

        if (tag === '_text') {
          return { tag: 'span', classes: [], text, attrs: {}, children: [], inlineStyle: {} };
        }

        // Check if this is a known icon
        const isIcon = ICON_NAMES.has(tag);

        let inlineText = text || '';
        const realChildren = [];
        for (const child of children) {
          if (child._textOnly || child.tag === '_text') {
            inlineText += (inlineText ? ' ' : '') + child.text;
          } else {
            realChildren.push(child);
          }
        }

        return {
          tag,
          classes,
          text: inlineText.trim(),
          attrs: cleanAttrs,
          children: realChildren,
          inlineStyle,
          isIcon,
        };
      }
    }