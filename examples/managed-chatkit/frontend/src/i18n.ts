import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import zhHans from './locales/zh-Hans.json';
import { SupportedLocale } from '@xpert-ai/chatkit-types';

const defaultLocale = 'en-US' as SupportedLocale;
const localeStorageKey = 'chatkit-lang';

const getInitialLanguage = () => {
  const stored = localStorage.getItem(localeStorageKey);
  if (stored) return stored;

  const browserLang = navigator.language || '';
  if (browserLang.toLowerCase().startsWith('zh')) {
    return 'zh-Hans';
  }

  return 'en-US';
};

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'zh-Hans': { translation: zhHans }
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  }
});

function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale) return defaultLocale;
  const normalized = locale.trim();
  if (!normalized) return defaultLocale;
  if (normalized === 'zh-CN' || normalized.startsWith('zh')) return 'zh-Hans' as SupportedLocale;
  if (normalized === 'en-US' || normalized.startsWith('en')) return 'en-US' as SupportedLocale;
  return defaultLocale;
}

function getStoredLocale(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(localeStorageKey);
  } catch {
    return null;
  }
}

function getBrowserLocale(): string | null {
  if (typeof navigator === 'undefined') return null;
  return navigator.language || null;
}

export function setLanguage(locale?: string | null): SupportedLocale {
  const resolved = normalizeLocale(locale);
  void i18n.changeLanguage(resolved);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(localeStorageKey, resolved);
    } catch {
      // ignore storage errors
    }
  }

  return resolved;
}

export function getLanguage(): SupportedLocale {
  if (i18n.isInitialized) {
    return normalizeLocale(i18n.language);
  }
  return normalizeLocale(getStoredLocale() ?? getBrowserLocale());
}

export default i18n;
