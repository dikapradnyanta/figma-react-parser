# Figma React Parser

A Figma plugin to parse React code (JSX/TSX) packaged in a ZIP file and generate equivalent Figma designs, complete with Tailwind styling and inline styles parsing.

## Features
- Upload ZIP containing your React codebase.
- Automatically resolves `.tsx` and `.jsx` files.
- Extracts Tailwind CSS utility classes and inline styles to match Figma visual nodes.
- Preserves layout, coloring, typography, and basic interactions.

## Setup
1. Clone this repository.
2. Run `npm install`.
3. Run `npm run build` to build the plugin output.
4. Load the `manifest.json` file via Figma Desktop App > Plugins > Development > Import plugin from manifest.

## Tech Stack
- Figma Plugin API
- Vite for building and bundling
- React (in parsed source)
- JSX parsing logic with zero dependencies (custom AST parser)
