const parser = require('@babel/parser');
const t = require('@babel/types');

const code = `
export const HomeScreen = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-5 pb-8" style={{ backgroundColor: "#1e3a8a", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <p>Hello World</p>
      </div>
      <div className="grid grid-cols-2">
        {courses.map(c => <CourseCard key={c.id} />)}
      </div>
    </div>
  );
}
`;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

function findJSX(node) {
  if (!node) return null;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return node;
  
  if (node.type === 'ReturnStatement') {
    return findJSX(node.argument);
  }
  if (node.type === 'BlockStatement') {
    for (const stmt of node.body) {
      if (stmt.type === 'ReturnStatement') return findJSX(stmt);
    }
  }
  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration') {
    return findJSX(node.body);
  }
  return null;
}

function parseJSX(node) {
  if (node.type === 'JSXElement') {
    const opening = node.openingElement;
    let tag = '';
    if (opening.name.type === 'JSXIdentifier') tag = opening.name.name;
    else if (opening.name.type === 'JSXMemberExpression') tag = `${opening.name.object.name}.${opening.name.property.name}`;
    
    let classes = [];
    let inlineStyle = {};
    
    for (const attr of opening.attributes) {
      if (attr.type === 'JSXAttribute' && attr.name.name === 'className') {
        if (attr.value && attr.value.type === 'StringLiteral') {
          classes = attr.value.value.split(/\s+/).filter(Boolean);
        }
      }
      if (attr.type === 'JSXAttribute' && attr.name.name === 'style') {
        if (attr.value && attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'ObjectExpression') {
           // simple static conversion
           for (const prop of attr.value.expression.properties) {
              if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                 let val = null;
                 if (prop.value.type === 'StringLiteral' || prop.value.type === 'NumericLiteral') val = prop.value.value;
                 inlineStyle[prop.key.name] = val;
              }
           }
        }
      }
    }
    
    const children = [];
    for (const child of node.children) {
       const parsedChild = parseJSX(child);
       if (parsedChild) {
          if (Array.isArray(parsedChild)) children.push(...parsedChild);
          else children.push(parsedChild);
       }
    }
    
    return {
       tag, classes, inlineStyle, children
    };
  } else if (node.type === 'JSXText') {
    const text = node.value.replace(/[\n\r]+\s*/g, ' ').trim();
    if (text) {
      return { tag: 'span', classes: [], text, children: [] };
    }
  } else if (node.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'CallExpression') {
       if (node.expression.callee.type === 'MemberExpression' && node.expression.callee.property.name === 'map') {
          // It's an array map! Simulate 3 elements.
          const callback = node.expression.arguments[0];
          const returnedJSX = findJSX(callback);
          if (returnedJSX) {
             const parsedChild = parseJSX(returnedJSX);
             if (parsedChild) {
                return [parsedChild, JSON.parse(JSON.stringify(parsedChild)), JSON.parse(JSON.stringify(parsedChild))];
             }
          }
       }
    } else if (node.expression.type === 'LogicalExpression' && node.expression.operator === '&&') {
       const right = parseJSX(node.expression.right);
       if (right) return right;
    } else if (node.expression.type === 'StringLiteral' || node.expression.type === 'NumericLiteral') {
       return { tag: 'span', classes: [], text: String(node.expression.value), children: [] };
    }
  } else if (node.type === 'JSXFragment') {
    const children = [];
    for (const child of node.children) {
       const parsedChild = parseJSX(child);
       if (parsedChild) {
          if (Array.isArray(parsedChild)) children.push(...parsedChild);
          else children.push(parsedChild);
       }
    }
    // fragments don't exist in Figma, return a wrapper or just the children
    // wait, we can't return an array for a single child if it's the root, but inside children array we can spread it.
    return children; 
  }
  return null;
}

const comps = [];
for (const node of ast.program.body) {
  if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'VariableDeclaration') {
     const init = node.declaration.declarations[0].init;
     const name = node.declaration.declarations[0].id.name;
     comps.push({ name, node: init });
  }
}

const res = comps.map(c => ({ name: c.name, tree: parseJSX(findJSX(c.node)) }));
console.log(JSON.stringify(res, null, 2));
