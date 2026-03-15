/* ===================================
   COMPREHENSIVE Auto-Guided Tutorial System
   Explains EVERY element on EVERY page
   =================================== */

class ComprehensiveTutorial {
    constructor() {
        this.currentStepIndex = 0;
        this.totalSteps = 0;
        this.tutorialFlow = [];
        this.overlay = null;
        this.spotlight = null;
        this.tooltip = null;
        this.arrow = null;
        this.stepBadge = null;
        this.skipButton = null;

        // Check if tutorial should start
        this.tutorialStarted = localStorage.getItem('guidedTutorialStarted') === 'true';
        this.tutorialCompleted = localStorage.getItem('guidedTutorialCompleted') === 'true';
        this.currentPage = window.location.pathname.split('/').pop();
        this.userRole = localStorage.getItem('userRole') || 'homeowner';

        this.init();
    }

    init() {
        // Create overlay elements
        this.createOverlayElements();

        // Define complete tutorial flow
        this.defineTutorialFlow();

        // Check if we should show welcome or continue tutorial
        if (!this.tutorialCompleted) {
            if (!this.tutorialStarted) {
                this.showWelcomeModal();
            } else {
                // Continue tutorial from saved position
                this.continueFromSavedPosition();
            }
        }
    }

    createOverlayElements() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';

        // Spotlight
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tutorial-spotlight';

        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';

        // Arrow
        this.arrow = document.createElement('div');
        this.arrow.className = 'tutorial-arrow';
        this.arrow.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="#00d4e8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Step badge
        this.stepBadge = document.createElement('div');
        this.stepBadge.className = 'tutorial-step-badge';

        // Skip button
        this.skipButton = document.createElement('button');
        this.skipButton.className = 'tutorial-skip-all';
        this.skipButton.textContent = 'Skip Tutorial';
        this.skipButton.onclick = () => this.skipTutorial();

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.spotlight);
        document.body.appendChild(this.tooltip);
        document.body.appendChild(this.arrow);
        document.body.appendChild(this.stepBadge);
        document.body.appendChild(this.skipButton);
    }

    defineTutorialFlow() {
        // COMPREHENSIVE TUTORIAL - Every element explained!
        this.tutorialFlow = [
            // ============ DASHBOARD HOME - ALL ELEMENTS ============
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.dashboard-header',
                title: 'Welcome to Your Dashboard! 👋',
                description: 'This is your home energy dashboard - your control center for monitoring energy usage, solar generation, and savings.',
                action: 'Start exploring your dashboard',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.dashboard-title',
                title: 'Dashboard Title',
                description: 'This title shows which page you\'re currently on. You\'re on the Home Energy Dashboard.',
                action: 'Note the page title',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.notification-btn',
                title: 'Notifications Bell 🔔',
                description: 'Click here to see your alerts and notifications. The red badge shows you have 3 unread notifications.',
                action: 'Check for important updates',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.profile-btn',
                title: 'Profile Menu',
                description: 'Access your account settings, preferences, and profile information from this button.',
                action: 'Manage your account',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-section',
                title: 'Energy Summary Cards',
                description: 'These four cards give you an instant snapshot of your energy status. Let\'s explore each one!',
                action: 'View your energy metrics',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(1)',
                title: 'Solar Generation Card ☀️',
                description: 'Shows how much solar energy you\'re generating RIGHT NOW. This updates in real-time throughout the day. Currently generating 12.4 kWh!',
                action: 'Check your solar output',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.card-change.positive',
                title: 'Comparison Indicator',
                description: 'The green "+8% vs yesterday" shows you\'re generating 8% more solar than yesterday. Green means good!',
                action: 'Compare with previous day',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(2)',
                title: 'Grid Consumption Card ⚡',
                description: 'Monitor how much electricity you\'re drawing from the power grid. Currently consuming 5.2 kWh from grid.',
                action: 'See your grid usage',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(3)',
                title: 'Battery Status Card 🔋',
                description: 'Check your battery charge level and status. Currently at 85% and charging. This stores excess solar energy for later use!',
                action: 'View battery health',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(4)',
                title: 'Monthly Savings Card 💰',
                description: 'Track how much money you\'re saving each month with solar energy. You\'ve saved ₹284 this month - up 15% from last month!',
                action: 'View your monthly savings',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-section',
                title: 'Energy Flow Visualization',
                description: 'This diagram shows how energy flows in real-time from solar panels through your home, battery, and grid.',
                action: 'Understand your energy flow',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.solar-node',
                title: 'Solar Source ☀️',
                description: 'Your solar panels are generating 12.4 kW right now. This is your primary clean energy source!',
                action: 'See solar generation',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-arrow:nth-of-type(2)',
                title: 'Energy Flow Direction',
                description: 'These arrows show the direction energy is flowing from source to destination.',
                action: 'Follow the energy path',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.home-node',
                title: 'Home Consumption 🏠',
                description: 'Your home is currently using 7.2 kW of power for all your appliances, lights, and devices.',
                action: 'Monitor home usage',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.battery-node',
                title: 'Battery Storage 🔋',
                description: 'Excess solar energy is being stored in your battery at 3.0 kW rate for use when the sun isn\'t shining.',
                action: 'Check battery charging',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.grid-node',
                title: 'Grid Connection ⚡',
                description: 'Surplus energy (2.2 kW) is being exported to the grid, earning you credits! Or import when you need more.',
                action: 'See grid exchange',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.actions-section',
                title: 'Quick Actions Hub',
                description: 'Access ALL major features of the app from these quick action cards. Let\'s explore each feature!',
                action: 'Browse available features',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(1)',
                title: '1. Energy Monitoring 📊',
                description: 'View detailed charts, graphs, and analytics of your energy usage and generation patterns over time.',
                action: 'Access detailed analytics',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(2)',
                title: '2. Virtual Solar Plant ☀️',
                description: 'Join the community solar program to share renewable energy with neighbors and earn community credits.',
                action: 'Explore community solar',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(3)',
                title: '3. Subscription Plans ✨',
                description: 'Manage your energy subscription plan. View current plan, upgrade, downgrade, or switch plans.',
                action: 'View plan options',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(4)',
                title: '4. Billing & DISCOM 📄',
                description: 'View your electricity bills, payment history, and DISCOM (Distribution Company) integration details.',
                action: 'Check billing details',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(5)',
                title: '5. AI Plan Recommendation 🤖',
                description: 'Get smart, AI-powered recommendations for the best energy plan based on YOUR specific usage patterns.',
                action: 'Get personalized suggestions',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(6)',
                title: '6. Virtual Solar Subscription ☀️',
                description: 'View and manage your subscription to the community solar plant. Track your guaranteed monthly clean energy units.',
                action: 'Plan your solar setup',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(7)',
                title: '7. Alerts & Notifications 🔔',
                description: 'Manage notification preferences, set up custom alerts, and view system warnings and updates.',
                action: 'Configure alerts',
                arrow: 'down'
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(8)',
                title: '8. Profile & Settings ⚙️',
                description: 'Update personal information, configure system settings, manage preferences, and customize your app experience.',
                action: 'Customize your account',
                arrow: 'down'
            },

            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(1)',
                title: 'Ready to Explore Energy Monitoring?',
                description: 'Now let\'s visit the Energy Monitoring page to see detailed analytics and charts. Click this card to continue!',
                action: 'Click to continue the tour',
                arrow: 'down',
                nextPageTrigger: '../homeowner/energy-monitoring.html'
            },

            // ============ ENERGY MONITORING PAGE - ALL ELEMENTS ============
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.back-btn',
                title: 'Back Button ←',
                description: 'Use this button to return to the dashboard anytime. Always available in the top-left for easy navigation.',
                action: 'Note the back button',
                arrow: 'right'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.dashboard-header',
                title: 'Energy Monitoring Page 📊',
                description: 'Welcome to Energy Monitoring! This page provides detailed analytics, charts, and breakdowns of your energy data.',
                action: 'Explore energy analytics',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.filter-section',
                title: 'Time Period Filters',
                description: 'Switch between different time scales to analyze your energy data: hourly, daily, or monthly views.',
                action: 'Choose your timeframe',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.filter-btn:nth-child(1)',
                title: 'Hourly View Button',
                description: 'Click to see energy usage broken down by hour. Perfect for identifying peak usage times during the day. Currently active!',
                action: 'View hourly patterns',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.filter-btn:nth-child(2)',
                title: 'Daily View Button',
                description: 'Switch to daily view to compare energy usage across different days and spot weekly patterns.',
                action: 'Analyze daily trends',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.filter-btn:nth-child(3)',
                title: 'Monthly View Button',
                description: 'Review monthly consumption to track seasonal variations and long-term trends in your energy usage.',
                action: 'Check monthly statistics',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.graph-section',
                title: 'Live Energy Usage Chart 📈',
                description: 'This interactive chart shows your energy consumption throughout the selected time period. Updates in real-time!',
                action: 'Analyze usage patterns',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.section-title',
                title: 'Section Title',
                description: 'Each section has a clear title showing what data is displayed below.',
                action: 'Read section titles',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.chart-container',
                title: 'Interactive Bar Chart',
                description: 'Each bar represents energy usage at different times. The height shows consumption level. Hover for exact values!',
                action: 'Explore the chart',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.hour-bar:nth-child(1)',
                title: 'Midnight Usage (00:00)',
                description: 'Shows 3.2 kW usage at midnight - typically low as most appliances are off and everyone is sleeping.',
                action: 'See nighttime usage',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.hour-bar:nth-child(4)',
                title: 'Noon Usage (12:00)',
                description: 'Peak daytime usage at 5.2 kW - AC, appliances, and devices all running during midday.',
                action: 'Check peak hours',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.hour-bar.active',
                title: 'Current Hour (16:00)',
                description: 'The highlighted bar shows the current hour (4 PM) with 4.6 kW usage. This updates every hour!',
                action: 'See real-time data',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-section',
                title: 'Energy Source Breakdown 🔌',
                description: 'See exactly where your energy comes from - solar panels, battery storage, or grid. Understand your energy mix!',
                action: 'View energy sources',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-card:nth-child(1)',
                title: 'Solar Energy Card ☀️',
                description: 'Shows solar contribution: 8.4 kWh consumed from solar panels. The progress bar shows 68% of total usage!',
                action: 'Check solar contribution',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-icon',
                title: 'Source Icon',
                description: 'Each source has a unique icon - sun for solar, lightning for grid, battery for storage.',
                action: 'Identify energy sources',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.progress-bar',
                title: 'Progress Bar Indicator',
                description: 'Visual representation of percentage. The filled portion shows what percentage of total energy comes from this source.',
                action: 'See percentage visually',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-percentage',
                title: 'Percentage Text',
                description: 'Exact percentage displayed as text. "68% of total" means over half your energy is clean solar!',
                action: 'Read exact percentage',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-card:nth-child(2)',
                title: 'Grid Energy Card ⚡',
                description: 'Electricity drawn from the power grid when solar and battery aren\'t sufficient. Shows kWh and percentage.',
                action: 'Monitor grid dependency',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.source-card:nth-child(3)',
                title: 'Battery Energy Card 🔋',
                description: 'Energy consumed from your battery storage. This uses stored solar energy from earlier when production was high.',
                action: 'Track battery usage',
                arrow: 'down'
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.back-btn',
                title: 'Return to Dashboard',
                description: 'Excellent! You\'ve seen all the energy monitoring features. Let\'s go back to explore more of the dashboard!',
                action: 'Click back to continue',
                arrow: 'right',
                nextPageTrigger: '/pages/homeowner/dashboard-home.html'
            },

            // ============ BACK TO DASHBOARD - EXPLORE MORE FEATURES ============
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(3)',
                title: 'Subscription Plans Feature',
                description: 'Let\'s explore the Subscription Plans page next to see plan details and options.',
                action: 'Click to view plans',
                arrow: 'down',
                nextPageTrigger: '../shared/subscription-plans.html'
            },

            // ============ HELP & SUPPORT PAGE - ALL ELEMENTS ============
            {
                page: '../shared/help-support.html',
                element: '.dashboard-header',
                title: 'Help & Support Page 🆘',
                description: 'Welcome to Help & Support! Get assistance, browse FAQs, and submit support tickets here.',
                action: 'Explore support options',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.contact-grid',
                title: 'Contact Methods',
                description: 'Three ways to reach our support team: Email, Phone, or Live Chat. Choose what works best for you!',
                action: 'See contact options',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.contact-card:nth-child(1)',
                title: 'Email Support 📧',
                description: 'Send us an email at support@smartenergy.com. Great for detailed questions or non-urgent issues.',
                action: 'Note email address',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.contact-card:nth-child(2)',
                title: 'Phone Support 📞',
                description: 'Call us at 1-800-SMART-NRG (1-800-762-7863). Available Monday-Friday, 8 AM - 8 PM EST.',
                action: 'Note phone number',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.contact-card:nth-child(3)',
                title: 'Live Chat 💬',
                description: 'Get instant help with Live Chat! Available 24/7 for immediate assistance with urgent issues.',
                action: 'Start a conversation',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.faq-section',
                title: 'Frequently Asked Questions ❓',
                description: 'Find quick answers to common questions. Click any question to expand and see the answer!',
                action: 'Browse FAQs',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.faq-item:nth-child(1)',
                title: 'FAQ #1 - Solar Generation',
                description: '"How do I monitor my solar generation?" - Click to expand and see the detailed answer.',
                action: 'Read the answer',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.ticket-section',
                title: 'Support Ticket System 🎫',
                description: 'Submit detailed issues or feature requests that require investigation or technical support from our team.',
                action: 'Submit a ticket',
                arrow: 'down'
            },
            {
                page: '../shared/help-support.html',
                element: '.ticket-form',
                title: 'Ticket Submission Form',
                description: 'Fill out this form with your issue details. Include as much information as possible for faster resolution!',
                action: 'Complete the form',
                arrow: 'down'
            }
        ];

        this.totalSteps = this.tutorialFlow.length;
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'tutorial-welcome-modal show';
        modal.innerHTML = `
            <div class="welcome-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"
                          stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1 class="welcome-title">Welcome to EnergyNest!</h1>
            <p class="welcome-message">
                Would you like a COMPLETE guided tour? We'll explain EVERY feature and element on EVERY page,
                step by step, with arrows and helpful tips along the way.
            </p>
            <p class="welcome-stats">📊 <strong>${this.totalSteps} total steps</strong> covering the entire app!</p>
            <div class="welcome-buttons">
                <button class="welcome-btn secondary" onclick="comprehensiveTutorial.skipTutorial()">
                    Skip for Now
                </button>
                <button class="welcome-btn primary" onclick="comprehensiveTutorial.startGuidedTour()">
                    Start Complete Tour
                </button>
            </div>
        `;

        // Add dark overlay
        this.overlay.classList.add('active');
        document.body.appendChild(modal);
    }

    startGuidedTour() {
        // Remove welcome modal
        const modal = document.querySelector('.tutorial-welcome-modal');
        if (modal) modal.remove();

        // Mark tutorial as started
        localStorage.setItem('guidedTutorialStarted', 'true');
        this.tutorialStarted = true;

        // Start from step 0
        this.currentStepIndex = 0;
        localStorage.setItem('tutorialStepIndex', '0');

        // Show first step
        this.showCurrentStep();
    }

    continueFromSavedPosition() {
        // Get saved step index
        const savedIndex = parseInt(localStorage.getItem('tutorialStepIndex') || '0');
        this.currentStepIndex = savedIndex;

        // Check if we're on the right page
        const currentStep = this.tutorialFlow[this.currentStepIndex];
        if (currentStep && currentStep.page === this.currentPage) {
            // Continue tutorial
            this.showCurrentStep();
        }
    }

    showCurrentStep() {
        if (this.currentStepIndex >= this.totalSteps) {
            this.completeTutorial();
            return;
        }

        const step = this.tutorialFlow[this.currentStepIndex];

        // Check if we're on the correct page
        if (step.page !== this.currentPage) {
            // Wait for page navigation
            return;
        }

        const element = document.querySelector(step.element);
        if (!element) {
            // Element not found, skip to next
            console.warn(`Tutorial element not found: ${step.element}`);
            this.currentStepIndex++;
            this.showCurrentStep();
            return;
        }

        // Show overlay and UI
        this.overlay.classList.add('active');
        this.stepBadge.classList.add('show');
        this.skipButton.classList.add('show');

        // Reset previous elevation
        this.resetElevation();

        // Elevate current element to be clickable/visible above overlay
        this.elevateElement(element);

        // Update step badge
        this.stepBadge.innerHTML = `
            <span class="step-badge-progress">${this.currentStepIndex + 1}</span>
            Step ${this.currentStepIndex + 1} of ${this.totalSteps}
        `;

        // Position spotlight
        this.positionSpotlight(element);

        // Position and show arrow
        this.positionArrow(element, step.arrow);

        // Show tooltip
        this.showTooltip(step, element);

        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Save progress
        localStorage.setItem('tutorialStepIndex', this.currentStepIndex.toString());
    }

    elevateElement(element) {
        // Store original styles
        this.currentElevatedElement = element;
        this.originalStyles = {
            zIndex: element.style.zIndex,
            position: element.style.position,
            pointerEvents: element.style.pointerEvents
        };

        // Apply elevation styles
        // Z-index 10005 is above overlay (10000) and spotlight (10001)
        element.style.zIndex = '10005';

        // Ensure position is relative or absolute so z-index applies
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
            element.style.position = 'relative';
        }

        // Ensure it's clickable
        element.style.pointerEvents = 'auto';
    }

    resetElevation() {
        if (this.currentElevatedElement && this.originalStyles) {
            this.currentElevatedElement.style.zIndex = this.originalStyles.zIndex;
            this.currentElevatedElement.style.position = this.originalStyles.position;
            this.currentElevatedElement.style.pointerEvents = this.originalStyles.pointerEvents;

            this.currentElevatedElement = null;
            this.originalStyles = null;
        }
    }

    positionSpotlight(element) {
        const rect = element.getBoundingClientRect();
        const padding = 12;

        this.spotlight.style.left = (rect.left - padding) + 'px';
        this.spotlight.style.top = (rect.top - padding) + 'px';
        this.spotlight.style.width = (rect.width + padding * 2) + 'px';
        this.spotlight.style.height = (rect.height + padding * 2) + 'px';
        this.spotlight.style.display = 'block';
    }

    positionArrow(element, direction) {
        const rect = element.getBoundingClientRect();
        const arrowSize = 60;

        this.arrow.className = `tutorial-arrow ${direction}`;

        let left, top;
        // Default positioning
        switch (direction) {
            case 'down':
                left = rect.left + (rect.width / 2) - (arrowSize / 2);
                top = rect.top - arrowSize - 10;
                break;
            case 'up':
                left = rect.left + (rect.width / 2) - (arrowSize / 2);
                top = rect.bottom + 10;
                break;
            case 'left':
                left = rect.right + 10;
                top = rect.top + (rect.height / 2) - (arrowSize / 2);
                break;
            case 'right':
                left = rect.left - arrowSize - 10;
                top = rect.top + (rect.height / 2) - (arrowSize / 2);
                break;
            default: // Default to down
                left = rect.left + (rect.width / 2) - (arrowSize / 2);
                top = rect.top - arrowSize - 10;
        }

        // Adjust for viewport edges
        if (top < 10) top = rect.bottom + 10; // Flip to bottom if too close to top
        if (top > window.innerHeight - 70) top = rect.top - arrowSize - 10; // Flip to top if too close to bottom

        this.arrow.style.left = left + 'px';
        this.arrow.style.top = top + 'px';
        this.arrow.style.display = 'block';
    }

    showTooltip(step, element) {
        const rect = element.getBoundingClientRect();

        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 class="tooltip-title">${step.title}</h3>
            </div>
            <div class="tooltip-content">
                <p class="tooltip-description">${step.description}</p>
                <div class="tooltip-tip">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p><strong>Action:</strong> ${step.action}</p>
                </div>
            </div>
            <div class="tooltip-footer">
                <span class="tooltip-progress">${this.currentStepIndex + 1} / ${this.totalSteps}</span>
                <div class="tooltip-actions">
                    ${this.currentStepIndex > 0 ? '<button class="tooltip-btn skip" onclick="comprehensiveTutorial.previousStep()">Back</button>' : ''}
                    <button class="tooltip-btn next" onclick="comprehensiveTutorial.nextStep()">
                        ${step.nextPageTrigger ? 'Click Element to Continue' : 'Next'}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Position tooltip logic
        // First make it transparently visible to measure dimensions
        this.tooltip.style.visibility = 'hidden';
        this.tooltip.style.display = 'block';

        const tooltipRect = this.tooltip.getBoundingClientRect();

        // Calculate preferred position (below element)
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 20;

        // Check if tooltip fits below
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If not enough space below, or if explicitly requested above
        // (Default to below unless space issues)
        if (spaceBelow < tooltipRect.height + 20 && spaceAbove > tooltipRect.height + 20) {
            // Move above
            top = rect.top - tooltipRect.height - 20;
        }

        // Horizontal clamping
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));

        // Vertical clamping (final safety check)
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';

        // Make visible
        this.tooltip.style.visibility = 'visible';
    }

    nextStep() {
        this.currentStepIndex++;
        this.showCurrentStep();
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.showCurrentStep();
        }
    }

    skipTutorial() {
        // Hide all elements
        this.overlay.classList.remove('active');
        this.spotlight.style.display = 'none';
        this.tooltip.style.display = 'none';
        this.arrow.style.display = 'none';
        this.stepBadge.classList.remove('show');
        this.skipButton.classList.remove('show');

        // Remove welcome modal if present
        const modal = document.querySelector('.tutorial-welcome-modal');
        if (modal) modal.remove();

        // Mark as completed
        localStorage.setItem('guidedTutorialCompleted', 'true');
        localStorage.setItem('guidedTutorialStarted', 'false');
        localStorage.removeItem('tutorialStepIndex');

        this.tutorialCompleted = true;
    }

    completeTutorial() {
        // Hide elements
        this.overlay.classList.remove('active');
        this.spotlight.style.display = 'none';
        this.tooltip.style.display = 'none';
        this.arrow.style.display = 'none';
        this.stepBadge.classList.remove('show');
        this.skipButton.classList.remove('show');

        // Show completion badge
        const badge = document.createElement('div');
        badge.className = 'tutorial-complete-badge show';
        badge.innerHTML = `
            <div class="complete-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="complete-title">Complete Tutorial Finished! 🎉</h2>
            <p class="complete-message">Congratulations! You've explored EVERY feature of the app. You're now an expert!</p>
            <p class="complete-stats">✅ Completed all ${this.totalSteps} steps</p>
            <button class="complete-btn" onclick="this.parentElement.remove()">Start Using the App</button>
        `;
        document.body.appendChild(badge);

        // Mark as completed
        localStorage.setItem('guidedTutorialCompleted', 'true');
        localStorage.setItem('guidedTutorialStarted', 'false');
        localStorage.removeItem('tutorialStepIndex');

        this.tutorialCompleted = true;
    }

    restart() {
        localStorage.removeItem('guidedTutorialCompleted');
        localStorage.removeItem('guidedTutorialStarted');
        localStorage.removeItem('tutorialStepIndex');
        window.location.reload();
    }
}

// Initialize comprehensive tutorial
let comprehensiveTutorial;

document.addEventListener('DOMContentLoaded', () => {
    comprehensiveTutorial = new ComprehensiveTutorial();
});

// Global function to restart
function restartGuidedTutorial() {
    if (comprehensiveTutorial) {
        comprehensiveTutorial.restart();
    }
}
