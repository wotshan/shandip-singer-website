/// <reference types="vite/client" />

// Vite's ambient types (import.meta.env, asset module declarations such as
// `*.webp` / `*.png`, and HMR's `import.meta.hot`) come from this Vite-generated
// reference. It is the standard convention, and it is what lets `tsconfig.json`
// drop the explicit `"types": ["node", "vite/client"]` array — an explicit type
// library path that Vercel's prebuilt-function transpiler cannot resolve, which
// shows up at deploy time as:
//     error TS2688: Cannot find type definition file for 'vite/client'.
