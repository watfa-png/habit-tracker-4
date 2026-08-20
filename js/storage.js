// Watfa Habit Tracker - local-first storage layer
'use strict';

const Storage = {
    KEYS: {
        HABITS: 'watfa_habit_tracker_habits_v2',
        SETTINGS: 'watfa_habit_tracker_settings_v2',
        LANGUAGE: 'watfa_habit_tracker_language_v2',
        THEME: 'watfa_habit_tracker_theme_v2',
        STATISTICS: 'watfa_habit_tracker_statistics_v2',
        EVENTS: 'watfa_habit_tracker_events_v2',
        PROFILE: 'watfa_habit_tracker_profile_v2'
    },

    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Storage read failed:', error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage write failed:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove failed:', error);
            return false;
        }
    },

    clear() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
        return true;
    },

    initializeLocalProfile() {
        const existing = this.get(this.KEYS.PROFILE);
        if (!existing) {
            this.set(this.KEYS.PROFILE, {
                username: 'Watfa User',
                email: '',
                role: 'local',
                createdAt: new Date().toISOString()
            });
        }
        this.migrateLegacyData();
        return true;
    },

    migrateLegacyData() {
        if (localStorage.getItem('watfa_habit_tracker_migrated_v2')) return;
        try {
            const session = JSON.parse(localStorage.getItem('habit_tracker_session') || 'null');
            const username = session?.username;
            const migrations = [
                ['habit_tracker_habits', this.KEYS.HABITS, []],
                ['habit_tracker_settings', this.KEYS.SETTINGS, this.getDefaultSettings()],
                ['habit_tracker_statistics', this.KEYS.STATISTICS, this.getDefaultStatistics()],
                ['habit_tracker_events', this.KEYS.EVENTS, []]
            ];
            for (const [legacyKey, newKey, fallback] of migrations) {
                if (localStorage.getItem(newKey)) continue;
                const legacyRaw = localStorage.getItem(legacyKey);
                if (!legacyRaw) continue;
                const legacy = JSON.parse(legacyRaw);
                const value = username && legacy && !Array.isArray(legacy) && typeof legacy === 'object'
                    ? (legacy[username] ?? fallback)
                    : legacy;
                this.set(newKey, value);
            }
            const oldLanguage = JSON.parse(localStorage.getItem('habit_tracker_language') || 'null');
            const oldTheme = JSON.parse(localStorage.getItem('habit_tracker_theme') || 'null');
            if (oldLanguage && !localStorage.getItem(this.KEYS.LANGUAGE)) this.setLanguage(oldLanguage);
            if (oldTheme && !localStorage.getItem(this.KEYS.THEME)) this.setTheme(oldTheme);
            localStorage.setItem('watfa_habit_tracker_migrated_v2', '1');
        } catch (error) {
            console.warn('Legacy data migration skipped:', error);
        }
    },

    getSession() {
        return this.get(this.KEYS.PROFILE) || {
            username: 'Watfa User', email: '', role: 'local'
        };
    },
    setSession(profile) { return this.set(this.KEYS.PROFILE, profile); },
    clearSession() { return true; },
    getUserByUsername() { return this.getSession(); },
    updateUser(_username, updates) {
        const profile = { ...this.getSession(), ...updates, role: 'local' };
        delete profile.password;
        return this.set(this.KEYS.PROFILE, profile);
    },
    deleteUser() { return this.clear(); },

    getHabits() {
        const habits = this.get(this.KEYS.HABITS);
        return Array.isArray(habits) ? habits : [];
    },
    setHabits(habits) { return this.set(this.KEYS.HABITS, Array.isArray(habits) ? habits : []); },
    addHabit(habit) { const habits = this.getHabits(); habits.push(habit); return this.setHabits(habits); },
    updateHabit(id, updates) {
        const habits = this.getHabits();
        const index = habits.findIndex(h => h.id === id);
        if (index < 0) return false;
        habits[index] = { ...habits[index], ...updates };
        return this.setHabits(habits);
    },
    deleteHabit(id) { return this.setHabits(this.getHabits().filter(h => h.id !== id)); },

    getDefaultSettings() {
        return {
            language: 'ar', theme: 'light'
        };
    },
    getSettings() { return { ...this.getDefaultSettings(), ...(this.get(this.KEYS.SETTINGS) || {}) }; },
    setSettings(settings) { return this.set(this.KEYS.SETTINGS, { ...this.getDefaultSettings(), ...settings }); },

    getLanguage() { return this.get(this.KEYS.LANGUAGE) || this.getSettings().language || 'ar'; },
    setLanguage(language) {
        const value = language === 'en' ? 'en' : 'ar';
        this.set(this.KEYS.LANGUAGE, value);
        const settings = this.getSettings(); settings.language = value; this.setSettings(settings);
        return true;
    },
    getTheme() { return this.get(this.KEYS.THEME) === 'dark' ? 'dark' : 'light'; },
    setTheme(theme) {
        const value = theme === 'dark' ? 'dark' : 'light';
        this.set(this.KEYS.THEME, value);
        const settings = this.getSettings(); settings.theme = value; this.setSettings(settings);
        return true;
    },

    getDefaultStatistics() {
        return { totalCompletions: 0, currentStreak: 0, bestStreak: 0, xp: 0, level: 1, activeDays: [] };
    },
    getStatistics() { return { ...this.getDefaultStatistics(), ...(this.get(this.KEYS.STATISTICS) || {}) }; },
    setStatistics(statistics) { return this.set(this.KEYS.STATISTICS, { ...this.getDefaultStatistics(), ...statistics }); },

    getEvents() {
        const events = this.get(this.KEYS.EVENTS);
        return Array.isArray(events) ? events : [];
    },
    setEvents(events) { return this.set(this.KEYS.EVENTS, Array.isArray(events) ? events : []); },
    addEvent(event) { const events = this.getEvents(); events.push(event); return this.setEvents(events); },
    updateEvent(id, updates) {
        const events = this.getEvents(); const index = events.findIndex(e => e.id === id);
        if (index < 0) return false;
        events[index] = { ...events[index], ...updates };
        return this.setEvents(events);
    },
    deleteEvent(id) { return this.setEvents(this.getEvents().filter(e => e.id !== id)); },
    getEventsByDate(date) { return this.getEvents().filter(e => e.date === date); },

    addHabitLog(habitId, date, completed = true) {
        const habit = this.getHabits().find(h => h.id === habitId);
        if (!habit) return false;
        const dates = Array.isArray(habit.completedDates) ? [...habit.completedDates] : [];
        habit.completedDates = completed
            ? [...new Set([...dates, date])]
            : dates.filter(d => d !== date);
        return this.updateHabit(habitId, habit);
    },
    removeHabitLog(habitId, date) { return this.addHabitLog(habitId, date, false); },
    getHabitLogs(habitId) { return this.getHabits().find(h => h.id === habitId)?.completedDates || []; },

    exportSnapshot() {
        return {
            schemaVersion: 2,
            exportedAt: new Date().toISOString(),
            app: 'Watfa Habit Tracker',
            profile: this.getSession(),
            habits: this.getHabits(),
            events: this.getEvents(),
            statistics: this.getStatistics(),
            settings: this.getSettings(),
            language: this.getLanguage(),
            theme: this.getTheme()
        };
    },

    importSnapshot(snapshot) {
        if (!snapshot || snapshot.schemaVersion !== 2 || !Array.isArray(snapshot.habits) || !Array.isArray(snapshot.events)) {
            throw new Error('Unsupported or invalid backup format');
        }
        if (snapshot.habits.length > 5000 || snapshot.events.length > 10000) {
            throw new Error('Backup exceeds safety limits');
        }

        const habits = snapshot.habits.map((habit) => ({
            id: String(habit.id || AppUtils.createId('habit')).slice(0, 120),
            name: String(habit.name || '').trim().slice(0, 100),
            description: String(habit.description || '').trim().slice(0, 500),
            category: String(habit.category || 'other').slice(0, 50),
            icon: AppUtils.safeIcon(habit.icon),
            color: AppUtils.safeColor(habit.color),
            frequency: ['daily', 'weekly'].includes(habit.frequency) ? habit.frequency : 'daily',
            goal: AppUtils.clampNumber(habit.goal, 1, 3650, 1),
            reminder: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(habit.reminder || '')) ? habit.reminder : null,
            createdAt: Number.isNaN(Date.parse(habit.createdAt)) ? new Date().toISOString() : habit.createdAt,
            streak: AppUtils.clampNumber(habit.streak, 0, 100000, 0),
            bestStreak: AppUtils.clampNumber(habit.bestStreak, 0, 100000, 0),
            completedDates: Array.isArray(habit.completedDates)
                ? [...new Set(habit.completedDates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(String(d))))].slice(0, 10000)
                : [],
            progress: AppUtils.clampNumber(habit.progress, 0, 100, 0)
        })).filter(h => h.name);

        const events = snapshot.events.map((event) => ({
            id: String(event.id || AppUtils.createId('event')).slice(0, 120),
            date: /^\d{4}-\d{2}-\d{2}$/.test(String(event.date || '')) ? event.date : AppUtils.localDateKey(),
            title: String(event.title || '').trim().slice(0, 120),
            description: String(event.description || '').trim().slice(0, 1000),
            time: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(event.time || '')) ? event.time : '',
            type: event.type === 'reminder' ? 'reminder' : 'event'
        })).filter(e => e.title);

        this.setHabits(habits);
        this.setEvents(events);
        this.setStatistics(snapshot.statistics || this.getDefaultStatistics());
        this.setSettings(snapshot.settings || this.getDefaultSettings());
        this.setLanguage(snapshot.language);
        this.setTheme(snapshot.theme);
        if (snapshot.profile && typeof snapshot.profile === 'object') {
            this.setSession({
                username: String(snapshot.profile.username || 'Watfa User').slice(0, 80),
                email: String(snapshot.profile.email || '').slice(0, 160),
                role: 'local',
                createdAt: snapshot.profile.createdAt || new Date().toISOString()
            });
        }
        return true;
    }
};

window.Storage = Storage;
