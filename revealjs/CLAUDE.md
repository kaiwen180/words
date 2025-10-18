# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a reveal.js-based presentation repository. The project is built on top of reveal.js (The HTML Presentation Framework) and includes a custom presentation that auto-plays slides with fullscreen support.

## Build System

The project uses Gulp as its build system. All build tasks are defined in `gulpfile.js`.

### Common Commands

```bash
# Start development server with live reload (default: http://localhost:8000)
npm start
# or
gulp serve

# Build all distributable files (JS bundles, CSS, plugins)
npm run build
# or
gulp build

# Run tests (ESLint + QUnit)
npm test
# or
gulp test

# Run only linting
gulp eslint

# Run only QUnit tests
gulp qunit

# Build individual components
gulp js          # Build both UMD and ES module bundles
gulp js-es5      # Build UMD bundle only (broad browser support)
gulp js-es6      # Build ES module bundle only
gulp css         # Build all CSS (themes + core)
gulp plugins     # Build all plugin bundles

# Package presentation for distribution
gulp package     # Creates reveal-js-presentation.zip
```

### Development Server Options

```bash
# Custom port
gulp serve --port 9000

# Custom host
gulp serve --host 0.0.0.0

# Custom root directory
gulp serve --root ./custom-slides
```

## Architecture

### Core Structure

- **`js/reveal.js`**: Main reveal.js implementation - a large monolithic file (~2000+ lines) that exports the core Reveal API
- **`js/index.js`**: Entry point that imports and exports reveal.js
- **`js/config.js`**: Default configuration object with all reveal.js options
- **`js/controllers/`**: Modular controllers that handle specific reveal.js features
  - Each controller manages a specific aspect of the presentation (e.g., keyboard, fragments, backgrounds, auto-animate)
  - Controllers are instantiated and coordinated by the main reveal.js module
- **`js/components/`**: Reusable components (e.g., playback controls)
- **`js/utils/`**: Utility modules (constants, device detection, color utilities, loader, etc.)

### Plugin System

Plugins extend reveal.js functionality. Built-in plugins are in `plugin/`:
- **highlight**: Syntax highlighting for code blocks (uses highlight.js)
- **markdown**: Markdown support for slides (uses marked)
- **math**: Mathematical notation (supports MathJax 2/3 and KaTeX)
- **notes**: Speaker notes functionality
- **search**: Search functionality for presentations
- **zoom**: Zoom functionality for presentations

Each plugin has:
- `plugin.js`: Plugin entry point
- `.js` and `.esm.js`: UMD and ES module builds

### Build Process

The build process uses Rollup with Babel transpilation:
1. **UMD Bundle** (`dist/reveal.js`): Transpiled with full polyfills for broad browser support (> 2%, not dead)
2. **ES Module Bundle** (`dist/reveal.esm.js`): Transpiled for modern browsers only (last 2 versions of major browsers)
3. **CSS**: Compiled from Sass (core + themes), autoprefixed, and minified
4. **Plugins**: Each built as both UMD and ESM formats

### Custom Presentation Setup

The main presentation file is `index.html`, which:
- Loads markdown content from `words.md` using the markdown plugin
- Uses custom separators for slides: `^---------` (horizontal), `^------` (vertical)
- Includes a custom auto-play button with fullscreen support
- Uses older browser-compatible JavaScript (ES5 syntax with vendor prefixes for CSS)

### Testing

Tests are in `test/*.html` and use QUnit. The test runner:
- Starts a local server on port 8009
- Runs tests via Puppeteer with headless Chrome
- Reports pass/fail status with timing information
- Tests cover plugins, dependencies, state management, navigation, auto-animate, etc.

## Key Files for Customization

- **`index.html`**: Main presentation file - modify this to change the presentation structure
- **`words.md`**: Markdown content for slides - edit this to change slide content
- **`dist/theme/`**: Compiled theme CSS files (built from `css/theme/source/*.scss`)
- **CSS themes source**: `css/theme/source/` - create custom themes here

## Notes

- The repository uses Node.js >= 18.0.0
- ES modules are used throughout the source code (`js/`)
- The build outputs both UMD (for maximum compatibility) and ESM (for modern browsers)
- Live reload watches HTML, MD, JS, CSS, and plugin files during development
