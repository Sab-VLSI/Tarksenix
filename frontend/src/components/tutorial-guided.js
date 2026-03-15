/* ===================================
   Enhanced Auto-Guided Tutorial System
   Complete walkthrough with arrows and auto-navigation
   =================================== */

class GuidedTutorial {
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
        // Complete tutorial flow across all pages - COMPREHENSIVE
        this.tutorialFlow = [
            // DASHBOARD HOME - Complete walkthrough of every element
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.dashboard-header',
                title: 'Welcome to Your Dashboard! 👋',
                description: 'This is your home energy dashboard. From here, you can monitor your energy usage, solar generation, and savings.',
                action: 'Look at the top section',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.notification-btn',
                title: 'Notifications',
                description: 'Click here to see your alerts and notifications. The badge shows unread count.',
                action: 'Check for important updates',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.profile-btn',
                title: 'Profile Menu',
                description: 'Access your account settings, preferences, and profile information.',
                action: 'Manage your account',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-section',
                title: 'Energy Summary Cards',
                description: 'These four cards give you an instant overview of your energy status.',
                action: 'View your energy metrics',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(1)',
                title: 'Solar Generation',
                description: 'See how much solar energy you\'re generating right now. This updates in real-time throughout the day!',
                action: 'Check your solar output',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(2)',
                title: 'Grid Consumption',
                description: 'Monitor how much electricity you\'re drawing from the grid. Lower is better!',
                action: 'See your grid usage',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(3)',
                title: 'Battery Status',
                description: 'Check your battery charge level and charging status. Stores excess solar energy for later use.',
                action: 'View battery health',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.summary-grid .summary-card:nth-child(4)',
                title: 'Monthly Savings',
                description: 'Track how much money you\'re saving each month with solar energy. Compare with previous months!',
                action: 'View your monthly savings',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-section',
                title: 'Energy Flow Diagram',
                description: 'Visualize how energy flows from your solar panels to home, battery, and grid.',
                action: 'Understand your energy flow',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.solar-node',
                title: 'Solar Source',
                description: 'Your solar panels are generating clean energy. This is your primary power source.',
                action: 'See solar generation',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.home-node',
                title: 'Home Consumption',
                description: 'This shows how much power your home is currently using.',
                action: 'Monitor home usage',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.battery-node',
                title: 'Battery Storage',
                description: 'Excess solar energy is stored in your battery for use when the sun isn\'t shining.',
                action: 'Check battery flow',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.flow-node.grid-node',
                title: 'Grid Connection',
                description: 'Surplus energy is exported to the grid, earning you credits. Or import when needed.',
                action: 'See grid exchange',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.actions-section',
                title: 'Quick Actions Hub',
                description: 'Access all major features of the app from these quick action cards. Let\'s explore each one!',
                action: 'Browse available features',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(1)',
                title: 'Energy Monitoring',
                description: 'View detailed charts and analytics of your energy usage and generation patterns over time.',
                action: 'Access detailed analytics',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(2)',
                title: 'Virtual Solar Plant',
                description: 'Join the community solar program to share renewable energy with neighbors.',
                action: 'Explore community solar',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(3)',
                title: 'Subscription Plans',
                description: 'Manage your energy subscription plan, upgrade or downgrade as needed.',
                action: 'View plan options',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(4)',
                title: 'Billing & DISCOM',
                description: 'View your electricity bills, payment history, and DISCOM (Distribution Company) integration.',
                action: 'Check billing details',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(5)',
                title: 'AI Plan Recommendation',
                description: 'Get smart, AI-powered recommendations for the best energy plan based on your usage patterns.',
                action: 'Get personalized suggestions',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(6)',
                title: 'Virtual Solar Subscription',
                description: 'Manage your share of community solar power and track your monthly allocations.',
                action: 'Plan your solar setup',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(7)',
                title: 'Alerts & Notifications',
                description: 'Manage your notification preferences and view important alerts about your system.',
                action: 'Configure alerts',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(8)',
                title: 'Profile & Settings',
                description: 'Update your personal information, system settings, and app preferences.',
                action: 'Customize your account',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav',
                title: 'Bottom Navigation Bar',
                description: 'Use this navigation bar to quickly switch between main sections of the app.',
                action: 'Navigate between sections',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav .nav-item:nth-child(1)',
                title: 'Dashboard Tab',
                description: 'Return to this main dashboard overview anytime. Currently active (highlighted).',
                action: 'Home base',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav .nav-item:nth-child(2)',
                title: 'Energy Tab',
                description: 'Quick access to detailed energy monitoring and analytics.',
                action: 'View energy details',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav .nav-item:nth-child(3)',
                title: 'Insights Tab',
                description: 'Get insights, trends, and recommendations about your energy usage.',
                action: 'Discover patterns',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav .nav-item:nth-child(4)',
                title: 'Settings Tab',
                description: 'Configure app settings, preferences, and system parameters.',
                action: 'Adjust settings',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(1)',
                title: 'Let\'s Explore Energy Monitoring!',
                description: 'Now let\'s navigate to the Energy Monitoring page to see detailed analytics. Click this card!',
                action: 'Click to continue the tour',
                arrow: 'down',
                autoAdvance: false,
                nextPageTrigger: '../homeowner/energy-monitoring.html'
            },

            // ENERGY MONITORING - Steps 6-10
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.back-btn',
                title: 'Navigation Tip',
                description: 'Use the back button to return to the dashboard anytime.',
                action: 'Note the back button location',
                arrow: 'right',
                autoAdvance: false
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.summary-section',
                title: 'Real-Time Energy Data',
                description: 'Monitor your consumption, solar generation, and grid usage in real-time.',
                action: 'View live energy metrics',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.chart-section',
                title: 'Usage Charts',
                description: 'Visualize your energy patterns over time with interactive charts.',
                action: 'Explore the energy charts',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '../homeowner/energy-monitoring.html',
                element: '.back-btn',
                title: 'Go Back to Dashboard',
                description: 'Click the back button to return to the dashboard and continue the tour.',
                action: 'Click back to continue',
                arrow: 'right',
                autoAdvance: false,
                nextPageTrigger: '/pages/homeowner/dashboard-home.html'
            },

            // BACK TO DASHBOARD - Steps 11-13
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.action-grid button:nth-child(5)',
                title: 'Subscription Plans',
                description: 'Manage your energy subscription plan here.',
                action: 'Click to view plans',
                arrow: 'down',
                autoAdvance: false,
                nextPageTrigger: '../shared/subscription-plans.html'
            },

            // SUBSCRIPTION PLANS - Steps 14-15
            {
                page: '../shared/subscription-plans.html',
                element: '.current-plan-section',
                title: 'Your Current Plan',
                description: 'See details about your current subscription plan and usage.',
                action: 'Review your plan details',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '../shared/subscription-plans.html',
                element: '.back-btn',
                title: 'Return to Dashboard',
                description: 'Go back to explore more features.',
                action: 'Click back',
                arrow: 'right',
                autoAdvance: false,
                nextPageTrigger: '/pages/homeowner/dashboard-home.html'
            },

            // BOTTOM NAVIGATION - Steps 16-18
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav',
                title: 'Bottom Navigation',
                description: 'Use this navigation bar to quickly switch between main sections of the app.',
                action: 'See the navigation options',
                arrow: 'up',
                autoAdvance: false
            },
            {
                page: '/pages/homeowner/dashboard-home.html',
                element: '.bottom-nav .nav-item:nth-child(4)',
                title: 'Support Section',
                description: 'Get help anytime by clicking the Support tab.',
                action: 'Click to see support options',
                arrow: 'up',
                autoAdvance: false,
                nextPageTrigger: '../shared/help-support.html'
            },

            // HELP & SUPPORT - Steps 19-21
            {
                page: '../shared/help-support.html',
                element: '.contact-grid',
                title: 'Contact Support',
                description: 'Reach us via Email, Phone, or Live Chat for assistance.',
                action: 'See contact methods',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '../shared/help-support.html',
                element: '.faq-section',
                title: 'FAQs',
                description: 'Find answers to common questions here. Click any question to expand it.',
                action: 'Browse FAQs',
                arrow: 'down',
                autoAdvance: false
            },
            {
                page: '../shared/help-support.html',
                element: '.ticket-section',
                title: 'Raise Support Tickets',
                description: 'Submit detailed issues or requests through the ticketing system.',
                action: 'Learn about tickets',
                arrow: 'down',
                autoAdvance: false
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
                Would you like a guided tour? We'll show you everything you need to know,
                step by step, with arrows and helpful tips along the way.
            </p>
            <div class="welcome-buttons">
                <button class="welcome-btn secondary" onclick="guidedTutorial.skipTutorial()">
                    Skip for Now
                </button>
                <button class="welcome-btn primary" onclick="guidedTutorial.startGuidedTour()">
                    Start Guided Tour
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
            this.currentStepIndex++;
            this.showCurrentStep();
            return;
        }

        // Show overlay and UI
        this.overlay.classList.add('active');
        this.stepBadge.classList.add('show');
        this.skipButton.classList.add('show');

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

        // Handle auto-advance
        if (step.autoAdvance) {
            setTimeout(() => this.nextStep(), 5000);
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
        }

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
                    ${this.currentStepIndex > 0 ? '<button class="tooltip-btn skip" onclick="guidedTutorial.previousStep()">Back</button>' : ''}
                    <button class="tooltip-btn next" onclick="guidedTutorial.nextStep()">
                        ${step.nextPageTrigger ? 'Click Element to Continue' : 'Next'}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Position tooltip
        const tooltipRect = this.tooltip.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 20;

        // Keep within viewport
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.display = 'block';
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
            <h2 class="complete-title">Tutorial Complete! 🎉</h2>
            <p class="complete-message">You're all set! You now know how to use all the key features.</p>
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

// Initialize guided tutorial
let guidedTutorial;

document.addEventListener('DOMContentLoaded', () => {
    guidedTutorial = new GuidedTutorial();
});

// Global function to restart
function restartGuidedTutorial() {
    if (guidedTutorial) {
        guidedTutorial.restart();
    }
}
