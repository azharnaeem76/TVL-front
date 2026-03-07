'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'ur';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    'nav.search': 'Scenario Search',
    'nav.caseLaws': 'Case Laws',
    'nav.chat': 'AI Chat',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',

    // Home
    'home.tagline': 'According to Spirit Of Law',
    'home.title1': 'The Value',
    'home.title2': 'of Law',
    'home.subtitle': "Pakistan's most comprehensive legal research platform. Search in",
    'home.searchNow': 'Search Now',
    'home.explore': 'Explore',
    'home.features': 'Features',
    'home.powerfulTools': 'Powerful Legal Tools',
    'home.powerfulToolsDesc': 'Everything a legal professional needs for fast, accurate research across Pakistani law.',
    'home.howItWorks': 'How It Works',
    'home.threeSteps': 'Three Simple Steps',
    'home.threeStepsDesc': 'From describing your scenario to getting results — fast and straightforward.',
    'home.jurisdiction': 'Jurisdiction',
    'home.allCourts': 'All Courts. One Platform.',
    'home.allCourtsDesc': 'Judgments from every superior court in Pakistan at your fingertips.',
    'home.startResearch': 'Start Your Legal Research',
    'home.startResearchDesc': 'Join thousands of legal professionals using TVL for faster, smarter legal research. Completely free. Completely private.',
    'home.searchCaseLaws': 'Search Case Laws',
    'home.getStarted': 'Get Started',

    // Search
    'search.title': 'Legal Scenario Search',
    'search.placeholder': 'Describe your legal scenario here...',
    'search.subtitle': 'Enter your legal query in English, Urdu, or Roman Urdu',
    'search.showFilters': 'Show Filters',
    'search.hideFilters': 'Hide Filters',
    'search.search': 'Search',
    'search.searching': 'Searching...',
    'search.category': 'Law Category',
    'search.court': 'Court',
    'search.yearRange': 'Year Range',
    'search.judgeName': 'Judge Name',
    'search.judgments': 'Judgments Found',
    'search.aiAnalysis': 'AI Analysis',
    'search.citedPrecedents': 'Cited Precedents',
    'search.emptyTitle': 'Describe Your Legal Scenario',
    'search.emptyDesc': 'Search in English, Urdu, or Roman Urdu above',
    'search.relevant': 'relevant',

    // Case Laws
    'caseLaws.title': 'Case Laws Library',
    'caseLaws.subtitle': 'Browse Pakistani case laws from all superior courts',
    'caseLaws.searchPlaceholder': 'Search by title or citation...',
    'caseLaws.noResults': 'No case laws found.',

    // Chat
    'chat.title': 'AI Legal Assistant',
    'chat.signInRequired': 'Please sign in to access the AI Chat.',
    'chat.newSession': '+ New Session',
    'chat.history': 'Chat History',
    'chat.noHistory': 'No chat history yet',
    'chat.askQuestion': 'Ask a legal question... (English, Urdu, Roman Urdu)',
    'chat.thinking': 'Thinking...',
    'chat.aiResponse': 'AI Response',
    'chat.citedPrecedents': 'Cited Precedents',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.bookmarks': 'Bookmarked Cases',
    'dashboard.noBookmarks': 'No bookmarked cases yet',
    'dashboard.profile': 'Your Profile',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your preferences and account',
    'settings.searchPrefs': 'Search Preferences',
    'settings.preferredLang': 'Preferred Language',
    'settings.resultsPerPage': 'Results Per Page',
    'settings.save': 'Save Preferences',
    'settings.saved': 'Saved!',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.dataManagement': 'Data Management',
    'settings.account': 'Account',
    'settings.shortcuts': 'Keyboard Shortcuts',

    // Common
    'common.readingMode': 'Reading Mode',
    'common.export': 'Export',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.compare': 'Compare',
    'common.clear': 'Clear',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.summary': 'Summary',
    'common.headnotes': 'Headnotes',
    'common.sectionsApplied': 'Sections Applied',
    'common.relevantStatutes': 'Relevant Statutes',
    'common.presidingJudge': 'Presiding Judge',

    // Features
    'feature.multilingual': 'Multilingual Intelligence',
    'feature.multilingualDesc': 'Type in English, Urdu script, or Roman Urdu — our AI detects and understands Pakistani legal terminology seamlessly.',
    'feature.citations': 'Case Law Citations',
    'feature.citationsDesc': 'Access judgments from the Supreme Court, all five High Courts, and Federal Shariat Court. Full PLD, SCMR, and CLC citations with summaries and headnotes.',
    'feature.aiAnalysis': 'AI Legal Analysis',
    'feature.aiAnalysisDesc': 'Powered by local AI — your data never leaves the server. Get legal analysis with statute references, procedural guidance, and precedent citations.',
    'feature.voice': 'Voice Command',
    'feature.voiceDesc': 'Speak your legal query directly — the system transcribes and processes your words, then responds with relevant citations and analysis.',

    // How it works
    'how.step1': 'Describe Your Scenario',
    'how.step1Desc': 'Type or speak your legal question in any language — English, Urdu, or Roman Urdu',
    'how.step2': 'AI Analyzes',
    'how.step2Desc': 'AI detects language, normalizes legal terms, and performs semantic search across all precedents',
    'how.step3': 'Results Delivered',
    'how.step3Desc': 'Receive relevant case laws, statute references, and comprehensive legal analysis',
  },
  ur: {
    // Navbar
    'nav.search': 'صورتحال کی تلاش',
    'nav.caseLaws': 'کیس لاز',
    'nav.chat': 'AI چیٹ',
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.settings': 'ترتیبات',
    'nav.signIn': 'سائن ان',
    'nav.signOut': 'سائن آؤٹ',

    // Home
    'home.tagline': 'روح قانون کے مطابق',
    'home.title1': 'قانون',
    'home.title2': 'کی قدر',
    'home.subtitle': 'پاکستان کا سب سے جامع قانونی تحقیق کا پلیٹ فارم۔ تلاش کریں',
    'home.searchNow': 'ابھی تلاش کریں',
    'home.explore': 'دریافت کریں',
    'home.features': 'خصوصیات',
    'home.powerfulTools': 'طاقتور قانونی ٹولز',
    'home.powerfulToolsDesc': 'پاکستانی قانون میں تیز اور درست تحقیق کے لیے ایک قانونی پیشہ ور کو جو کچھ بھی درکار ہے۔',
    'home.howItWorks': 'یہ کیسے کام کرتا ہے',
    'home.threeSteps': 'تین آسان اقدامات',
    'home.threeStepsDesc': 'اپنی صورتحال بیان کرنے سے نتائج حاصل کرنے تک — تیز اور سیدھا۔',
    'home.jurisdiction': 'دائرہ اختیار',
    'home.allCourts': 'تمام عدالتیں۔ ایک پلیٹ فارم۔',
    'home.allCourtsDesc': 'پاکستان کی ہر اعلیٰ عدالت کے فیصلے آپ کی انگلیوں پر۔',
    'home.startResearch': 'اپنی قانونی تحقیق شروع کریں',
    'home.startResearchDesc': 'تیز تر، ذہین قانونی تحقیق کے لیے TVL استعمال کرنے والے ہزاروں قانونی پیشہ وروں میں شامل ہوں۔ مکمل طور پر مفت۔ مکمل طور پر نجی۔',
    'home.searchCaseLaws': 'کیس لاز تلاش کریں',
    'home.getStarted': 'شروع کریں',

    // Search
    'search.title': 'قانونی صورتحال کی تلاش',
    'search.placeholder': 'اپنی قانونی صورتحال یہاں بیان کریں...',
    'search.subtitle': 'اپنا قانونی سوال انگریزی، اردو، یا رومن اردو میں درج کریں',
    'search.showFilters': 'فلٹرز دکھائیں',
    'search.hideFilters': 'فلٹرز چھپائیں',
    'search.search': 'تلاش',
    'search.searching': 'تلاش کر رہے ہیں...',
    'search.category': 'قانون کا زمرہ',
    'search.court': 'عدالت',
    'search.yearRange': 'سال کی حد',
    'search.judgeName': 'جج کا نام',
    'search.judgments': 'فیصلے ملے',
    'search.aiAnalysis': 'AI تجزیہ',
    'search.citedPrecedents': 'حوالہ شدہ نظائر',
    'search.emptyTitle': 'اپنی قانونی صورتحال بیان کریں',
    'search.emptyDesc': 'اوپر انگریزی، اردو، یا رومن اردو میں تلاش کریں',
    'search.relevant': 'متعلقہ',

    // Case Laws
    'caseLaws.title': 'کیس لاز لائبریری',
    'caseLaws.subtitle': 'تمام اعلیٰ عدالتوں سے پاکستانی کیس لاز براؤز کریں',
    'caseLaws.searchPlaceholder': 'عنوان یا حوالے سے تلاش کریں...',
    'caseLaws.noResults': 'کوئی کیس لاز نہیں ملے۔',

    // Chat
    'chat.title': 'AI قانونی معاون',
    'chat.signInRequired': 'AI چیٹ تک رسائی کے لیے سائن ان کریں۔',
    'chat.newSession': '+ نیا سیشن',
    'chat.history': 'چیٹ کی تاریخ',
    'chat.noHistory': 'ابھی تک کوئی چیٹ تاریخ نہیں',
    'chat.askQuestion': 'قانونی سوال پوچھیں... (انگریزی، اردو، رومن اردو)',
    'chat.thinking': 'سوچ رہے ہیں...',
    'chat.aiResponse': 'AI جواب',
    'chat.citedPrecedents': 'حوالہ شدہ نظائر',

    // Dashboard
    'dashboard.welcome': 'خوش آمدید',
    'dashboard.quickActions': 'فوری کارروائیاں',
    'dashboard.bookmarks': 'بُک مارک شدہ کیسز',
    'dashboard.noBookmarks': 'ابھی تک کوئی بُک مارک شدہ کیس نہیں',
    'dashboard.profile': 'آپ کا پروفائل',

    // Settings
    'settings.title': 'ترتیبات',
    'settings.subtitle': 'اپنی ترجیحات اور اکاؤنٹ کا نظم کریں',
    'settings.searchPrefs': 'تلاش کی ترجیحات',
    'settings.preferredLang': 'ترجیحی زبان',
    'settings.resultsPerPage': 'فی صفحہ نتائج',
    'settings.save': 'ترجیحات محفوظ کریں',
    'settings.saved': 'محفوظ ہو گیا!',
    'settings.appearance': 'ظاہری شکل',
    'settings.theme': 'تھیم',
    'settings.dataManagement': 'ڈیٹا مینجمنٹ',
    'settings.account': 'اکاؤنٹ',
    'settings.shortcuts': 'کی بورڈ شارٹ کٹس',

    // Common
    'common.readingMode': 'پڑھنے کا موڈ',
    'common.export': 'برآمد',
    'common.share': 'شیئر',
    'common.copy': 'کاپی',
    'common.copied': 'کاپی ہو گیا!',
    'common.compare': 'موازنہ',
    'common.clear': 'صاف کریں',
    'common.close': 'بند کریں',
    'common.back': 'واپس',
    'common.summary': 'خلاصہ',
    'common.headnotes': 'ہیڈ نوٹس',
    'common.sectionsApplied': 'لاگو شدہ دفعات',
    'common.relevantStatutes': 'متعلقہ قوانین',
    'common.presidingJudge': 'صدر جج',

    // Features
    'feature.multilingual': 'کثیر لسانی ذہانت',
    'feature.multilingualDesc': 'انگریزی، اردو رسم الخط، یا رومن اردو میں ٹائپ کریں — ہماری AI پاکستانی قانونی اصطلاحات کو بغیر کسی رکاوٹ کے سمجھتی ہے۔',
    'feature.citations': 'کیس لاء حوالہ جات',
    'feature.citationsDesc': 'سپریم کورٹ، تمام پانچ ہائی کورٹس، اور فیڈرل شریعت کورٹ کے فیصلوں تک رسائی۔ مکمل PLD، SCMR، اور CLC حوالہ جات۔',
    'feature.aiAnalysis': 'AI قانونی تجزیہ',
    'feature.aiAnalysisDesc': 'مقامی AI سے چلتا ہے — آپ کا ڈیٹا کبھی سرور سے باہر نہیں جاتا۔ قانونی حوالے، طریقہ کار کی رہنمائی حاصل کریں۔',
    'feature.voice': 'آواز کا حکم',
    'feature.voiceDesc': 'اپنا قانونی سوال براہ راست بولیں — نظام آپ کے الفاظ لکھتا ہے اور متعلقہ حوالہ جات کے ساتھ جواب دیتا ہے۔',

    // How it works
    'how.step1': 'اپنی صورتحال بیان کریں',
    'how.step1Desc': 'اپنا قانونی سوال کسی بھی زبان میں ٹائپ کریں یا بولیں — انگریزی، اردو، یا رومن اردو',
    'how.step2': 'AI تجزیہ کرتا ہے',
    'how.step2Desc': 'AI زبان کا پتہ لگاتا ہے، قانونی اصطلاحات کو معمول بناتا ہے، اور تمام نظائر میں معنوی تلاش کرتا ہے',
    'how.step3': 'نتائج فراہم',
    'how.step3Desc': 'متعلقہ کیس لاز، قانونی حوالے، اور جامع قانونی تجزیہ حاصل کریں',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  dir: 'ltr',
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('tvl_locale') as Locale | null;
    if (saved && (saved === 'en' || saved === 'ur')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('tvl_locale', newLocale);
    document.documentElement.dir = newLocale === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale === 'ur' ? 'ur' : 'en';
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale === 'ur' ? 'ur' : 'en';
  }, [locale]);

  const t = useCallback((key: string) => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  const dir = locale === 'ur' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ur' : 'en')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        locale === 'ur'
          ? 'bg-brass-400/10 border-brass-400/20 text-brass-300'
          : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-brass-300'
      } ${className}`}
      title={locale === 'en' ? 'Switch to Urdu' : 'Switch to English'}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {locale === 'en' ? 'اردو' : 'EN'}
    </button>
  );
}
