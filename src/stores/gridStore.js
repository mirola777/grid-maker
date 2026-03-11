import { writable } from 'svelte/store';

function createGridStore() {
  const { subscribe, set, update } = writable({
    // Image
    imageSrc: null,       // original uploaded image
    croppedSrc: null,     // after crop (or same as original if no crop)

    // Grid overlay
    rows: 4,
    cols: 4,
    lineColor: '#ff3366',
    lineOpacity: 0.7,
    lineWidth: 1.5,
    showNumbers: false,
    numberColor: '#ff3366',
    numberSize: 12,

    // Grid style
    lineStyle: 'solid',   // solid, dashed, dotted
    showDiagonals: false,
    showCenter: false,

    // Filter
    filter: 'none', // none, grayscale, sepia, scanner, highContrast, invert

    // Export
    exportScale: 2,
    exportFormat: 'png',
    exportQuality: 92,
    exportGridOnly: false,

    // Mode
    advancedMode: false,
  });

  return {
    subscribe,
    set,
    update,

    setImage(src) {
      update(s => ({ ...s, imageSrc: src, croppedSrc: src }));
    },

    setCroppedImage(src) {
      update(s => ({ ...s, croppedSrc: src }));
    },

    clearImage() {
      update(s => ({ ...s, imageSrc: null, croppedSrc: null }));
    },
  };
}

export const gridStore = createGridStore();

// Theme store
function createThemeStore() {
  const saved = typeof localStorage !== 'undefined'
    ? localStorage.getItem('grid-maker-theme') || 'dark'
    : 'dark';

  const { subscribe, set } = writable(saved);

  return {
    subscribe,
    toggle() {
      let current;
      subscribe(v => current = v)();
      const next = current === 'light' ? 'dark' : 'light';
      set(next);
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('grid-maker-theme', next);
    },
    init() {
      let current;
      subscribe(v => current = v)();
      document.documentElement.setAttribute('data-theme', current);
    }
  };
}

export const theme = createThemeStore();
