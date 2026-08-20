// Watfa Habit Tracker - safe page initialization
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    try {
        Storage.initializeLocalProfile();
        Translations.init();
        UI.init();

        if (typeof Habits !== 'undefined') Habits.init();
        if (typeof Statistics !== 'undefined') Statistics.init();
        if (typeof Charts !== 'undefined') Charts.init();
    } catch (error) {
        console.error('Watfa Habit Tracker initialization failed:', error);
        const root = document.querySelector('main, .main-content, .landing-content');
        if (root) {
            const warning = document.createElement('div');
            warning.className = 'app-error-banner';
            warning.setAttribute('role', 'alert');
            warning.textContent = typeof Translations !== 'undefined' ? Translations.get('app_load_error') : 'Watfa Habit Tracker could not start.';
            root.prepend(warning);
        }
    }
});
