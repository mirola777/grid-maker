<script>
  import { gridStore } from '../stores/gridStore.js';
  import { historyStore } from '../stores/historyStore.js';
  import { t } from '../stores/i18n.js';

  let store = $derived($gridStore);
  let tr = $derived($t);
  let { onCrop, onExport, onHistory, sidebarWidth = $bindable(272) } = $props();
  let saveFlash = $state(false);

  async function handleSave() {
    await historyStore.save(store);
    saveFlash = true;
    setTimeout(() => { saveFlash = false; }, 1200);
  }

  let sections = $state({
    grid: true,
    style: true,
    extras: false,
    filters: false,
    export: true,
  });

  function toggle(key) { sections[key] = !sections[key]; }

  const presets = [
    { label: '3x3', rows: 3, cols: 3 },
    { label: '4x4', rows: 4, cols: 4 },
    { label: '5x5', rows: 5, cols: 5 },
    { label: '6x6', rows: 6, cols: 6 },
    { label: '8x8', rows: 8, cols: 8 },
    { label: '10x10', rows: 10, cols: 10 },
    { label: '12x12', rows: 12, cols: 12 },
    { label: '16x16', rows: 16, cols: 16 },
  ];

  const colorPresets = [
    '#000000', '#333333', '#666666', '#ff3366',
    '#f97316', '#f59e0b', '#10b981', '#06b6d4',
    '#6366f1', '#ffffff',
  ];

  const filters = [
    { value: 'none', icon: '◯' },
    { value: 'grayscale', icon: '◐' },
    { value: 'sepia', icon: '◑' },
    { value: 'scanner', icon: '⊞' },
    { value: 'highContrast', icon: '◉' },
    { value: 'invert', icon: '◈' },
    { value: 'brightness', icon: '☀' },
    { value: 'warm', icon: '🔥' },
    { value: 'cool', icon: '❄' },
  ];

  const filterKeys = {
    none: 'filterNone',
    grayscale: 'filterGrayscale',
    sepia: 'filterSepia',
    scanner: 'filterScanner',
    highContrast: 'filterHighContrast',
    invert: 'filterInvert',
    brightness: 'filterBrightness',
    warm: 'filterWarm',
    cool: 'filterCool',
  };

  const numberPositions = [
    { value: 'center', icon: '◉' },
    { value: 'top-left', icon: '◸' },
    { value: 'top-right', icon: '◹' },
    { value: 'bottom-left', icon: '◺' },
    { value: 'bottom-right', icon: '◿' },
  ];

  const positionKeys = {
    center: 'posCenter',
    'top-left': 'posTopLeft',
    'top-right': 'posTopRight',
    'bottom-left': 'posBottomLeft',
    'bottom-right': 'posBottomRight',
  };
</script>

<aside class="sidebar" style:width="{sidebarWidth}px" style:min-width="{sidebarWidth}px">
  <!-- Mode toggle -->
  <div class="mode-toggle">
    <button
      class="mode-btn"
      class:active={!store.advancedMode}
      onclick={() => gridStore.update(s => ({...s, advancedMode: false}))}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      {tr('simpleMode')}
    </button>
    <button
      class="mode-btn"
      class:active={store.advancedMode}
      onclick={() => gridStore.update(s => ({...s, advancedMode: true}))}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      {tr('advancedMode')}
    </button>
  </div>

  <div class="sidebar-scroll">
    <!-- Grid -->
    <section class="section">
      <button class="section-toggle" onclick={() => toggle('grid')}>
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>{tr('sectionGrid')}</span>
        </div>
        <svg class="chevron" class:open={sections.grid} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="section-content" class:open={sections.grid}>
        <div class="section-inner">
          <div class="section-body">
            <div class="presets-row">
              {#each presets as p}
                <button
                  class="preset-chip"
                  class:active={store.rows === p.rows && store.cols === p.cols}
                  onclick={() => gridStore.update(s => ({...s, rows: p.rows, cols: p.cols}))}
                >{p.label}</button>
              {/each}
            </div>

            <div class="field-row">
              <div class="field">
                <span class="field-label">{tr('rows')}</span>
                <div class="stepper">
                  <button class="step-btn" onclick={() => gridStore.update(s => ({...s, rows: Math.max(1, s.rows - 1)}))}>-</button>
                  <input type="number" min="1" max="50" value={store.rows}
                    oninput={(e) => gridStore.update(s => ({...s, rows: Math.min(50, Math.max(1, +e.target.value || 1))}))} />
                  <button class="step-btn" onclick={() => gridStore.update(s => ({...s, rows: Math.min(50, s.rows + 1)}))}>+</button>
                </div>
              </div>
              <div class="field">
                <span class="field-label">{tr('cols')}</span>
                <div class="stepper">
                  <button class="step-btn" onclick={() => gridStore.update(s => ({...s, cols: Math.max(1, s.cols - 1)}))}>-</button>
                  <input type="number" min="1" max="50" value={store.cols}
                    oninput={(e) => gridStore.update(s => ({...s, cols: Math.min(50, Math.max(1, +e.target.value || 1))}))} />
                  <button class="step-btn" onclick={() => gridStore.update(s => ({...s, cols: Math.min(50, s.cols + 1)}))}>+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Line Style -->
    {#if store.advancedMode}
    <section class="section">
      <button class="section-toggle" onclick={() => toggle('style')}>
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>{tr('sectionLineStyle')}</span>
        </div>
        <svg class="chevron" class:open={sections.style} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="section-content" class:open={sections.style}>
        <div class="section-inner">
          <div class="section-body">
            <div class="field">
              <span class="field-label">{tr('quickColors')}</span>
              <div class="color-swatches">
                {#each colorPresets as color}
                  <button
                    class="swatch"
                    class:active={store.lineColor === color}
                    style="background: {color}; {color === '#ffffff' ? 'border: 1px solid var(--border-color)' : ''}"
                    onclick={() => gridStore.update(s => ({...s, lineColor: color}))}
                    title={color}
                  ></button>
                {/each}
              </div>
              <div class="color-custom-row">
                <span class="field-label-sm">{tr('custom')}</span>
                <div class="color-custom-picker">
                  <input type="color" value={store.lineColor}
                    oninput={(e) => gridStore.update(s => ({...s, lineColor: e.target.value}))} />
                  <span class="color-hex">{store.lineColor}</span>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="field-label-row">
                <span class="field-label">{tr('thickness')}</span>
                <span class="field-value">{store.lineWidth}px</span>
              </div>
              <input type="range" min="0.3" max="10" step="0.1" value={store.lineWidth}
                oninput={(e) => gridStore.update(s => ({...s, lineWidth: +e.target.value}))} />
            </div>

            <div class="field">
              <div class="field-label-row">
                <span class="field-label">{tr('opacity')}</span>
                <span class="field-value">{Math.round(store.lineOpacity * 100)}%</span>
              </div>
              <input type="range" min="0.05" max="1" step="0.05" value={store.lineOpacity}
                oninput={(e) => gridStore.update(s => ({...s, lineOpacity: +e.target.value}))} />
            </div>

            <div class="field">
              <span class="field-label">{tr('style')}</span>
              <div class="style-chips">
                {#each ['solid', 'dashed', 'dotted'] as style}
                  <button
                    class="preset-chip"
                    class:active={store.lineStyle === style}
                    onclick={() => gridStore.update(s => ({...s, lineStyle: style}))}
                  >{tr(style)}</button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {:else}
    <!-- Simple mode: inline color + thickness -->
    <section class="section">
      <div class="section-body simple-line">
        <div class="simple-color-row">
          {#each colorPresets.slice(0, 6) as color}
            <button
              class="swatch swatch-sm"
              class:active={store.lineColor === color}
              style="background: {color}"
              onclick={() => gridStore.update(s => ({...s, lineColor: color}))}
              title={color}
            ></button>
          {/each}
          <div class="swatch-picker-sm">
            <input type="color" value={store.lineColor}
              oninput={(e) => gridStore.update(s => ({...s, lineColor: e.target.value}))} />
          </div>
        </div>
      </div>
    </section>
    {/if}

    <!-- Extras -->
    {#if store.advancedMode}
    <section class="section">
      <button class="section-toggle" onclick={() => toggle('extras')}>
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span>{tr('sectionExtras')}</span>
        </div>
        <svg class="chevron" class:open={sections.extras} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="section-content" class:open={sections.extras}>
        <div class="section-inner">
          <div class="section-body">
            <label class="toggle-field">
              <span>{tr('showCellNumbers')}</span>
              <span class="toggle-switch" class:active={store.showNumbers}>
                <input type="checkbox" checked={store.showNumbers}
                  onchange={(e) => gridStore.update(s => ({...s, showNumbers: e.target.checked}))} />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>

            <label class="toggle-field">
              <span>{tr('centerCrosshair')}</span>
              <span class="toggle-switch" class:active={store.showCenter}>
                <input type="checkbox" checked={store.showCenter}
                  onchange={(e) => gridStore.update(s => ({...s, showCenter: e.target.checked}))} />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>

            <label class="toggle-field">
              <span>{tr('diagonals')}</span>
              <span class="toggle-switch" class:active={store.showDiagonals}>
                <input type="checkbox" checked={store.showDiagonals}
                  onchange={(e) => gridStore.update(s => ({...s, showDiagonals: e.target.checked}))} />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>

            {#if store.showNumbers}
              <div class="field">
                <span class="field-label">{tr('numberPosition')}</span>
                <div class="style-chips">
                  {#each numberPositions as pos}
                    <button
                      class="preset-chip"
                      class:active={store.numberPosition === pos.value}
                      onclick={() => gridStore.update(s => ({...s, numberPosition: pos.value}))}
                      title={tr(positionKeys[pos.value])}
                    ><span class="pos-icon">{pos.icon}</span> {tr(positionKeys[pos.value])}</button>
                  {/each}
                </div>
              </div>

              <div class="color-field">
                <span class="field-label">{tr('numberColor')}</span>
                <input type="color" value={store.numberColor}
                  oninput={(e) => gridStore.update(s => ({...s, numberColor: e.target.value}))} />
              </div>
              <div class="field">
                <div class="field-label-row">
                  <span class="field-label">{tr('numberSize')}</span>
                  <span class="field-value">{store.numberSize}px</span>
                </div>
                <input type="range" min="8" max="36" step="1" value={store.numberSize}
                  oninput={(e) => gridStore.update(s => ({...s, numberSize: +e.target.value}))} />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </section>
    {/if}

    <!-- Filters -->
    <section class="section">
      <button class="section-toggle" onclick={() => toggle('filters')}>
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span>{tr('sectionFilters')}</span>
        </div>
        <svg class="chevron" class:open={sections.filters} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="section-content" class:open={sections.filters}>
        <div class="section-inner">
          <div class="section-body">
            <div class="filter-grid">
              {#each filters as f}
                <button
                  class="filter-chip"
                  class:active={store.filter === f.value}
                  onclick={() => gridStore.update(s => ({...s, filter: f.value}))}
                >
                  <span class="filter-icon">{f.icon}</span>
                  <span class="filter-name">{tr(filterKeys[f.value])}</span>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Export -->
    <section class="section">
      <button class="section-toggle" onclick={() => toggle('export')}>
        <div class="section-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>{tr('sectionDownload')}</span>
        </div>
        <svg class="chevron" class:open={sections.export} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="section-content" class:open={sections.export}>
        <div class="section-inner">
          <div class="section-body">
            <div class="field">
              <span class="field-label">{tr('scale')}</span>
              <div class="style-chips">
                {#each [1, 2, 3] as scale}
                  <button
                    class="preset-chip"
                    class:active={store.exportScale === scale}
                    onclick={() => gridStore.update(s => ({...s, exportScale: scale}))}
                  >{scale}x</button>
                {/each}
              </div>
            </div>

            {#if store.advancedMode}
            <label class="toggle-field">
              <span>{tr('gridOnly')}</span>
              <span class="toggle-switch" class:active={store.exportGridOnly}>
                <input type="checkbox" checked={store.exportGridOnly}
                  onchange={(e) => gridStore.update(s => ({...s, exportGridOnly: e.target.checked}))} />
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </span>
            </label>

            {#if store.exportGridOnly}
              <div class="color-field">
                <span class="field-label">{tr('bgColor')}</span>
                <input type="color" value={store.exportBgColor}
                  oninput={(e) => gridStore.update(s => ({...s, exportBgColor: e.target.value}))} />
              </div>
            {/if}

            <div class="field">
              <div class="field-label-row">
                <span class="field-label">{tr('jpegQuality')}</span>
                <span class="field-value">{store.exportQuality}%</span>
              </div>
              <input type="range" min="10" max="100" step="5" value={store.exportQuality}
                oninput={(e) => gridStore.update(s => ({...s, exportQuality: +e.target.value}))} />
            </div>
            {/if}

            <div class="export-buttons">
              <button class="btn btn-primary full" onclick={() => onExport?.('png')} disabled={!store.croppedSrc}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {tr('downloadPng')}
              </button>
              <button class="btn btn-ghost full" onclick={() => onExport?.('jpeg')} disabled={!store.croppedSrc}>
                {tr('downloadJpeg')}
              </button>
            </div>

            <button
              class="btn btn-ghost full save-history-btn"
              class:saved={saveFlash}
              onclick={handleSave}
              disabled={!store.croppedSrc}
            >
              {#if saveFlash}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {/if}
              {tr('historySave')}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Bottom actions -->
  <div class="sidebar-footer">
    <button class="btn btn-ghost full btn-sm reset-settings" onclick={() => gridStore.resetSettings()}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      {tr('resetAll')}
    </button>
    {#if store.imageSrc}
      <button class="btn btn-ghost full btn-sm" onclick={() => onCrop?.()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
        {tr('reCrop')}
      </button>
      <button class="btn btn-ghost full btn-sm" style="color: var(--danger)" onclick={() => gridStore.clearImage()}>
        {tr('removeImage')}
      </button>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    transition: background 0.35s ease, border-color 0.35s ease;
  }

  /* Mode toggle */
  .mode-toggle {
    display: flex;
    padding: 8px 10px;
    gap: 4px;
    border-bottom: 1px solid var(--border-light);
  }
  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    background: transparent;
    transition: all 0.2s ease;
  }
  .mode-btn:hover { color: var(--text-secondary); background: var(--bg-hover); }
  .mode-btn.active {
    color: var(--accent);
    background: var(--accent-light);
    box-shadow: inset 0 0 0 1px var(--accent-glow);
  }

  .sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .section { border-bottom: 1px solid var(--border-light); }

  .section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 11px 16px;
    background: none;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 600;
  }
  .section-toggle:hover { background: var(--bg-hover); }

  .section-label { display: flex; align-items: center; gap: 8px; }

  .chevron { color: var(--text-muted); transition: transform 0.2s ease; }
  .chevron.open { transform: rotate(180deg); }

  /* Animated section collapse */
  .section-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .section-content.open {
    grid-template-rows: 1fr;
  }
  .section-inner {
    overflow: hidden;
    min-height: 0;
  }

  .section-body {
    padding: 2px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .presets-row { display: flex; flex-wrap: wrap; gap: 4px; }

  .preset-chip {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-mono);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    transition: all var(--transition);
  }
  .preset-chip:hover { background: var(--bg-hover); border-color: var(--accent); color: var(--text-primary); }
  .preset-chip.active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .field-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
  .field-label-sm { font-size: 10px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .field-label-row { display: flex; align-items: center; justify-content: space-between; }
  .field-value { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); }

  .stepper { display: flex; align-items: center; gap: 0; }
  .stepper input { text-align: center; border-radius: 0; border-left: none; border-right: none; width: 100%; padding: 6px 4px; }
  .step-btn {
    width: 30px; height: 33px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); color: var(--text-secondary);
    border: 1px solid var(--border-color);
    font-size: 16px; font-weight: 500;
  }
  .step-btn:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
  .step-btn:last-child { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
  .step-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  /* Color swatches */
  .color-swatches {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    align-items: center;
  }
  .swatch {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;
  }
  .swatch:hover { transform: scale(1.15); }
  .swatch.active {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--text-primary);
    transform: scale(1.1);
  }

  /* Custom color row */
  .color-custom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }
  .color-custom-picker {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .color-custom-picker input[type="color"] {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    padding: 2px;
  }
  .color-hex {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    padding: 3px 6px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    border: 1px solid var(--border-light);
  }

  /* Simple mode inline colors */
  .simple-line { padding: 8px 16px 10px; }
  .simple-color-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .swatch-sm {
    width: 22px;
    height: 22px;
    border-radius: 5px;
  }
  .swatch-picker-sm {
    width: 22px;
    height: 22px;
    overflow: hidden;
    border-radius: 5px;
    flex-shrink: 0;
  }
  .swatch-picker-sm input[type="color"] {
    width: 30px;
    height: 30px;
    margin: -4px;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .color-field { display: flex; align-items: center; justify-content: space-between; }

  .style-chips { display: flex; gap: 4px; flex-wrap: wrap; }

  .pos-icon { font-size: 11px; margin-right: 1px; }

  /* Toggle switch */
  .toggle-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-secondary);
    gap: 8px;
  }
  .toggle-switch {
    position: relative;
    flex-shrink: 0;
  }
  .toggle-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle-track {
    display: block;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--border-color);
    transition: background 0.2s ease;
    position: relative;
  }
  .toggle-switch.active .toggle-track {
    background: var(--accent);
  }
  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .toggle-switch.active .toggle-thumb {
    transform: translateX(16px);
  }

  /* Filters */
  .filter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }
  .filter-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 10px;
    font-weight: 500;
    transition: all 0.15s ease;
  }
  .filter-chip:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    color: var(--text-primary);
  }
  .filter-chip.active {
    background: var(--accent-light);
    border-color: var(--accent);
    color: var(--accent);
  }
  .filter-icon {
    font-size: 16px;
    line-height: 1;
  }
  .filter-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .export-buttons { display: flex; flex-direction: column; gap: 6px; }
  .save-history-btn {
    margin-top: 2px;
    border-style: dashed;
  }
  .save-history-btn.saved {
    border-color: var(--success);
    color: var(--success);
    border-style: solid;
  }
  .full { width: 100%; justify-content: center; }

  .sidebar-footer {
    padding: 8px 12px;
    border-top: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .reset-settings { color: var(--text-muted); }
  .reset-settings:hover { color: var(--accent); }

  /* Mobile: sidebar becomes bottom drawer */
  @media (max-width: 768px) {
    .sidebar {
      width: 100% !important;
      min-width: 100% !important;
      height: auto;
      max-height: 45vh;
      border-right: none;
      border-top: 1px solid var(--border-color);
      order: 2;
    }
    .sidebar-scroll { padding: 0; }
    .section-body { padding: 2px 14px 12px; }
    .presets-row { gap: 3px; }
    .mode-toggle { padding: 6px 8px; }
    .filter-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
