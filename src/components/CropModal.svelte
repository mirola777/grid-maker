<script>
  import Cropper from 'cropperjs';
  import 'cropperjs/dist/cropper.css';
  import { t } from '../stores/i18n.js';

  let { imageSrc, onApply, onCancel } = $props();
  let tr = $derived($t);

  let imgEl = $state(null);
  let cropper = $state(null);
  let modalEl = $state(null);
  let selectedRatio = $state('free');
  let customW = $state(16);
  let customH = $state(9);
  let cropInfo = $state({ w: 0, h: 0 });
  let mouseDownTarget = $state(null);

  let ratios = $derived([
    { label: tr('free'), value: 'free', ratio: NaN, icon: '~' },
    { label: '1:1', value: '1:1', ratio: 1, icon: null },
    { label: '4:3', value: '4:3', ratio: 4/3, icon: null },
    { label: '3:2', value: '3:2', ratio: 3/2, icon: null },
    { label: '16:9', value: '16:9', ratio: 16/9, icon: null },
    { label: '9:16', value: '9:16', ratio: 9/16, icon: null },
    { label: '2:3', value: '2:3', ratio: 2/3, icon: null },
    { label: '3:4', value: '3:4', ratio: 3/4, icon: null },
  ]);

  function initCropper() {
    if (cropper) cropper.destroy();
    if (!imgEl) return;

    cropper = new Cropper(imgEl, {
      viewMode: 0,
      dragMode: 'move',
      autoCropArea: 0.85,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      background: true,
      minContainerWidth: 200,
      minContainerHeight: 200,
      crop(event) {
        cropInfo = {
          w: Math.round(event.detail.width),
          h: Math.round(event.detail.height),
        };
      },
    });
  }

  function setRatio(item) {
    selectedRatio = item.value;
    cropper?.setAspectRatio(item.ratio);
  }

  function setCustomRatio() {
    if (customW > 0 && customH > 0) {
      selectedRatio = 'custom';
      cropper?.setAspectRatio(customW / customH);
    }
  }

  function rotateLeft() { cropper?.rotate(-90); }
  function rotateRight() { cropper?.rotate(90); }
  function flipH() {
    const d = cropper?.getData();
    cropper?.scaleX(d?.scaleX === -1 ? 1 : -1);
  }
  function flipV() {
    const d = cropper?.getData();
    cropper?.scaleY(d?.scaleY === -1 ? 1 : -1);
  }
  function zoomIn() { cropper?.zoom(0.1); }
  function zoomOut() { cropper?.zoom(-0.1); }
  function resetCrop() {
    selectedRatio = 'free';
    cropper?.reset();
    cropper?.setAspectRatio(NaN);
  }

  function apply() {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 10000,
      maxHeight: 10000,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    if (!canvas) return;
    onApply?.(canvas.toDataURL('image/png'));
    cropper.destroy();
  }

  function cancel() {
    cropper?.destroy();
    onCancel?.();
  }

  function handleOverlayMouseDown(e) {
    mouseDownTarget = e.target;
  }

  function handleOverlayClick(e) {
    // Only close if BOTH mousedown AND click happened on the overlay itself
    if (e.target === modalEl && mouseDownTarget === modalEl) {
      cancel();
    }
    mouseDownTarget = null;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter') apply();
  }

  $effect(() => {
    if (imgEl && imageSrc) {
      setTimeout(initCropper, 80);
    }
    return () => { cropper?.destroy(); };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" bind:this={modalEl} onmousedown={handleOverlayMouseDown} onclick={handleOverlayClick}>
  <div class="modal">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-title">
        <div class="title-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
        </div>
        <div>
          <h3>{tr('cropTitle')}</h3>
          <span class="subtitle">{tr('cropSubtitle')}</span>
        </div>
      </div>
      <div class="header-actions">
        {#if cropInfo.w > 0}
          <span class="crop-size">{cropInfo.w} &times; {cropInfo.h}</span>
        {/if}
        <button class="close-btn" onclick={cancel} title="Close (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Aspect Ratio Bar -->
    <div class="ratio-bar">
      <span class="ratio-label">{tr('aspectRatio')}</span>
      <div class="ratio-chips">
        {#each ratios as item}
          <button
            class="ratio-chip"
            class:active={selectedRatio === item.value}
            onclick={() => setRatio(item)}
          >
            {#if item.icon}
              <span class="ratio-icon">{item.icon}</span>
            {/if}
            {item.label}
          </button>
        {/each}
        <div class="custom-ratio" class:active={selectedRatio === 'custom'}>
          <input type="number" min="1" max="99" bind:value={customW} class="ratio-input"
            onfocus={() => selectedRatio = 'custom'}
            oninput={setCustomRatio} />
          <span class="ratio-sep">:</span>
          <input type="number" min="1" max="99" bind:value={customH} class="ratio-input"
            onfocus={() => selectedRatio = 'custom'}
            oninput={setCustomRatio} />
        </div>
      </div>
    </div>

    <!-- Crop Area -->
    <div class="crop-area">
      <img bind:this={imgEl} src={imageSrc} alt="Crop preview" />
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="tool-section">
        <span class="tool-title">{tr('rotate')}</span>
        <div class="tool-btns">
          <button class="tool-btn" onclick={rotateLeft} title="Rotate left 90deg">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          <button class="tool-btn" onclick={rotateRight} title="Rotate right 90deg">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
          </button>
        </div>
      </div>

      <div class="tool-sep"></div>

      <div class="tool-section">
        <span class="tool-title">{tr('flip')}</span>
        <div class="tool-btns">
          <button class="tool-btn" onclick={flipH} title="Flip horizontal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 8 3 12 7 16"/><polyline points="17 8 21 12 17 16"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
          </button>
          <button class="tool-btn" onclick={flipV} title="Flip vertical">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 7 12 3 16 7"/><polyline points="8 17 12 21 16 17"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          </button>
        </div>
      </div>

      <div class="tool-sep"></div>

      <div class="tool-section">
        <span class="tool-title">{tr('zoom')}</span>
        <div class="tool-btns">
          <button class="tool-btn" onclick={zoomOut} title="Zoom out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="tool-btn" onclick={zoomIn} title="Zoom in">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
        </div>
      </div>

      <div class="tool-sep"></div>

      <button class="tool-btn reset-btn" onclick={resetCrop} title="Reset all">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <span>{tr('reset')}</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <div class="footer-hint">
        <kbd>Enter</kbd> {tr('apply')} &middot; <kbd>Esc</kbd> {tr('cancel')}
      </div>
      <div class="footer-actions">
        <button class="btn btn-ghost" onclick={cancel}>{tr('cancelBtn')}</button>
        <button class="btn btn-primary" onclick={apply}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {tr('applyCrop')}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg), 0 0 60px rgba(249, 115, 22, 0.08);
    max-width: 920px;
    width: 100%;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }
  .modal-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .title-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--accent-light), var(--bg-tertiary));
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-title h3 {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
  }
  .subtitle {
    font-size: 11px;
    color: var(--text-muted);
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .crop-size {
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    padding: 3px 8px;
    background: var(--bg-tertiary);
    border-radius: 6px;
  }
  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
  }
  .close-btn:hover { background: var(--bg-hover); color: var(--danger); }

  .ratio-bar {
    padding: 10px 18px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 12px;
    overflow-x: auto;
    background: var(--bg-tertiary);
  }
  .ratio-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ratio-chips {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
  }
  .ratio-chip {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-mono);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .ratio-chip:hover {
    border-color: var(--accent);
    color: var(--text-primary);
  }
  .ratio-chip.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 2px 8px var(--accent-glow);
  }
  .ratio-icon { margin-right: 2px; }

  .custom-ratio {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    transition: border-color 0.15s ease;
  }
  .custom-ratio.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }
  .ratio-input {
    width: 36px !important;
    text-align: center;
    border: none !important;
    background: transparent !important;
    padding: 4px 2px !important;
    font-size: 12px !important;
    box-shadow: none !important;
  }
  .ratio-sep {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .crop-area {
    flex: 1;
    min-height: 0;
    max-height: 50vh;
    overflow: hidden;
    background: var(--bg-primary);
  }
  .crop-area img {
    display: block;
    max-width: 100%;
    max-height: 50vh;
  }

  .toolbar {
    padding: 10px 18px;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tool-section {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tool-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }
  .tool-btns { display: flex; gap: 2px; }
  .tool-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .tool-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border-color);
  }
  .reset-btn {
    width: auto;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 500;
    margin-left: auto;
  }
  .reset-btn span { font-size: 12px; }
  .tool-sep {
    width: 1px;
    height: 24px;
    background: var(--border-color);
    margin: 0 4px;
    flex-shrink: 0;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }
  .footer-hint {
    font-size: 11px;
    color: var(--text-muted);
  }
  .footer-hint kbd {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
  }
  .footer-actions {
    display: flex;
    gap: 8px;
  }

  @media (max-width: 640px) {
    .modal { max-height: 100vh; border-radius: 0; }
    .overlay { padding: 0; }
    .ratio-bar { flex-wrap: nowrap; overflow-x: auto; }
    .toolbar { gap: 4px; }
    .tool-title { display: none; }
    .footer-hint { display: none; }
    .crop-area { max-height: 40vh; }
  }
</style>
