// Watfa Habit Tracker - application bootstrap helpers
const App = {
    navigate(page) {
        window.location.href = page;
    },

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('statistics')) return 'statistics';
        if (path.includes('calendar')) return 'calendar';
        if (path.includes('settings')) return 'settings';
        return 'landing';
    }
};

window.App = App;
