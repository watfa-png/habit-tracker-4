// ============================================

// Habit Tracker - Habits Module

// ============================================



/**

 * Habits Module - Handles all habit-related operations

 * CRUD, streak calculation, completion tracking

 */



const Habits = {

    /**

     * Generate unique ID

     * @returns {string} Unique ID

     */

    generateId() {

        return AppUtils.createId('habit');

    },



    /**

     * Get all habits

     * @returns {Array} Array of habits

     */

    getAll() {

        return Storage.getHabits();

    },



    /**

     * Get habit by ID

     * @param {string} id - Habit ID

     * @returns {Object|null} Habit object or null

     */

    getById(id) {

        const habits = this.getAll();

        return habits.find(h => h.id === id) || null;

    },



    /**

     * Create new habit

     * @param {Object} habitData - Habit data

     * @returns {Object} Created habit

     */

    create(habitData) {

        const habit = {

            id: this.generateId(),

            name: String(habitData.name || '').trim().slice(0, 100),

            description: String(habitData.description || '').trim().slice(0, 500),

            category: habitData.category || 'other',

            icon: habitData.icon || 'fa-check',

            color: habitData.color || '#6C63FF',

            frequency: habitData.frequency || 'daily',

            goal: AppUtils.clampNumber(habitData.goal, 1, 3650, 1),

            reminder: habitData.reminder || null,

            createdAt: new Date().toISOString(),

            streak: 0,

            bestStreak: 0,

            completedDates: [],

            progress: 0

        };

        

        Storage.addHabit(habit);

        

        // Update stats

        if (typeof UI !== 'undefined') {

            UI.updateStats();

        }

        

        // Update all dashboard charts

        if (typeof Charts !== 'undefined') {

            Charts.updateAllDashboardCharts();

        }

        

        // Re-render habits

        this.render(this.getTodayHabits());

        

        return habit;

    },



    /**

     * Update habit

     * @param {string} id - Habit ID

     * @param {Object} updates - Habit updates

     * @returns {boolean} Success status

     */

    update(id, updates) {

        const result = Storage.updateHabit(id, updates);

        

        // Update stats

        if (typeof UI !== 'undefined') {

            UI.updateStats();

        }

        

        // Update all dashboard charts

        if (typeof Charts !== 'undefined') {

            Charts.updateAllDashboardCharts();

        }

        

        // Re-render habits

        this.render(this.getTodayHabits());

        

        return result;

    },



    /**

     * Delete habit

     * @param {string} id - Habit ID

     * @returns {boolean} Success status

     */

    delete(id) {

        const result = Storage.deleteHabit(id);

        

        // Update stats

        if (typeof UI !== 'undefined') {

            UI.updateStats();

        }

        

        // Update weekly progress chart

        if (typeof Charts !== 'undefined') {

            Charts.updateWeeklyProgress();

        }

        

        // Re-render habits

        this.render(this.getTodayHabits());

        

        return result;

    },



    /**

     * Complete habit for today

     * @param {string} id - Habit ID

     * @returns {Object} Updated habit

     */

    complete(id) {

        const habit = this.getById(id);

        if (!habit) return null;

        

        const today = AppUtils.localDateKey();

        

        // Check if already completed today

        if (habit.completedDates.includes(today)) {

            // Uncomplete

            habit.completedDates = habit.completedDates.filter(date => date !== today);

            habit.streak = this.calculateStreak(habit.completedDates);

        } else {

            // Complete

            habit.completedDates.push(today);

            habit.streak = this.calculateStreak(habit.completedDates);

            

            // Update best streak

            if (habit.streak > habit.bestStreak) {

                habit.bestStreak = habit.streak;

            }

            

            // Add XP

            this.addXP(10);

        }

        

        // Calculate progress

        habit.progress = Math.min(100, (habit.completedDates.length / Math.max(1, Number(habit.goal) || 1)) * 100);

        

        Storage.updateHabit(id, habit);

        

        // Update stats

        if (typeof UI !== 'undefined') {

            UI.updateStats();

        }

        

        // Update all dashboard charts

        if (typeof Charts !== 'undefined') {

            Charts.updateAllDashboardCharts();

        }

        

        // Re-render habits

        this.render(this.getTodayHabits());

        

        return habit;

    },



    /**

     * Calculate streak from completed dates

     * @param {Array} completedDates - Array of completed dates

     * @returns {number} Streak count

     */

    calculateStreak(completedDates) {

        if (completedDates.length === 0) return 0;

        

        const sortedDates = [...completedDates].sort().reverse();

        const today = AppUtils.localDateKey();

        const yesterday = AppUtils.addLocalDays(today, -1);

        

        // Check if today or yesterday is in the list

        if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {

            return 0;

        }

        

        let streak = 1;

        let currentDate = sortedDates.includes(today) ? today : yesterday;

        

        for (let i = 1; i < sortedDates.length; i++) {

            const prevDateStr = AppUtils.addLocalDays(currentDate, -1);

            

            if (sortedDates.includes(prevDateStr)) {

                streak++;

                currentDate = prevDateStr;

            } else {

                break;

            }

        }

        

        return streak;

    },



    /**

     * Check if habit is completed today

     * @param {string} id - Habit ID

     * @returns {boolean} Completion status

     */

    isCompletedToday(id) {

        const habit = this.getById(id);

        if (!habit) return false;

        

        const today = AppUtils.localDateKey();

        return habit.completedDates.includes(today);

    },



    /**

     * Add XP to user

     * @param {number} amount - XP amount

     */

    addXP(amount) {

        const stats = Storage.getStatistics();

        stats.totalCompletions += 1;

        stats.xp += amount;

        

        // Calculate level

        const newLevel = Math.floor(stats.xp / 100) + 1;

        stats.level = newLevel;

        

        Storage.setStatistics(stats);

    },



    /**

     * Get today's habits

     * @returns {Array} Array of today's habits

     */

    getTodayHabits() {

        const habits = this.getAll();

        const today = AppUtils.localDateKey();

        

        return habits.filter(habit => {

            if (habit.frequency === 'daily') return true;

            if (habit.frequency === 'weekly') {

                const dayOfWeek = new Date().getDay();

                // Simple logic: show all weekly habits (can be enhanced)

                return true;

            }

            return true;

        });

    },



    /**

     * Filter habits

     * @param {Array} habits - Array of habits

     * @param {string} filter - Filter type

     * @returns {Array} Filtered habits

     */

    filter(habits, filter) {

        switch (filter) {

            case 'daily':

                return habits.filter(h => h.frequency === 'daily');

            case 'weekly':

                return habits.filter(h => h.frequency === 'weekly');

            case 'completed':

                return habits.filter(h => this.isCompletedToday(h.id));

            case 'pending':

                return habits.filter(h => !this.isCompletedToday(h.id));

            default:

                return habits;

        }

    },



    /**

     * Search habits

     * @param {Array} habits - Array of habits

     * @param {string} query - Search query

     * @returns {Array} Filtered habits

     */

    search(habits, query) {

        if (!query) return habits;

        const lowerQuery = query.toLowerCase();

        return habits.filter(h => 

            h.name.toLowerCase().includes(lowerQuery) ||

            h.description.toLowerCase().includes(lowerQuery) ||

            h.category.toLowerCase().includes(lowerQuery)

        );

    },



    /**

     * Render habits list

     * @param {Array} habits - Array of habits

     */

    render(habits) {

        const container = document.getElementById('habitsList');

        if (!container) return;

        

        if (habits.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    <i class="fas fa-clipboard-list"></i>

                    <h3>${Translations.get('no_habits')}</h3>

                    <p>${Translations.get('no_habits_desc')}</p>

                </div>

            `;

            return;

        }

        

        container.innerHTML = habits.map(habit => `

            <div class="habit-item ${this.isCompletedToday(habit.id) ? 'completed' : ''}" data-id="${habit.id}">

                <div class="habit-checkbox ${this.isCompletedToday(habit.id) ? 'checked' : ''}" onclick="Habits.complete('${habit.id}')">

                    ${this.isCompletedToday(habit.id) ? '<i class="fas fa-check"></i>' : ''}

                </div>

                <div class="habit-icon" style="background: ${AppUtils.safeColor(habit.color)}20; color: ${AppUtils.safeColor(habit.color)}">

                    <i class="fas ${AppUtils.safeIcon(habit.icon)}"></i>

                </div>

                <div class="habit-info">

                    <div class="habit-name">${AppUtils.escapeHtml(habit.name)}</div>

                    <div class="habit-meta">

                        <span class="habit-streak">

                            <i class="fas fa-fire"></i>

                            ${habit.streak}

                        </span>

                        <span>${Translations.get(habit.frequency)}</span>

                    </div>

                </div>

                <div class="habit-actions">

                    <button class="habit-action-btn" onclick="Habits.edit('${habit.id}')">

                        <i class="fas fa-edit"></i>

                    </button>

                    <button class="habit-action-btn delete" onclick="Habits.delete('${habit.id}')">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </div>

        `).join('');

    },



    /**

     * Edit habit

     * @param {string} id - Habit ID

     */

    edit(id) {

        const habit = this.getById(id);

        if (!habit) return;

        

        // Open edit modal with habit data

        const modal = document.getElementById('addHabitModal');

        const form = document.getElementById('addHabitForm');

        

        // Populate form

        document.getElementById('habitName').value = habit.name;

        document.getElementById('habitDescription').value = habit.description;

        document.getElementById('habitCategory').value = habit.category;

        document.getElementById('habitFrequency').value = habit.frequency;

        document.getElementById('habitGoal').value = habit.goal;

        document.getElementById('habitReminder').value = habit.reminder || '';

        document.getElementById('selectedIcon').value = habit.icon;

        document.getElementById('selectedColor').value = habit.color;

        

        // Select icon and color

        document.querySelectorAll('.icon-btn').forEach(btn => {

            btn.classList.toggle('selected', btn.dataset.icon === habit.icon);

        });

        document.querySelectorAll('.color-btn').forEach(btn => {

            btn.classList.toggle('selected', btn.dataset.color === habit.color);

        });

        

        // Change modal to edit mode

        modal.dataset.editId = id;

        modal.querySelector('h2').textContent = Translations.get('edit_habit');

        

        modal.classList.add('active');

    },



    /**

     * Initialize habits module

     */

    init() {

        // Render habits

        const habits = this.getTodayHabits();

        this.render(habits);

        

        // Setup search

        const searchInput = document.getElementById('habitSearch');

        if (searchInput) {

            searchInput.addEventListener('input', (e) => {

                const query = e.target.value;

                const filter = document.getElementById('habitFilter').value;

                let habits = this.getTodayHabits();

                habits = this.filter(habits, filter);

                habits = this.search(habits, query);

                this.render(habits);

            });

        }

        

        // Setup filter

        const filterSelect = document.getElementById('habitFilter');

        if (filterSelect) {

            filterSelect.addEventListener('change', (e) => {

                const filter = e.target.value;

                const query = document.getElementById('habitSearch').value;

                let habits = this.getTodayHabits();

                habits = this.filter(habits, filter);

                habits = this.search(habits, query);

                this.render(habits);

            });

        }

        

        // Setup add habit modal

        const addHabitBtn = document.getElementById('addHabitBtn');

        const addHabitModal = document.getElementById('addHabitModal');

        const closeModal = document.getElementById('closeModal');

        const cancelModal = document.getElementById('cancelModal');

        const addHabitForm = document.getElementById('addHabitForm');

        

        if (addHabitBtn && addHabitModal) {

            addHabitBtn.addEventListener('click', () => {

                addHabitModal.classList.add('active');

                addHabitModal.dataset.editId = '';

                addHabitModal.querySelector('h2').textContent = Translations.get('add_new_habit');

                addHabitForm.reset();

                

                // Reset color selection

                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));

                document.getElementById('selectedColor').value = '#6C63FF';

                document.querySelector('.color-btn[data-color="#6C63FF"]')?.classList.add('selected');

                

                // Reset icon selection

                document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));

                document.getElementById('selectedIcon').value = 'fa-book';

                document.querySelector('.icon-btn[data-icon="fa-book"]')?.classList.add('selected');

            });

        }

        

        if (closeModal) {

            closeModal.addEventListener('click', () => {

                addHabitModal.classList.remove('active');

            });

        }

        

        if (cancelModal) {

            cancelModal.addEventListener('click', () => {

                addHabitModal.classList.remove('active');

            });

        }

        

        if (addHabitForm) {

            addHabitForm.addEventListener('submit', (e) => {

                e.preventDefault();

                

                const habitData = {

                    name: document.getElementById('habitName').value,

                    description: document.getElementById('habitDescription').value,

                    category: document.getElementById('habitCategory').value,

                    frequency: document.getElementById('habitFrequency').value,

                    goal: parseInt(document.getElementById('habitGoal').value),

                    reminder: document.getElementById('habitReminder').value,

                    icon: document.getElementById('selectedIcon').value,

                    color: document.getElementById('selectedColor').value

                };

                

                const editId = addHabitModal.dataset.editId;

                

                if (editId) {

                    this.update(editId, habitData);

                } else {

                    this.create(habitData);

                }

                

                addHabitModal.classList.remove('active');

                addHabitForm.reset();

                

                // Re-render habits

                const habits = this.getTodayHabits();

                this.render(habits);

                

                // Show toast

                UI.showToast(editId ? 'تم تحديث العادة' : 'تم إضافة العادة');

            });

        }

        

        // Setup icon picker

        const iconPicker = document.getElementById('iconPicker');

        if (iconPicker) {

            iconPicker.addEventListener('click', (e) => {

                const btn = e.target.closest('.icon-btn');

                if (btn) {

                    document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));

                    btn.classList.add('selected');

                    document.getElementById('selectedIcon').value = btn.dataset.icon;

                }

            });

        }

        

        // Setup color picker

        const colorPicker = document.getElementById('colorPicker');

        if (colorPicker) {

            colorPicker.addEventListener('click', (e) => {

                const btn = e.target.closest('.color-btn');

                if (btn) {

                    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));

                    btn.classList.add('selected');

                    document.getElementById('selectedColor').value = btn.dataset.color;

                }

            });

        }

    }

};

