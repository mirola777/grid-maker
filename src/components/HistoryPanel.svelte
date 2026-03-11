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

  function startRename(entry, e) {
    e?.stopPropagation();
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

  function handleRemove(id, e) {
    e?.stopPropagation();
    historyStore.remove(id);
  }
</script>

<aside class="history-sidebar">
  <div class="hs-header">
    <div class="hs-title-row">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span class="hs-title">{tr('historyTitle')}</span>
      {#if history.length > 0}
        <span class="hs-count">{history.length}</span>
      {/if}
    </div>
    <button class="hs-close" onclick={onClose} aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  {#if sorted.length === 0}
    <div class="hs-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.2" opacity="0.4">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p class="hs-empty-title">{tr('historyEmpty')}</p>
      <p class="hs-empty-sub">{tr('historyEmptySub')}</p>
    </div>
  {:else}
    <div class="hs-list">
      {#each sorted as entry (entry.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="hs-card" onclick={() => handleLoad(entry)}>
          <div class="hs-thumb">
            {#if entry.thumbnail}
              <img src={entry.thumbnail} alt="" draggable="false" />
            {:else}
              <div class="hs-thumb-empty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </div>
            {/if}
          </div>

          <div class="hs-card-body">
            <div class="hs-card-top">
              {#if editingId === entry.id}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <form class="hs-rename" onsubmit={(e) => { e.preventDefault(); finishRename(); }} onclick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    class="hs-rename-input"
                    bind:value={editName}
                    placeholder={tr('historyNamePlaceholder')}
                    autofocus={true}
                    onblur={finishRename}
                  />
                </form>
              {:else}
                <span class="hs-card-name">{entry.name || tr('historyUntitled')}</span>
              {/if}
              <span class="hs-card-time">{formatDate(entry.createdAt)}</span>
            </div>

            <div class="hs-card-meta">
              <span class="hs-meta-badge">{entry.settings.rows}x{entry.settings.cols}</span>
              {#if entry.settings.filter !== 'none'}
                <span class="hs-meta-badge hs-meta-filter">{tr('sectionFilters')}</span>
              {/if}
              {#if entry.settings.showNumbers}
                <span class="hs-meta-badge">#</span>
              {/if}
              <span class="hs-meta-color" style="background: {entry.settings.lineColor}"></span>
            </div>
          </div>

          <div class="hs-card-actions">
            <button class="hs-action" onclick={(e) => startRename(entry, e)} title={tr('historyRename')}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="hs-action hs-action-danger" onclick={(e) => handleRemove(entry.id, e)} title={tr('historyDelete')}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <div class="hs-footer">
      <button
        class="hs-clear-btn"
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
</aside>

<style>
  .history-sidebar {
    width: 260px;
    min-width: 260px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    transition: background 0.35s ease, border-color 0.35s ease;
    animation: slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* Header */
  .hs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
  }
  .hs-title-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hs-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .hs-count {
    font-size: 10px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 1px 6px;
    border-radius: 8px;
    background: var(--accent-light);
    color: var(--accent);
  }
  .hs-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
  }
  .hs-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* Empty */
  .hs-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    text-align: center;
  }
  .hs-empty-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .hs-empty-sub {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.4;
    max-width: 200px;
  }

  /* List */
  .hs-list {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Card */
  .hs-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    position: relative;
  }
  .hs-card:hover {
    background: var(--bg-hover);
    border-color: var(--border-color);
  }
  .hs-card:active {
    transform: scale(0.99);
  }

  /* Thumbnail */
  .hs-thumb {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
  }
  .hs-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hs-thumb-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    opacity: 0.4;
  }

  /* Card body */
  .hs-card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .hs-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  .hs-card-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .hs-card-time {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    flex-shrink: 0;
  }

  /* Meta badges */
  .hs-card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .hs-meta-badge {
    font-size: 9px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--bg-tertiary);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }
  .hs-meta-filter {
    background: var(--accent-light);
    color: var(--accent);
    border-color: transparent;
  }
  .hs-meta-color {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    border: 1px solid var(--border-color);
    flex-shrink: 0;
  }

  /* Rename */
  .hs-rename {
    flex: 1;
    min-width: 0;
  }
  .hs-rename-input {
    width: 100%;
    font-size: 11px !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
  }

  /* Actions */
  .hs-card-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }
  .hs-card:hover .hs-card-actions {
    opacity: 1;
  }
  .hs-action {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background: transparent;
    color: var(--text-muted);
  }
  .hs-action:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  .hs-action-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }

  /* Footer */
  .hs-footer {
    padding: 8px 10px;
    border-top: 1px solid var(--border-light);
    flex-shrink: 0;
  }
  .hs-clear-btn {
    width: 100%;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--border-light);
    text-align: center;
  }
  .hs-clear-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(239, 68, 68, 0.05);
  }
  .hs-clear-btn.confirm {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--danger);
    color: var(--danger);
    font-weight: 600;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .history-sidebar {
      position: fixed;
      inset: 0;
      width: 100% !important;
      min-width: 100% !important;
      z-index: 999;
      border-left: none;
      animation: mobileSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes mobileSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .hs-header {
      padding: 12px 16px;
    }
    .hs-list {
      padding: 8px 12px;
      gap: 6px;
    }
    .hs-card {
      padding: 8px 10px;
    }
    .hs-thumb {
      width: 52px;
      height: 52px;
    }
    .hs-card-actions {
      opacity: 1;
    }
  }
</style>
