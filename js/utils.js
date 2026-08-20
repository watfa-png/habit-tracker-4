// Watfa Habit Tracker - shared safety/date helpers
const AppUtils = Object.freeze({
    escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    },

    localDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    localDateFromKey(dateKey) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
        if (!match) return new Date(NaN);
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
    },

    addLocalDays(dateKey, amount) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0, 0);
        date.setDate(date.getDate() + amount);
        return this.localDateKey(date);
    },

    createId(prefix = 'item') {
        if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
        const bytes = new Uint8Array(16);
        globalThis.crypto?.getRandomValues?.(bytes);
        if (bytes.some(Boolean)) {
            return `${prefix}_${Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')}`;
        }
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    },

    safeColor(value, fallback = '#6C63FF') {
        return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
    },

    safeIcon(value, fallback = 'fa-check') {
        return /^fa-[a-z0-9-]+$/i.test(String(value || '')) ? value : fallback;
    },

    clampNumber(value, min, max, fallback = min) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
    },

    csvCell(value) {
        let text = String(value ?? '');
        // Prevent spreadsheet formula injection when CSV is opened in Excel/Sheets.
        if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
        return `"${text.replaceAll('"', '""')}"`;
    }
});

window.AppUtils = AppUtils;
