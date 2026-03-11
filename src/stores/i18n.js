import { writable, derived } from 'svelte/store';

const translations = {
  en: {
    // Header
    appName: "Mirola's Grid Maker",
    paste: "paste",
    grid: "grid",

    // Sidebar - Grid
    sectionGrid: "Grid",
    rows: "Rows",
    cols: "Cols",

    // Sidebar - Line Style
    sectionLineStyle: "Line Style",
    quickColors: "Quick Colors",
    custom: "Custom",
    thickness: "Thickness",
    opacity: "Opacity",
    style: "Style",
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",

    // Sidebar - Extras
    sectionExtras: "Extras",
    showCellNumbers: "Show cell numbers",
    centerCrosshair: "Center crosshair",
    diagonals: "Diagonals",
    numberColor: "Number color",
    numberSize: "Number size",

    // Sidebar - Filters
    sectionFilters: "Filters",
    filterNone: "Original",
    filterGrayscale: "Grayscale",
    filterSepia: "Sepia",
    filterScanner: "Scanner",
    filterHighContrast: "High Contrast",
    filterInvert: "Invert",
    filterBrightness: "Bright",
    filterWarm: "Warm",
    filterCool: "Cool",

    // Sidebar - Download
    sectionDownload: "Download",
    scale: "Scale",
    gridOnly: "Grid only (transparent bg)",
    downloadPng: "Download PNG",
    downloadJpeg: "Download JPEG",

    // Sidebar - Footer
    reCrop: "Re-crop image",
    removeImage: "Remove image",

    // Mode
    simpleMode: "Simple",
    advancedMode: "Advanced",

    // Canvas
    dropTitle: "Drop your image here",
    dropSub: "Click to browse, paste with",
    dropSub2: ", or drag from browser",
    orLoadUrl: "or paste an image URL",
    urlPlaceholder: "https://example.com/image.jpg",
    loadUrl: "Load",

    // Crop Modal
    cropTitle: "Crop & Adjust",
    cropSubtitle: "Move freely beyond image edges",
    aspectRatio: "Aspect Ratio",
    free: "Free",
    rotate: "Rotate",
    flip: "Flip",
    zoom: "Zoom",
    reset: "Reset",
    apply: "apply",
    cancel: "cancel",
    applyCrop: "Apply Crop",
    cancelBtn: "Cancel",

    // Language
    language: "Language",

    // Footer
    madeWith: "Made with",
    by: "by",
    footerDesc: "Free drawing grid overlay tool",
  },
  es: {
    appName: "Mirola's Grid Maker",
    paste: "pegar",
    grid: "cuadrícula",

    sectionGrid: "Cuadrícula",
    rows: "Filas",
    cols: "Columnas",

    sectionLineStyle: "Estilo de Línea",
    quickColors: "Colores Rápidos",
    custom: "Personalizado",
    thickness: "Grosor",
    opacity: "Opacidad",
    style: "Estilo",
    solid: "sólido",
    dashed: "guiones",
    dotted: "puntos",

    sectionExtras: "Extras",
    showCellNumbers: "Mostrar números de celda",
    centerCrosshair: "Cruz central",
    diagonals: "Diagonales",
    numberColor: "Color de números",
    numberSize: "Tamaño de números",

    sectionFilters: "Filtros",
    filterNone: "Original",
    filterGrayscale: "Escala de grises",
    filterSepia: "Sepia",
    filterScanner: "Escáner",
    filterHighContrast: "Alto contraste",
    filterInvert: "Invertir",
    filterBrightness: "Brillo",
    filterWarm: "Cálido",
    filterCool: "Frío",

    sectionDownload: "Descargar",
    scale: "Escala",
    gridOnly: "Solo cuadrícula (fondo transparente)",
    downloadPng: "Descargar PNG",
    downloadJpeg: "Descargar JPEG",

    reCrop: "Recortar imagen",
    removeImage: "Eliminar imagen",

    simpleMode: "Simple",
    advancedMode: "Avanzado",

    dropTitle: "Arrastra tu imagen aquí",
    dropSub: "Clic para buscar, pegar con",
    dropSub2: ", o arrastra desde el navegador",
    orLoadUrl: "o pega una URL de imagen",
    urlPlaceholder: "https://ejemplo.com/imagen.jpg",
    loadUrl: "Cargar",

    cropTitle: "Recortar y Ajustar",
    cropSubtitle: "Puedes moverte más allá de los bordes",
    aspectRatio: "Proporción",
    free: "Libre",
    rotate: "Rotar",
    flip: "Voltear",
    zoom: "Zoom",
    reset: "Reiniciar",
    apply: "aplicar",
    cancel: "cancelar",
    applyCrop: "Aplicar Recorte",
    cancelBtn: "Cancelar",

    language: "Idioma",

    madeWith: "Hecho con",
    by: "por",
    footerDesc: "Herramienta gratuita de cuadrícula para dibujo",
  },
  pt: {
    appName: "Mirola's Grid Maker",
    paste: "colar",
    grid: "grade",

    sectionGrid: "Grade",
    rows: "Linhas",
    cols: "Colunas",

    sectionLineStyle: "Estilo da Linha",
    quickColors: "Cores Rápidas",
    custom: "Personalizado",
    thickness: "Espessura",
    opacity: "Opacidade",
    style: "Estilo",
    solid: "sólido",
    dashed: "tracejado",
    dotted: "pontilhado",

    sectionExtras: "Extras",
    showCellNumbers: "Mostrar números das células",
    centerCrosshair: "Cruz central",
    diagonals: "Diagonais",
    numberColor: "Cor dos números",
    numberSize: "Tamanho dos números",

    sectionFilters: "Filtros",
    filterNone: "Original",
    filterGrayscale: "Escala de cinza",
    filterSepia: "Sépia",
    filterScanner: "Scanner",
    filterHighContrast: "Alto contraste",
    filterInvert: "Inverter",
    filterBrightness: "Brilho",
    filterWarm: "Quente",
    filterCool: "Frio",

    sectionDownload: "Baixar",
    scale: "Escala",
    gridOnly: "Apenas grade (fundo transparente)",
    downloadPng: "Baixar PNG",
    downloadJpeg: "Baixar JPEG",

    reCrop: "Recortar imagem",
    removeImage: "Remover imagem",

    simpleMode: "Simples",
    advancedMode: "Avançado",

    dropTitle: "Solte sua imagem aqui",
    dropSub: "Clique para buscar, cole com",
    dropSub2: ", ou arraste do navegador",
    orLoadUrl: "ou cole uma URL de imagem",
    urlPlaceholder: "https://exemplo.com/imagem.jpg",
    loadUrl: "Carregar",

    cropTitle: "Recortar e Ajustar",
    cropSubtitle: "Mova livremente além das bordas",
    aspectRatio: "Proporção",
    free: "Livre",
    rotate: "Girar",
    flip: "Espelhar",
    zoom: "Zoom",
    reset: "Reiniciar",
    apply: "aplicar",
    cancel: "cancelar",
    applyCrop: "Aplicar Corte",
    cancelBtn: "Cancelar",

    language: "Idioma",

    madeWith: "Feito com",
    by: "por",
    footerDesc: "Ferramenta gratuita de grade para desenho",
  },
  fr: {
    appName: "Mirola's Grid Maker",
    paste: "coller",
    grid: "grille",

    sectionGrid: "Grille",
    rows: "Lignes",
    cols: "Colonnes",

    sectionLineStyle: "Style de Ligne",
    quickColors: "Couleurs Rapides",
    custom: "Personnalisé",
    thickness: "Épaisseur",
    opacity: "Opacité",
    style: "Style",
    solid: "plein",
    dashed: "tirets",
    dotted: "pointillé",

    sectionExtras: "Extras",
    showCellNumbers: "Afficher les numéros de cellule",
    centerCrosshair: "Croix centrale",
    diagonals: "Diagonales",
    numberColor: "Couleur des numéros",
    numberSize: "Taille des numéros",

    sectionFilters: "Filtres",
    filterNone: "Original",
    filterGrayscale: "Niveaux de gris",
    filterSepia: "Sépia",
    filterScanner: "Scanner",
    filterHighContrast: "Contraste élevé",
    filterInvert: "Inverser",
    filterBrightness: "Lumineux",
    filterWarm: "Chaud",
    filterCool: "Froid",

    sectionDownload: "Télécharger",
    scale: "Échelle",
    gridOnly: "Grille seule (fond transparent)",
    downloadPng: "Télécharger PNG",
    downloadJpeg: "Télécharger JPEG",

    reCrop: "Recadrer l'image",
    removeImage: "Supprimer l'image",

    simpleMode: "Simple",
    advancedMode: "Avancé",

    dropTitle: "Déposez votre image ici",
    dropSub: "Cliquez pour parcourir, collez avec",
    dropSub2: ", ou glissez depuis le navigateur",
    orLoadUrl: "ou collez une URL d'image",
    urlPlaceholder: "https://exemple.com/image.jpg",
    loadUrl: "Charger",

    cropTitle: "Recadrer et Ajuster",
    cropSubtitle: "Déplacez librement au-delà des bords",
    aspectRatio: "Ratio",
    free: "Libre",
    rotate: "Pivoter",
    flip: "Retourner",
    zoom: "Zoom",
    reset: "Réinitialiser",
    apply: "appliquer",
    cancel: "annuler",
    applyCrop: "Appliquer",
    cancelBtn: "Annuler",

    language: "Langue",

    madeWith: "Fait avec",
    by: "par",
    footerDesc: "Outil gratuit de grille pour le dessin",
  },
};

function detectLanguage() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('grid-maker-lang');
    if (saved && translations[saved]) return saved;
  }

  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const code = browserLang.slice(0, 2).toLowerCase();
    if (translations[code]) return code;
  }

  return 'en';
}

function createI18nStore() {
  const initial = detectLanguage();
  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    setLang(lang) {
      if (translations[lang]) {
        set(lang);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('grid-maker-lang', lang);
        }
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
      }
    },
    init() {
      let current;
      subscribe(v => current = v)();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = current;
      }
    }
  };
}

export const locale = createI18nStore();

export const t = derived(locale, ($locale) => {
  const strings = translations[$locale] || translations.en;
  return (key) => strings[key] || translations.en[key] || key;
});

export const availableLocales = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];
