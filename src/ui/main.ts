import { parseThemeContent, applyThemeTokens } from './parser/theme-resolver';
import { parseAllComponents, ICON_NAMES } from './parser/jsx-parser';

import './style.css';

// ── UI SETUP ──────────────────────────────────────────────
    const dropzone   = document.getElementById('dropzone');
    const fileInput  = document.getElementById('fileInput');
    const statusArea = document.getElementById('status-area');
    const statusLabel= document.getElementById('status-label');
    const progressBar= document.getElementById('progress-bar');
    const logArea    = document.getElementById('log-area');

    function log(msg, type = 'info') {
      const el = document.createElement('div');
      el.className = `log-line log-${type}`;
      el.textContent = msg;
      logArea.appendChild(el);
      logArea.scrollTop = logArea.scrollHeight;
    }
    function setProgress(pct, label) {
      progressBar.style.width = pct + '%';
      if (label) statusLabel.textContent = label;
    }
    
    const copyLogBtn = document.getElementById('copy-log-btn');
    if (copyLogBtn) {
      copyLogBtn.addEventListener('click', () => {
        const text = logArea.innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalHTML = copyLogBtn.innerHTML;
          copyLogBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => copyLogBtn.innerHTML = originalHTML, 1500);
        });
      });
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('hover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('hover'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault(); dropzone.classList.remove('hover');
      if (e.dataTransfer.files.length) handleZip(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => { if (e.target.files.length) handleZip(e.target.files[0]); });

    onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      if (msg.type === 'status') {
        if (msg.progress !== undefined) setProgress(msg.progress, msg.text);
        log(msg.text, msg.isError ? 'error' : msg.done ? 'success' : 'info');
      } else if (msg.type === 'log') {
        log(msg.text, msg.logType || 'info');
      }
    };

    // ══════════════════════════════════════════════════════════
    // ICON_NAMES is now imported from jsx-parser.ts

    // ── ZIP HANDLER ───────────────────────────────────────────
    async function handleZip(file) {
      statusArea.classList.add('visible');
      logArea.innerHTML = '';
      setProgress(5, 'Reading ZIP...');
      log('📦 ' + file.name);

      try {
        const zip = await JSZip.loadAsync(file);

        // ── Step 1: Build theme token map ──
        setProgress(10, 'Reading design tokens...');
        let tokenMap = {};
        for (const [filename, entry] of Object.entries(zip.files)) {
          if (entry.dir) continue;
          if (/theme\.(ts|js|tsx)$/i.test(filename) && !filename.includes('node_modules')) {
            const content = await entry.async('text');
            tokenMap = parseThemeContent(content);
            const count = Object.keys(tokenMap).length;
            log(`🎨 Theme loaded: ${count} tokens from ${filename}`, 'success');
            for (const [k, v] of Object.entries(tokenMap).slice(0, 6)) {
              log(`   ${k} = ${v}`, 'info');
            }
            break;
          }
        }

        // ── Step 2: Collect .tsx/.jsx files ──
        const filesData = [];
        setProgress(15, 'Scanning files...');
        for (const [filename, entry] of Object.entries(zip.files)) {
          if (entry.dir) continue;
          if (filename.includes('node_modules')) continue;
          const lname = filename.toLowerCase();
          if (lname.endsWith('.tsx') || lname.endsWith('.jsx')) {
            const rawContent = await entry.async('text');
            // Apply theme token substitution before parsing
            const content = applyThemeTokens(rawContent, tokenMap);
            filesData.push({ filename, content });
            log('✓ ' + filename, 'info');
          }
        }

        if (!filesData.length) {
          setProgress(0, '⚠️ No .tsx/.jsx files found');
          log('No React files found!', 'error'); return;
        }

        setProgress(30, `Parsing ${filesData.length} React files...`);

        // ── PASS 1: Parse ALL files into component map ──
        const componentMap = {}; // name -> tree
        const parsedFiles = [];

        for (const f of filesData) {
          try {
            const comps = parseAllComponents(f.content);
            if (comps.length > 0) {
              for (const { name, tree } of comps) {
                componentMap[name] = tree;
                // Only push the first (main) component as the screen, or if it's explicitly a screen
                // Actually, let's push ALL components to parsedFiles so they can be resolved.
                parsedFiles.push({ filename: f.filename, name, tree });
                log(`  ✓ parsed: ${name} (${countNodes(tree)} nodes)`, 'success');
              }
            } else {
              log(`  ⚠ no JSX: ${f.filename.split('/').pop()}`, 'info');
            }
          } catch(e) {
            log(`  ✗ error: ${f.filename.split('/').pop()}: ${e.message}`, 'error');
          }
        }

        // ── PASS 2: Inline/resolve custom components ──
        setProgress(50, 'Resolving components...');
        for (const f of parsedFiles) {
          resolveTree(f.tree, componentMap, new Set([f.name]));
        }

        // ── PASS 3: Select screens ──
        // Skip wrapper/shell components
        const SKIP_COMPONENTS = new Set(['App', 'PhoneFrame', 'BottomNav', 'Layout', 'Root', 'Provider', 'Router']);

        // Priority: files in pages/screens/views, or named Screen/Page/View, or have >= 15 nodes
        let screens = parsedFiles.filter(f => {
          if (SKIP_COMPONENTS.has(f.name)) return false;
          const path = f.filename.toLowerCase();
          // Skip UI library components
          if (path.includes('/ui/') || path.includes('components/ui')) return false;
          
          if (path.includes('/pages/') || path.includes('/screens/') || path.includes('/views/')) return true;
          if (/screen|page|view/i.test(f.name)) return true;
          // Substantial components are treated as screens
          if (countNodes(f.tree) >= 15) return true;
          
          return false;
        });

        screens.sort((a, b) => countNodes(b.tree) - countNodes(a.tree));

        // Logical sorting
        const orderMap = { "home": 1, "materials": 2, "quiz": 3, "forum": 4 };
        screens.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          const weightA = Object.keys(orderMap).find(k => nameA.includes(k)) ? orderMap[Object.keys(orderMap).find(k => nameA.includes(k))] : 99;
          const weightB = Object.keys(orderMap).find(k => nameB.includes(k)) ? orderMap[Object.keys(orderMap).find(k => nameB.includes(k))] : 99;
          return weightA - weightB || a.name.localeCompare(b.name);
        });

        // Extract components (non-screens)
        const components = parsedFiles.filter(f => !screens.includes(f) && !SKIP_COMPONENTS.has(f.name));

        log(`✅ ${screens.length} screens, ${components.length} components`, 'success');
        screens.forEach(s => log(`  📱 ${s.name}`, 'success'));
        components.forEach(c => log(`  🧩 ${c.name}`, 'info'));

        setProgress(60, 'Sending to Figma...');
        parent.postMessage({ pluginMessage: { type: 'parse-files', screens, components, tokens: tokenMap } }, '*');

      } catch (err) {
        setProgress(0, 'Error: ' + err.message);
        log('Error: ' + err.message, 'error');
        console.error(err);
      }
    }

    // ── HELPER: count total nodes ──
    function countNodes(node) {
      if (!node) return 0;
      return 1 + (node.children || []).reduce((s, c) => s + countNodes(c), 0);
    }

    let dynamicIcons = new Set();

    // ── CODE CLEANER ──
    function cleanCode(code) {
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
      let m;
      while ((m = importRegex.exec(code)) !== null) {
        const icons = m[1].split(',').map(s => s.trim()).filter(s => s);
        icons.forEach(i => dynamicIcons.add(i));
      }
      if (dynamicIcons.size > 0) {
        console.log('[ui.html] Detected dynamic lucide-react icons:', Array.from(dynamicIcons));
      }

      code = code.replace(/\/\/[^\n]*/g, '');
      code = code.replace(/\/\*[\s\S]*?\*\//g, '');
      code = code.replace(/^import\b[^\n]*\n?/gm, '');
      return code;
    }

    // ── COMPONENT RESOLVER ──
    function resolveTree(node, map, visited, depth = 0) {
      if (!node || depth > 12) return;

      const isCustom = /^[A-Z]/.test(node.tag);
      // Skip known icon components
      if (isCustom && (ICON_NAMES.has(node.tag) || dynamicIcons.has(node.tag))) {
        node.isIcon = true;
        return;
      }

      if (isCustom && !visited.has(node.tag)) {
        // Tag is a known component. Instead of inlining, mark it so plugin creates an instance.
        const def = map[node.tag];
        if (def) {
          // We don't inline anymore. We keep node.tag as "CourseCard"
          // We still resolve children in case they have custom tags.
          for (const child of node.children || []) resolveTree(child, map, visited, depth + 1);
          return;
        }
      }

      for (const child of node.children || []) resolveTree(child, map, visited, depth + 1);
    }

    // ═══════════════════════════════════════════════════════════