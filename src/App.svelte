<script>
  import { onMount } from 'svelte';
  import { gridStore, theme } from './stores/gridStore.js';
  import { t, locale } from './stores/i18n.js';
  import { historyStore, historyCount } from './stores/historyStore.js';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import LanguageSelector from './components/LanguageSelector.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import ImageCanvas from './components/ImageCanvas.svelte';
  import CropModal from './components/CropModal.svelte';
  import HistoryPanel from './components/HistoryPanel.svelte';

  let store = $derived($gridStore);
  let tr = $derived($t);
  let hCount = $derived($historyCount);
  let cropOpen = $state(false);
  let historyOpen = $state(false);
  let sidebarWidth = $state(272);
  let isResizing = $state(false);

  function startResize(e) {
    e.preventDefault();
    isResizing = true;
    const startX = e.clientX;
    const startW = sidebarWidth;

    function onMove(ev) {
      const diff = ev.clientX - startX;
      sidebarWidth = Math.min(480, Math.max(220, startW + diff));
    }
    function onUp() {
      isResizing = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  onMount(() => {
    theme.init();
    locale.init();
  });

  function handleImageAdd(src) {
    gridStore.setImage(src);
    cropOpen = true;
  }

  function handleCropOpen() {
    if (store.imageSrc) cropOpen = true;
  }

  function handleCropApply(croppedSrc) {
    gridStore.setCroppedImage(croppedSrc);
    cropOpen = false;
  }

  function handleCropCancel() {
    cropOpen = false;
  }

  async function handleSaveHistory() {
    await historyStore.save(store);
  }

  function handleHistoryLoad(state) {
    gridStore.set(state);
    historyOpen = false;
  }

  function getFilterCSS(filter) {
    switch (filter) {
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(100%)';
      case 'scanner': return 'grayscale(100%) contrast(200%) brightness(1.1)';
      case 'highContrast': return 'contrast(180%) saturate(0.5)';
      case 'invert': return 'invert(100%)';
      case 'brightness': return 'brightness(1.3) contrast(1.05)';
      case 'warm': return 'sepia(30%) saturate(140%) brightness(1.05)';
      case 'cool': return 'saturate(80%) hue-rotate(15deg) brightness(1.05)';
      default: return null;
    }
  }

  async function handleExport(format) {
    if (!store.croppedSrc) return;

    const img = new Image();
    img.src = store.croppedSrc;
    await new Promise((resolve) => { img.onload = resolve; });

    const scale = store.exportScale;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (!store.exportGridOnly) {
      // Apply filter if needed
      const filterCSS = getFilterCSS(store.filter);
      if (filterCSS) ctx.filter = filterCSS;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';
    } else {
      // Grid-only mode: fill with background color (or keep transparent for PNG)
      if (format === 'jpeg' || store.exportBgColor !== '#ffffff') {
        ctx.fillStyle = store.exportBgColor;
        ctx.fillRect(0, 0, w, h);
      }
    }

    ctx.strokeStyle = store.lineColor;
    ctx.lineWidth = store.lineWidth * scale;
    ctx.globalAlpha = store.lineOpacity;

    if (store.lineStyle === 'dashed') ctx.setLineDash([8 * scale, 4 * scale]);
    else if (store.lineStyle === 'dotted') ctx.setLineDash([2 * scale, 4 * scale]);
    else ctx.setLineDash([]);

    for (let i = 1; i < store.rows; i++) {
      const y = (i / store.rows) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let j = 1; j < store.cols; j++) {
      const x = (j / store.cols) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    const half = ctx.lineWidth / 2;
    ctx.strokeRect(half, half, w - ctx.lineWidth, h - ctx.lineWidth);

    if (store.showDiagonals) {
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w, h);
      ctx.moveTo(w, 0); ctx.lineTo(0, h);
      ctx.stroke();
    }

    if (store.showCenter) {
      ctx.setLineDash([]);
      ctx.lineWidth = store.lineWidth * scale * 0.7;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.stroke();
    }

    if (store.showNumbers) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = store.numberColor;
      ctx.font = `600 ${store.numberSize * scale}px 'JetBrains Mono', monospace`;
      ctx.strokeStyle = store.exportGridOnly ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 3 * scale;

      const pad = 0.08;
      let xOff = 0.5, yOff = 0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      switch (store.numberPosition) {
        case 'top-left': xOff = pad; yOff = pad; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; break;
        case 'top-right': xOff = 1 - pad; yOff = pad; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; break;
        case 'bottom-left': xOff = pad; yOff = 1 - pad; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; break;
        case 'bottom-right': xOff = 1 - pad; yOff = 1 - pad; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; break;
      }

      let n = 1;
      for (let r = 0; r < store.rows; r++) {
        for (let c = 0; c < store.cols; c++) {
          const x = ((c + xOff) / store.cols) * w;
          const y = ((r + yOff) / store.rows) * h;
          ctx.strokeText(String(n), x, y);
          ctx.fillText(String(n), x, y);
          n++;
        }
      }
    }

    ctx.globalAlpha = 1;
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? store.exportQuality / 100 : undefined;
    const link = document.createElement('a');
    link.download = `mirolas-grid.${format}`;
    link.href = canvas.toDataURL(mime, quality);
    link.click();
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-left">
      <div class="logo-mark">
        <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
          <rect width="512" height="512" rx="108" fill="url(#lmBg)"/>
          <g stroke="rgba(255,255,255,0.85)" stroke-width="22" stroke-linecap="round">
            <line x1="192" y1="80" x2="192" y2="432"/>
            <line x1="320" y1="80" x2="320" y2="432"/>
            <line x1="80" y1="192" x2="432" y2="192"/>
            <line x1="80" y1="320" x2="432" y2="320"/>
          </g>
          <rect x="72" y="72" width="368" height="368" rx="28" fill="none" stroke="white" stroke-width="24" opacity="0.9"/>
          <defs>
            <linearGradient id="lmBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--accent)"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="logo">Grid Maker</h1>
      <span class="badge">by Mirola</span>
    </div>
    <div class="header-center">
      {#if store.croppedSrc}
        <span class="status-pill">
          <span class="status-dot"></span>
          {store.rows}&times;{store.cols} {tr('grid')}
          {#if store.filter !== 'none'}
            <span class="filter-badge">{tr('sectionFilters')}</span>
          {/if}
        </span>
      {/if}
    </div>
    <div class="header-right">
      <button class="history-btn" onclick={() => historyOpen = true} title={tr('historyBtn')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="history-btn-label">{tr('historyBtn')}</span>
        {#if hCount > 0}
          <span class="history-badge">{hCount}</span>
        {/if}
      </button>
      <div class="kbd-hint">
        <kbd>Ctrl</kbd><span>+</span><kbd>V</kbd>
        <span class="kbd-label">{tr('paste')}</span>
      </div>
      <LanguageSelector />
      <ThemeToggle />
    </div>
  </header>

  <div class="main">
    <Sidebar onCrop={handleCropOpen} onExport={handleExport} bind:sidebarWidth={sidebarWidth} />
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="sidebar-resizer"
      onmousedown={startResize}
      class:resizing={isResizing}
    ></div>
    <ImageCanvas onImageAdd={handleImageAdd} />
  </div>

  <footer class="footer">
    <div class="footer-left">
      <span class="footer-brand">Grid Maker</span>
      <span class="footer-sep">&middot;</span>
      <span class="footer-desc">{tr('footerDesc')}</span>
    </div>
    <div class="footer-right">
      <span class="footer-text">{tr('madeWith')} &#9829; {tr('by')} mirola777</span>
      <a class="footer-link" href="https://github.com/mirola777" target="_blank" rel="noopener noreferrer" title="GitHub @mirola777">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>
      <a class="footer-link" href="https://instagram.com/mirola777" target="_blank" rel="noopener noreferrer" title="Instagram @mirola777">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
    </div>
  </footer>

  {#if cropOpen && store.imageSrc}
    <CropModal
      imageSrc={store.imageSrc}
      onApply={handleCropApply}
      onCancel={handleCropCancel}
    />
  {/if}

  {#if historyOpen}
    <HistoryPanel
      onLoad={handleHistoryLoad}
      onClose={() => historyOpen = false}
    />
  {/if}

  <article class="seo-content" aria-hidden="true">
    <h1>Grid Maker - Cuadricula para Dibujo Online Gratis</h1>
    <h2>Drawing Grid Overlay Tool - Outil de Grille - Ferramenta de Grade</h2>
    <p>Herramienta gratuita para crear cuadriculas sobre imagenes. Sube tu foto de referencia, ajusta las filas y columnas, personaliza el color y grosor de las lineas, y descarga la imagen con la cuadricula en alta resolucion.</p>
    <p>Free online grid maker tool. Upload your reference image, set custom rows and columns, adjust line color, thickness and opacity, then download with the grid overlay in high resolution PNG or JPEG.</p>
    <p>Ferramenta online gratuita para criar grades sobre imagens. Carregue sua foto de referencia, ajuste linhas e colunas, personalize cor e espessura, e baixe em alta resolucao.</p>
    <p>Outil gratuit en ligne pour creer des grilles sur des images. Telechargez votre photo de reference, ajustez lignes et colonnes, personnalisez la couleur et l'epaisseur, et telechargez en haute resolution.</p>
  </article>
</div>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 52px;
    min-height: 52px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    transition: background 0.35s ease, border-color 0.35s ease;
    position: relative;
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), #ef4444, var(--accent));
    opacity: 0.6;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
  .logo-mark svg {
    width: 32px;
    height: 32px;
    border-radius: 7px;
  }

  .logo {
    font-size: 17px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent), #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .badge {
    font-size: 10px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 2px 7px;
    border-radius: 4px;
    background: var(--accent-light);
    color: var(--accent);
    letter-spacing: 0.3px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: blink 2s ease infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .filter-badge {
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--accent);
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .history-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    font-size: 11px;
    font-weight: 600;
    position: relative;
  }
  .history-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    color: var(--accent);
  }
  .history-btn-label {
    font-family: var(--font-body);
  }
  .history-badge {
    font-size: 9px;
    font-weight: 700;
    font-family: var(--font-mono);
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--accent);
    color: white;
    padding: 0 4px;
  }

  .kbd-hint {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .kbd-hint kbd {
    padding: 2px 5px;
    border-radius: 4px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    color: var(--text-secondary);
  }
  .kbd-hint span { margin: 0 1px; }
  .kbd-label { margin-left: 4px; }

  .main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar-resizer {
    width: 4px;
    cursor: col-resize;
    background: transparent;
    transition: background 0.15s ease;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    margin-left: -2px;
    margin-right: -2px;
  }
  .sidebar-resizer:hover,
  .sidebar-resizer.resizing {
    background: var(--accent);
  }
  .sidebar-resizer::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 12px;
    margin-left: -4px;
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 32px;
    min-height: 32px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-light);
    font-size: 11px;
    color: var(--text-muted);
    transition: background 0.35s ease;
  }
  .footer-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .footer-brand {
    font-weight: 600;
    color: var(--text-secondary);
  }
  .footer-sep { opacity: 0.4; }
  .footer-desc { font-size: 10px; }
  .footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
  }
  .footer-text {
    color: var(--text-muted);
  }
  .footer-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    color: var(--text-muted);
    transition: all 0.15s ease;
    text-decoration: none;
  }
  .footer-link:hover {
    color: var(--accent);
    background: var(--accent-light);
  }

  .seo-content {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap; border: 0;
  }

  @media (max-width: 768px) {
    .header { padding: 0 10px; height: 46px; min-height: 46px; }
    .logo { font-size: 14px; }
    .logo-mark { width: 28px; height: 28px; }
    .logo-mark svg { width: 28px; height: 28px; }
    .badge { display: none; }
    .kbd-hint { display: none; }
    .history-btn-label { display: none; }
    .header-center { display: none; }
    .main { flex-direction: column; }
    .sidebar-resizer { display: none; }
    .footer { height: 28px; min-height: 28px; padding: 0 10px; }
    .footer-desc { display: none; }
    .footer-sep { display: none; }
  }
</style>
