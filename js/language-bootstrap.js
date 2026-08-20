// Apply the persisted locale before the page paints to avoid showing the Arabic fallback first.
'use strict';

(() => {
    const supportedLanguages = ['ar', 'tr', 'en'];
    const languageKey = 'watfa_habit_tracker_language_v2';
    const settingsKey = 'watfa_habit_tracker_settings_v2';

    let language = 'ar';
    try {
        const savedLanguage = JSON.parse(localStorage.getItem(languageKey) || 'null');
        const savedSettings = JSON.parse(localStorage.getItem(settingsKey) || 'null');
        const candidate = savedLanguage || savedSettings?.language;
        if (supportedLanguages.includes(candidate)) language = candidate;
    } catch (error) {
        console.warn('Saved language could not be restored:', error);
    }

    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.add('i18n-pending');

    // Never leave the document hidden if a later script fails to initialize.
    window.setTimeout(() => document.documentElement.classList.remove('i18n-pending'), 2000);
})();
