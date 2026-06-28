import JSZip from 'jszip';
import { parseThemeContent, applyThemeTokens, parseCssVariables, parseTailwindConfig } from './parser/theme-resolver';
import { parseAllComponents, ICON_NAMES, ParseOptions } from './parser/jsx-parser';

import type { ParsedScreen, ComponentNode as ParsedComponentNode } from '../plugin/types';

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
        // Use textarea and execCommand for Figma UI sandbox compatibility
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          const originalHTML = copyLogBtn.innerHTML;
          copyLogBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14ae5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => copyLogBtn.innerHTML = originalHTML, 1500);
        } catch (err) {
          console.error('Copy failed', err);
        } finally {
          document.body.removeChild(textarea);
        }
      });
    }

    let lastParsedAST: any = null;
    const copyAstBtn = document.getElementById('copy-ast-btn');
    if (copyAstBtn) {
      copyAstBtn.addEventListener('click', () => {
        if (!lastParsedAST) return;
        const text = JSON.stringify(lastParsedAST, null, 2);
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          const originalHTML = copyAstBtn.innerHTML;
          copyAstBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14ae5c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => copyAstBtn.innerHTML = originalHTML, 1500);
        } catch (err) {
          console.error('Copy AST failed', err);
        } finally {
          document.body.removeChild(textarea);
        }
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

    // ── Helpers for Parse Report ──
    function renderParseReport(
      successList: { name: string; nodes: number; filename: string }[],
      failList: { filename: string; reason: string }[],
      skipList: { filename: string }[]
    ) {
      const reportEl = document.getElementById('parse-report');
      const statsEl  = document.getElementById('report-stats');
      const successListEl = document.getElementById('report-success-list');
      const failListEl    = document.getElementById('report-fail-list');
      if (!reportEl || !statsEl || !successListEl || !failListEl) return;

      // Stats row
      statsEl.innerHTML = `
        <div class="report-stat-item"><span class="report-stat-dot dot-success"></span>${successList.length} file sukses</div>
        <div class="report-stat-item"><span class="report-stat-dot dot-fail"></span>${failList.length} file gagal</div>
        <div class="report-stat-item"><span class="report-stat-dot dot-skip"></span>${skipList.length} file dilewati</div>
      `;

      // Success column
      successListEl.innerHTML = successList.length
        ? successList.map(s =>
            `<div class="report-list-item">
               <span class="item-name">${s.name}</span>
               <span class="item-detail">(${s.nodes} nodes)</span>
             </div>`
          ).join('')
        : '<div style="color:#484F58;">— tidak ada —</div>';

      // Fail column
      failListEl.innerHTML = failList.length
        ? failList.map(f =>
            `<div class="report-list-item">
               <span class="item-name">${f.filename.split('/').pop()}</span>
               <span class="item-detail" title="${f.reason}">!</span>
             </div>`
          ).join('')
        : '<div style="color:#484F58;">— tidak ada —</div>';

      reportEl.style.display = 'block';
    }

    // ── ZIP HANDLER ───────────────────────────────────────────
    async function handleZip(file) {
      statusArea.classList.add('visible');
      logArea.innerHTML = '';

      // Hide old report
      const reportEl = document.getElementById('parse-report');
      if (reportEl) reportEl.style.display = 'none';

      setProgress(5, 'Reading ZIP...');
      log('Package: ' + file.name);
      
      const minNodeInput = document.getElementById('minNodeInput') as HTMLInputElement;
      const minNodeCount = minNodeInput ? parseInt(minNodeInput.value, 10) || 5 : 5;
      
      const frameTemplateSelect = document.getElementById('frameTemplateSelect') as HTMLSelectElement;
      const frameTemplate = frameTemplateSelect ? frameTemplateSelect.value : '375x812';

      const frameworkSelect = document.getElementById('frameworkSelect') as HTMLSelectElement;
      const framework = (frameworkSelect?.value || 'generic') as ParseOptions['framework'];

      const mockCountInput = document.getElementById('mockCountInput') as HTMLInputElement;
      const mockCount = mockCountInput ? Math.max(1, parseInt(mockCountInput.value, 10) || 3) : 3;

      log(`Framework: ${frameworkSelect?.options[frameworkSelect.selectedIndex]?.text || framework}`, 'info');
      log(`Mock items per .map(): ${mockCount}`, 'info');

      // ── Parse tracking ──
      const parseSuccessList: { name: string; nodes: number; filename: string }[] = [];
      const parseFailList: { filename: string; reason: string }[] = [];
      const parseSkipList: { filename: string }[] = [];

      const parseOptions: ParseOptions = { framework, mockCount };

      try {
        const zip = await JSZip.loadAsync(file);

        // ── Step 1: Build theme token map ──
        setProgress(10, 'Reading design tokens...');
        let tokenMap = {};
        for (const [filename, entry] of Object.entries(zip.files)) {
          if (entry.dir || filename.includes('node_modules')) continue;
          
          let fileTokens = {};
          
          if (/theme\.(ts|js|tsx)$/i.test(filename)) {
            const content = await entry.async('text');
            fileTokens = parseThemeContent(content);
          } else if (/\.css$/i.test(filename)) {
            const content = await entry.async('text');
            fileTokens = parseCssVariables(content);
          } else if (/tailwind\.config\.(js|ts)$/i.test(filename)) {
            const content = await entry.async('text');
            fileTokens = parseTailwindConfig(content);
          }
          
          const count = Object.keys(fileTokens).length;
          if (count > 0) {
            tokenMap = { ...tokenMap, ...fileTokens };
            log(`Theme loaded: ${count} tokens from ${filename}`, 'success');
            for (const [k, v] of Object.entries(fileTokens).slice(0, 3)) {
              log(`   ${k} = ${v}`, 'info');
            }
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
            log('Loaded: ' + filename, 'info');
          }
        }

        if (!filesData.length) {
          setProgress(0, 'No .tsx/.jsx files found');
          log('No React files found!', 'error'); return;
        }

        setProgress(30, `Parsing ${filesData.length} React files...`);

        // ── PASS 1: Parse ALL files into component map ──
        const componentMap: Record<string, ParsedComponentNode> = {}; // name -> tree
        const parsedFiles: ParsedScreen[] = [];

        for (const f of filesData) {
          try {
            const comps = parseAllComponents(f.content, f.filename, parseOptions);
            if (comps.length > 0) {
              for (const { name, tree, isDefaultExport } of comps) {
                componentMap[name] = tree;
                // Only push the first (main) component as the screen, or if it's explicitly a screen
                // Actually, let's push ALL components to parsedFiles so they can be resolved.
                parsedFiles.push({ filename: f.filename, name, tree, isDefaultExport });
                const nodeCount = countNodes(tree);
                log(`  Parsed: ${name} (${nodeCount} nodes)`, 'success');
                parseSuccessList.push({ name, nodes: nodeCount, filename: f.filename });
              }
            } else {
              log(`  No JSX: ${f.filename.split('/').pop()}`, 'info');
              parseSkipList.push({ filename: f.filename });
            }
          } catch(e: any) {
            log(`  Error parsing ${f.filename}: ${e?.message || String(e)}`, 'error');
            parseFailList.push({ filename: f.filename, reason: e?.message || String(e) });
          }
        }

        // ── PASS 2: Inline/resolve custom components ──
        setProgress(50, 'Resolving components...');
        for (const f of parsedFiles) {
          resolveTree(f.tree, componentMap, new Set([f.name]));
        }

        // ── PASS 3: Determine Screens vs Components ──
        // Skip wrapper/shell components
        const SKIP_COMPONENTS = new Set(['BottomNav', 'Provider', 'Router', 'Root', 'Layout', 'App']);

        // Priority: files in pages/screens/views/app, or named Screen/Page/View/App, or have >= 15 nodes
        let screens = parsedFiles.filter(f => {
          if (SKIP_COMPONENTS.has(f.name)) return false;
          
          const nodes = countNodes(f.tree);
          const path = f.filename.toLowerCase();
          
          // Skip UI library components (Shadcn ui/ directory)
          if (path.includes('/ui/') || path.includes('components/ui')) return false;

          // 1. Explicitly page files (page.tsx, index.tsx) — always screens
          if (path.endsWith('page.tsx') || path.endsWith('page.jsx')) return true;
          if (path.endsWith('index.tsx') || path.endsWith('index.jsx')) {
            // Only if in a screen-like folder (not root index)
            if (path.includes('/pages/') || path.includes('/screens/') || path.includes('/views/')) return true;
          }

          // 2. Directory-based: pages/, screens/, views/ — always screens
          if (path.includes('/pages/') || path.includes('/screens/') || path.includes('/views/')) return true;
          
          // 3. app.tsx at root or in src/app
          if (path.endsWith('app.tsx') || path.endsWith('app.jsx')) return true;

          // 4. Component name contains Screen/Page/View keywords (case-insensitive)
          if (/screen|page|view|home|dashboard|login|register|profile|detail|list|feed/i.test(f.name)) return true;
          
          // 5. Substantial components with enough nodes are treated as screens
          // (regardless of isDefaultExport, since many screen files export with named export)
          if (nodes >= Math.max(8, minNodeCount)) return true;
          
          return false;
        });

        // Fallback: if no screens found but we have parsed files, take the biggest ones
        if (screens.length === 0 && parsedFiles.length > 0) {
          screens = parsedFiles
            .filter(f => !SKIP_COMPONENTS.has(f.name) && !f.filename.toLowerCase().includes('/ui/'))
            .sort((a, b) => countNodes(b.tree) - countNodes(a.tree))
            .slice(0, 10);
          log(`Fallback: using top ${screens.length} parsed files as screens`, 'info');
        }

        screens.sort((a, b) => countNodes(b.tree) - countNodes(a.tree));

        // Logical sorting
        const orderMap = { "home": 1, "materials": 2, "quiz": 3, "forum": 4 };
        screens.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          const keyA = Object.keys(orderMap).find(k => nameA.includes(k));
          const keyB = Object.keys(orderMap).find(k => nameB.includes(k));
          const weightA = keyA ? orderMap[keyA as keyof typeof orderMap] : 99;
          const weightB = keyB ? orderMap[keyB as keyof typeof orderMap] : 99;
          return weightA - weightB || a.name.localeCompare(b.name);
        });

        // Extract components (non-screens)
        const components = parsedFiles.filter(f => !screens.includes(f) && !SKIP_COMPONENTS.has(f.name));

        // Pre-process components for Interactive Variants
        components.forEach(comp => {
          const hasHover = (node: any): boolean => {
            if (node.rawClassName && node.rawClassName.some((c: string) => c.startsWith('hover:'))) return true;
            if (node.children) return node.children.some(hasHover);
            return false;
          };

          if (hasHover(comp.tree)) {
            const hoverTree = JSON.parse(JSON.stringify(comp.tree));
            const applyHover = (node: any) => {
              if (node.rawClassName) {
                const hoverClasses = node.rawClassName
                  .filter((c: string) => c.startsWith('hover:'))
                  .map((c: string) => c.replace('hover:', ''));
                if (hoverClasses.length > 0) {
                  // Append to override previous classes
                  node.rawClassName = [...node.rawClassName, ...hoverClasses];
                }
              }
              if (node.children) node.children.forEach(applyHover);
            };
            applyHover(hoverTree);
            comp.variants = { Hover: hoverTree };
            log(`  Added Hover variant to ${comp.name}`, 'info');
          }
        });

        log(`Success: ${screens.length} screens, ${components.length} components`, 'success');
        screens.forEach(s => log(`  📱 ${s.name}`, 'success'));
        components.forEach(c => log(`  🧩 ${c.name}`, 'info'));

        setProgress(60, 'Sending to Figma...');
        
        lastParsedAST = { screens, components, tokens: tokenMap, frameTemplate, framework };
        if (copyAstBtn) copyAstBtn.style.display = 'block';

        // ── Render Parse Report ──
        renderParseReport(parseSuccessList, parseFailList, parseSkipList);

        parent.postMessage({ pluginMessage: { type: 'parse-files', screens, components, tokens: tokenMap, frameTemplate, framework } }, '*');

      } catch (err) {
        setProgress(0, 'Error: ' + err.message);
        log('Error: ' + err.message, 'error');
        console.error(err);

        // Show partial report even on error
        renderParseReport(parseSuccessList, parseFailList, parseSkipList);
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

      code = code.replace(/^import\b[^\n]*\n?/gm, '');
      return code;
    }

    // ── COMPONENT RESOLVER ──
    function resolveTree(node, map, visited, depth = 0) {
      if (!node || depth > 12) return;

      const isCustom = /^[A-Z]/.test(node.originalTag);
      // Skip known icon components
      if (isCustom && (ICON_NAMES.has(node.originalTag) || dynamicIcons.has(node.originalTag))) {
        node.isIcon = true;
        return;
      }

      if (isCustom && !visited.has(node.originalTag)) {
        // Tag is a known component. Instead of inlining, mark it so plugin creates an instance.
        const def = map[node.originalTag];
        if (def) {
          // We don't inline anymore. We keep node.originalTag as "CourseCard"
          // We still resolve children in case they have custom tags.
          for (const child of node.children || []) resolveTree(child, map, visited, depth + 1);
          return;
        }
      }

      for (const child of node.children || []) resolveTree(child, map, visited, depth + 1);
    }

    // ═══════════════════════════════════════════════════════════