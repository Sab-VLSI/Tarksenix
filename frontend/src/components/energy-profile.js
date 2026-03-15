/**
 * energy-profile.js
 * Handles EnergyProfileForm submission and renders energy recommendations.
 */

(function () {
    'use strict';

    // ── Recommendation knowledge-base ────────────────────────────────────────
    const RECOMMENDATIONS = {
        // Consumer-type specific
        home: [
            {
                icon: '☀️',
                title: 'Rooftop Solar Installation',
                desc: 'An independent home is an ideal candidate for a 3–5 kW rooftop solar system. Payback period is typically 4–6 years in India.'
            },
            {
                icon: '🌡️',
                title: 'Smart AC Scheduling',
                desc: 'A/C typically accounts for 40–60 % of residential bills. Set a schedule via a smart plug or a 5-star rated inverter AC to cut consumption.'
            }
        ],
        apartment: [
            {
                icon: '🏢',
                title: 'Group Solar via Society',
                desc: 'Apartments can opt for community net-metering through their RWA. Collective projects qualify for DISCOM subsidies.'
            },
            {
                icon: '💡',
                title: 'Swap to LED & BEE 5-Star',
                desc: 'Replace all bulbs with LED and upgrade appliances to BEE 5-star rated ones. Savings of 20–30 % are typical.'
            }
        ],
        pg: [
            {
                icon: '🔌',
                title: 'Sub-Metering per Room',
                desc: 'Install individual smart meters for each room. This alone reduces overall consumption by 15–25 % through accountability.'
            },
            {
                icon: '💧',
                title: 'Efficient Geyser Usage',
                desc: 'Switch to solar water heaters or heat-pump geysers. These save up to 80 % of geyser electricity.'
            }
        ],
        shop: [
            {
                icon: '🕐',
                title: 'Shift Load to Off-Peak Hours',
                desc: 'Commercial tariffs have time-of-day pricing. Run energy-intensive equipment (e.g. refrigeration, ovens) during off-peak windows to reduce costs.'
            },
            {
                icon: '🪟',
                title: 'Cool-Roof & Daylighting',
                desc: 'Reflective roofing and skylights can reduce cooling load by up to 25 % in commercial premises.'
            }
        ],

        // Rooftop specific
        rooftopYes: {
            icon: '⚡',
            title: 'Solar on Net-Metering (PM Surya Ghar)',
            desc: 'You qualify for the PM Surya Ghar free rooftop solar scheme. Up to 300 units/month subsidy available. Apply on pmsuryaghar.gov.in.'
        },
        rooftopNo: {
            icon: '🔋',
            title: 'Virtual Solar / Green Energy Tariff',
            desc: 'Without a rooftop, opt for your DISCOM\'s green-energy tariff or a virtual net-metering arrangement through a community solar park.'
        },

        // Consumption-based
        low: {   // < 150 units
            icon: '🌿',
            title: 'Low Consumption – Maintain Green Habits',
            desc: 'Your usage is below the national average. Focus on maintaining habits: unplug standby devices, use natural light, and prefer cold-water washing.'
        },
        medium: { // 150–400 units
            icon: '📊',
            title: 'Monitor & Optimise Usage',
            desc: 'Consider a smart energy monitor (e.g. Shelly, Emporia). Identifying phantom loads alone can save 5–10 % monthly.'
        },
        high: {  // > 400 units
            icon: '🚨',
            title: 'High Consumption Alert – Audit Needed',
            desc: 'Your monthly usage is significantly above average. A professional energy audit is recommended. Common culprits: old ACs, geysers, refrigerators.'
        },

        // Always shown
        general: [
            {
                icon: '📱',
                title: 'EnergyNest Energy Dashboard',
                desc: 'Track real-time consumption, generate bills, and set alerts directly from your EnergyNest dashboard.'
            }
        ]
    };

    // ── DOM References ────────────────────────────────────────────────────────
    const form = document.getElementById('energyProfileForm');
    const recPanel = document.getElementById('recommendationsPanel');
    const recCards = document.getElementById('recCards');
    const editBtn = document.getElementById('epEditBtn');
    const dropZone = document.getElementById('dropZoneLabel');
    const fileInput = document.getElementById('epBill');
    const fileNameEl = document.getElementById('fileNameDisplay');

    // ── File upload feedback ──────────────────────────────────────────────────
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            fileNameEl.textContent = '📎 ' + file.name;
            fileNameEl.hidden = false;
            dropZone.style.borderColor = 'var(--color-energy-cyan)';
        }
    });

    // Drag-and-drop visuals
    ['dragenter', 'dragover'].forEach(evt =>
        dropZone.addEventListener(evt, e => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        })
    );
    ['dragleave', 'drop'].forEach(evt =>
        dropZone.addEventListener(evt, e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (evt === 'drop' && e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        })
    );

    // ── Form submission ───────────────────────────────────────────────────────
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        const data = collectFormData();
        const recs = buildRecommendations(data);

        renderRecommendations(recs, data);

        // Scroll recommendations into view smoothly
        recPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ── Edit button ───────────────────────────────────────────────────────────
    editBtn.addEventListener('click', () => {
        recPanel.hidden = true;
        form.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ── Validation ────────────────────────────────────────────────────────────
    function validateForm() {
        const required = form.querySelectorAll('[required]');
        let valid = true;

        required.forEach(el => {
            el.classList.remove('ep-invalid');
        });

        // State
        const state = form.querySelector('#epState');
        if (!state.value) { markInvalid(state); valid = false; }

        // City
        const city = form.querySelector('#epCity');
        if (!city.value.trim()) { markInvalid(city); valid = false; }

        // Consumer type
        const type = form.querySelector('input[name="consumerType"]:checked');
        if (!type) {
            const group = form.querySelector('.consumer-type-grid');
            group.classList.add('ep-group-invalid');
            valid = false;
        }

        // Rooftop
        const rooftop = form.querySelector('input[name="rooftop"]:checked');
        if (!rooftop) {
            form.querySelector('.toggle-group').classList.add('ep-group-invalid');
            valid = false;
        }

        // Consumption
        const cons = form.querySelector('#epConsumption');
        if (!cons.value || parseFloat(cons.value) < 0) { markInvalid(cons); valid = false; }

        if (!valid) shakeSubmitBtn();
        return valid;
    }

    function markInvalid(el) {
        el.classList.add('ep-invalid');
        el.addEventListener('input', () => el.classList.remove('ep-invalid'), { once: true });
        el.addEventListener('change', () => el.classList.remove('ep-invalid'), { once: true });
    }

    function shakeSubmitBtn() {
        const btn = document.getElementById('epSubmitBtn');
        btn.classList.add('ep-shake');
        btn.addEventListener('animationend', () => btn.classList.remove('ep-shake'), { once: true });
    }

    // ── Data collection ───────────────────────────────────────────────────────
    function collectFormData() {
        const stateEl = document.getElementById('epState');
        const stateName = stateEl.options[stateEl.selectedIndex].text;
        return {
            state: stateName,
            city: document.getElementById('epCity').value.trim(),
            consumerType: form.querySelector('input[name="consumerType"]:checked').value,
            rooftop: form.querySelector('input[name="rooftop"]:checked').value,
            consumption: parseFloat(document.getElementById('epConsumption').value) || 0
        };
    }

    // ── Build recommendation list ─────────────────────────────────────────────
    function buildRecommendations(data) {
        const recs = [];

        // Consumer type recs
        const typeRecs = RECOMMENDATIONS[data.consumerType] || [];
        recs.push(...typeRecs);

        // Rooftop rec
        recs.push(data.rooftop === 'yes'
            ? RECOMMENDATIONS.rooftopYes
            : RECOMMENDATIONS.rooftopNo
        );

        // Consumption-based rec
        if (data.consumption < 150) recs.push(RECOMMENDATIONS.low);
        else if (data.consumption <= 400) recs.push(RECOMMENDATIONS.medium);
        else recs.push(RECOMMENDATIONS.high);

        // General / platform rec
        recs.push(...RECOMMENDATIONS.general);

        return recs;
    }

    // ── Render recommendations ────────────────────────────────────────────────
    function renderRecommendations(recs, data) {
        recCards.innerHTML = '';

        // Summary stat strip
        const strip = document.createElement('div');
        strip.className = 'rec-stat-strip';
        strip.innerHTML = `
            <span class="rec-stat"><strong>${escHtml(data.city)}</strong>, ${escHtml(data.state)}</span>
            <span class="rec-dot">·</span>
            <span class="rec-stat">${capitaliseSentence(data.consumerType)}</span>
            <span class="rec-dot">·</span>
            <span class="rec-stat">${data.consumption} kWh/mo</span>
            <span class="rec-dot">·</span>
            <span class="rec-stat">Rooftop: ${data.rooftop === 'yes' ? 'Yes ✔' : 'No ✖'}</span>
        `;
        recCards.appendChild(strip);

        // Recommendation cards with staggered animation
        recs.forEach((rec, i) => {
            const card = document.createElement('div');
            card.className = 'rec-card';
            card.style.animationDelay = `${i * 80}ms`;
            card.innerHTML = `
                <span class="rec-card-icon" aria-hidden="true">${rec.icon}</span>
                <div class="rec-card-body">
                    <p class="rec-card-title">${escHtml(rec.title)}</p>
                    <p class="rec-card-desc">${escHtml(rec.desc)}</p>
                </div>
            `;
            recCards.appendChild(card);
        });

        form.hidden = true;
        recPanel.hidden = false;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function capitaliseSentence(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

})();
