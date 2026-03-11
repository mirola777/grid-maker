import { writable } from 'svelte/store';

const DEFAULTS = {
  // Image
  imageSrc: null,
  croppedSrc: null,

  // Grid overlay
  rows: 4,
  cols: 4,
  lineColor: '#000000',
  lineOpacity: 0.6,
  lineWidth: 0.8,
  showNumbers: false,
  numberColor: '#000000',
  numberSize: 12,
  numberPosition: 'center', // center, top-left, top-right, bottom-left, bottom-right

  // Grid style
  lineStyle: 'solid',
  showDiagonals: false,
  showCenter: false,

  // Filter
  filter: 'none',

  // Export
  exportScale: 2,
  exportFormat: 'png',
  exportQuality: 92,
  exportGridOnly: false,
  exportBgColor: '#ffffff',

  // Mode
  advancedMode: false,
};

function createGridStore() {
  const { subscribe, set, update } = writable({ ...DEFAULTS });

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

    resetSettings() {
      update(s => ({
        ...DEFAULTS,
        imageSrc: s.imageSrc,
        croppedSrc: s.croppedSrc,
      }));
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
