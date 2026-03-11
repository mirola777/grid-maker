<script>
  import { historyStore } from '../stores/historyStore.js';
  import { t } from '../stores/i18n.js';

  let { onLoad, onClose } = $props();
  let tr = $derived($t);
  let history = $derived($historyStore);
  let sorted = $derived([...history].reverse());
  let editingId = $state(null);
  let editName = $state('');
  let confirmClearAll = $state(false);

  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return tr('historyJustNow');
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function handleLoad(entry) {
    onLoad?.({
      imageSrc: entry.imageSrc,
      croppedSrc: entry.croppedSrc,
      ...entry.settings,
    });
  }

  function startRename(entry) {
    editingId = entry.id;
    editName = entry.name || '';
  }

  function finishRename() {
    if (editingId) {
      historyStore.rename(editingId, editName.trim());
      editingId = null;
      editName = '';
    }
  }

  function handleClearAll() {
    if (confirmClearAll) {
      historyStore.clearAll();
      confirmClearAll = false;
    } else {
      confirmClearAll = true;
      setTimeout(() => { confirmClearAll = false; }, 3000);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="history-overlay" onclick={onClose}>
  <div class="history-panel" onclick={(e) => e.stopPropagation()}>
    <div class="history-header">
      <div class="history-title-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <h2 class="history-title">{tr('historyTitle')}</h2>
        <span class="history-count">{history.length}</span>
      </div>
      <button class="close-btn" onclick={onClose} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    {#if sorted.length === 0}
      <div class="history-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <p class="history-empty-text">{tr('historyEmpty')}</p>
        <p class="history-empty-sub">{tr('historyEmptySub')}</p>
      </div>
    {:else}
      <div class="history-grid">
        {#each sorted as entry (entry.id)}
          <div class="history-card">
            <button class="history-thumb" onclick={() => handleLoad(entry)}>
              {#if entry.thumbnail}
                <img src={entry.thumbnail} alt="" draggable="false" />
              {:else}
                <div class="thumb-placeholder">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </div>
              {/if}
              <div class="thumb-overlay">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                <span>{tr('historyLoad')}</span>
              </div>
              <span class="card-grid-badge">{entry.settings.rows}x{entry.settings.cols}</span>
            </button>

            <div class="card-info">
              {#if editingId === entry.id}
                <form class="rename-form" onsubmit={(e) => { e.preventDefault(); finishRename(); }}>
                  <input
                    type="text"
                    class="rename-input"
                    bind:value={editName}
                    placeholder={tr('historyNamePlaceholder')}
                    autofocus={true}
                    onblur={finishRename}
                  />
                </form>
              {:else}
                <button class="card-name" onclick={() => startRename(entry)} title={tr('historyRename')}>
                  {entry.name || tr('historyUntitled')}
                </button>
              {/if}
              <span class="card-time">{formatDate(entry.createdAt)}</span>
            </div>

            <div class="card-actions">
              <button class="card-action" onclick={() => startRename(entry)} title={tr('historyRename')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="card-action card-action-danger" onclick={() => historyStore.remove(entry.id)} title={tr('historyDelete')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <div class="history-footer">
        <button
          class="btn btn-ghost btn-sm clear-all-btn"
          class:confirm={confirmClearAll}
          onclick={handleClearAll}
        >
          {#if confirmClearAll}
            {tr('historyConfirmClear')}
          {:else}
            {tr('historyClearAll')}
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .history-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .history-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 560px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  @keyframes slideUp {
    from { transform: translateY(20px) scale(0.97); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
  }
  .history-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .history-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .history-count {
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 2px 7px;
    border-radius: 10px;
    background: var(--accent-light);
    color: var(--accent);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
  }
  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* Empty */
  .history-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 48px 24px;
    text-align: center;
  }
  .history-empty-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .history-empty-sub {
    font-size: 12px;
    color: var(--text-muted);
    max-width: 260px;
  }

  /* Grid */
  .history-grid {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .history-card {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all 0.15s ease;
    position: relative;
  }
  .history-card:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 12px var(--accent-glow);
  }

  .history-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    background: var(--bg-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
    border: none;
    padding: 0;
  }
  .history-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }
  .history-thumb:hover img {
    transform: scale(1.05);
  }
  .thumb-placeholder {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
    color: white;
    font-size: 11px;
    font-weight: 600;
  }
  .history-thumb:hover .thumb-overlay {
    opacity: 1;
  }

  .card-grid-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: var(--font-mono);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    backdrop-filter: blur(4px);
  }

  .card-info {
    padding: 8px 10px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-height: 30px;
  }
  .card-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    background: none;
    padding: 0;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .card-name:hover {
    color: var(--accent);
  }
  .card-time {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .rename-form {
    flex: 1;
    min-width: 0;
  }
  .rename-input {
    width: 100%;
    font-size: 12px !important;
    padding: 3px 6px !important;
    border-radius: 4px !important;
  }

  .card-actions {
    display: flex;
    gap: 2px;
    padding: 2px 8px 8px;
  }
  .card-action {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
  }
  .card-action:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  .card-action-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }

  /* Footer */
  .history-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: center;
  }
  .clear-all-btn {
    color: var(--text-muted);
    font-size: 11px;
  }
  .clear-all-btn:hover {
    color: var(--danger);
  }
  .clear-all-btn.confirm {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--danger);
    color: var(--danger);
  }

  @media (max-width: 768px) {
    .history-panel {
      max-width: 100%;
      max-height: 90vh;
      border-radius: var(--radius-md);
    }
    .history-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 8px;
    }
    .history-overlay {
      padding: 10px;
    }
  }

  @media (max-width: 400px) {
    .history-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
