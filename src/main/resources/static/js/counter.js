/* ============================================================
   COUNTER.JS — Progress ring + Skill bars
   ============================================================ */
(function () {
    'use strict';

    /* ── 1. PROGRESS RING ANIMATION ────────────────────────── */
    function initProgressRing() {
        const ring  = document.getElementById('progress-ring');
        const label = document.getElementById('progress-value');
        if (!ring || !label) return;

        const RADIUS        = 36;
        const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
        const TARGET_PCT    = 85;

        ring.style.strokeDasharray  = CIRCUMFERENCE;
        ring.style.strokeDashoffset = CIRCUMFERENCE;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.target.dataset.done) return;
                entry.target.dataset.done = '1';

                const offset = CIRCUMFERENCE - (TARGET_PCT / 100) * CIRCUMFERENCE;
                setTimeout(() => {
                    ring.style.transition       = 'stroke-dashoffset 1.8s ease';
                    ring.style.strokeDashoffset = offset;
                }, 300);

                let current = 0;
                const step = () => {
                    current = Math.min(current + 2, TARGET_PCT);
                    label.textContent = current + '%';
                    if (current < TARGET_PCT) setTimeout(step, 30);
                };
                setTimeout(step, 300);

                obs.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        const card = ring.closest('.hero-card') || ring;
        obs.observe(card);
    }

    /* ── 2. SKILL BAR ANIMATION ─────────────────────────────── */
    function initSkillBars() {
        const bars = document.querySelectorAll('.skill-bar-fill');
        if (!bars.length) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.target.dataset.done) return;
                entry.target.dataset.done = '1';
                const target = entry.target.dataset.width || '0%';
                setTimeout(() => {
                    entry.target.style.width = target;
                }, 120);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        bars.forEach(el => obs.observe(el));
    }

    /* ── INIT ALL ───────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        initProgressRing();
        initSkillBars();
    });

})();