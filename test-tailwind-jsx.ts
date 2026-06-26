import { parseAllComponents } from './src/ui/parser/jsx-parser';
import { applyThemeTokens } from './src/ui/parser/theme-resolver';

const sampleCode = `
// Extracted from Figma Dev Mode (Tailwind JSX)
export const CardComponent = () => {
  return (
    <div 
      className="flex flex-col items-center justify-start p-4 bg-white rounded-lg shadow-md"
      style={{ width: "100%", height: 100, border: "1px solid #ccc", background: "url('https://example.com/image.png')" }}
    >
      <div className="flex flex-row justify-between w-full">
        <h1 className="text-xl font-bold text-gray-800">{ title }</h1>
        {/* User Avatar */}
        <img src="https://example.com/avatar.png" className="w-8 h-8 rounded-full" />
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
            {item.name}
          </div>
        ))}
      </div>
      
      <button 
        className={isActive ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"}
        style={{ marginTop: getSpacing("16px") }}
      >
        Click Me
      </button>
    </div>
  );
};
`;

const themedCode = applyThemeTokens(sampleCode, { "colors.primary": "#0D3B66" });
const parsed = parseAllComponents(themedCode);

console.log(JSON.stringify(parsed, null, 2));
