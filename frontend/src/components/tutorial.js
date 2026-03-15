/* ===================================
   Interactive Tutorial System
   Tutorial steps for guiding users through the app
   =================================== */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.overlay = null;
        this.spotlight = null;
        this.tooltip = null;
        this.userRole = localStorage.getItem('userRole') || 'homeowner';
        this.tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';

        this.init();
    }

    init() {
        // Create overlay elements
        this.createOverlay();

        // Check if we should show tutorial
        if (!this.tutorialCompleted) {
            this.showStartButton();
        }
    }

    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';

        // Create spotlight
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tutorial-spotlight';

        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.spotlight);
        document.body.appendChild(this.tooltip);
    }

    showStartButton() {
        const startBtn = document.createElement('button');
        startBtn.className = 'tutorial-start-btn';
        startBtn.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        startBtn.onclick = () => this.start();
        document.body.appendChild(startBtn);
    }

    start() {
        // Hide start button
        const startBtn = document.querySelector('.tutorial-start-btn');
        if (startBtn) startBtn.style.display = 'none';

        // Define tutorial steps based on current page and role
        this.defineSteps();

        // Start tutorial
        this.currentStep = 0;
        this.showStep();
    }

    defineSteps() {
        const currentPage = window.location.pathname.split('/').pop();

        // Home Owner Dashboard Steps
        const homeownerDashboard = [
            {
                element: '.dashboard-header',
                title: 'Your Dashboard',
                description: 'This is your main dashboard where you can see all your energy activities at a glance.',
                tip: 'Check your notifications and profile from the top right',
                position: 'bottom'
            },
            {
                element: '.summary-section',
                title: 'Energy Summary',
                description: 'View your solar generation, current consumption, today\'s savings, and grid status at a glance.',
                tip: 'These numbers update in real-time throughout the day',
                position: 'bottom'
            },
            {
                element: '.action-grid',
                title: 'Quick Actions',
                description: 'Access key features like energy monitoring, subscription plans, billing, and AI recommendations.',
                tip: 'Click any card to navigate to that section',
                position: 'bottom'
            },
            {
                element: '.bottom-nav',
                title: 'Navigation Bar',
                description: 'Use this navigation bar to quickly move between Dashboard, Energy, Insights, Support, and your Profile.',
                tip: 'The active page is highlighted in green',
                position: 'top'
            }
        ];

        // Energy Monitoring Steps
        const energyMonitoring = [
            {
                element: '.energy-summary',
                title: 'Energy Summary',
                description: 'See your real-time consumption, solar generation, and grid import/export.',
                tip: 'Numbers are updated every few seconds',
                position: 'bottom'
            },
            {
                element: '.chart-section',
                title: 'Usage Charts',
                description: 'Visualize your energy patterns throughout the day, week, or month.',
                tip: 'Switch between different time periods',
                position: 'bottom'
            },
            {
                element: '.breakdown-section',
                title: 'Source Breakdown',
                description: 'Understand where your energy comes from - solar, battery, or grid.',
                tip: 'Green means renewable!',
                position: 'bottom'
            }
        ];

        // Vendor Dashboard Steps
        const vendorDashboard = [
            {
                element: '.services-grid',
                title: 'Business Overview',
                description: 'Access asset management, track orders, and monitor revenue from here.',
                tip: 'Click any card to dive deeper',
                position: 'bottom'
            },
            {
                element: '.status-section',
                title: 'Service Status',
                description: 'Track active jobs, completed installations, and pending requests.',
                tip: 'Update job status regularly',
                position: 'bottom'
            },
            {
                element: '.analytics-section',
                title: 'Monthly Installations',
                description: 'View your installation trends and business growth over time.',
                tip: 'Use this to forecast capacity',
                position: 'bottom'
            }
        ];

        // Energy Company Dashboard Steps
        const companyDashboard = [
            {
                element: '.quick-access-section',
                title: 'Quick Access',
                description: 'Jump to grid overview, distributed energy, or tariff simulation.',
                tip: 'These are your most-used features',
                position: 'bottom'
            },
            {
                element: '.grid-overview',
                title: 'Grid Metrics',
                description: 'Monitor total demand, supply, renewable contribution, and storage.',
                tip: 'Real-time grid health monitoring',
                position: 'bottom'
            },
            {
                element: '.distributed-section',
                title: 'Distributed Resources',
                description: 'Track connected solar homes and bidirectional energy flow.',
                tip: 'Community energy at scale',
                position: 'bottom'
            }
        ];

        // Support Page Steps
        const supportPage = [
            {
                element: '.contact-grid',
                title: 'Contact Support',
                description: 'Reach us via email, phone, or live chat for immediate assistance.',
                tip: 'Live chat is available 24/7',
                position: 'bottom'
            },
            {
                element: '.faq-section',
                title: 'Frequently Asked Questions',
                description: 'Find quick answers to common questions. Click to expand any FAQ.',
                tip: 'Most questions are answered here',
                position: 'bottom'
            },
            {
                element: '.ticket-section',
                title: 'Raise a Ticket',
                description: 'Submit detailed issues that require investigation or technical support.',
                tip: 'Include as much detail as possible',
                position: 'top'
            }
        ];

        // Map pages to steps
        const stepMap = {
            'dashboard-home.html': homeownerDashboard,
            'energy-monitoring.html': energyMonitoring,
            'dashboard-vendor.html': vendorDashboard,
            'dashboard-company.html': companyDashboard,
            'help-support.html': supportPage
        };

        this.steps = stepMap[currentPage] || homeownerDashboard;
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[this.currentStep];
        const element = document.querySelector(step.element);

        if (!element) {
            // Element not found, skip to next
            this.currentStep++;
            this.showStep();
            return;
        }

        // Show overlay
        this.overlay.classList.add('active');

        // Position spotlight
        this.positionSpotlight(element);

        // Show tooltip
        this.showTooltip(step, element);

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    positionSpotlight(element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;

        this.spotlight.style.left = (rect.left - padding) + 'px';
        this.spotlight.style.top = (rect.top - padding) + 'px';
        this.spotlight.style.width = (rect.width + padding * 2) + 'px';
        this.spotlight.style.height = (rect.height + padding * 2) + 'px';
    }

    showTooltip(step, element) {
        const rect = element.getBoundingClientRect();
        const position = step.position || 'bottom';

        this.tooltip.className = `tutorial-tooltip ${position}`;
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
                ${step.tip ? `
                    <div class="tooltip-tip">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p>${step.tip}</p>
                    </div>
                ` : ''}
            </div>
            <div class="tooltip-footer">
                <span class="tooltip-progress">${this.currentStep + 1} of ${this.steps.length}</span>
                <div class="tooltip-actions">
                    <button class="tooltip-btn skip" onclick="tutorial.skip()">
                        ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Skip'}
                    </button>
                    <button class="tooltip-btn next" onclick="tutorial.next()">
                        ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(rect, position);
    }

    positionTooltip(elementRect, position) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const padding = 20;

        let left, top;

        switch (position) {
            case 'top':
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                top = elementRect.top - tooltipRect.height - padding;
                break;
            case 'bottom':
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                top = elementRect.bottom + padding;
                break;
            case 'left':
                left = elementRect.left - tooltipRect.width - padding;
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = elementRect.right + padding;
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                break;
        }

        // Keep tooltip within viewport
        const maxLeft = window.innerWidth - tooltipRect.width - 20;
        const maxTop = window.innerHeight - tooltipRect.height - 20;

        left = Math.max(20, Math.min(left, maxLeft));
        top = Math.max(20, Math.min(top, maxTop));

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }

    next() {
        this.currentStep++;
        this.showStep();
    }

    skip() {
        this.complete();
    }

    complete() {
        // Hide overlay and elements
        this.overlay.classList.remove('active');
        this.spotlight.style.display = 'none';
        this.tooltip.style.display = 'none';

        // Show completion badge
        this.showCompletionBadge();

        // Mark as completed
        localStorage.setItem('tutorialCompleted', 'true');
        this.tutorialCompleted = true;
    }

    showCompletionBadge() {
        const badge = document.createElement('div');
        badge.className = 'tutorial-complete-badge show';
        badge.innerHTML = `
            <div class="complete-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="complete-title">Tutorial Complete!</h2>
            <p class="complete-message">You're all set to start using the app</p>
            <button class="complete-btn" onclick="this.parentElement.remove()">Got it!</button>
        `;

        document.body.appendChild(badge);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            badge.classList.remove('show');
            setTimeout(() => badge.remove(), 300);
        }, 5000);
    }

    restart() {
        localStorage.removeItem('tutorialCompleted');
        this.tutorialCompleted = false;
        this.start();
    }
}

// Initialize tutorial system
let tutorial;

document.addEventListener('DOMContentLoaded', () => {
    tutorial = new TutorialSystem();
});

// Expose restart function globally
function restartTutorial() {
    if (tutorial) {
        tutorial.restart();
    }
}
