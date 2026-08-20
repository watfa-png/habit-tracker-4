// ============================================
// Habit Tracker - Translations Module
// ============================================

/**
 * Translations Module - Handles multi-language support
 * Supports Arabic (RTL) and English (LTR)
 */

const Translations = {
    // Translation data
    translations: {
        ar: {
            // Landing Page
            tagline: 'تتبع عاداتك اليومية',
            hero_title: 'ابنِ عادات أفضل، حياة أفضل',
            hero_subtitle: 'تطبيق احترافي لتتبع عاداتك اليومية مع إحصائيات متقدمة ونظام تحفيزي',
            login_btn: 'ابدأ الآن',
            learn_more: 'تعرف على المزيد',
            features_title: 'المميزات الرئيسية',
            feature1_title: 'إحصائيات متقدمة',
            feature1_desc: 'تتبع تقدمك مع رسوم بيانية تفاعلية وإحصائيات مفصلة',
            feature2_title: 'نظام السلاسل',
            feature2_desc: 'حافظ على سلسلة إنجازاتك وحقق أطول سلسلة ممكنة',
            feature3_title: 'نظام المستويات',
            feature3_desc: 'اكسب نقاط XP مع كل إنجاز وتقدم في المستويات',
            feature4_title: 'تقويم تفاعلي',
            feature4_desc: 'عرض نشاطك اليومي مع خريطة حرارية مثل GitHub',
            feature5_title: 'جدولة مرنة',
            feature5_desc: 'أضف وقتًا تفضيليًا لكل عادة ونظّم خطتك اليومية بوضوح',
            feature6_title: 'الوضع الداكن',
            feature6_desc: 'تصميم عصري مع دعم كامل للوضع الداكن والفاتح',
            
            username: 'اسم المستخدم',
            no_account: 'ليس لديك حساب؟',
            
            // Dashboard
            dashboard: 'لوحة التحكم',
            calendar: 'التقويم',
            statistics: 'الإحصائيات',
            settings: 'الإعدادات',
            add_habit: 'إضافة عادة جديدة',
            dark_mode: 'الوضع الداكن',
            logout: 'تسجيل الخروج',
            commitment_rate: 'نسبة الالتزام',
            completed_habits: 'العادات المكتملة',
            longest_streak: 'أطول سلسلة',
            total_habits: 'إجمالي العادات',
            xp_level: 'مستوى XP',
            active_days: 'الأيام النشطة',
            from_last_week: 'من الأسبوع الماضي',
            today: 'اليوم',
            days: 'أيام',
            active: 'نشطة',
            this_month: 'هذا الشهر',
            weekly_progress: 'التقدم الأسبوعي',
            habit_distribution: 'توزيع العادات',
            daily_streak: 'سلسلة الأيام المتتالية',
            last_7_days: 'آخر 7 أيام',
            last_30_days: 'آخر 30 يوم',
            today_habits: 'عادات اليوم',
            all: 'الكل',
            daily: 'يومي',
            weekly: 'أسبوعي',
            completed: 'مكتمل',
            pending: 'قيد الانتظار',
            
            // Add Habit Modal
            add_new_habit: 'إضافة عادة جديدة',
            habit_name: 'اسم العادة',
            description: 'الوصف',
            category: 'التصنيف',
            health: 'الصحة',
            fitness: 'اللياقة',
            learning: 'التعلم',
            productivity: 'الإنتاجية',
            mindfulness: 'الوعي',
            other: 'أخرى',
            frequency: 'التكرار',
            monthly: 'شهري',
            icon: 'الأيقونة',
            color: 'اللون',
            goal: 'الهدف',
            reminder: 'التذكير',
            cancel: 'إلغاء',
            save: 'حفظ',
            
            // Statistics
            stats_subtitle: 'تحليل شامل لتقدمك وإنجازاتك',
            total_completions: 'إجمالي الإنجازات',
            current_streak: 'السلسلة الحالية',
            best_streak: 'أفضل سلسلة',
            success_rate: 'معدل النجاح',
            monthly_progress: 'التقدم الشهري',
            current_month: 'الشهر الحالي',
            last_month: 'الشهر الماضي',
            last_3_months: 'آخر 3 أشهر',
            habit_performance: 'أداء العادات',
            category_breakdown: 'توزيع التصنيفات',
            weekly_comparison: 'مقارنة أسبوعية',
            activity_heatmap: 'خريطة النشاط',
            less: 'أقل',
            more: 'أكثر',
            achievements: 'الإنجازات',
            streak_7: 'سلسلة 7 أيام',
            streak_7_desc: 'أكمل عاداتك لمدة 7 أيام متتالية',
            first_habit: 'أول عادة',
            first_habit_desc: 'أنشئ عادتك الأولى',
            streak_30: 'سلسلة 30 يوم',
            streak_30_desc: 'أكمل عاداتك لمدة 30 يوم متتالية',
            perfect_week: 'أسبوع مثالي',
            perfect_week_desc: 'أكمل جميع عاداتك لأسبوع كامل',
            
            // Calendar
            calendar_subtitle: 'عرض نشاطك اليومي والشهري',
            saturday: 'السبت',
            sunday: 'الأحد',
            monday: 'الإثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة',
            day_details: 'تفاصيل اليوم',
            selected_date: 'التاريخ المحدد',
            completion_rate: 'نسبة الإنجاز',
            
            // Settings
            settings_subtitle: 'تخصيص تجربتك في التطبيق',
            appearance: 'المظهر',
            dark_mode_desc: 'تفعيل الوضع الداكن للراحة',
            language: 'اللغة',
            language_desc: 'اختر لغة التطبيق المفضلة',
            account: 'الملف المحلي',
            email: 'البريد الإلكتروني',
            edit: 'تعديل',
            data: 'البيانات',
            export_data: 'تصدير البيانات',
            export_data_desc: 'تصدير بياناتك كملف CSV أو PDF',
            delete_account: 'حذف البيانات المحلية',
            delete_account_desc: 'حذف حسابك وجميع بياناتك',
            delete: 'حذف',
            about: 'حول التطبيق',
            version: 'الإصدار',
            edit_username: 'تعديل اسم المستخدم',
            new_username: 'اسم المستخدم الجديد',
            
            manage_users: 'إدارة المستخدمين',
            all_roles: 'جميع الأدوار',
            actions: 'الإجراءات',
            add_new_user: 'إضافة مستخدم جديد',
            edit_user: 'تعديل المستخدم',

            // Motivational Quotes
            motivational_quotes: [
                'استمر، فالنتائج العظيمة لا تولد في يوم واحد.',
                'كل خطوة صغيرة تقربك من هدفك الكبير.',
                'لا تتوقف؛ النجاح يحب من يصرّ على المحاولة.',
                'ما تزرعه اليوم، ستجنيه غدًا.',
                'الثبات أقوى من الحماس المؤقت.',
                'النتائج تحتاج وقتًا، فلا تستعجلها.',
                'كل يوم تلتزم فيه هو انتصار جديد.',
                'النجاح ليس صدفة، بل عادة من الاستمرار.',
                'الطريق الطويل يبدأ بخطوة، وينتهي بالإصرار.',
                'قد لا ترى التغيير اليوم، لكنك تبنيه كل يوم.',
                'لا تدع التعب يقنعك بالتوقف، فالراحة تأتي بعد الإنجاز.',
                'الإنجازات الكبيرة هي حصيلة الجهود الصغيرة المتكررة.',
                'كن صبورًا، فالأشياء الجميلة تحتاج وقتًا لتنمو.',
                'استمر حتى يصبح ما كان صعبًا أمرًا معتادًا.',
                'لا تقارن بدايتك بنهاية شخص آخر.',
                'كل مرة تقاوم فيها الاستسلام، تصبح أقوى.',
                'النجاح مكافأة من لا ينسحب.',
                'لا تبحث عن الطريق السهل، بل عن الإرادة القوية.',
                'اليوم الذي تظنه بلا فائدة، قد يكون سبب نجاحك غدًا.',
                'لا تترك حلمك بسبب يوم سيئ.'
            ],
            motivational_continue: 'متابعة'
        },
        en: {
            // Landing Page
            tagline: 'Track Your Daily Habits',
            hero_title: 'Build Better Habits, Build a Better Life',
            hero_subtitle: 'A professional habit tracking app with advanced statistics and motivational system',
            login_btn: 'Start now',
            learn_more: 'Learn More',
            features_title: 'Key Features',
            feature1_title: 'Advanced Statistics',
            feature1_desc: 'Track your progress with interactive charts and detailed statistics',
            feature2_title: 'Streak System',
            feature2_desc: 'Maintain your achievement streak and achieve the longest streak possible',
            feature3_title: 'Level System',
            feature3_desc: 'Earn XP points with every achievement and progress through levels',
            feature4_title: 'Interactive Calendar',
            feature4_desc: 'View your daily activity with a GitHub-style heatmap',
            feature5_title: 'Flexible scheduling',
            feature5_desc: 'Add a preferred time to each habit and keep your day organized',
            feature6_title: 'Dark Mode',
            feature6_desc: 'Modern design with full dark and light mode support',
            
            username: 'Username',
            no_account: "Don't have an account?",
            
            // Dashboard
            dashboard: 'Dashboard',
            calendar: 'Calendar',
            statistics: 'Statistics',
            settings: 'Settings',
            add_habit: 'Add New Habit',
            dark_mode: 'Dark Mode',
            logout: 'Logout',
            commitment_rate: 'Commitment Rate',
            completed_habits: 'Completed Habits',
            longest_streak: 'Longest Streak',
            total_habits: 'Total Habits',
            xp_level: 'XP Level',
            active_days: 'Active Days',
            from_last_week: 'from last week',
            today: 'Today',
            days: 'days',
            active: 'active',
            this_month: 'this month',
            weekly_progress: 'Weekly Progress',
            habit_distribution: 'Habit Distribution',
            daily_streak: 'Daily Streak',
            last_7_days: 'Last 7 days',
            last_30_days: 'Last 30 days',
            today_habits: 'Today\'s Habits',
            all: 'All',
            daily: 'Daily',
            weekly: 'Weekly',
            completed: 'Completed',
            pending: 'Pending',
            
            // Add Habit Modal
            add_new_habit: 'Add New Habit',
            habit_name: 'Habit Name',
            description: 'Description',
            category: 'Category',
            health: 'Health',
            fitness: 'Fitness',
            learning: 'Learning',
            productivity: 'Productivity',
            mindfulness: 'Mindfulness',
            other: 'Other',
            frequency: 'Frequency',
            monthly: 'Monthly',
            icon: 'Icon',
            color: 'Color',
            goal: 'Goal',
            reminder: 'Reminder',
            cancel: 'Cancel',
            save: 'Save',
            
            // Statistics
            stats_subtitle: 'Comprehensive analysis of your progress and achievements',
            total_completions: 'Total Completions',
            current_streak: 'Current Streak',
            best_streak: 'Best Streak',
            success_rate: 'Success Rate',
            monthly_progress: 'Monthly Progress',
            current_month: 'Current Month',
            last_month: 'Last Month',
            last_3_months: 'Last 3 Months',
            habit_performance: 'Habit Performance',
            category_breakdown: 'Category Breakdown',
            weekly_comparison: 'Weekly Comparison',
            activity_heatmap: 'Activity Heatmap',
            less: 'Less',
            more: 'More',
            achievements: 'Achievements',
            streak_7: '7 Day Streak',
            streak_7_desc: 'Complete your habits for 7 consecutive days',
            first_habit: 'First Habit',
            first_habit_desc: 'Create your first habit',
            streak_30: '30 Day Streak',
            streak_30_desc: 'Complete your habits for 30 consecutive days',
            perfect_week: 'Perfect Week',
            perfect_week_desc: 'Complete all your habits for a full week',
            
            // Calendar
            calendar_subtitle: 'View your daily and monthly activity',
            saturday: 'Saturday',
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            day_details: 'Day Details',
            selected_date: 'Selected Date',
            completion_rate: 'Completion Rate',
            
            // Settings
            settings_subtitle: 'Customize your app experience',
            appearance: 'Appearance',
            dark_mode_desc: 'Enable dark mode for comfort',
            language: 'Language',
            language_desc: 'Choose your preferred app language',
            account: 'Local profile',
            email: 'Email',
            edit: 'Edit',
            data: 'Data',
            export_data: 'Export Data',
            export_data_desc: 'Export your data as CSV or PDF file',
            delete_account: 'Delete local data',
            delete_account_desc: 'Delete your account and all your data',
            delete: 'Delete',
            about: 'About',
            version: 'Version',
            edit_username: 'Edit Username',
            new_username: 'New Username',
            
            manage_users: 'Manage Users',
            all_roles: 'All Roles',
            actions: 'Actions',
            add_new_user: 'Add New User',
            edit_user: 'Edit User',

            // Motivational Quotes
            motivational_quotes: [
                'Keep going. Great results are not built in a single day.',
                'Every small step brings you closer to your big goal.',
                'Never stop. Success belongs to those who keep trying.',
                'What you plant today, you will harvest tomorrow.',
                'Consistency is stronger than temporary motivation.',
                'Great results take time. Don\'t rush the process.',
                'Every day you stay committed is another victory.',
                'Success is not luck; it is the habit of persistence.',
                'Every long journey begins with one step and ends with determination.',
                'You may not see progress today, but you\'re building it every day.',
                'Don\'t let exhaustion convince you to quit. Rest comes after achievement.',
                'Great achievements are the result of small, repeated efforts.',
                'Be patient. Beautiful things take time to grow.',
                'Keep going until what once felt difficult becomes natural.',
                'Don\'t compare your beginning to someone else\'s finish.',
                'Every time you resist giving up, you become stronger.',
                'Success rewards those who refuse to quit.',
                'Don\'t look for the easy path; build a stronger will.',
                'The day that feels useless may become the reason for tomorrow\'s success.',
                'Don\'t give up on your dream because of one bad day.'
            ],
            motivational_continue: 'Continue'
        }
    },

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {string} lang - Language code (default: current language)
     * @returns {string} Translated text
     */
    get(key, lang = null) {
        const language = lang || Storage.getLanguage() || 'ar';
        return this.translations[language]?.[key] || this.translations['ar'][key] || key;
    },

    /**
     * Set language
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        Storage.setLanguage(lang);
        this.applyLanguage(lang);
    },

    /**
     * Apply language to the page
     * @param {string} lang - Language code
     */
    applyLanguage(lang) {
        // Set HTML dir and lang attributes
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
        
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.get(key, lang);
            if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else {
                element.textContent = translation;
            }
        });
        
        // Update language toggle button text
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            const span = langToggle.querySelector('span');
            if (span) {
                span.textContent = lang === 'ar' ? 'English' : 'العربية';
            }
        }
    },

    /**
     * Initialize translations on page load
     */
    init() {
        const currentLang = Storage.getLanguage() || 'ar';
        this.applyLanguage(currentLang);
    }
};
