(function () {
  'use strict';

  const AVAILABLE_LANGUAGES = [
    'ar',
    'az',
    'be',
    'bg',
    'cn',
    'de',
    'du',
    'en',
    'es',
    'fr',
    'hi',
    'id',
    'it',
    'jp',
    'kk',
    'kr',
    'ky',
    'pl',
    'pt',
    'ru',
    'tr',
    'tw',
    'uk',
    'uz',
    'vi',
  ];

  const languageMap = {
    ko: 'kr',
    'ko-kr': 'kr',
    zh: 'cn',
    'zh-cn': 'cn',
    'zh-hans': 'cn',
    'zh-sg': 'cn',
    'zh-tw': 'tw',
    'zh-hk': 'tw',
    'zh-hant': 'tw',
    ja: 'jp',
    'ja-jp': 'jp',
    nl: 'du',
    'nl-nl': 'du',
  };

  const translationCache = new Map();
  const languageChangeListeners = new Set();

  let currentLanguage = 'en';
  let translations = {};
  let fallbackTranslationsEn = {};

  function normalizeLanguageCode(input) {
    const value = String(input || '').toLowerCase();
    if (!value) return 'en';
    if (languageMap[value]) return languageMap[value];
    if (AVAILABLE_LANGUAGES.includes(value)) return value;

    const short = value.slice(0, 2);
    if (languageMap[short]) return languageMap[short];
    if (AVAILABLE_LANGUAGES.includes(short)) return short;

    return 'en';
  }

  function getEmbeddedTranslations() {
    if (typeof window === 'undefined') return {};
    return window.YouTubePlusEmbeddedTranslations || {};
  }

  function detectLanguage() {
    const htmlLang =
      (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) ||
      '';
    if (htmlLang) return normalizeLanguageCode(htmlLang);

    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const hl = params.get('hl');
        if (hl) return normalizeLanguageCode(hl);
      } catch {
        // ignore
      }
    }

    const browserLang =
      (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en';

    return normalizeLanguageCode(browserLang);
  }

  function loadLanguageSync(lang) {
    const embedded = getEmbeddedTranslations();
    const safeLang = normalizeLanguageCode(lang);

    fallbackTranslationsEn = embedded.en || {};
    translations = embedded[safeLang] || fallbackTranslationsEn;
    currentLanguage = safeLang;
    translationCache.clear();

    return true;
  }

  function translate(key, params = {}) {
    const cacheKey = `${key}:${JSON.stringify(params)}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    let text = translations[key];
    if (!text) {
      text = fallbackTranslationsEn[key] || key;
    }

    if (params && typeof params === 'object') {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      }
    }

    translationCache.set(cacheKey, text);
    return text;
  }

  async function setLanguage(lang) {
    const oldLang = currentLanguage;
    const success = loadLanguageSync(lang);

    if (success && oldLang !== currentLanguage) {
      for (const listener of languageChangeListeners) {
        try {
          listener(currentLanguage, oldLang);
        } catch {
          // ignore listener failures
        }
      }

      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(
            new CustomEvent('youtube-plus-language-changed', {
              detail: {
                language: currentLanguage,
                previousLanguage: oldLang,
              },
            })
          );
        } catch {
          // ignore
        }
      }
    }

    return success;
  }

  async function loadTranslations() {
    return loadLanguageSync(currentLanguage);
  }

  function getAllTranslations() {
    return { ...translations };
  }

  function getAvailableLanguages() {
    return [...AVAILABLE_LANGUAGES];
  }

  function hasTranslation(key) {
    return Object.prototype.hasOwnProperty.call(translations, key);
  }

  function addTranslation(key, value) {
    translations[key] = value;
    translationCache.clear();
  }

  function addTranslations(newTranslations) {
    Object.assign(translations, newTranslations || {});
    translationCache.clear();
  }

  function onLanguageChange(callback) {
    languageChangeListeners.add(callback);
    return () => languageChangeListeners.delete(callback);
  }

  function formatNumber(num, options = {}) {
    const locale = currentLanguage === 'du' ? 'nl-NL' : currentLanguage;
    return new Intl.NumberFormat(locale, options).format(num);
  }

  function formatDate(date, options = {}) {
    const locale = currentLanguage === 'du' ? 'nl-NL' : currentLanguage;
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
  }

  function pluralize(count, singular, plural, few = null) {
    if (currentLanguage === 'ru' && few) {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return singular;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
      return plural;
    }
    return count === 1 ? singular : plural;
  }

  function clearCache() {
    translationCache.clear();
  }

  function getCacheStats() {
    return {
      size: translationCache.size,
      currentLanguage,
      availableLanguages: getAvailableLanguages(),
      translationsLoaded: Object.keys(translations).length,
    };
  }

  async function initialize() {
    currentLanguage = detectLanguage();
    await loadTranslations();

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('youtube-plus-i18n-ready', {
            detail: { language: currentLanguage },
          })
        );
      } catch {
        // ignore
      }
    }
  }

  const i18nAPI = {
    t: translate,
    translate,
    getLanguage: () => currentLanguage,
    setLanguage,
    detectLanguage,
    getAllTranslations,
    getAvailableLanguages,
    hasTranslation,
    addTranslation,
    addTranslations,
    onLanguageChange,
    formatNumber,
    formatDate,
    pluralize,
    clearCache,
    getCacheStats,
    loadTranslations,
    initialize,
  };

  if (typeof window !== 'undefined') {
    window.YouTubePlusI18n = i18nAPI;
    window.YouTubePlusI18nLoader = {
      loadTranslations: async lang => {
        const embedded = getEmbeddedTranslations();
        return embedded[normalizeLanguageCode(lang)] || embedded.en || {};
      },
      AVAILABLE_LANGUAGES,
    };

    if (window.YouTubeUtils) {
      window.YouTubeUtils.i18n = i18nAPI;
      window.YouTubeUtils.t = translate;
      window.YouTubeUtils.getLanguage = () => currentLanguage;
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18nAPI;
  }

  initialize();
})();
