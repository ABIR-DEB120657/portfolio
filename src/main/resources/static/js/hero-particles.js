/* ============================================================
   HERO-PARTICLES.JS
   Green dot-grid arc wave around photo
   + Magnetic attraction (dots pulled toward mouse)
   + Ambient spotlight follow (.hero-spotlight CSS vars)
   ============================================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const canvas = document.getElementById('hero-particle-canvas');
        if (!canvas) return;

        const ctx    = canvas.getContext('2d');
        const W      = 520;
        const H      = 520;
        canvas.width  = W;
        canvas.height = H;

        const CX = W / 2;
        const CY = H / 2;

        /* ── MAGNETIC MOUSE STATE ── */
        let mouseX = null;
        let mouseY = null;
        const MAGNET_RADIUS   = 140;
        const MAGNET_STRENGTH = 22;

        const magnetTarget =
            document.querySelector('.hero-section') ||
            document.getElementById('home') ||
            document;

        magnetTarget.addEventListener('mousemove', function (e) {
            const rect   = canvas.getBoundingClientRect();
            const scaleX = W / rect.width;
            const scaleY = H / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top)  * scaleY;

            if (x >= 0 && x <= W && y >= 0 && y <= H) {
                mouseX = x;
                mouseY = y;
            } else {
                mouseX = null;
                mouseY = null;
            }
        });

        magnetTarget.addEventListener('mouseleave', function () {
            mouseX = null;
            mouseY = null;
        });

        /* ── DOT GRID PARTICLES ── */
        const dots = [];
        const COLS = 22, ROWS = 22;
        const SPACING  = 22;
        const OFFSET_X = CX - (COLS * SPACING) / 2;
        const OFFSET_Y = CY - (ROWS * SPACING) / 2;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const bx   = OFFSET_X + c * SPACING;
                const by   = OFFSET_Y + r * SPACING;
                const dist = Math.hypot(bx - CX, by - CY);
                if (dist < 80 || dist > 240) continue;

                dots.push({
                    bx, by,
                    x: bx, y: by,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.3 + Math.random() * 0.4,
                    amp:   1.5 + Math.random() * 2,
                    size:  0.8 + Math.random() * 1.2,
                    alpha: 0.2 + Math.random() * 0.5,
                });
            }
        }

        /* ── ARC WAVE OFFSET ── */
        let waveOffset = 0;

        /* ── ANIMATION LOOP ── */
        let raf;
        function animate(ts) {
            ctx.clearRect(0, 0, W, H);
            waveOffset = ts * 0.001;

            /* Dot grid with magnetic attraction */
            dots.forEach(d => {
                const wave = Math.sin(d.phase + waveOffset * d.speed) * d.amp;
                let x = d.bx + wave;
                let y = d.by + wave * 0.5;

                if (mouseX !== null) {
                    const dx   = mouseX - x;
                    const dy   = mouseY - y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < MAGNET_RADIUS && dist > 0.01) {
                        const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_STRENGTH;
                        x += (dx / dist) * pull;
                        y += (dy / dist) * pull;
                    }
                }

                d.x = x;
                d.y = y;

                const pulseAlpha = d.alpha * (0.7 + 0.3 * Math.sin(waveOffset * d.speed + d.phase));
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(16,185,129,${pulseAlpha})`;
                ctx.fill();
            });

            /* Arc wave rings */
            for (let ring = 0; ring < 3; ring++) {
                const r        = 130 + ring * 40;
                const segments = 80;
                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const wave  = Math.sin(angle * 4 + waveOffset + ring * 1.2) * 5;
                    const rr    = r + wave;
                    const x     = CX + Math.cos(angle) * rr;
                    const y     = CY + Math.sin(angle) * rr;
                    const alpha = 0.08 + 0.06 * Math.sin(angle * 3 + waveOffset);

                    ctx.beginPath();
                    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(16,185,129,${alpha})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(animate);
        }

        raf = requestAnimationFrame(animate);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(animate);
        });

    });

    /* ════════════════════════════════════════════════════════
       AMBIENT SPOTLIGHT FOLLOW
       Updates --spot-x / --spot-y on .hero-spotlight
       ════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
        const heroSection = document.querySelector('.hero-section') || document.getElementById('home');
        const spotlight   = document.getElementById('heroSpotlight') || document.querySelector('.hero-spotlight');

        if (!heroSection || !spotlight) return;

        heroSection.addEventListener('mousemove', function (e) {
            const rect = heroSection.getBoundingClientRect();
            spotlight.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
            spotlight.style.setProperty('--spot-y', (e.clientY - rect.top)  + 'px');
            spotlight.classList.add('is-active');
        });

        heroSection.addEventListener('mouseleave', function () {
            spotlight.classList.remove('is-active');
        });
    });

})();