 // ============================================
// Habit Tracker - UI Module
// ============================================

/**
 * UI Module - Handles UI interactions, theme, and general UI operations
 */

const UI = {
    calendarDate: null,
    renderCurrentCalendar: null,

    displayUsername(username) {
        return username === 'Watfa User' ? Translations.get('default_username') : username;
    },

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error)
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const toastMessage = document.getElementById('toastMessage');
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    /**
     * Update current date display
     */
    updateDate() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const dayElement = document.getElementById('currentDay');
        
        if (dateElement) {
            const lang = Storage.getLanguage() || 'ar';
            dateElement.textContent = now.toLocaleDateString(Translations.locale(lang), {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (dayElement) {
            const lang = Storage.getLanguage() || 'ar';
            dayElement.textContent = now.toLocaleDateString(Translations.locale(lang), {
                weekday: 'long'
            });
        }
    },

    /**
     * Update welcome message based on time of day
     */
    updateWelcomeMessage() {
        const welcomeElement = document.getElementById('welcomeMessage');
        if (!welcomeElement) return;
        
        const hour = new Date().getHours();
        const lang = Storage.getLanguage() || 'ar';
        
        let greeting;
        if (hour < 12) {
            greeting = Translations.get('good_morning', lang);
        } else if (hour < 18) {
            greeting = Translations.get('good_afternoon', lang);
        } else {
            greeting = Translations.get('good_evening', lang);
        }
        
        const session = Storage.getSession();
        const username = session ? this.displayUsername(session.username) : '';
        
        welcomeElement.textContent = `${greeting} ${username} 👋`;
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const currentTheme = Storage.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        Storage.setTheme(newTheme);
        this.applyTheme(newTheme);
    },

    /**
     * Apply theme to the page
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = theme === 'dark';
        }
        
        const darkModeSetting = document.getElementById('darkModeSetting');
        if (darkModeSetting) {
            darkModeSetting.checked = theme === 'dark';
        }
    },

    /**
     * Toggle sidebar on mobile
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    },

    /**
     * Close sidebar on mobile
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    },

    /**
     * Update stats cards
     */
    updateStats() {
        if (typeof Habits === 'undefined' || typeof Statistics === 'undefined') return;
        const habits = Habits.getAll();
        const stats = Storage.getStatistics();
        
        // Total habits
        const totalHabitsElement = document.getElementById('totalHabits');
        if (totalHabitsElement) {
            totalHabitsElement.textContent = habits.length;
        }
        
        // Completed today
        const completedTodayElement = document.getElementById('completedToday');
        if (completedTodayElement) {
            const completedCount = habits.filter(h => Habits.isCompletedToday(h.id)).length;
            completedTodayElement.textContent = `${completedCount}/${habits.length}`;
            
            // Update progress ring for completed habits
            const progressRing = document.querySelector('.progress-ring circle:last-child');
            if (progressRing) {
                const circumference = 157; // 2 * PI * 25
                const percentage = habits.length > 0 ? (completedCount / habits.length) : 0;
                const offset = circumference - (percentage * circumference);
                progressRing.style.strokeDashoffset = offset;
            }
        }
        
        // Longest streak
        const longestStreakElement = document.getElementById('longestStreak');
        if (longestStreakElement) {
            const longestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
            longestStreakElement.textContent = longestStreak;
        }
        
        // Commitment rate (percentage of habits completed today)
        const commitmentRateElement = document.getElementById('commitmentRate');
        if (commitmentRateElement) {
            const completedCount = habits.filter(h => Habits.isCompletedToday(h.id)).length;
            const commitmentPercentage = habits.length > 0 
                ? Math.round((completedCount / habits.length) * 100) 
                : 0;
            commitmentRateElement.textContent = `${commitmentPercentage}%`;
            
            // Calculate and update change from last week
            const statChangeElement = document.querySelector('.stat-change');
            if (statChangeElement) {
                const weeklyData = Statistics.getWeeklyComparison();
                if (weeklyData && weeklyData.lastWeek && weeklyData.lastWeek.length > 0) {
                    const lastWeekAvg = Math.round(weeklyData.lastWeek.reduce((a, b) => a + b, 0) / weeklyData.lastWeek.length);
                    const change = commitmentPercentage - lastWeekAvg;
                    
                    if (change > 0) {
                        statChangeElement.textContent = `+${change}%`;
                        statChangeElement.className = 'stat-change positive';
                    } else if (change < 0) {
                        statChangeElement.textContent = `${change}%`;
                        statChangeElement.className = 'stat-change negative';
                    } else {
                        statChangeElement.textContent = '0%';
                        statChangeElement.className = 'stat-change neutral';
                    }
                } else {
                    statChangeElement.textContent = '0%';
                    statChangeElement.className = 'stat-change neutral';
                }
            }
        }
        
        // XP Level
        const xpLevelElement = document.getElementById('xpLevel');
        if (xpLevelElement) {
            xpLevelElement.textContent = `${Translations.get('level')} ${stats.level}`;
            
            // Update XP progress bar
            const progressFill = document.querySelector('.xp-progress .progress-fill');
            const xpText = document.querySelector('.xp-progress span');
            if (progressFill && xpText) {
                const currentXP = stats.xp || 0;
                const xpForNextLevel = stats.level * 1000;
                const xpInCurrentLevel = currentXP % 1000;
                const progressPercentage = (xpInCurrentLevel / 1000) * 100;
                progressFill.style.width = `${progressPercentage}%`;
                xpText.textContent = `${xpInCurrentLevel}/1000 XP`;
            }
        }
        
        // Active days (current month only)
        const activeDaysElement = document.getElementById('activeDays');
        if (activeDaysElement && stats.activeDays) {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const monthlyActiveDays = stats.activeDays.filter(date => {
                const dateObj = new Date(date);
                return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
            }).length;
            
            activeDaysElement.textContent = monthlyActiveDays;
        }
    },

    /**
     * Initialize calendar
     */
    initCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const calendarTitle = document.getElementById('calendarTitle');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        if (!calendarGrid || !calendarTitle) return;
        
        this.calendarDate ||= new Date();
        
        const renderCalendar = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const lang = Storage.getLanguage() || 'ar';
            
            calendarTitle.textContent = date.toLocaleDateString(Translations.locale(lang), {
                month: 'long',
                year: 'numeric'
            });
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let html = '';
            
            // Empty cells for days before first day of month
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="calendar-day empty"></div>';
            }
            
            // Days of the month
            const today = new Date();
            const habits = Habits.getAll();
            const events = Storage.getEvents();
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                
                // Check if any habits were completed on this day
                const completedHabitCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
                const hasHabits = completedHabitCount > 0;
                const isCompleted = hasHabits;
                
                // Check if any events exist on this day
                const dayEvents = events.filter(e => e.date === dateStr);
                const hasEvents = dayEvents.length > 0;
                const localizedDate = new Date(year, month, day, 12).toLocaleDateString(Translations.locale(lang), {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const dayLabel = Translations.format('calendar_day_summary', {
                    date: localizedDate,
                    habits: completedHabitCount,
                    events: dayEvents.length
                }, lang);
                
                html += `
                    <div class="calendar-day ${isToday ? 'today' : ''} ${hasHabits ? 'has-habits' : ''} ${isCompleted ? 'completed' : ''} ${hasEvents ? 'has-events' : ''}" 
                         aria-label="${AppUtils.escapeHtml(dayLabel)}"
                         data-date="${dateStr}"
                         onclick="UI.openEventsModal('${dateStr}')"
                         onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); UI.openEventsModal('${dateStr}'); }"
                         role="button"
                         tabindex="0">
                        ${day}
                        ${hasEvents ? `<span class="event-indicator"></span>` : ''}
                    </div>
                `;
            }
            
            calendarGrid.innerHTML = html;
        };
        
        this.renderCurrentCalendar = () => renderCalendar(this.calendarDate);
        this.renderCurrentCalendar();
        
        if (prevMonthBtn && !prevMonthBtn.dataset.calendarBound) {
            prevMonthBtn.dataset.calendarBound = 'true';
            prevMonthBtn.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
                this.renderCurrentCalendar();
            });
        }
        
        if (nextMonthBtn && !nextMonthBtn.dataset.calendarBound) {
            nextMonthBtn.dataset.calendarBound = 'true';
            nextMonthBtn.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
                this.renderCurrentCalendar();
            });
        }
    },

    /**
     * Show day details
     * @param {string} dateStr - Date string
     */
    showDayDetails(dateStr) {
        const selectedDateElement = document.getElementById('selectedDate');
        const dayCompletionRateElement = document.getElementById('dayCompletionRate');
        const dayHabitsElement = document.getElementById('dayHabits');
        
        if (!selectedDateElement) return;
        
        const lang = Storage.getLanguage() || 'ar';
        const date = AppUtils.localDateFromKey(dateStr);
        selectedDateElement.textContent = date.toLocaleDateString(Translations.locale(lang), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const habits = Habits.getAll();
        const completedHabits = habits.filter(h => h.completedDates.includes(dateStr));
        const completionRate = habits.length > 0 ? Math.round((completedHabits.length / habits.length) * 100) : 0;
        
        if (dayCompletionRateElement) {
            dayCompletionRateElement.textContent = `${completionRate}%`;
        }
        
        if (dayHabitsElement) {
            if (completedHabits.length === 0) {
                dayHabitsElement.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_completed_habits')}</p>`;
            } else {
                dayHabitsElement.innerHTML = completedHabits.map(h => `
                    <div class="habit-item completed">
                        <div class="habit-checkbox checked">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="habit-icon" style="background: ${AppUtils.safeColor(h.color)}20; color: ${AppUtils.safeColor(h.color)}">
                            <i class="fas ${AppUtils.safeIcon(h.icon)}"></i>
                        </div>
                        <div class="habit-info">
                            <div class="habit-name">${AppUtils.escapeHtml(h.name)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    /**
     * Open events modal for a specific date
     * @param {string} dateStr - Date string
     */
    openEventsModal(dateStr) {
        const eventsModal = document.getElementById('eventsModal');
        const eventsModalTitle = document.getElementById('eventsModalTitle');
        const eventsList = document.getElementById('eventsList');
        
        if (!eventsModal) return;
        
        // Set current date for the modal
        eventsModal.dataset.currentDate = dateStr;
        
        // Update title with date
        const lang = Storage.getLanguage() || 'ar';
        const date = AppUtils.localDateFromKey(dateStr);
        eventsModalTitle.textContent = date.toLocaleDateString(Translations.locale(lang), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Render events for this date
        this.renderEventsList(dateStr);
        
        // Show modal
        eventsModal.classList.add('active');
        
        // Also show day details
        this.showDayDetails(dateStr);
    },

    /**
     * Render events list for a specific date
     * @param {string} dateStr - Date string
     */
    renderEventsList(dateStr) {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;
        
        const events = Storage.getEventsByDate(dateStr);
        
        if (events.length === 0) {
            eventsList.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_events')}</p>`;
            return;
        }
        
        eventsList.innerHTML = events.map(event => {
            const editLabel = Translations.format('edit_event_aria', { title: event.title });
            const deleteLabel = Translations.format('delete_event_aria', { title: event.title });
            return `
            <div class="event-item" data-event-id="${event.id}">
                <div class="event-icon ${event.type}">
                    <i class="fas ${event.type === 'reminder' ? 'fa-bell' : 'fa-calendar'}"></i>
                </div>
                <div class="event-info">
                    <div class="event-title">${AppUtils.escapeHtml(event.title)}</div>
                    <div class="event-meta">
                        ${event.time ? `<span class="event-time"><i class="fas fa-clock"></i> ${AppUtils.escapeHtml(event.time)}</span>` : ''}
                        <span class="event-type">${Translations.get(event.type === 'reminder' ? 'reminder' : 'event')}</span>
                    </div>
                    ${event.description ? `<div class="event-description">${AppUtils.escapeHtml(event.description)}</div>` : ''}
                </div>
                <div class="event-actions">
                    <button aria-label="${AppUtils.escapeHtml(editLabel)}" class="event-action-btn edit" onclick="UI.editEvent('${event.id}')" type="button">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button aria-label="${AppUtils.escapeHtml(deleteLabel)}" class="event-action-btn delete" onclick="UI.deleteEvent('${event.id}')" type="button">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    },

    /**
     * Open event form modal for adding/editing
     * @param {string} eventId - Event ID (optional, for editing)
     */
    openEventFormModal(eventId = null) {
        const eventFormModal = document.getElementById('eventFormModal');
        const eventFormTitle = document.getElementById('eventFormTitle');
        const eventForm = document.getElementById('eventForm');
        
        if (!eventFormModal || !eventForm) return;
        
        // Reset form
        eventForm.reset();
        eventForm.dataset.editId = eventId || '';
        
        if (eventId) {
            // Edit mode - populate form with existing event data
            const events = Storage.getEvents();
            const event = events.find(e => e.id === eventId);
            
            if (event) {
                eventFormTitle.textContent = Translations.get('edit_event');
                document.getElementById('eventTitle').value = event.title;
                document.getElementById('eventDescription').value = event.description || '';
                document.getElementById('eventTime').value = event.time || '';
                document.getElementById('eventType').value = event.type;
            }
        } else {
            // Add mode
            eventFormTitle.textContent = Translations.get('add_event');
        }
        
        eventFormModal.classList.add('active');
    },

    /**
     * Close events modal
     */
    closeEventsModal() {
        const eventsModal = document.getElementById('eventsModal');
        if (eventsModal) {
            eventsModal.classList.remove('active');
        }
    },

    /**
     * Close event form modal
     */
    closeEventFormModal() {
        const eventFormModal = document.getElementById('eventFormModal');
        if (eventFormModal) {
            eventFormModal.classList.remove('active');
        }
    },

    /**
     * Save event (add or update)
     * @param {Object} eventData - Event data
     */
    saveEvent(eventData) {
        const eventsModal = document.getElementById('eventsModal');
        const currentDate = eventsModal ? eventsModal.dataset.currentDate : null;
        
        if (!currentDate) return;
        
        const eventForm = document.getElementById('eventForm');
        const editId = eventForm ? eventForm.dataset.editId : '';
        
        if (editId) {
            // Update existing event
            Storage.updateEvent(editId, eventData);
            this.showToast(Translations.get('event_updated'));
        } else {
            // Add new event
            const newEvent = {
                id: AppUtils.createId('event'),
                date: currentDate,
                ...eventData
            };
            Storage.addEvent(newEvent);
            this.showToast(Translations.get('event_added'));
        }
        
        // Refresh events list
        this.renderEventsList(currentDate);
        
        // Refresh calendar to show event indicator
        this.renderCurrentCalendar?.();
        
        // Close form modal
        this.closeEventFormModal();
    },

    /**
     * Edit event
     * @param {string} eventId - Event ID
     */
    editEvent(eventId) {
        this.openEventFormModal(eventId);
    },

    /**
     * Delete event
     * @param {string} eventId - Event ID
     */
    deleteEvent(eventId) {
        if (confirm(Translations.get('confirm_delete_event'))) {
            Storage.deleteEvent(eventId);
            
            const eventsModal = document.getElementById('eventsModal');
            const currentDate = eventsModal ? eventsModal.dataset.currentDate : null;
            
            if (currentDate) {
                this.renderEventsList(currentDate);
            }
            
            // Refresh calendar to remove event indicator
            this.renderCurrentCalendar?.();
            
            this.showToast(Translations.get('event_deleted'));
        }
    },

    /**
     * Initialize events modals
     */
    initEventsModals() {
        const closeEventsModal = document.getElementById('closeEventsModal');
        const closeEventFormModal = document.getElementById('closeEventFormModal');
        const cancelEventForm = document.getElementById('cancelEventForm');
        const addEventBtn = document.getElementById('addEventBtn');
        const eventForm = document.getElementById('eventForm');

        // Close events modal
        if (closeEventsModal) {
            closeEventsModal.addEventListener('click', () => {
                this.closeEventsModal();
            });
        }

        // Close event form modal
        if (closeEventFormModal) {
            closeEventFormModal.addEventListener('click', () => {
                this.closeEventFormModal();
            });
        }

        // Cancel event form
        if (cancelEventForm) {
            cancelEventForm.addEventListener('click', () => {
                this.closeEventFormModal();
            });
        }

        // Add new event button
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                this.openEventFormModal();
            });
        }

        // Event form submission
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const eventData = {
                    title: document.getElementById('eventTitle').value,
                    description: document.getElementById('eventDescription').value,
                    time: document.getElementById('eventTime').value,
                    type: document.getElementById('eventType').value
                };
                
                this.saveEvent(eventData);
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            const eventsModal = document.getElementById('eventsModal');
            const eventFormModal = document.getElementById('eventFormModal');
            
            if (eventsModal && eventsModal.classList.contains('active')) {
                if (!eventsModal.contains(e.target) && !e.target.closest('.calendar-day')) {
                    this.closeEventsModal();
                }
            }
            
            if (eventFormModal && eventFormModal.classList.contains('active')) {
                if (!eventFormModal.contains(e.target)) {
                    this.closeEventFormModal();
                }
            }
        });
    },

    /**
     * Initialize language toggle
     */
    initLanguageToggle() {
        document.querySelectorAll('[data-language-selector]').forEach((selector) => {
            selector.value = Storage.getLanguage() || 'ar';
            if (selector.dataset.languageBound) return;
            selector.dataset.languageBound = 'true';
            selector.addEventListener('change', (event) => {
                Translations.setLanguage(event.target.value);
            });
        });

        if (!this.languageChangeBound) {
            this.languageChangeBound = true;
            document.addEventListener('watfa:languagechange', () => this.refreshLocalizedContent());
        }
    },

    /**
     * Refresh JavaScript-rendered content after a runtime language change.
     */
    refreshLocalizedContent() {
        this.updateDate();
        this.updateWelcomeMessage();

        if (typeof Habits !== 'undefined') {
            this.updateStats();
            if (document.getElementById('habitsList')) {
                let habits = Habits.getTodayHabits();
                const filter = document.getElementById('habitFilter')?.value || 'all';
                const query = document.getElementById('habitSearch')?.value || '';
                habits = Habits.search(Habits.filter(habits, filter), query);
                Habits.render(habits);
            }
        }

        this.renderCurrentCalendar?.();
        const selectedDate = document.getElementById('eventsModal')?.dataset.currentDate;
        if (selectedDate) {
            this.showDayDetails(selectedDate);
            if (document.getElementById('eventsModal')?.classList.contains('active')) {
                this.openEventsModal(selectedDate);
            }
        }

        const habitModal = document.getElementById('addHabitModal');
        if (habitModal?.dataset.editId) {
            habitModal.querySelector('h2').textContent = Translations.get('edit_habit');
        }
        const eventForm = document.getElementById('eventForm');
        if (eventForm?.dataset.editId) {
            document.getElementById('eventFormTitle').textContent = Translations.get('edit_event');
        }

        if (typeof Statistics !== 'undefined' && window.location.pathname.includes('statistics')) {
            if (Statistics.hasData()) {
                Statistics.updateOverviewCards();
                Statistics.updateAchievements();
            } else {
                Statistics.showEmptyState();
            }
        }

        if (typeof Charts !== 'undefined') {
            Charts.destroyAll();
            Charts.init();
        }

        const motivationalModal = document.getElementById('motivationalModal');
        if (motivationalModal?.classList.contains('active')) this.showMotivationalModal();

        const session = Storage.getSession();
        const currentUsername = document.getElementById('currentUsername');
        const currentEmail = document.getElementById('currentEmail');
        if (currentUsername && session) currentUsername.textContent = this.displayUsername(session.username);
        if (currentEmail && session) currentEmail.textContent = session.email || '—';
    },

    /**
     * Initialize dark mode toggle
     */
    initDarkModeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => {
                this.toggleDarkMode();
            });
        }
        
        const darkModeSetting = document.getElementById('darkModeSetting');
        if (darkModeSetting) {
            darkModeSetting.addEventListener('change', () => {
                this.toggleDarkMode();
            });
        }
    },

    /**
     * Initialize mobile menu
     */
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            if (sidebar && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
    },

    /**
     * Initialize settings page
     */
    initSettings() {
        // Username edit
        const editUsernameBtn = document.getElementById('editUsernameBtn');
        const editUsernameModal = document.getElementById('editUsernameModal');
        const closeUsernameModal = document.getElementById('closeUsernameModal');
        const cancelUsernameModal = document.getElementById('cancelUsernameModal');
        const editUsernameForm = document.getElementById('editUsernameForm');
        
        if (editUsernameBtn && editUsernameModal) {
            editUsernameBtn.addEventListener('click', () => {
                editUsernameModal.classList.add('active');
            });
        }
        
        if (closeUsernameModal) {
            closeUsernameModal.addEventListener('click', () => {
                editUsernameModal.classList.remove('active');
            });
        }
        
        if (cancelUsernameModal) {
            cancelUsernameModal.addEventListener('click', () => {
                editUsernameModal.classList.remove('active');
            });
        }
        
        if (editUsernameForm) {
            editUsernameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newUsername = document.getElementById('newUsername').value;
                const session = Storage.getSession();
                
                if (session) {
                    Storage.updateUser(session.username, { username: newUsername });
                    session.username = newUsername;
                    Storage.setSession(session);
                    
                    document.getElementById('currentUsername').textContent = newUsername;
                    editUsernameModal.classList.remove('active');
                    this.showToast(Translations.get('username_updated'));
                }
            });
        }
        
        // Email edit
        const editEmailBtn = document.getElementById('editEmailBtn');
        const editEmailModal = document.getElementById('editEmailModal');
        const closeEmailModal = document.getElementById('closeEmailModal');
        const cancelEmailModal = document.getElementById('cancelEmailModal');
        const editEmailForm = document.getElementById('editEmailForm');
        
        if (editEmailBtn && editEmailModal) {
            editEmailBtn.addEventListener('click', () => {
                editEmailModal.classList.add('active');
            });
        }
        
        if (closeEmailModal) {
            closeEmailModal.addEventListener('click', () => {
                editEmailModal.classList.remove('active');
            });
        }
        
        if (cancelEmailModal) {
            cancelEmailModal.addEventListener('click', () => {
                editEmailModal.classList.remove('active');
            });
        }
        
        if (editEmailForm) {
            editEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newEmail = document.getElementById('newEmail').value;
                const session = Storage.getSession();
                
                if (session) {
                    Storage.updateUser(session.username, { email: newEmail });
                    
                    document.getElementById('currentEmail').textContent = newEmail;
                    editEmailModal.classList.remove('active');
                    editEmailForm.reset();
                    this.showToast(Translations.get('email_updated'));
                }
            });
        }
        // Password authentication is intentionally not part of this local-first app.

        // Export buttons
        const exportCSVBtn = document.getElementById('exportCSVBtn');
        const exportPDFBtn = document.getElementById('exportPDFBtn');
        
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => {
                this.exportCSV();
            });
        }
        
        if (exportPDFBtn) {
            // Remove any existing event listeners to prevent duplicates
            const newBtn = exportPDFBtn.cloneNode(true);
            exportPDFBtn.parentNode.replaceChild(newBtn, exportPDFBtn);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportToPDF();
            });
        }
        
        // Portable JSON backup / restore for the local-first data model.
        const exportJSONBtn = document.getElementById('exportJSONBtn');
        const importJSONBtn = document.getElementById('importJSONBtn');
        const importJSONFile = document.getElementById('importJSONFile');

        exportJSONBtn?.addEventListener('click', () => {
            const snapshot = Storage.exportSnapshot();
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `watfa-habit-tracker-backup_${AppUtils.localDateKey()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast(Translations.get('backup_created'));
        });

        importJSONBtn?.addEventListener('click', () => importJSONFile?.click());
        importJSONFile?.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                this.showToast(Translations.get('backup_too_large'), 'error');
                event.target.value = '';
                return;
            }
            try {
                const snapshot = JSON.parse(await file.text());
                if (!confirm(Translations.get('confirm_import_backup'))) return;
                Storage.importSnapshot(snapshot);
                this.showToast(Translations.get('backup_imported'));
                setTimeout(() => window.location.reload(), 250);
            } catch (error) {
                console.error('Backup import failed:', error);
                this.showToast(Translations.get('backup_invalid'), 'error');
            } finally {
                event.target.value = '';
            }
        });

        // Delete local data
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm(Translations.get('confirm_delete_local'))) {
                    Storage.clear();
                    Storage.initializeLocalProfile();
                    this.showToast(Translations.get('local_data_deleted'));
                    setTimeout(() => window.location.reload(), 250);
                }
            });
        }
    },

    /**
     * Export data as CSV
     */
    exportCSV() {
        const habits = Habits.getAll();
        const locale = Translations.locale();
        
        let csv = [Translations.get('csv_name'), Translations.get('csv_description'), Translations.get('csv_category'), Translations.get('csv_frequency'), Translations.get('csv_streak'), Translations.get('csv_best_streak'), Translations.get('csv_completed_dates')].map(AppUtils.csvCell).join(',') + '\n';
        habits.forEach(habit => {
            csv += [
                habit.name,
                habit.description,
                Translations.get(habit.category),
                Translations.get(habit.frequency),
                habit.streak,
                habit.bestStreak,
                (habit.completedDates || []).map(date =>
                    AppUtils.localDateFromKey(date).toLocaleDateString(locale)
                ).join(', ')
            ].map(AppUtils.csvCell).join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `watfa-habits_${AppUtils.localDateKey()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast(Translations.get('data_exported'));
    },

    /**
     * Export data to PDF
     */
    exportToPDF() {
        try {
            // Check if jsPDF is loaded
            let jsPDFConstructor;
            if (window.jspdf && window.jspdf.jsPDF) {
                jsPDFConstructor = window.jspdf.jsPDF;
            } else if (window.jsPDF) {
                jsPDFConstructor = window.jsPDF;
            } else {
                this.showToast(Translations.get('pdf_library_missing'), 'error');
                return;
            }

            if (!jsPDFConstructor) {
                this.showToast(Translations.get('pdf_library_missing'), 'error');
                return;
            }

            const session = Storage.getSession();
            if (!session) {
                this.showToast(Translations.get('local_profile_unavailable'), 'error');
                return;
            }

            const habits = Habits.getAll();
            const stats = Storage.getStatistics();
            const lang = Storage.getLanguage() || 'ar';

            // Create PDF document
            const doc = new jsPDFConstructor({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Set font
            doc.setFont('helvetica');

            let yPos = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // Title
            doc.setFontSize(24);
            doc.setTextColor(108, 99, 255);
            doc.text(Translations.get('pdf_report_title'), margin, yPos);
            yPos += 15;

            // Export date
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            const exportDate = new Date().toLocaleDateString(Translations.locale(lang), {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`${Translations.get('export_date')}: ${exportDate}`, margin, yPos);
            yPos += 15;

            doc.setTextColor(0, 0, 0);

            // User Summary Section
            doc.setFontSize(16);
            doc.setTextColor(108, 99, 255);
            doc.text(Translations.get('user_summary'), margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);

            const totalCompletions = Statistics.getTotalCompletions();
            const currentStreak = Statistics.getCurrentStreak();
            const bestStreak = Statistics.getBestStreak();
            const successRate = Statistics.getSuccessRate();
            const activeDaysThisMonth = Statistics.getActiveDaysThisMonth();

            // Simple text rendering for summary
            const summaryData = [
                `${Translations.get('total_active_habits')}: ${habits.length}`,
                `${Translations.get('total_completed_habits')}: ${totalCompletions}`,
                `${Translations.get('current_streak')}: ${currentStreak} ${Translations.get('days')}`,
                `${Translations.get('longest_streak')}: ${bestStreak} ${Translations.get('days')}`,
                `${Translations.get('commitment_percentage')}: ${successRate}%`,
                `${Translations.get('xp_level')}: ${stats.level}`,
                `${Translations.get('xp_progress')}: ${stats.xp}`,
                `${Translations.get('monthly_active_days')}: ${activeDaysThisMonth}`
            ];

            summaryData.forEach(line => {
                doc.text(line, margin, yPos);
                yPos += 7;
            });
            yPos += 10;

            // Habits List Section
            doc.setFontSize(16);
            doc.setTextColor(108, 99, 255);
            doc.text(Translations.get('habits_list'), margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            habits.forEach(habit => {
                const daysSinceCreation = Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1;
                const expectedCompletions = habit.frequency === 'daily' ? daysSinceCreation : Math.ceil(daysSinceCreation / 7);
                const missedDays = Math.max(0, expectedCompletions - habit.completedDates.length);
                const completionRate = expectedCompletions > 0 ? Math.round((habit.completedDates.length / expectedCompletions) * 100) : 0;

                const habitLine = `${habit.name} (${Translations.get(habit.category)}) - ${Translations.get(habit.active === false ? 'inactive' : 'active')} - ${completionRate}% ${Translations.get('complete_label')} - ${habit.completedDates.length} ${Translations.get('days_completed')} - ${missedDays} ${Translations.get('missed')}`;
                const wrapped = doc.splitTextToSize(habitLine, contentWidth);
                wrapped.forEach(textLine => {
                    doc.text(textLine, margin, yPos);
                    yPos += 5;
                });
                yPos += 3;

                // Check if we need a new page
                if (yPos > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            // Save PDF
            const fileName = `watfa-habits_${AppUtils.localDateKey()}.pdf`;
            doc.save(fileName);

            this.showToast(Translations.get('pdf_exported'));
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.showToast(Translations.get('pdf_export_error'), 'error');
        }
    },

    /**
     * Generate performance summary text
     * @param {Array} habits - Array of habits
     * @param {Object} stats - Statistics object
     * @param {number} overallCompletion - Overall completion percentage
     * @returns {string} Performance summary
     */
    generatePerformanceSummary(habits, stats, overallCompletion) {
        let summary = Translations.format('tracking_summary', { count: habits.length });
        if (overallCompletion >= 80) summary += Translations.get('performance_excellent');
        else if (overallCompletion >= 60) summary += Translations.get('performance_good');
        else if (overallCompletion >= 40) summary += Translations.get('performance_moderate');
        else summary += Translations.get('performance_needs_work');

        summary += Translations.format('xp_summary', { xp: stats.xp, level: stats.level });
        const currentStreak = Statistics.getCurrentStreak();
        summary += currentStreak > 0
            ? Translations.format('streak_summary', { count: currentStreak })
            : Translations.get('streak_start');
        const bestStreak = Statistics.getBestStreak();
        if (bestStreak > 0) summary += Translations.format('best_streak_summary', { count: bestStreak });
        summary += Translations.get('performance_closing');
        return summary;
    },

    /**
     * Initialize motivational modal
     */
    initMotivationalModal() {
        const motivationalModal = document.getElementById('motivationalModal');
        const motivationalContinueBtn = document.getElementById('motivationalContinueBtn');
        const motivationalOverlay = document.querySelector('.motivational-overlay');

        if (!motivationalModal) return;

        // Close on continue button click
        if (motivationalContinueBtn) {
            motivationalContinueBtn.addEventListener('click', () => {
                this.closeMotivationalModal();
            });
        }

        // Close on overlay click
        if (motivationalOverlay) {
            motivationalOverlay.addEventListener('click', () => {
                this.closeMotivationalModal();
            });
        }

        // Show at most once per local day. This is a local UX preference, not a login event.
        const today = AppUtils.localDateKey();
        const lastShown = localStorage.getItem('watfa_motivation_last_shown');
        if (lastShown !== today) {
            localStorage.setItem('watfa_motivation_last_shown', today);
            setTimeout(() => this.showMotivationalModal(), 300);
        }
    },

    /**
     * Show motivational modal with random quote
     */
    showMotivationalModal() {
        const motivationalModal = document.getElementById('motivationalModal');
        const motivationalQuote = document.getElementById('motivationalQuote');
        
        if (!motivationalModal || !motivationalQuote) return;

        const lang = Storage.getLanguage() || 'ar';
        const quotes = Translations.translations[lang].motivational_quotes;
        
        // Select random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        motivationalQuote.textContent = quote;
        
        // Update continue button text
        const continueBtnText = motivationalModal.querySelector('[data-translate="motivational_continue"]');
        if (continueBtnText) {
            continueBtnText.textContent = Translations.get('motivational_continue');
        }

        // Show modal with animation
        motivationalModal.style.display = 'flex';
        // Trigger reflow
        motivationalModal.offsetHeight;
        motivationalModal.classList.add('active');
    },

    /**
     * Close motivational modal with animation
     */
    closeMotivationalModal() {
        const motivationalModal = document.getElementById('motivationalModal');
        
        if (!motivationalModal) return;

        motivationalModal.classList.remove('active');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            motivationalModal.style.display = 'none';
        }, 500);
    },

    /**
     * Initialize UI module
     */
    init() {
        // Apply saved theme
        const theme = Storage.getTheme();
        this.applyTheme(theme);
        
        // Update date and welcome message
        this.updateDate();
        this.updateWelcomeMessage();
        
        // Initialize toggles
        this.initLanguageToggle();
        this.initDarkModeToggle();
        this.initMobileMenu();
        
        // Update stats
        this.updateStats();
        
        // Initialize calendar if on calendar page
        if (window.location.pathname.includes('calendar')) {
            this.initCalendar();
            this.initEventsModals();
        }
        
        // Initialize settings if on settings page
        if (window.location.pathname.includes('settings')) {
            this.initSettings();
        }
        
        // Initialize motivational modal
        this.initMotivationalModal();
        
        // Update user info in settings
        const session = Storage.getSession();
        if (session) {
            const currentUsername = document.getElementById('currentUsername');
            const currentEmail = document.getElementById('currentEmail');
            
            if (currentUsername) {
                currentUsername.textContent = this.displayUsername(session.username);
            }
            if (currentEmail) {
                currentEmail.textContent = session.email || '—';
            }
        }
    },
};
