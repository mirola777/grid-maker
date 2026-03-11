<script>
  import { gridStore } from '../stores/gridStore.js';
  import { t } from '../stores/i18n.js';

  let { onImageAdd } = $props();

  let store = $derived($gridStore);
  let tr = $derived($t);
  let wrapperEl = $state(null);
  let fileInput = $state(null);
  let isDragging = $state(false);
  let urlValue = $state('');
  let urlLoading = $state(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageAdd?.(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;

    if (e.dataTransfer.files?.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      return;
    }

    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const match = html.match(/src="([^"]+)"/);
      if (match) { loadUrl(match[1]); return; }
    }

    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url?.startsWith('http')) loadUrl(url);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        handleFile(item.getAsFile());
        return;
      }
    }
    const text = e.clipboardData?.getData('text/plain');
    if (text?.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)/i)) {
      e.preventDefault();
      loadUrl(text.trim());
    }
  }

  function loadUrl(url) {
    urlLoading = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      try { onImageAdd?.(c.toDataURL('image/png')); }
      catch { onImageAdd?.(url); }
      urlLoading = false;
      urlValue = '';
    };
    img.onerror = () => {
      onImageAdd?.(url);
      urlLoading = false;
      urlValue = '';
    };
    img.src = url;
  }

  function handleUrlSubmit(e) {
    e?.preventDefault();
    const url = urlValue.trim();
    if (url && url.startsWith('http')) {
      loadUrl(url);
    }
  }

  // CSS filter string
  let cssFilter = $derived.by(() => {
    switch (store.filter) {
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(100%)';
      case 'scanner': return 'grayscale(100%) contrast(200%) brightness(1.1)';
      case 'highContrast': return 'contrast(180%) saturate(0.5)';
      case 'invert': return 'invert(100%)';
      case 'brightness': return 'brightness(1.3) contrast(1.05)';
      case 'warm': return 'sepia(30%) saturate(140%) brightness(1.05)';
      case 'cool': return 'saturate(80%) hue-rotate(15deg) brightness(1.05)';
      default: return 'none';
    }
  });

  // Grid overlay SVG lines
  let gridLines = $derived.by(() => {
    if (!store.croppedSrc) return '';
    const lines = [];
    const { rows, cols } = store;

    for (let i = 1; i < rows; i++) {
      const y = (i / rows) * 100;
      lines.push(`<line x1="0%" y1="${y}%" x2="100%" y2="${y}%" />`);
    }
    for (let j = 1; j < cols; j++) {
      const x = (j / cols) * 100;
      lines.push(`<line x1="${x}%" y1="0%" x2="${x}%" y2="100%" />`);
    }

    if (store.showDiagonals) {
      lines.push(`<line x1="0%" y1="0%" x2="100%" y2="100%" />`);
      lines.push(`<line x1="100%" y1="0%" x2="0%" y2="100%" />`);
    }

    if (store.showCenter) {
      lines.push(`<line x1="50%" y1="0%" x2="50%" y2="100%" />`);
      lines.push(`<line x1="0%" y1="50%" x2="100%" y2="50%" />`);
    }

    return lines.join('');
  });

  let cellNumbers = $derived.by(() => {
    if (!store.showNumbers || !store.croppedSrc) return [];
    const nums = [];
    let n = 1;
    for (let r = 0; r < store.rows; r++) {
      for (let c = 0; c < store.cols; c++) {
        nums.push({
          x: ((c + 0.5) / store.cols) * 100,
          y: ((r + 0.5) / store.rows) * 100,
          n: n++,
        });
      }
    }
    return nums;
  });

  let edgeLabels = $derived.by(() => {
    if (!store.showNumbers || !store.croppedSrc) return { cols: [], rows: [] };
    const cols = [];
    for (let c = 0; c < store.cols; c++) {
      cols.push({ x: ((c + 0.5) / store.cols) * 100, label: c + 1 });
    }
    const rows = [];
    for (let r = 0; r < store.rows; r++) {
      rows.push({ y: ((r + 0.5) / store.rows) * 100, label: r + 1 });
    }
    return { cols, rows };
  });

  let dashArray = $derived(
    store.lineStyle === 'dashed' ? '8 4' :
    store.lineStyle === 'dotted' ? '2 4' : 'none'
  );
</script>

<svelte:window onpaste={handlePaste} />

<div
  class="canvas-wrapper"
  bind:this={wrapperEl}
  ondragover={(e) => { e.preventDefault(); isDragging = true; }}
  ondragleave={() => isDragging = false}
  ondrop={handleDrop}
  class:dragging={isDragging}
  role="presentation"
>
  {#if store.croppedSrc}
    <div class="image-container">
      <img
        src={store.croppedSrc}
        alt="Grid reference"
        class="main-image"
        draggable="false"
        style:filter={cssFilter}
      />

      <svg class="grid-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g
          stroke={store.lineColor}
          stroke-width={store.lineWidth}
          opacity={store.lineOpacity}
          stroke-dasharray={dashArray}
          vector-effect="non-scaling-stroke"
        >
          {@html gridLines}
        </g>

        <rect x="0" y="0" width="100" height="100" fill="none"
          stroke={store.lineColor}
          stroke-width={store.lineWidth}
          opacity={store.lineOpacity}
          vector-effect="non-scaling-stroke"
        />

        {#if store.showNumbers}
          {#each cellNumbers as cell}
            <text
              x="{cell.x}%"
              y="{cell.y}%"
              text-anchor="middle"
              dominant-baseline="central"
              fill={store.numberColor}
              font-size="{store.numberSize}"
              font-family="var(--font-mono)"
              font-weight="600"
              opacity="0.85"
              style="paint-order: stroke; stroke: var(--bg-primary); stroke-width: 3px;"
            >{cell.n}</text>
          {/each}
        {/if}
      </svg>

      <!-- Edge labels -->
      {#if store.showNumbers}
        <div class="edge-labels edge-labels-top">
          {#each edgeLabels.cols as col}
            <span class="edge-label" style="left: {col.x}%">{col.label}</span>
          {/each}
        </div>
        <div class="edge-labels edge-labels-left">
          {#each edgeLabels.rows as row}
            <span class="edge-label" style="top: {row.y}%">{row.label}</span>
          {/each}
        </div>
      {/if}

      <!-- Replace image button -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="replace-btn" onclick={() => fileInput?.click()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
    </div>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="empty-state" onclick={() => fileInput?.click()}>
      <div class="empty-glow"></div>

      <div class="empty-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke-width="1.2">
          <defs>
            <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--accent)"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
          <g stroke="url(#emptyGrad)">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </g>
        </svg>
      </div>

      <div class="empty-text">
        <p class="empty-title">{tr('dropTitle')}</p>
        <p class="empty-sub">{tr('dropSub')} <kbd>Ctrl+V</kbd>{tr('dropSub2')}</p>
      </div>

      <div class="empty-formats">
        <span class="format-tag">PNG</span>
        <span class="format-tag">JPG</span>
        <span class="format-tag">GIF</span>
        <span class="format-tag">WEBP</span>
        <span class="format-tag">SVG</span>
        <span class="format-tag">BMP</span>
      </div>

      <!-- URL input -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="url-section" onclick={(e) => e.stopPropagation()}>
        <span class="url-label">{tr('orLoadUrl')}</span>
        <form class="url-form" onsubmit={handleUrlSubmit}>
          <input
            type="url"
            class="url-input"
            placeholder={tr('urlPlaceholder')}
            bind:value={urlValue}
            disabled={urlLoading}
          />
          <button type="submit" class="url-btn" disabled={!urlValue.trim() || urlLoading}>
            {#if urlLoading}
              <span class="url-spinner"></span>
            {:else}
              {tr('loadUrl')}
            {/if}
          </button>
        </form>
      </div>

      <div class="empty-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.4">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
    </div>
  {/if}

  <input bind:this={fileInput} type="file" accept="image/*" class="hidden"
    onchange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} />
</div>

<style>
  .canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow: auto;
    position: relative;
    transition: background 0.2s ease;
    min-width: 0;
  }

  .canvas-wrapper.dragging { background: var(--accent-light); }
  .canvas-wrapper.dragging::after {
    content: '';
    position: absolute;
    inset: 12px;
    border: 2px dashed var(--accent);
    border-radius: var(--radius-lg);
    pointer-events: none;
    animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .image-container {
    position: relative;
    max-width: 100%;
    max-height: calc(100vh - 100px);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    line-height: 0;
  }

  .main-image {
    display: block;
    max-width: 100%;
    max-height: calc(100vh - 100px);
    object-fit: contain;
    user-select: none;
    transition: filter 0.3s ease;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Edge labels */
  .edge-labels {
    position: absolute;
    pointer-events: none;
  }
  .edge-labels-top {
    top: -18px;
    left: 0;
    right: 0;
    height: 16px;
  }
  .edge-labels-left {
    left: -20px;
    top: 0;
    bottom: 0;
    width: 18px;
  }
  .edge-label {
    position: absolute;
    font-size: 9px;
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-muted);
    opacity: 0.7;
  }
  .edge-labels-top .edge-label {
    transform: translateX(-50%);
  }
  .edge-labels-left .edge-label {
    transform: translateY(-50%);
    text-align: right;
    width: 100%;
    display: block;
  }

  .replace-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--bg-glass);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.15s ease;
  }
  .image-container:hover .replace-btn { opacity: 1; }
  .replace-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  .hidden { display: none; }

  /* Empty state */
  .empty-state {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 52px 40px;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all 0.3s ease;
    max-width: 460px;
    width: 100%;
    text-align: center;
    overflow: hidden;
  }
  .empty-state:hover {
    border-color: var(--accent);
    background: var(--accent-light);
    transform: translateY(-2px);
  }
  .empty-state:hover .empty-glow { opacity: 1; }

  .empty-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
  }
  .empty-state:hover .empty-icon {
    background: var(--accent-light);
    transform: scale(1.05);
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .empty-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 6px;
    line-height: 1.5;
  }
  .empty-sub kbd {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
  }

  .empty-formats { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .format-tag {
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: var(--font-mono);
    background: var(--bg-tertiary);
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  /* URL section */
  .url-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    cursor: default;
  }
  .url-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
  }
  .url-form {
    display: flex;
    gap: 4px;
    width: 100%;
    max-width: 360px;
  }
  .url-input {
    flex: 1;
    font-size: 12px !important;
    padding: 6px 10px !important;
    border-radius: 6px !important;
    font-family: var(--font-mono) !important;
  }
  .url-btn {
    padding: 6px 14px;
    border-radius: 6px;
    background: var(--accent);
    color: white;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .url-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .url-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .url-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-arrow {
    animation: float 2s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .canvas-wrapper { padding: 12px; }
    .empty-state { padding: 36px 24px; gap: 16px; }
    .empty-title { font-size: 16px; }
    .image-container { max-height: calc(55vh - 50px); }
    .main-image { max-height: calc(55vh - 50px); }
    .url-form { flex-direction: column; }
  }
</style>
