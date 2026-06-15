/* ============================================================
   ORBIT.JS — Hero Section Circular Skill Tag Rotation
   File: src/main/resources/static/js/orbit.js
   ============================================================ */

(function () {
    'use strict';

    /* ── Config ─────────────────────────────────────────── */
    const CONFIG = {
        orbitDuration:    12,    // seconds — একটা full rotation
        orbitRadius:      155,   // px — photo 100px radius + 55px gap
        startAngleOffset: -90,   // degrees — top থেকে শুরু
        autoStart:        true,
    };

    /* ── State ──────────────────────────────────────────── */
    let animationId    = null;
    let startTimestamp = null;

    /* ── Main Init ──────────────────────────────────────── */
    function initOrbit() {
        const container = document.querySelector('.orbit-container');
        if (!container) return;

        const tags = container.querySelectorAll('.orbit-tag');
        if (!tags.length) return;

        const total = tags.length;

        tags.forEach((tag, i) => {
            const angleDeg = CONFIG.startAngleOffset + (360 / total) * i;
            tag.style.setProperty('--orbit-radius',   CONFIG.orbitRadius   + 'px');
            tag.style.setProperty('--orbit-duration',  CONFIG.orbitDuration + 's');
            tag.style.setProperty('--initial-angle',   angleDeg             + 'deg');
            tag._orbitAngle = angleDeg;
        });

        if (CONFIG.autoStart) startOrbit(container, tags);
    }

    /* ── Animation Loop ─────────────────────────────────── */
    function startOrbit(container, tags) {
        const total       = tags.length;
        const anglePerTag = 360 / total;

        function getCenter() {
            return {
                cx: container.offsetWidth  / 2,
                cy: container.offsetHeight / 2,
            };
        }

        function tick(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed    = timestamp - startTimestamp;
            const durationMs = CONFIG.orbitDuration * 1000;
            const { cx, cy } = getCenter();

            tags.forEach((tag, i) => {
                const baseAngle    = CONFIG.startAngleOffset + anglePerTag * i;
                const rotationFrac = (elapsed % durationMs) / durationMs;
                const currentAngle = baseAngle + rotationFrac * 360;
                const rad          = (currentAngle * Math.PI) / 180;

                const x = cx + CONFIG.orbitRadius * Math.cos(rad);
                const y = cy + CONFIG.orbitRadius * Math.sin(rad);

                tag.style.left      = x + 'px';
                tag.style.top       = y + 'px';
                tag.style.transform = `translate(-50%, -50%) rotate(${-currentAngle}deg)`;
            });

            animationId = requestAnimationFrame(tick);
        }

        animationId = requestAnimationFrame(tick);
    }

    /* ── Resize handler ─────────────────────────────────── */
    function bindResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId    = null;
                    startTimestamp = null;
                }
                initOrbit();
            }, 250);
        });
    }

    /* ── Radar sweep element inject ─────────────────────── */
    function injectRadarSweep() {
        const container = document.querySelector('.orbit-container');
        if (!container) return;
        if (container.querySelector('.radar-sweep-line')) return;

        const sweep = document.createElement('div');
        sweep.className = 'radar-sweep-line radar-sweep';
        container.appendChild(sweep);
    }

    /* ── Entry point ─────────────────────────────────────── */
    function boot() {
        initOrbit();
        /* bindHoverPause সরানো হয়েছে — hover এ stop হবে না */
        bindResize();
        injectRadarSweep();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();