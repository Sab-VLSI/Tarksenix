/**
 * EnergyNest — Core JavaScript Support Module
 * Handles API calls, authentication, toast notifications, and shared logic.
 */

// Configuration
const API_BASE = 'http://localhost:8000';

console.log('EnergyNest Auth Module Loaded');

/**
 * Centralized API Wrapper with error handling and logging.
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { detail: 'Empty or invalid JSON response' };
        }

        if (!response.ok) {
            throw new Error(data.detail || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * Handle User Login
 */
async function handleLogin(event) {
    if (event) event.preventDefault();
    console.log('Login attempt started');

    const form = event && event.target ? event.target : document.getElementById('loginForm');
    const emailEl = form.querySelector('#loginEmail') || form.querySelector('input[type="email"]');
    const passEl = form.querySelector('#loginPassword') || form.querySelector('input[type="password"]');

    if (!emailEl || !passEl) {
        console.error('Login fields not found in DOM');
        return;
    }

    const email = emailEl.value;
    const password = passEl.value;

    // Attempt to get the button from the specific form that was submitted
    let loginBtn = null;
    if (event && event.target) {
        loginBtn = event.target.querySelector('.btn-primary');
    }
    // Fallback for direct calls
    if (!loginBtn) {
        loginBtn = document.querySelector('#loginForm .btn-primary');
    }

    if (!email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }

    try {
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.dataset.originalHtml = loginBtn.innerHTML;
            loginBtn.innerHTML = '<span>Logging in...</span>';
        }

        const data = await apiCall('/auth/login', 'POST', { email, password });

        console.log('Login success:', data);

        // Save user data
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id || data.email);
        localStorage.setItem('userState', data.state || '');
        localStorage.setItem('isLoggedIn', 'true');

        showToast(`Welcome back, ${data.name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
            const targets = {
                'homeowner': '/pages/homeowner/dashboard-home.html',
                'vendor': '/pages/vendor/dashboard-vendor.html',
                'company': '/pages/company/dashboard-company.html'
            };
            const target = targets[data.role] || '/';
            console.log('Redirecting to:', target);
            navigateWithTransition(target);
        }, 800);


    } catch (error) {
        console.error('Login failed:', error);
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = loginBtn.dataset.originalHtml || '<span>Login</span>';
        }
    }
}

/**
 * Handle User Signup
 */
async function handleSignup(event, role) {
    if (event) event.preventDefault();
    console.log('Signup attempt started for role:', role);

    const formId = event.target.id;
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Signup form not found:', formId);
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic Validation
    if (!data.name || data.name.length < 2) {
        showToast('Please enter a valid full name', 'warning');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Please enter a valid email address', 'warning');
        return;
    }

    if (!data.password || data.password.length < 6) {
        showToast('Password must be at least 6 characters long', 'warning');
        return;
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
        showToast('Passwords do not match', 'warning');
        return;
    }

    // Clean up data for backend
    delete data.confirmPassword;

    // Add role and specific fields
    data.role = role || localStorage.getItem('userRole');

    const submitBtn = form.querySelector('.btn-primary');

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Creating Account...</span>';
        }

        await apiCall('/auth/signup', 'POST', data);

        showToast('Registration successful! Please login.', 'success');

        setTimeout(() => {
            navigateWithTransition('/login.html');
        }, 1500);

    } catch (error) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalHtml || '<span>Create Account</span>';
        }
    }
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
    console.log(`Toast [${type}]: ${message}`);
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: white;
        color: #1a1f36;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        border-left: 4px solid ${colors[type]};
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        min-width: 200px;
        animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: ${colors[type]}; font-size: 18px;">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Add animation style if not present
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            @keyframes toastSlideIn {
                from { opacity: 0; transform: translateX(30px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes toastSlideOut {
                to { opacity: 0; transform: translateX(30px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove toast after delay
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Authentication Guards
 */
function requireAuth() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = '/login.html';
    }
}

/**
 * UI State Helpers (Skeletons & Loading)
 */
function setLoading(selector, isLoading) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        if (isLoading) {
            el.dataset.originalContent = el.innerHTML;
            el.classList.add('skeleton');
            el.innerHTML = '&nbsp;';
        } else {
            el.classList.remove('skeleton');
            if (el.dataset.originalContent && el.innerHTML === '&nbsp;') {
                el.innerHTML = el.dataset.originalContent;
                delete el.dataset.originalContent;
            }
        }
    });
}

/**
 * Page Transitions & Navigation
 */
function navigateWithTransition(url) {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = url;
    }, 400);
}

function initUIEffects() {
    // Initial fade in
    requestAnimationFrame(() => {
        document.body.classList.add('si-loaded');
    });

    // Intercept all SI links for smooth transitions
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.includes(window.location.origin) && !link.target && !link.hasAttribute('download')) {
            e.preventDefault();
            navigateWithTransition(link.href);
        }
    });
}

/**
 * Theme Management (Dark Mode)
 */
function initTheme() {
    const savedTheme = localStorage.getItem('si-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('si-theme', newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
}

// Global initialization
function initAuth() {
    console.log('Initializing auth listeners...');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, attaching listener');
        loginForm.onsubmit = handleLogin;
    }

    const homeOwnerLoginForm = document.getElementById('homeOwnerLoginForm');
    if (homeOwnerLoginForm) {
        homeOwnerLoginForm.onsubmit = handleLogin;
    }

    const vendorLoginForm = document.getElementById('vendorLoginForm');
    if (vendorLoginForm) {
        vendorLoginForm.onsubmit = handleLogin;
    }

    const companyLoginForm = document.getElementById('companyLoginForm');
    if (companyLoginForm) {
        companyLoginForm.onsubmit = handleLogin;
    }

    const path = window.location.pathname.toLowerCase();
    if (path.includes('signup-homeowner')) {
        const f = document.getElementById('homeOwnerSignupForm');
        if (f) f.onsubmit = (e) => handleSignup(e, 'homeowner');
    } else if (path.includes('signup-vendor')) {
        const f = document.getElementById('vendorSignupForm');
        if (f) f.onsubmit = (e) => handleSignup(e, 'vendor');
    } else if (path.includes('signup-company')) {
        const f = document.getElementById('companySignupForm');
        if (f) f.onsubmit = (e) => handleSignup(e, 'company');
    }

    // Initialize UI Effects
    initUIEffects();
    initTheme();
}

// Run init based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
