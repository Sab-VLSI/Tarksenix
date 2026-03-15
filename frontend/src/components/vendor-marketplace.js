/**
 * vendor-marketplace.js
 * Ranking: Score = 40% Cost + 30% SLA + 20% Response Time + 10% Rating
 * Lower cost/response/sla days = better; higher rating = better.
 */

(function () {
    'use strict';

    // ────────────────────────────────────────────────────────────
    // Vendor Data  (5 vendors, realistic Indian solar market data)
    // ────────────────────────────────────────────────────────────
    const VENDORS = [
        {
            id: 'v1',
            name: 'SunPower Solutions',
            location: 'Mumbai, Maharashtra',
            emoji: '☀️',
            accentColor: '#f59e0b',
            tintColor: 'rgba(245,158,11,0.1)',
            costPerKw: 42000,          // ₹ per kW
            sladays: 2,                // maintenance response SLA (days)
            responseHrs: 3,            // initial response time (hours)
            rating: 4.8,               // out of 5
            yearsActive: 9,
            projectsDone: 1240,
            certifications: 'MNRE · BIS · ISO 9001',
            warranty: '25 yr panel · 10 yr inverter',
        },
        {
            id: 'v2',
            name: 'GreenGrid Installers',
            location: 'Pune, Maharashtra',
            emoji: '🌿',
            accentColor: '#22c55e',
            tintColor: 'rgba(34,197,94,0.1)',
            costPerKw: 38500,
            sladays: 1,
            responseHrs: 2,
            rating: 4.6,
            yearsActive: 7,
            projectsDone: 870,
            certifications: 'MNRE · ISO 14001',
            warranty: '25 yr panel · 5 yr inverter',
        },
        {
            id: 'v3',
            name: 'BrightWatt Energy',
            location: 'Bengaluru, Karnataka',
            emoji: '⚡',
            accentColor: '#3b82f6',
            tintColor: 'rgba(59,130,246,0.1)',
            costPerKw: 45000,
            sladays: 3,
            responseHrs: 6,
            rating: 4.9,
            yearsActive: 12,
            projectsDone: 2100,
            certifications: 'MNRE · IEC · ISO 9001',
            warranty: '30 yr panel · 12 yr inverter',
        },
        {
            id: 'v4',
            name: 'EcoVolt Systems',
            location: 'Hyderabad, Telangana',
            emoji: '🔋',
            accentColor: '#a855f7',
            tintColor: 'rgba(168,85,247,0.1)',
            costPerKw: 36000,
            sladays: 2,
            responseHrs: 4,
            rating: 4.3,
            yearsActive: 5,
            projectsDone: 430,
            certifications: 'MNRE · BIS',
            warranty: '20 yr panel · 5 yr inverter',
        },
        {
            id: 'v5',
            name: 'SolarNest India',
            location: 'Chennai, Tamil Nadu',
            emoji: '🏡',
            accentColor: '#10b981',
            tintColor: 'rgba(16,185,129,0.1)',
            costPerKw: 40000,
            sladays: 1,
            responseHrs: 2,
            rating: 4.7,
            yearsActive: 8,
            projectsDone: 1050,
            certifications: 'MNRE · ISO 9001 · ISO 14001',
            warranty: '25 yr panel · 8 yr inverter',
        }
    ];

    // ────────────────────────────────────────────────────────────
    // Ranking Algorithm
    // Score = 40% Cost + 30% SLA + 20% Response + 10% Rating
    // Each metric is normalised to [0,1]:
    //   cost/sla/response: lower = better  → norm = (max - val)/(max - min)
    //   rating:            higher = better → norm = (val - min)/(max - min)
    // ────────────────────────────────────────────────────────────
    const WEIGHTS = { cost: 0.40, sla: 0.30, response: 0.20, rating: 0.10 };

    function normalise(values, lowerIsBetter) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        return values.map(v =>
            lowerIsBetter ? (max - v) / range : (v - min) / range
        );
    }

    function rankVendors(vendors) {
        const costs = normalise(vendors.map(v => v.costPerKw), true);
        const slas = normalise(vendors.map(v => v.sladays), true);
        const responses = normalise(vendors.map(v => v.responseHrs), true);
        const ratings = normalise(vendors.map(v => v.rating), false);

        return vendors
            .map((v, i) => ({
                ...v,
                _score: (
                    WEIGHTS.cost * costs[i] +
                    WEIGHTS.sla * slas[i] +
                    WEIGHTS.response * responses[i] +
                    WEIGHTS.rating * ratings[i]
                )
            }))
            .sort((a, b) => b._score - a._score);
    }

    // ────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────
    const fmt = n => '₹' + n.toLocaleString('en-IN');
    const pct = n => Math.round(n * 100);

    function starsHtml(rating) {
        const full = Math.floor(rating);
        const half = rating - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    }

    function rankBadge(position) {
        if (position === 0) return { cls: 'rank-gold', label: '🥇 Top Pick' };
        if (position === 1) return { cls: 'rank-silver', label: '🥈 Runner Up' };
        if (position === 2) return { cls: 'rank-bronze', label: '🥉 3rd Place' };
        return { cls: 'rank-std', label: `#${position + 1}` };
    }

    // ────────────────────────────────────────────────────────────
    // DOM Rendering
    // ────────────────────────────────────────────────────────────
    const list = document.getElementById('vmList');
    const count = document.getElementById('vmCount');

    function renderVendors(vendors) {
        // Remove skeletons
        list.innerHTML = '';
        count.textContent = `${vendors.length} vendors`;

        vendors.forEach((v, i) => {
            const badge = rankBadge(i);
            const card = document.createElement('article');
            card.className = 'vm-card';
            card.style.setProperty('--vm-accent', v.accentColor);
            card.style.setProperty('--vm-tint', v.tintColor);
            card.style.animationDelay = `${i * 70}ms`;
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${v.name}`);

            card.innerHTML = `
                <!-- Top row -->
                <div class="vm-card-top">
                    <div class="vm-avatar">${v.emoji}</div>
                    <div style="flex:1;min-width:0;">
                        <p class="vm-vendor-name">${esc(v.name)}</p>
                        <p class="vm-vendor-location">📍 ${esc(v.location)}</p>
                    </div>
                    <span class="vm-rank-badge ${badge.cls}">${badge.label}</span>
                </div>

                <!-- Metrics grid (2×2) -->
                <div class="vm-metrics">
                    <div class="vm-metric">
                        <span class="vm-metric-label">💰 Install Cost</span>
                        <span class="vm-metric-value">${fmt(v.costPerKw)}/kW</span>
                    </div>
                    <div class="vm-metric">
                        <span class="vm-metric-label">🛡️ Maintenance SLA</span>
                        <span class="vm-metric-value">${v.sladays === 1 ? '24 hrs' : v.sladays + ' days'}</span>
                    </div>
                    <div class="vm-metric">
                        <span class="vm-metric-label">⚡ Response Time</span>
                        <span class="vm-metric-value">${v.responseHrs < 24 ? v.responseHrs + ' hrs' : Math.round(v.responseHrs / 24) + ' day'}</span>
                    </div>
                    <div class="vm-metric">
                        <span class="vm-metric-label">📋 Projects Done</span>
                        <span class="vm-metric-value">${v.projectsDone.toLocaleString('en-IN')}+</span>
                    </div>
                </div>

                <!-- Footer row -->
                <div class="vm-card-footer">
                    <div>
                        <span class="vm-stars">${starsHtml(v.rating)}</span>
                        <span class="vm-rating-text">${v.rating} / 5</span>
                    </div>
                    <span class="vm-score-pill">Score ${pct(v._score)}%</span>
                    <button class="vm-contact-link" data-id="${v.id}">Contact →</button>
                </div>
            `;

            // Click on card or contact button → open modal
            card.addEventListener('click', (e) => {
                if (e.target.closest('.vm-contact-link')) {
                    e.stopPropagation();
                }
                openModal(v);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') openModal(v);
            });
            card.querySelector('.vm-contact-link').addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(v);
            });

            list.appendChild(card);
        });
    }

    // ────────────────────────────────────────────────────────────
    // Sort chips
    // ────────────────────────────────────────────────────────────
    let currentSort = 'score';
    let rankedVendors = rankVendors(VENDORS);

    function sortVendors(key) {
        currentSort = key;
        let sorted;
        if (key === 'score') sorted = [...rankedVendors]; // already ranked
        else if (key === 'cost') sorted = [...VENDORS].sort((a, b) => a.costPerKw - b.costPerKw);
        else if (key === 'sla') sorted = [...VENDORS].sort((a, b) => a.sladays - b.sladays);
        else if (key === 'response') sorted = [...VENDORS].sort((a, b) => a.responseHrs - b.responseHrs);
        else if (key === 'rating') sorted = [...VENDORS].sort((a, b) => b.rating - a.rating);
        // Re-attach _score for display (use rankedVendors as reference)
        sorted = sorted.map(v => {
            const ranked = rankedVendors.find(r => r.id === v.id);
            return ranked || v;
        });
        renderVendors(sorted);
    }

    document.getElementById('vmChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.vm-chip');
        if (!chip) return;
        document.querySelectorAll('.vm-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        sortVendors(chip.dataset.sort);
    });

    // ────────────────────────────────────────────────────────────
    // Contact Modal
    // ────────────────────────────────────────────────────────────
    const modal = document.getElementById('contactModal');
    const closeBtn = document.getElementById('closeContactModal');
    const modalHeader = document.getElementById('modalVendorHeader');
    const modalDetails = document.getElementById('modalVendorDetails');
    const enquireBtn = document.getElementById('modalEnquireBtn');
    const modalConfirm = document.getElementById('modalConfirm');

    function openModal(v) {
        modalHeader.innerHTML = `
            <p class="vm-modal-name">${esc(v.emoji)} ${esc(v.name)}</p>
            <p class="vm-modal-loc">📍 ${esc(v.location)} · ${v.yearsActive} yrs experience</p>
        `;
        modalDetails.innerHTML = `
            <div class="vm-modal-row">
                <p class="vm-modal-row-label">💰 Install Cost</p>
                <p class="vm-modal-row-value">${fmt(v.costPerKw)}/kW</p>
            </div>
            <div class="vm-modal-row">
                <p class="vm-modal-row-label">🛡️ SLA</p>
                <p class="vm-modal-row-value">${v.sladays === 1 ? '24 hours' : v.sladays + ' days'}</p>
            </div>
            <div class="vm-modal-row">
                <p class="vm-modal-row-label">⚡ Response</p>
                <p class="vm-modal-row-value">${v.responseHrs} hrs</p>
            </div>
            <div class="vm-modal-row">
                <p class="vm-modal-row-label">🏆 Rating</p>
                <p class="vm-modal-row-value">${v.rating} / 5</p>
            </div>
            <div class="vm-modal-row" style="grid-column:1/-1;">
                <p class="vm-modal-row-label">📜 Certifications</p>
                <p class="vm-modal-row-value">${esc(v.certifications)}</p>
            </div>
            <div class="vm-modal-row" style="grid-column:1/-1;">
                <p class="vm-modal-row-label">🔧 Warranty</p>
                <p class="vm-modal-row-value">${esc(v.warranty)}</p>
            </div>
        `;

        enquireBtn.disabled = false;
        enquireBtn.textContent = 'Send Enquiry Request →';
        modalConfirm.hidden = true;
        modal.classList.add('active');
    }

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    enquireBtn.addEventListener('click', () => {
        enquireBtn.disabled = true;
        enquireBtn.textContent = 'Sending…';
        // Simulate async call
        setTimeout(() => {
            modalConfirm.hidden = false;
            enquireBtn.textContent = '✓ Enquiry Sent';
        }, 900);
    });

    // ────────────────────────────────────────────────────────────
    // Init – brief artificial delay to show skeleton, then render
    // ────────────────────────────────────────────────────────────
    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    setTimeout(() => {
        renderVendors(rankedVendors);
    }, 350);

})();
