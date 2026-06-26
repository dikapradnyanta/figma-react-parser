import { parse } from '@babel/parser';

// Keep ICON_NAMES for resolving unknown tags that are icons
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

import { ComponentNode } from '../../plugin/types';


export function parseAllComponents(code: string, filename?: string): { name: string, tree: ComponentNode, isDefaultExport?: boolean }[] {
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    console.error('Babel parse error:', e);
    return [];
  }

  const components: { name: string, node: any, isDefaultExport?: boolean }[] = [];

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      if (decl.type === 'FunctionDeclaration' && decl.id) {
        components.push({ name: decl.id.name, node: decl, isDefaultExport: true });
      } else if (decl.type === 'FunctionDeclaration' || decl.type === 'ArrowFunctionExpression') {
        let name = 'UnknownComponent';
        if (filename) {
          const base = filename.split('/').pop()?.replace(/\.[^/.]+$/, "") || "";
          name = base.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        }
        components.push({ name, node: decl, isDefaultExport: true });
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      const decl = node.declaration;
      if (decl && decl.type === 'VariableDeclaration') {
        for (const varDecl of decl.declarations) {
          if (varDecl.id.type === 'Identifier') {
            components.push({ name: varDecl.id.name, node: varDecl.init });
          }
        }
      } else if (decl && decl.type === 'FunctionDeclaration' && decl.id) {
        components.push({ name: decl.id.name, node: decl });
      }
    } else if (node.type === 'VariableDeclaration') {
      for (const varDecl of node.declarations) {
        if (varDecl.id.type === 'Identifier' && varDecl.id.name && varDecl.id.name.length > 0 && varDecl.id.name[0] === varDecl.id.name[0].toUpperCase()) {
          components.push({ name: varDecl.id.name, node: varDecl.init });
        }
      }
    } else if (node.type === 'FunctionDeclaration' && node.id && node.id.name[0] === node.id.name[0].toUpperCase()) {
      components.push({ name: node.id.name, node });
    }
  }

  const parsedComponents: { name: string, tree: ComponentNode, isDefaultExport?: boolean }[] = [];
  for (const comp of components) {
    const jsx = findJSX(comp.node);
    if (jsx) {
      const tree = parseJSX(jsx);
      if (tree) {
        if (Array.isArray(tree)) {
          // If the root is a fragment, wrap it in a div
          parsedComponents.push({
            name: comp.name,
            tree: { type: 'group', originalTag: 'div', rawClassName: [], props: {}, children: tree as ComponentNode[] },
            isDefaultExport: comp.isDefaultExport
          });
        } else {
          parsedComponents.push({ name: comp.name, tree: tree as ComponentNode, isDefaultExport: comp.isDefaultExport });
        }
      }
    }
  }
  return parsedComponents;
}

function findJSX(node: any): any {
  if (!node) return null;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return node;

  if (node.type === 'ReturnStatement') {
    return findJSX(node.argument);
  }
  if (node.type === 'BlockStatement') {
    const returnStmts = node.body.filter((stmt: any) => stmt.type === 'ReturnStatement');
    if (returnStmts.length > 0) {
      // Ambil return yang paling terakhir (struktur utama UI)
      return findJSX(returnStmts[returnStmts.length - 1]);
    }
    for (const stmt of node.body) {
      if (stmt.type === 'IfStatement') {
        const branch = findJSX(stmt.consequent) || (stmt.alternate ? findJSX(stmt.alternate) : null);
        if (branch) return branch;
      }
    }
  }
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration') {
    return findJSX(node.body);
  }
  return null;
}

function extractASTStyleValue(node: any): string | number | null {
  if (!node) return null;
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral') {
    return node.value;
  }
  if (node.type === 'Identifier') {
    // Basic fallback for simple variables like `colors.bg` if they were mapped differently, 
    // but typically identifier alone might be a local variable. We'll return its name.
    return node.name;
  }
  if (node.type === 'MemberExpression') {
    // e.g. colors.primary -> 'colors.primary'
    const obj = extractASTStyleValue(node.object);
    const prop = node.property.name || extractASTStyleValue(node.property);
    if (obj && prop) return `${obj}.${prop}`;
  }
  if (node.type === 'TemplateLiteral') {
    // simplified: just join the quasis
    return node.quasis.map((q: any) => q.value.raw).join('');
  }
  if (node.type === 'ConditionalExpression') {
    // cond ? A : B -> we blindly take the consequent (A) for static parsing purposes
    return extractASTStyleValue(node.consequent);
  }
  return null;
}

function parseJSX(node: any): ComponentNode | ComponentNode[] | null {
  if (node.type === 'JSXElement') {
    const opening = node.openingElement;
    let tag = '';
    if (opening.name.type === 'JSXIdentifier') {
      tag = opening.name.name;
    } else if (opening.name.type === 'JSXMemberExpression') {
      tag = `${opening.name.object.name}.${opening.name.property.name}`;
    }

    let classes: string[] = [];
    const inlineStyle: Record<string, string | number> = {};
    const attrs: Record<string, string> = {};
    let actionTo: string | undefined = undefined;

    for (const attr of opening.attributes) {
      if (attr.type === 'JSXAttribute') {
        const attrName = attr.name.name;
        if (typeof attrName !== 'string') continue;

        if (attrName === 'className') {
          if (attr.value && attr.value.type === 'StringLiteral') {
            classes = attr.value.value.split(/\s+/).filter(Boolean);
          } else if (attr.value && attr.value.type === 'JSXExpressionContainer') {
             const val = extractASTStyleValue(attr.value.expression);
             if (typeof val === 'string') classes = val.split(/\s+/).filter(Boolean);
          }
        } else if (attrName === 'style') {
          if (attr.value && attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'ObjectExpression') {
            for (const prop of attr.value.expression.properties) {
              if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                const val = extractASTStyleValue(prop.value);
                if (val !== null) {
                  inlineStyle[prop.key.name] = val;
                }
              }
            }
          }
        } else if (attrName === 'to' || attrName === 'href') {
          if (attr.value && attr.value.type === 'StringLiteral') {
            actionTo = attr.value.value;
          } else if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            const val = extractASTStyleValue(attr.value.expression);
            if (val !== null) actionTo = String(val);
          }
        } else if (attrName === 'onClick') {
           if (attr.value && attr.value.type === 'JSXExpressionContainer') {
             const expr = attr.value.expression;
             if (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') {
               // Check if body is a CallExpression (e.g. navigate('route'))
               let callExpr = expr.body;
               if (callExpr.type === 'BlockStatement') {
                 // Try to find the call inside the block
                 for (const stmt of callExpr.body) {
                   if (stmt.type === 'ExpressionStatement' && stmt.expression.type === 'CallExpression') {
                     callExpr = stmt.expression;
                     break;
                   }
                 }
               }
               if (callExpr && callExpr.type === 'CallExpression') {
                 if (callExpr.arguments.length > 0) {
                    const arg = callExpr.arguments[0];
                    if (arg.type === 'StringLiteral') {
                      actionTo = arg.value;
                    }
                 }
               }
             }
           }
        } else {
          // Other attributes (src, alt, etc)
          if (attr.value && attr.value.type === 'StringLiteral') {
            attrs[attrName] = attr.value.value;
          } else if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            const val = extractASTStyleValue(attr.value.expression);
            if (val !== null) attrs[attrName] = String(val);
          }
        }
      }
    }

    const children: ComponentNode[] = [];
    for (const child of node.children) {
      const parsedChild = parseJSX(child);
      if (parsedChild) {
        if (Array.isArray(parsedChild)) {
          children.push(...parsedChild);
        } else {
          children.push(parsedChild);
        }
      }
    }

    const props: Record<string, any> = { ...attrs };
    if (actionTo) props.actionTo = actionTo;
    
    let type: 'frame' | 'text' | 'image' | 'group' = 'frame';
    const tLower = tag.toLowerCase();
    const textTags = ['p','span','h1','h2','h3','h4','h5','h6','label','strong','em','small','a','li','td','th','caption','figcaption','legend','blockquote','time','code','pre','mark','b','i','u','abbr','cite','dt','dd'];
    if (textTags.includes(tLower)) type = 'text';
    else if (['img', 'image', 'video', 'figure'].includes(tLower)) type = 'image';

    return { type, originalTag: tag, rawClassName: classes, rawInlineStyle: inlineStyle, props, children };
  } else if (node.type === 'JSXText') {
    const text = node.value.replace(/[\n\r]+\s*/g, ' ').trim();
    if (text) {
      return { type: 'text', originalTag: 'span', rawClassName: [], props: {}, text, children: [] };
    }
  } else if (node.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'CallExpression') {
      if (node.expression.callee.type === 'MemberExpression' && node.expression.callee.property.name === 'map') {
        // Array map! Simulate 3 elements.
        const callback = node.expression.arguments[0];
        const returnedJSX = findJSX(callback);
        if (returnedJSX) {
          const parsedChild = parseJSX(returnedJSX);
          if (parsedChild) {
             const children = [];
             for(let i=0; i<3; i++) {
                children.push(JSON.parse(JSON.stringify(Array.isArray(parsedChild) ? parsedChild[0] : parsedChild)));
             }
             return children;
          }
        }
      }
    } else if (node.expression.type === 'LogicalExpression' && node.expression.operator === '&&') {
      const right = parseJSX(node.expression.right);
      if (right) return right;
    } else if (node.expression.type === 'ConditionalExpression') {
      // condition ? A : B
      const consequent = parseJSX(node.expression.consequent);
      if (consequent) return consequent;
    } else if (node.expression.type === 'StringLiteral' || node.expression.type === 'NumericLiteral') {
      return { type: 'text', originalTag: 'span', rawClassName: [], props: {}, text: String(node.expression.value), children: [] };
    }
  } else if (node.type === 'JSXFragment') {
    const children: ComponentNode[] = [];
    for (const child of node.children) {
      const parsedChild = parseJSX(child);
      if (parsedChild) {
        if (Array.isArray(parsedChild)) children.push(...parsedChild);
        else children.push(parsedChild);
      }
    }
    return children;
  }
  return null;
}