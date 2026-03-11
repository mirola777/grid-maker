# Grid Maker - Project Guide

## Overview
Mirola's Grid Maker is a free drawing grid overlay tool built with Svelte 5 + Vite.

## Commands
- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Production build to `dist/`
- `npm run preview` - Preview production build

## Architecture
- **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **Cropper.js v1.6.2** (NOT v2) for image cropping
- **SVG overlay** for real-time grid preview (uses `vector-effect="non-scaling-stroke"`)
- **Canvas API** for high-res export only
- **CSS custom properties** for theming (`[data-theme="dark"]`)
- **Svelte stores** (`writable`, `derived`) for global state

## Key Patterns
- Event modifiers removed in Svelte 5: use `onclick={(e) => { e.stopPropagation(); }}` instead of `onclick|stopPropagation`
- mouseDownTarget tracking pattern to prevent modal close on drag operations
- `ctx.filter` for applying CSS-style filters on canvas export
- Grid lines via `{@html}` for SVG performance
- `$derived.by(() => {})` for complex computed values

## File Structure
- `src/App.svelte` - Main layout, export logic, sidebar resize
- `src/components/ImageCanvas.svelte` - Image + SVG grid overlay + edge labels
- `src/components/Sidebar.svelte` - Controls with animated sections + toggle switches
- `src/components/CropModal.svelte` - Crop with Cropper.js v1
- `src/stores/gridStore.js` - Grid state + theme store
- `src/stores/i18n.js` - 4-language i18n (en/es/pt/fr)

## Constraints
- Max crop canvas: 10000x10000
- Grid rows/cols: 1-50
- Sidebar width: 220-480px (resizable)
- No AI mentions anywhere in the codebase or docs
