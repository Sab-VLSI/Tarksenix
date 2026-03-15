/**
 * EnergyNest - User Onboarding
 * Conditional multi-step flow based on user type
 */

// Configuration - Dashboard routing based on user type
const CONFIG = {
    dashboards: {
        homeowner: '/pages/homeowner/dashboard-home.html',
        vendor: '/pages/vendor/dashboard-vendor.html',
        energycompany: '/pages/company/dashboard-company.html'
    }
};

// State management
const state = {
    currentStep: 1,
    totalSteps: 1, // Dynamic - changes based on user type
    selections: {
        userType: null,           // Step 1 (always shown)
        householdType: null,      // Step 2 (Home Owner only)
        solarCapacity: null,      // Step 2 (Home Owner only)
        batteryBackup: 'yes',     // Step 2 (Home Owner only)
        energyGoals: []           // Step 3 (Home Owner only)
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initOnboarding();
});

/**
 * Initialize onboarding functionality
 */
function initOnboarding() {
    setupStepNavigation();
    setupStep1Selections();
    setupStep2Selections();
    setupStep3Selections();
    updateProgress();

    console.log('EnergyNest - Onboarding Loaded');
}

/* ===================================
   Step Navigation
   =================================== */

/**
 * Setup step navigation controls
 */
function setupStepNavigation() {
    const backBtn = document.querySelector('.btn-back');
    const nextBtn = document.querySelector('.btn-next');

    // Back button
    backBtn.addEventListener('click', () => {
        if (state.currentStep > 1) {
            goToStep(state.currentStep - 1);
        }
    });

    // Next button
    nextBtn.addEventListener('click', () => {
        handleNextAction();
    });

    // Progress dots navigation (only allow clicking if homeowner)
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const targetStep = index + 1;
            // Only allow if homeowner or going to step 1
            if (state.selections.userType === 'homeowner' || targetStep === 1) {
                goToStep(targetStep);
            }
        });
    });
}

/**
 * Handle Next button action based on current step and user type
 */
function handleNextAction() {
    // Step 1: User Type Selection
    if (state.currentStep === 1) {
        // Check if user selected a type
        if (!state.selections.userType) {
            console.log('Please select a user type');
            return;
        }

        // CONDITIONAL ROUTING based on user type
        if (state.selections.userType === 'homeowner') {
            // Home Owner → Show Step 2 (Energy Setup)
            state.totalSteps = 3; // Home Owner has 3 steps
            goToStep(2);
        } else {
            // Vendor or Energy Company → Skip onboarding, go to dashboard
            console.log(`${state.selections.userType} selected - Skipping to dashboard`);
            finishOnboarding();
        }
        return;
    }

    // Step 2: Energy Setup (Home Owner only)
    if (state.currentStep === 2) {
        goToStep(3);
        return;
    }

    // Step 3: Energy Goals (Home Owner only - final step)
    if (state.currentStep === 3) {
        finishOnboarding();
        return;
    }
}

/**
 * Navigate to specific step
 */
function goToStep(stepNumber) {
    // Hide current step
    const currentStepEl = document.querySelector(`.step[data-step="${state.currentStep}"]`);
    if (currentStepEl) {
        currentStepEl.classList.remove('active');
    }

    // Update state
    state.currentStep = stepNumber;

    // Show new step
    const newStepEl = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (newStepEl) {
        newStepEl.classList.add('active');
    }

    // Update UI
    updateProgress();
    updateNavigationButtons();

    console.log(`Navigated to step ${stepNumber}`);
}

/**
 * Update progress indicator
 */
function updateProgress() {
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = (state.currentStep / state.totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update progress dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        const dotStep = index + 1;
        dot.classList.remove('active', 'completed');

        // Show/hide dots based on user type
        if (state.selections.userType === 'homeowner' || dotStep === 1) {
            dot.style.display = 'block';
        } else {
            dot.style.display = 'none';
        }

        if (dotStep === state.currentStep) {
            dot.classList.add('active');
        } else if (dotStep < state.currentStep) {
            dot.classList.add('completed');
        }
    });

    // Update progress text
    document.querySelector('.current-step').textContent = state.currentStep;
    document.querySelector('.total-steps').textContent = state.totalSteps;
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    const backBtn = document.querySelector('.btn-back');
    const nextBtn = document.querySelector('.btn-next');
    const btnText = nextBtn.querySelector('.btn-text');

    // Back button
    if (state.currentStep === 1) {
        backBtn.disabled = true;
    } else {
        backBtn.disabled = false;
    }

    // Next button text - dynamic based on step and user type
    if (state.currentStep === 1) {
        // Step 1: Show "Next" or "Continue" based on selection
        btnText.textContent = 'Next';
    } else if (state.currentStep === state.totalSteps) {
        // Last step for homeowner
        btnText.textContent = 'Finish Setup';
    } else {
        btnText.textContent = 'Next';
    }
}

/* ===================================
   STEP 1: User Type Selection
   =================================== */

/**
 * Setup Step 1 - User Type selection
 */
function setupStep1Selections() {
    const selectionCards = document.querySelectorAll('.step-1 .selection-card');

    selectionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all cards
            selectionCards.forEach(c => c.classList.remove('selected'));

            // Add active to clicked card
            card.classList.add('selected');

            // Update state
            state.selections.userType = card.getAttribute('data-value');

            console.log('User type selected:', state.selections.userType);

            // Update progress display immediately
            updateProgress();
        });
    });
}

/* ===================================
   STEP 2: Energy Setup (Home Owner Only)
   =================================== */

/**
 * Setup Step 2 - Energy configuration
 */
function setupStep2Selections() {
    setupHouseholdTypeSelection();
    setupSolarCapacitySelection();
    setupBatteryToggle();
}

/**
 * Household type selection
 */
function setupHouseholdTypeSelection() {
    const householdBtns = document.querySelectorAll('.step-2 .pill-group:nth-of-type(1) .pill-btn');

    householdBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            householdBtns.forEach(b => b.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');

            // Update state
            state.selections.householdType = btn.getAttribute('data-value');

            console.log('Household type selected:', state.selections.householdType);
        });
    });
}

/**
 * Solar capacity selection
 */
function setupSolarCapacitySelection() {
    const solarBtns = document.querySelectorAll('.step-2 .pill-group:nth-of-type(2) .pill-btn');

    solarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            solarBtns.forEach(b => b.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');

            // Update state
            state.selections.solarCapacity = btn.getAttribute('data-value');

            console.log('Solar capacity selected:', state.selections.solarCapacity);
        });
    });
}

/**
 * Battery backup toggle
 */
function setupBatteryToggle() {
    const toggleBtns = document.querySelectorAll('.step-2 .toggle-btn');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            toggleBtns.forEach(b => b.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');

            // Update state
            state.selections.batteryBackup = btn.getAttribute('data-value');

            console.log('Battery backup:', state.selections.batteryBackup);
        });
    });
}

/* ===================================
   STEP 3: Energy Goals (Home Owner Only)
   =================================== */

/**
 * Setup Step 3 - Energy goals (multi-select)
 */
function setupStep3Selections() {
    const goalCards = document.querySelectorAll('.step-3 .goal-card');

    goalCards.forEach(card => {
        card.addEventListener('click', () => {
            const goalValue = card.getAttribute('data-value');

            // Toggle selected state
            card.classList.toggle('selected');

            // Update state
            if (card.classList.contains('selected')) {
                // Add to goals array
                if (!state.selections.energyGoals.includes(goalValue)) {
                    state.selections.energyGoals.push(goalValue);
                }
            } else {
                // Remove from goals array
                state.selections.energyGoals = state.selections.energyGoals.filter(
                    goal => goal !== goalValue
                );
            }

            console.log('Energy goals:', state.selections.energyGoals);
        });
    });
}

/* ===================================
   Finish Onboarding
   =================================== */

/**
 * Finish onboarding and navigate to dashboard
 */
function finishOnboarding() {
    console.log('Onboarding completed!');
    console.log('Final selections:', state.selections);
    console.log('User flow:', getUserFlowSummary());

    // Show completion animation
    showCompletionAnimation();

    // Navigate to correct dashboard based on user type after animation
    setTimeout(() => {
        const dashboardUrl = CONFIG.dashboards[state.selections.userType];
        if (dashboardUrl) {
            console.log(`Navigating to: ${dashboardUrl}`);
            window.location.href = dashboardUrl;
        } else {
            console.error('No dashboard configured for user type:', state.selections.userType);
            showDashboardPlaceholder();
        }
    }, 1500);
}

/**
 * Get user flow summary for logging
 */
function getUserFlowSummary() {
    if (state.selections.userType === 'homeowner') {
        return 'Home Owner → Step 2 → Step 3 → Dashboard';
    } else if (state.selections.userType === 'vendor') {
        return 'Vendor → Skip onboarding → Dashboard';
    } else if (state.selections.userType === 'energycompany') {
        return 'Energy Company → Skip onboarding → Dashboard';
    }
    return 'Unknown';
}

/**
 * Show completion animation
 */
function showCompletionAnimation() {
    const card = document.querySelector('.onboarding-card');

    // Create success overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #00d4e8, #a3e635);
        border-radius: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        z-index: 100;
        animation: overlayFadeIn 0.3s ease-out forwards;
    `;

    // Dynamic message based on user type
    const message = state.selections.userType === 'homeowner'
        ? 'Your energy profile is ready!'
        : 'Welcome aboard!';

    overlay.innerHTML = `
        <div style="
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            animation: successPulse 1s ease-in-out infinite;
        ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">All Set!</h2>
        <p style="font-size: 1.125rem; opacity: 0.9;">${message}</p>
        <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">Taking you to your dashboard...</p>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes overlayFadeIn {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        @keyframes successPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);

    card.style.position = 'relative';
    card.appendChild(overlay);
}

/**
 * Show dashboard placeholder (for demo)
 */
function showDashboardPlaceholder() {
    // Build profile summary based on user type
    let profileHTML = `<p><strong style="color: #1a1f36;">User Type:</strong> ${formatUserType(state.selections.userType)}</p>`;

    if (state.selections.userType === 'homeowner') {
        profileHTML += `
            <p><strong style="color: #1a1f36;">Household:</strong> ${state.selections.householdType || 'Not selected'}</p>
            <p><strong style="color: #1a1f36;">Solar Capacity:</strong> ${state.selections.solarCapacity || 'Not selected'}</p>
            <p><strong style="color: #1a1f36;">Battery Backup:</strong> ${state.selections.batteryBackup}</p>
            <p><strong style="color: #1a1f36;">Energy Goals:</strong> ${state.selections.energyGoals.length > 0 ? state.selections.energyGoals.join(', ') : 'None selected'}</p>
        `;
    } else {
        profileHTML += `<p style="color: #697386; font-style: italic;">Skipped detailed onboarding as ${formatUserType(state.selections.userType)}</p>`;
    }

    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
            padding: 2rem;
            text-align: center;
            font-family: 'Inter', sans-serif;
        ">
            <div style="max-width: 700px;">
                <div style="
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 2rem;
                    background: linear-gradient(135deg, #00d4e8, #a3e635);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h1 style="
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #00d4e8, #a3e635);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                ">
                    Welcome to Your Dashboard!
                </h1>
                <p style="font-size: 1.25rem; color: #697386; margin-bottom: 2rem;">
                    ${getDashboardWelcomeMessage()}
                </p>
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
                    text-align: left;
                ">
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1a1f36;">
                        Your Profile Summary:
                    </h3>
                    <div style="display: grid; gap: 0.75rem; font-size: 0.9375rem; color: #697386;">
                        ${profileHTML}
                    </div>
                </div>
                <div style="
                    margin-top: 2rem;
                    padding: 1rem;
                    background: rgba(0, 212, 232, 0.1);
                    border-radius: 0.5rem;
                    border-left: 4px solid #00d4e8;
                ">
                    <p style="font-size: 0.9375rem; color: #1a1f36; font-weight: 500;">
                        ✓ User Flow: ${getUserFlowSummary()}
                    </p>
                </div>
                <p style="margin-top: 2rem; font-size: 0.875rem; color: #9ca3af;">
                    Dashboard coming soon...<br>
                    Update <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">CONFIG.dashboardTarget</code> in onboarding.js
                </p>
            </div>
        </div>
    `;
}

/**
 * Format user type for display
 */
function formatUserType(userType) {
    const types = {
        'homeowner': 'Home Owner',
        'vendor': 'Vendor',
        'energycompany': 'Energy Company'
    };
    return types[userType] || userType;
}

/**
 * Get dashboard welcome message based on user type
 */
function getDashboardWelcomeMessage() {
    if (state.selections.userType === 'homeowner') {
        return 'Your energy profile has been set up successfully';
    } else if (state.selections.userType === 'vendor') {
        return 'Ready to manage your services and equipment';
    } else if (state.selections.userType === 'energycompany') {
        return 'Welcome to your utility management dashboard';
    }
    return 'Your account is ready';
}

/**
 * Optional: Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Arrow right / Enter - Next
    if ((e.key === 'ArrowRight' || e.key === 'Enter') && !e.target.matches('input, textarea')) {
        const nextBtn = document.querySelector('.btn-next');
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
        }
    }

    // Arrow left - Back
    if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
        const backBtn = document.querySelector('.btn-back');
        if (backBtn && !backBtn.disabled) {
            backBtn.click();
        }
    }
});
