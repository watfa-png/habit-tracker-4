// ============================================
// Habit Tracker - Statistics Module
// ============================================

/**
 * Statistics Module - Calculates real statistics from habit data
 */

const Statistics = {
    /**
     * Calculate total completions across all habits
     * @returns {number} Total completions
     */
    getTotalCompletions() {
        const habits = Habits.getAll();
        return habits.reduce((total, habit) => total + habit.completedDates.length, 0);
    },

    /**
     * Calculate current streak (consecutive days with at least one completion)
     * @returns {number} Current streak in days
     */
    getCurrentStreak() {
        const habits = Habits.getAll();
        if (habits.length === 0) return 0;

        // Get all unique completion dates across all habits
        const allDates = new Set();
        habits.forEach(habit => {
            habit.completedDates.forEach(date => allDates.add(date));
        });

        if (allDates.size === 0) return 0;

        const sortedDates = Array.from(allDates).sort().reverse();
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
     * Calculate best streak ever
     * @returns {number} Best streak in days
     */
    getBestStreak() {
        const habits = Habits.getAll();
        if (habits.length === 0) return 0;

        // Get the maximum bestStreak from all habits
        return habits.reduce((max, habit) => Math.max(max, habit.bestStreak), 0);
    },

    /**
     * Calculate success rate (percentage of habits completed today)
     * @returns {number} Success rate percentage
     */
    getSuccessRate() {
        const habits = Habits.getAll();
        if (habits.length === 0) return 0;

        const completedCount = habits.filter(h => Habits.isCompletedToday(h.id)).length;
        return Math.round((completedCount / habits.length) * 100);
    },

    /**
     * Calculate active days in current month
     * @returns {number} Active days count
     */
    getActiveDaysThisMonth() {
        const habits = Habits.getAll();
        if (habits.length === 0) return 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get all unique completion dates
        const allDates = new Set();
        habits.forEach(habit => {
            habit.completedDates.forEach(date => allDates.add(date));
        });

        // Filter dates for current month
        let activeDays = 0;
        allDates.forEach(dateStr => {
            const [year, month] = dateStr.split('-').map(Number);
            if (month - 1 === currentMonth && year === currentYear) activeDays++;
        });

        return activeDays;
    },

    /**
     * Get most completed habits
     * @param {number} limit - Maximum number of habits to return
     * @returns {Array} Array of habit objects with completion counts
     */
    getMostCompletedHabits(limit = 5) {
        const habits = Habits.getAll();
        return habits
            .map(habit => ({
                ...habit,
                completionCount: habit.completedDates.length
            }))
            .sort((a, b) => b.completionCount - a.completionCount)
            .slice(0, limit);
    },

    /**
     * Calculate habit completion rate per habit
     * @returns {Array} Array of objects with habit name and completion rate
     */
    getHabitCompletionRates() {
        const habits = Habits.getAll();
        return habits.map(habit => {
            const daysSinceCreation = Math.floor(
                (new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)
            ) + 1;
            const expectedCompletions = habit.frequency === 'daily' ? daysSinceCreation : Math.ceil(daysSinceCreation / 7);
            const completionRate = expectedCompletions > 0 
                ? Math.round((habit.completedDates.length / expectedCompletions) * 100)
                : 0;
            
            return {
                name: habit.name,
                completionRate: Math.min(completionRate, 100),
                streak: habit.streak
            };
        });
    },

    /**
     * Get daily completion data for a date range
     * @param {number} days - Number of days to look back
     * @returns {Array} Array of objects with date and completion count
     */
    getDailyCompletionData(days = 30) {
        const habits = Habits.getAll();
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = AppUtils.localDateKey(date);

            let completionCount = 0;
            habits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    completionCount++;
                }
            });

            data.push({
                date: dateStr,
                day: date.getDate(),
                completionCount,
                completionRate: habits.length > 0 ? Math.round((completionCount / habits.length) * 100) : 0
            });
        }

        return data;
    },

    /**
     * Get weekly comparison data
     * @returns {Object} Object with this week and last week data
     */
    getWeeklyComparison() {
        const habits = Habits.getAll();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        const thisWeekData = new Array(7).fill(0);
        const lastWeekData = new Array(7).fill(0);

        const now = new Date();
        const currentDayOfWeek = now.getDay();

        // This week
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(now.getDate() - currentDayOfWeek + i);
            const dateStr = AppUtils.localDateKey(date);

            let completionCount = 0;
            habits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    completionCount++;
                }
            });

            thisWeekData[i] = habits.length > 0 ? Math.round((completionCount / habits.length) * 100) : 0;
        }

        // Last week
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(now.getDate() - currentDayOfWeek - 7 + i);
            const dateStr = AppUtils.localDateKey(date);

            let completionCount = 0;
            habits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    completionCount++;
                }
            });

            lastWeekData[i] = habits.length > 0 ? Math.round((completionCount / habits.length) * 100) : 0;
        }

        return {
            thisWeek: thisWeekData,
            lastWeek: lastWeekData
        };
    },

    /**
     * Get weekly progress data for dashboard (current week only)
     * @returns {Array} Array of 7 percentages for each day of the week (Saturday to Friday)
     */
    getWeeklyProgress() {
        const habits = Habits.getAll();
        
        // Arabic week starts on Saturday (day 6 in JS)
        // Order: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
        const weekData = new Array(7).fill(0);

        const now = new Date();
        const currentDayOfWeek = now.getDay();

        // Calculate each day from Saturday (6) to Friday (5)
        for (let i = 0; i < 7; i++) {
            // i=0: Saturday (6), i=1: Sunday (0), i=2: Monday (1), etc.
            const targetDay = (i + 6) % 7;
            
            const date = new Date();
            const daysFromSaturday = targetDay - currentDayOfWeek;
            date.setDate(now.getDate() + daysFromSaturday);
            const dateStr = AppUtils.localDateKey(date);

            let completionCount = 0;
            let totalHabitsForDay = 0;

            habits.forEach(habit => {
                // Count habits that existed on this date
                const habitCreatedDate = AppUtils.localDateKey(new Date(habit.createdAt));
                if (habitCreatedDate <= dateStr) {
                    totalHabitsForDay++;
                    if (habit.completedDates.includes(dateStr)) {
                        completionCount++;
                    }
                }
            });

            weekData[i] = totalHabitsForDay > 0 ? Math.round((completionCount / totalHabitsForDay) * 100) : 0;
        }

        return weekData;
    },

    /**
     * Get category breakdown
     * @returns {Object} Object with category names and counts
     */
    getCategoryBreakdown() {
        const habits = Habits.getAll();
        const categories = {};

        habits.forEach(habit => {
            categories[habit.category] = (categories[habit.category] || 0) + 1;
        });

        return categories;
    },

    /**
     * Get activity heatmap data
     * @param {number} days - Number of days to include
     * @returns {Array} Array of objects with date and activity level
     */
    getActivityHeatmapData(days = 365) {
        const habits = Habits.getAll();
        const data = [];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = AppUtils.localDateKey(date);

            let completionCount = 0;
            habits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    completionCount++;
                }
            });

            // Calculate activity level (0-4)
            let level = 0;
            if (completionCount > 0) {
                level = Math.min(Math.ceil(completionCount / Math.max(habits.length, 1) * 4), 4);
            }

            data.push({
                date: dateStr,
                level,
                completionCount
            });
        }

        return data;
    },

    /**
     * Check if user has any data
     * @returns {boolean} True if user has habits or completions
     */
    hasData() {
        const habits = Habits.getAll();
        if (habits.length === 0) return false;

        const totalCompletions = this.getTotalCompletions();
        return totalCompletions > 0;
    },

    /**
     * Update statistics page overview cards
     */
    updateOverviewCards() {
        const totalCompletions = this.getTotalCompletions();
        const currentStreak = this.getCurrentStreak();
        const bestStreak = this.getBestStreak();
        const successRate = this.getSuccessRate();

        const totalCompletionsEl = document.getElementById('totalCompletions');
        if (totalCompletionsEl) {
            totalCompletionsEl.textContent = totalCompletions;
        }

        const currentStreakEl = document.getElementById('currentStreak');
        if (currentStreakEl) {
            const dayText = Translations.get('days');
            currentStreakEl.textContent = `${currentStreak} ${dayText}`;
        }

        const bestStreakEl = document.getElementById('bestStreak');
        if (bestStreakEl) {
            const dayText = Translations.get('days');
            bestStreakEl.textContent = `${bestStreak} ${dayText}`;
        }

        const successRateEl = document.getElementById('successRate');
        if (successRateEl) {
            successRateEl.textContent = `${successRate}%`;
        }
    },

    /**
     * Update achievements section based on real data
     */
    updateAchievements() {
        const currentStreak = this.getCurrentStreak();
        const bestStreak = this.getBestStreak();
        const habits = Habits.getAll();
        const totalCompletions = this.getTotalCompletions();

        // Streak 7 days
        const streak7Card = document.querySelector('.achievement-card:nth-child(1)');
        if (streak7Card) {
            if (bestStreak >= 7) {
                streak7Card.classList.add('unlocked');
                streak7Card.classList.remove('locked');
                streak7Card.querySelector('.achievement-icon').classList.remove('locked');
            } else {
                streak7Card.classList.remove('unlocked');
                streak7Card.classList.add('locked');
                streak7Card.querySelector('.achievement-icon').classList.add('locked');
            }
        }

        // First habit
        const firstHabitCard = document.querySelector('.achievement-card:nth-child(2)');
        if (firstHabitCard) {
            if (habits.length > 0) {
                firstHabitCard.classList.add('unlocked');
                firstHabitCard.classList.remove('locked');
                firstHabitCard.querySelector('.achievement-icon').classList.remove('locked');
            } else {
                firstHabitCard.classList.remove('unlocked');
                firstHabitCard.classList.add('locked');
                firstHabitCard.querySelector('.achievement-icon').classList.add('locked');
            }
        }

        // Streak 30 days
        const streak30Card = document.querySelector('.achievement-card:nth-child(3)');
        if (streak30Card) {
            if (bestStreak >= 30) {
                streak30Card.classList.add('unlocked');
                streak30Card.classList.remove('locked');
                streak30Card.querySelector('.achievement-icon').classList.remove('locked');
            } else {
                streak30Card.classList.remove('unlocked');
                streak30Card.classList.add('locked');
                streak30Card.querySelector('.achievement-icon').classList.add('locked');
            }
        }

        // Perfect week (7 days with 100% completion)
        const perfectWeekCard = document.querySelector('.achievement-card:nth-child(4)');
        if (perfectWeekCard) {
            const weeklyData = this.getWeeklyComparison();
            const hasPerfectWeek = weeklyData.thisWeek.some(day => day === 100) || 
                                   weeklyData.lastWeek.some(day => day === 100);
            
            if (hasPerfectWeek) {
                perfectWeekCard.classList.add('unlocked');
                perfectWeekCard.classList.remove('locked');
                perfectWeekCard.querySelector('.achievement-icon').classList.remove('locked');
            } else {
                perfectWeekCard.classList.remove('unlocked');
                perfectWeekCard.classList.add('locked');
                perfectWeekCard.querySelector('.achievement-icon').classList.add('locked');
            }
        }
    },

    /**
     * Show empty state if no data
     */
    showEmptyState() {
        const chartsGrid = document.querySelector('.charts-grid');
        const achievementsSection = document.querySelector('.achievements-section');
        
        if (chartsGrid) {
            chartsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>${Translations.get('no_stats_data')}</h3>
                    <p>${Translations.get('no_stats_desc')}</p>
                </div>
            `;
        }

        if (achievementsSection) {
            achievementsSection.style.display = 'none';
        }

        // Reset overview cards
        const totalCompletionsEl = document.getElementById('totalCompletions');
        if (totalCompletionsEl) totalCompletionsEl.textContent = '0';

        const currentStreakEl = document.getElementById('currentStreak');
        if (currentStreakEl) {
            const dayText = Translations.get('days');
            currentStreakEl.textContent = `0 ${dayText}`;
        }

        const bestStreakEl = document.getElementById('bestStreak');
        if (bestStreakEl) {
            const dayText = Translations.get('days');
            bestStreakEl.textContent = `0 ${dayText}`;
        }

        const successRateEl = document.getElementById('successRate');
        if (successRateEl) successRateEl.textContent = '0%';
    },

    /**
     * Initialize statistics page
     */
    init() {
        if (!window.location.pathname.includes('statistics')) return;

        if (!this.hasData()) {
            this.showEmptyState();
            return;
        }

        this.updateOverviewCards();
        this.updateAchievements();

        // Setup month filter event listener
        const monthFilter = document.getElementById('monthFilter');
        if (monthFilter) {
            monthFilter.addEventListener('change', () => {
                // Destroy and reinitialize monthly progress chart
                if (Charts.charts.monthlyProgress) {
                    Charts.charts.monthlyProgress.destroy();
                }
                Charts.initMonthlyProgress();
            });
        }
    }
};
