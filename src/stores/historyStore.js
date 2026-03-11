import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'grid-maker-history';
const MAX_ENTRIES = 30;
const THUMB_SIZE = 160;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createThumbnail(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1) {
        canvas.width = THUMB_SIZE;
        canvas.height = Math.round(THUMB_SIZE / ratio);
      } else {
        canvas.height = THUMB_SIZE;
        canvas.width = Math.round(THUMB_SIZE * ratio);
      }
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    // Storage full — remove oldest entries and retry
    if (entries.length > 1) {
      saveToStorage(entries.slice(-Math.floor(entries.length / 2)));
    }
  }
}

function createHistoryStore() {
  const initial = loadFromStorage();
  const { subscribe, set, update } = writable(initial);

  function persist(entries) {
    saveToStorage(entries);
    return entries;
  }

  return {
    subscribe,

    async save(gridState, name = '') {
      if (!gridState.croppedSrc) return;

      const thumbnail = await createThumbnail(gridState.croppedSrc);
      const entry = {
        id: generateId(),
        name: name || '',
        thumbnail,
        createdAt: Date.now(),
        // Save image sources
        imageSrc: gridState.imageSrc,
        croppedSrc: gridState.croppedSrc,
        // Save grid settings (not image data)
        settings: {
          rows: gridState.rows,
          cols: gridState.cols,
          lineColor: gridState.lineColor,
          lineOpacity: gridState.lineOpacity,
          lineWidth: gridState.lineWidth,
          showNumbers: gridState.showNumbers,
          numberColor: gridState.numberColor,
          numberSize: gridState.numberSize,
          numberPosition: gridState.numberPosition,
          lineStyle: gridState.lineStyle,
          showDiagonals: gridState.showDiagonals,
          showCenter: gridState.showCenter,
          filter: gridState.filter,
          exportScale: gridState.exportScale,
          exportFormat: gridState.exportFormat,
          exportQuality: gridState.exportQuality,
          exportGridOnly: gridState.exportGridOnly,
          exportBgColor: gridState.exportBgColor,
          advancedMode: gridState.advancedMode,
        },
      };

      update(entries => {
        const updated = [...entries, entry].slice(-MAX_ENTRIES);
        return persist(updated);
      });

      return entry.id;
    },

    remove(id) {
      update(entries => {
        const updated = entries.filter(e => e.id !== id);
        return persist(updated);
      });
    },

    rename(id, name) {
      update(entries => {
        const updated = entries.map(e =>
          e.id === id ? { ...e, name } : e
        );
        return persist(updated);
      });
    },

    clearAll() {
      set(persist([]));
    },
  };
}

export const historyStore = createHistoryStore();

export const historyCount = derived(historyStore, ($h) => $h.length);
