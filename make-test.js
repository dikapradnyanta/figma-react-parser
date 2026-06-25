const fs = require('fs');
const uiHtml = fs.readFileSync('ui.html', 'utf8');
const parserStart = uiHtml.indexOf('function buildThemeMap');
const parserEnd = uiHtml.indexOf('</script>', parserStart);
const parserCode = uiHtml.substring(parserStart, parserEnd);

const script = `
const fs = require('fs');
${parserCode}

const themeSrc = fs.readFileSync("test/theme.ts", "utf8");
const tokenMap = parseThemeContent(themeSrc);

let src = fs.readFileSync("prototype_source/src/app/components/screens/forum-screen.tsx", "utf8");
src = applyThemeTokens(src, tokenMap);

console.log(JSON.stringify(parseAllComponents(src), null, 2));
`;

fs.writeFileSync('test-parser.js', script);


