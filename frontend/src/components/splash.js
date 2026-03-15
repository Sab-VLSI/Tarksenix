/**
 * EnergyNest - Splash Screen
 * Auto-navigation and interaction logic
 */

// Configuration
const CONFIG = {
    splashDuration: 3000, // 3 seconds
    navigationTarget: '/login.html', // Start with login
    fadeOutDuration: 500 // Fade out animation duration
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
});

/**
 * Initialize splash screen functionality
 */
function initSplashScreen() {
    // Start auto-navigation timer
    startAutoNavigation();

    // Optional: Allow tap/click to skip splash screen
    enableSkipInteraction();

    // Log initialization for debugging
    console.log('EnergyNest - Splash Screen Loaded');
    console.log(`Auto-navigation in ${CONFIG.splashDuration}ms`);
}

/**
 * Start automatic navigation after splash duration
 */
function startAutoNavigation() {
    setTimeout(() => {
        navigateToNextScreen();
    }, CONFIG.splashDuration);
}

/**
 * Navigate to the next screen with smooth transition
 */
function navigateToNextScreen() {
    const splashContainer = document.querySelector('.splash-container');

    // Add fade-out animation
    splashContainer.style.transition = `opacity ${CONFIG.fadeOutDuration}ms ease-out`;
    splashContainer.style.opacity = '0';

    // Navigate after fade-out completes
    setTimeout(() => {
        // Check if target page exists, otherwise create placeholder
        if (CONFIG.navigationTarget) {
            window.location.href = CONFIG.navigationTarget;
        } else {
            // For demo purposes, show console message
            console.log('Navigation target not configured. Update CONFIG.navigationTarget in splash.js');

            // Create a simple placeholder message
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #0a0e27, #1a237e);
                    color: white;
                    font-family: 'Inter', sans-serif;
                    text-align: center;
                    padding: 2rem;
                ">
                    <div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #00f5ff, #b4ff39); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            Welcome to EnergyNest
                        </h1>
                        <p style="font-size: 1.2rem; opacity: 0.8;">
                            Login/Signup screen coming soon...
                        </p>
                        <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.6;">
                            Update the navigation target in <code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">splash.js</code>
                        </p>
                    </div>
                </div>
            `;
        }
    }, CONFIG.fadeOutDuration);
}

/**
 * Enable tap/click to skip splash screen
 */
function enableSkipInteraction() {
    const splashContainer = document.querySelector('.splash-container');
    let hasSkipped = false;

    const skipHandler = () => {
        if (!hasSkipped) {
            hasSkipped = true;
            console.log('Splash screen skipped by user interaction');
            navigateToNextScreen();
        }
    };

    // Listen for click/tap events
    splashContainer.addEventListener('click', skipHandler);
    splashContainer.addEventListener('touchstart', skipHandler);

    // Optional: Show subtle skip hint after 1 second
    setTimeout(() => {
        if (!hasSkipped) {
            showSkipHint();
        }
    }, 1000);
}

/**
 * Show a subtle hint that user can tap to skip
 */
function showSkipHint() {
    const hint = document.createElement('div');
    hint.className = 'skip-hint';
    hint.textContent = 'Tap to continue';
    hint.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
        letter-spacing: 0.1em;
        animation: hintFade 2s ease-in-out infinite;
        pointer-events: none;
        z-index: 100;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes hintFade {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(hint);
}

/**
 * Optional: Preload next page for faster navigation
 */
function preloadNextPage() {
    if (CONFIG.navigationTarget) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = CONFIG.navigationTarget;
        document.head.appendChild(link);
    }
}

// Start preloading next page
preloadNextPage();
