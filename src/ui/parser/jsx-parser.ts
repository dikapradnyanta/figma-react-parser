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

export interface ParsedNode {
  tag: string;
  classes: string[];
  inlineStyle?: Record<string, string | number>;
  text?: string;
  attrs?: Record<string, string>;
  actionTo?: string;
  children: ParsedNode[];
  isExpression?: boolean;
}

export function parseAllComponents(code: string): { name: string, tree: ParsedNode }[] {
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

  const components: { name: string, node: any }[] = [];

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      if (decl.type === 'FunctionDeclaration' && decl.id) {
        components.push({ name: decl.id.name, node: decl });
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

  const parsedComponents: { name: string, tree: ParsedNode }[] = [];
  for (const comp of components) {
    const jsx = findJSX(comp.node);
    if (jsx) {
      const tree = parseJSX(jsx);
      if (tree) {
        if (Array.isArray(tree)) {
          // If the root is a fragment, wrap it in a div
          parsedComponents.push({
            name: comp.name,
            tree: { tag: 'div', classes: [], children: tree as ParsedNode[] }
          });
        } else {
          parsedComponents.push({ name: comp.name, tree: tree as ParsedNode });
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
    for (const stmt of node.body) {
      if (stmt.type === 'ReturnStatement') return findJSX(stmt);
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

function parseJSX(node: any): ParsedNode | ParsedNode[] | null {
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
                 if (callExpr.callee.type === 'Identifier' && (callExpr.callee.name === 'navigate' || callExpr.callee.name === 'router.push' || callExpr.callee.name === 'push')) {
                    if (callExpr.arguments.length > 0) {
                       const arg = callExpr.arguments[0];
                       if (arg.type === 'StringLiteral') {
                         actionTo = arg.value;
                       }
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

    const children: ParsedNode[] = [];
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

    return { tag, classes, inlineStyle, attrs, actionTo, children };
  } else if (node.type === 'JSXText') {
    const text = node.value.replace(/[\n\r]+\s*/g, ' ').trim();
    if (text) {
      return { tag: 'span', classes: [], text, children: [] };
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
      return { tag: 'span', classes: [], text: String(node.expression.value), children: [] };
    }
  } else if (node.type === 'JSXFragment') {
    const children: ParsedNode[] = [];
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