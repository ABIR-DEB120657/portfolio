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
/* ═══════════════════════════════════════
   STEP 8 — CURSOR-REACTIVE PARTICLES
═══════════════════════════════════════ */
(function () {
    var heroEl = document.getElementById('home');
    if (!heroEl) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:0;opacity:0.55;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var mouse = { x: -999, y: -999, active: false };
    var particles = [];
    var MAX = 30;

    heroEl.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        // Spawn particle on move
        if (particles.length < MAX) {
            for (var i = 0; i < 1; i++) {
                particles.push({
                    x: mouse.x + (Math.random() - 0.5) * 12,
                    y: mouse.y + (Math.random() - 0.5) * 12,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: -0.4 - Math.random() * 1.0,
                    size: 1.2 + Math.random() * 2.2,
                    alpha: 0.55 + Math.random() * 0.35,
                    life: 0,
                    maxLife: 55 + Math.floor(Math.random() * 35),
                    hue: Math.random() < 0.6 ? 160 : (Math.random() < 0.5 ? 190 : 270),
                });
            }
        }
    });

    heroEl.addEventListener('mouseleave', function () {
        mouse.active = false;
    });

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.life++;
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy -= 0.012;
            p.vx *= 0.97;

            var lr    = p.life / p.maxLife;
            var alpha = p.alpha * (1 - lr);
            var size  = p.size  * (1 - lr * 0.4);
            if (alpha < 0.01 || p.life >= p.maxLife) {
                particles.splice(i, 1);
                continue;
            }

            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
            grad.addColorStop(0,   'hsla(' + p.hue + ',90%,65%,' + alpha.toFixed(3) + ')');
            grad.addColorStop(0.5, 'hsla(' + p.hue + ',80%,55%,' + (alpha * 0.5).toFixed(3) + ')');
            grad.addColorStop(1,   'hsla(' + p.hue + ',70%,50%,0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        requestAnimationFrame(tick);
    }
    tick();
})();
