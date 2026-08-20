// ============================================
// Habit Tracker - Charts Module
// ============================================

/**
 * Charts Module - Handles all Chart.js visualizations
 */

const Charts = {
    charts: {},

    /**
     * Initialize weekly progress chart
     */
    initWeeklyProgress() {
        const ctx = document.getElementById('weeklyProgressChart');
        if (!ctx) return;

        const labels = [
            Translations.get('saturday'),
            Translations.get('sunday'),
            Translations.get('monday'),
            Translations.get('tuesday'),
            Translations.get('wednesday'),
            Translations.get('thursday'),
            Translations.get('friday')
        ];

        const data = Statistics.getWeeklyProgress();

        this.charts.weeklyProgress = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: Translations.get('weekly_progress'),
                    data: data,
                    backgroundColor: 'rgba(108, 99, 255, 0.8)',
                    borderColor: 'rgba(108, 99, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    },

    /**
     * Update weekly progress chart with new data
     */
    updateWeeklyProgress() {
        if (!this.charts.weeklyProgress) return;

        const data = Statistics.getWeeklyProgress();
        this.charts.weeklyProgress.data.datasets[0].data = data;
        this.charts.weeklyProgress.update();
    },

    /**
     * Update daily streak chart with new data
     */
    updateDailyStreak() {
        if (!this.charts.dailyStreak) return;

        const dailyData = Statistics.getDailyCompletionData(7);
        const data = dailyData.map((d, i) => dailyData[6 - i]?.completionCount || 0);
        this.charts.dailyStreak.data.datasets[0].data = data;
        this.charts.dailyStreak.update();
    },

    /**
     * Update commitment chart with new data
     */
    updateCommitmentChart() {
        if (!this.charts.commitment) return;

        const dailyData = Statistics.getDailyCompletionData(5);
        const data = dailyData.map(d => d.completionRate);
        this.charts.commitment.data.datasets[0].data = data;
        this.charts.commitment.update();
    },

    /**
     * Update streak chart with new data
     */
    updateStreakChart() {
        if (!this.charts.streak) return;

        const dailyData = Statistics.getDailyCompletionData(5);
        const data = dailyData.map(d => d.completionCount);
        this.charts.streak.data.datasets[0].data = data;
        this.charts.streak.update();
    },

    /**
     * Update habit distribution chart with new data
     */
    updateHabitDistribution() {
        if (!this.charts.habitDistribution) return;

        const habits = Habits.getAll();
        const categories = {};
        
        habits.forEach(habit => {
            categories[habit.category] = (categories[habit.category] || 0) + 1;
        });

        const labels = Object.keys(categories).map(cat => Translations.get(cat));
        const data = Object.values(categories);
        const colors = ['#6C63FF', '#22C55E', '#FACC15', '#EF4444', '#3B82F6', '#EC4899'];

        this.charts.habitDistribution.data.labels = labels;
        this.charts.habitDistribution.data.datasets[0].data = data;
        this.charts.habitDistribution.data.datasets[0].backgroundColor = colors.slice(0, data.length);
        this.charts.habitDistribution.update();

        // Update legend
        this.renderHabitLegend(labels, colors.slice(0, data.length));
    },

    /**
     * Update all dashboard charts
     */
    updateAllDashboardCharts() {
        this.updateWeeklyProgress();
        this.updateDailyStreak();
        this.updateCommitmentChart();
        this.updateStreakChart();
        this.updateHabitDistribution();
    },

    /**
     * Initialize habit distribution chart
     */
    initHabitDistribution() {
        const ctx = document.getElementById('habitDistributionChart');
        if (!ctx) return;

        const habits = Habits.getAll();
        const categories = {};
        
        habits.forEach(habit => {
            categories[habit.category] = (categories[habit.category] || 0) + 1;
        });

        const labels = Object.keys(categories).map(cat => Translations.get(cat));
        const data = Object.values(categories);
        const colors = ['#6C63FF', '#22C55E', '#FACC15', '#EF4444', '#3B82F6', '#EC4899'];

        this.charts.habitDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });

        // Render custom legend
        this.renderHabitLegend(labels, colors.slice(0, data.length));
    },

    /**
     * Render habit legend
     */
    renderHabitLegend(labels, colors) {
        const legendContainer = document.getElementById('habitLegend');
        if (!legendContainer) return;

        legendContainer.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <span class="legend-color" style="background: ${colors[index]}"></span>
                <span>${AppUtils.escapeHtml(label)}</span>
            </div>
        `).join('');
    },

    /**
     * Initialize daily streak chart
     */
    initDailyStreak() {
        const ctx = document.getElementById('dailyStreakChart');
        if (!ctx) return;

        const labels = [];
        const data = [];
        
        // Get real completion data for last 7 days
        const habits = Habits.getAll();
        const dailyData = Statistics.getDailyCompletionData(7);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString(Translations.locale(), { day: 'numeric', month: 'short' }));
            // Use real completion count from statistics
            data.push(dailyData[6 - i]?.completionCount || 0);
        }

        this.charts.dailyStreak = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: Translations.get('daily_streak'),
                    data: data,
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6C63FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    /**
     * Initialize commitment mini chart
     */
    initCommitmentChart() {
        const ctx = document.getElementById('commitmentChart');
        if (!ctx) return;

        // Get real success rate data for last 5 days
        const dailyData = Statistics.getDailyCompletionData(5);
        const data = dailyData.map(d => d.completionRate);

        this.charts.commitment = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', ''],
                datasets: [{
                    data: data,
                    borderColor: '#6C63FF',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    },

    /**
     * Initialize streak mini chart
     */
    initStreakChart() {
        const ctx = document.getElementById('streakChart');
        if (!ctx) return;

        // Get real streak data for last 5 days
        const dailyData = Statistics.getDailyCompletionData(5);
        const data = dailyData.map(d => d.completionCount);

        this.charts.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['', '', '', '', ''],
                datasets: [{
                    data: data,
                    backgroundColor: '#EA580C',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    },

    /**
     * Initialize monthly progress chart (statistics page)
     */
    initMonthlyProgress() {
        const ctx = document.getElementById('monthlyProgressChart');
        if (!ctx) return;

        const monthFilter = document.getElementById('monthFilter');
        let days = 30;
        
        if (monthFilter) {
            const filterValue = monthFilter.value;
            if (filterValue === 'last') {
                days = 30;
            } else if (filterValue === '3months') {
                days = 90;
            }
        }

        const dailyData = Statistics.getDailyCompletionData(days);
        const labels = dailyData.map(d => d.day);
        const data = dailyData.map(d => d.completionRate);

        this.charts.monthlyProgress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: Translations.get('monthly_progress'),
                    data: data,
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Initialize habit performance chart (statistics page)
     */
    initHabitPerformance() {
        const ctx = document.getElementById('habitPerformanceChart');
        if (!ctx) return;

        const habits = Habits.getAll();
        if (habits.length === 0) {
            // Show empty state
            ctx.parentElement.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_habits_short')}</p>`;
            return;
        }

        const completionRates = Statistics.getHabitCompletionRates();
        const labels = completionRates.map(h => h.name);
        const data = completionRates.map(h => h.completionRate);

        this.charts.habitPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: Translations.get('habit_performance'),
                    data: data,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#22C55E',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Initialize category breakdown chart (statistics page)
     */
    initCategoryBreakdown() {
        const ctx = document.getElementById('categoryBreakdownChart');
        if (!ctx) return;

        const habits = Habits.getAll();
        if (habits.length === 0) {
            // Show empty state
            ctx.parentElement.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_habits_short')}</p>`;
            return;
        }

        const categories = Statistics.getCategoryBreakdown();
        const labels = Object.keys(categories).map(cat => Translations.get(cat));
        const data = Object.values(categories);
        const colors = ['#6C63FF', '#22C55E', '#FACC15', '#EF4444', '#3B82F6', '#EC4899'];

        this.charts.categoryBreakdown = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    /**
     * Initialize weekly comparison chart (statistics page)
     */
    initWeeklyComparison() {
        const ctx = document.getElementById('weeklyComparisonChart');
        if (!ctx) return;

        const weeklyData = Statistics.getWeeklyComparison();
        const habits = Habits.getAll();
        
        if (habits.length === 0) {
            // Show empty state
            ctx.parentElement.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_habits_short')}</p>`;
            return;
        }

        this.charts.weeklyComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    Translations.get('saturday'),
                    Translations.get('sunday'),
                    Translations.get('monday'),
                    Translations.get('tuesday'),
                    Translations.get('wednesday'),
                    Translations.get('thursday'),
                    Translations.get('friday')
                ],
                datasets: [{
                    label: Translations.get('this_week'),
                    data: weeklyData.thisWeek,
                    backgroundColor: 'rgba(108, 99, 255, 0.8)',
                    borderColor: '#6C63FF',
                    borderWidth: 2,
                    borderRadius: 8
                }, {
                    label: Translations.get('last_week'),
                    data: weeklyData.lastWeek,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#22C55E',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Initialize activity heatmap
     */
    initActivityHeatmap() {
        const container = document.getElementById('activityHeatmap');
        if (!container) return;

        const habits = Habits.getAll();
        if (habits.length === 0) {
            // Show empty state
            container.innerHTML = `<p class="text-center text-secondary">${Translations.get('no_activity_data')}</p>`;
            return;
        }

        const heatmapData = Statistics.getActivityHeatmapData(365);
        
        let html = '';
        heatmapData.forEach(data => {
            html += `<div class="heatmap-cell level-${data.level}" title="${data.date}: ${data.completionCount} ${Translations.get('completions')}"></div>`;
        });
        
        container.innerHTML = html;
    },

    /**
     * Initialize all charts on dashboard
     */
    initDashboard() {
        this.initWeeklyProgress();
        this.initHabitDistribution();
        this.initDailyStreak();
        this.initCommitmentChart();
        this.initStreakChart();
        
        // Force update weekly progress after initialization to ensure real data
        setTimeout(() => {
            this.updateWeeklyProgress();
        }, 100);
    },

    /**
     * Initialize all charts on statistics page
     */
    initStatistics() {
        // Only initialize if there's data
        if (!Statistics.hasData()) {
            return;
        }
        
        this.initMonthlyProgress();
        this.initHabitPerformance();
        this.initCategoryBreakdown();
        this.initWeeklyComparison();
        this.initActivityHeatmap();
    },

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    },

    /**
     * Initialize charts module
     */
    init() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('dashboard')) {
            this.initDashboard();
        } else if (currentPage.includes('statistics')) {
            this.initStatistics();
        }
    }
};
