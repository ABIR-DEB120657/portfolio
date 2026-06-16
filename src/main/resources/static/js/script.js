/* ============================================================
   PORTFOLIO SCRIPT.JS — Dark Minimal Green Edition
   ──────────────────────────────────────────────────────────
   NOTE: নিচের sections এখন navbar.html inline script-এ আছে,
         তাই এখানে duplicate করা হয়নি:
         • Theme toggle click + icon update   → navbar.html
         • Hamburger menu                     → navbar.html
         • Navbar scroll (scrolled class)     → navbar.html
         • Scroll progress bar                → navbar.html
         • Sliding nav indicator              → navbar.html

   এই ফাইলে যা আছে:
         1. Theme Init (page flash রোধ করতে)
         2. Custom Cursor
         3. Scroll Fade-Up
         4. Active Nav Link on Scroll (single-page only)
         5. Smooth Scroll (Lenis)
         6. Shockwave Burst + Particles
         7. About Page — Scroll Reveal
   ============================================================ */

/* ═══════════════════════════════════════════════════════════
   0. THEME FLASH PREVENTION
   ═══════════════════════════════════════════════════════════ */
const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
(function () {
    var saved = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener("DOMContentLoaded", function () {

    // ═══════════════════════════════════════════════════
    // 1. THEME ICON SYNC
    // ═══════════════════════════════════════════════════
    var themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        themeIcon.className = currentTheme === 'light'
            ? 'fa-solid fa-sun'
            : 'fa-solid fa-moon';
    }

    // ═══════════════════════════════════════════════════
    // 2. CUSTOM CURSOR
    // ═══════════════════════════════════════════════════
    const cursor     = document.querySelector('.cursor');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursor && cursorRing) {
        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top  = mouseY + 'px';
        });

        (function lerpRing() {
            ringX += (mouseX - ringX) * 0.25;
            ringY += (mouseY - ringY) * 0.25;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top  = ringY + 'px';
            requestAnimationFrame(lerpRing);
        })();

        const interactiveEls = document.querySelectorAll(
            'a, button, .btn, .card, .theme-toggle-btn, .nav-links a, .hero-tag, .badge'
        );
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform       = 'translate(-50%, -50%) scale(1.8)';
                cursorRing.style.width       = '52px';
                cursorRing.style.height      = '52px';
                cursorRing.style.opacity     = '1';
                cursorRing.style.borderColor = 'var(--accent)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform       = 'translate(-50%, -50%) scale(1)';
                cursorRing.style.width       = '30px';
                cursorRing.style.height      = '30px';
                cursorRing.style.opacity     = '0.6';
                cursorRing.style.borderColor = '';
            });
        });

        document.addEventListener('mousedown', () => {
            cursor.style.transform     = 'translate(-50%, -50%) scale(0.7)';
            cursorRing.style.transform = 'translate(-50%, -50%) scale(0.85)';
        });
        document.addEventListener('mouseup', () => {
            cursor.style.transform     = 'translate(-50%, -50%) scale(1)';
            cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity     = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity     = '1';
            cursorRing.style.opacity = '0.6';
        });
    }

    // ═══════════════════════════════════════════════════
    // 3. SCROLL FADE-UP (IntersectionObserver)
    // ═══════════════════════════════════════════════════
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length) {
        const fadeObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        fadeEls.forEach(el => fadeObserver.observe(el));
    }

    // ═══════════════════════════════════════════════════
    // 4. ACTIVE NAV LINK ON SCROLL
    // ═══════════════════════════════════════════════════
    const sections = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-links a');

    if (sections.length && navLinks.length) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(sec => {
                if (window.scrollY >= sec.offsetTop - 110) current = sec.id;
            });
            navLinks.forEach(a => {
                a.classList.remove('active');
                const href = a.getAttribute('href');
                if (href === '#' + current || href === '/' + current) {
                    a.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // ═══════════════════════════════════════════════════
    // 5. SMOOTH SCROLL — Lenis দিয়ে
    //    আগে: scrollIntoView({ behavior: 'smooth' })
    //    এখন: lenis.scrollTo() — conflict নেই, jank নেই
    // ═══════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const target   = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, {
                    offset: 0,
                    duration: 1.4,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            }
        });
    });

    // ═══════════════════════════════════════════════════
    // 7. ABOUT PAGE — SCROLL REVEAL
    // ═══════════════════════════════════════════════════
    initReveal();

    function initReveal() {
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.10,
            rootMargin: '0px 0px -40px 0px'
        });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    // ═══════════════════════════════════════════════════
    // 6. SHOCKWAVE BURST + PARTICLES
    //    Hero page এ burst-1/2/3 না থাকলে skip
    // ═══════════════════════════════════════════════════
    const burstRings = [
        document.getElementById('burst-1'),
        document.getElementById('burst-2'),
        document.getElementById('burst-3')
    ].filter(Boolean);

    if (burstRings.length === 0) return;

    const shockwaveWrapper = document.querySelector('.shockwave-wrapper');

    /* ─── 6a. Burst particles ─── */
    function spawnBurstParticles(count) {
        if (!shockwaveWrapper) return;
        count = count || 24;

        for (var i = 0; i < count; i++) {
            var dot   = document.createElement('div');
            dot.className = 'burst-particle';

            var angle = Math.random() * Math.PI * 2;
            var dist  = 80 + Math.random() * 140;
            var dx    = Math.cos(angle) * dist;
            var dy    = Math.sin(angle) * dist;
            var size  = 2   + Math.random() * 4;
            var dur   = 0.55 + Math.random() * 0.65;
            var del   = Math.random() * 0.15;
            var alpha = 0.7  + Math.random() * 0.3;

            dot.style.width      = size + 'px';
            dot.style.height     = size + 'px';
            dot.style.background = 'rgba(16,185,129,' + alpha + ')';
            dot.style.boxShadow  =
                '0 0 ' + (size * 2.5).toFixed(1) + 'px rgba(16,185,129,0.9),'
                + '0 0 ' + (size * 5.0).toFixed(1) + 'px rgba(16,185,129,0.4)';

            dot.style.setProperty('--pdx',  dx.toFixed(1)  + 'px');
            dot.style.setProperty('--pdy',  dy.toFixed(1)  + 'px');
            dot.style.setProperty('--pdur', dur.toFixed(2) + 's');
            dot.style.setProperty('--pdel', del.toFixed(2) + 's');
            dot.style.setProperty('--psz',  size           + 'px');

            shockwaveWrapper.appendChild(dot);

            (function(el, ms) {
                setTimeout(function() {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, ms);
            })(dot, (dur + del + 0.15) * 1000);
        }
    }

    /* ─── 6b. Ambient floating particles ─── */
    function initAmbientParticles(count) {
        if (!shockwaveWrapper) return;
        count = count || 13;

        var particles = [];

        for (var i = 0; i < count; i++) {
            var dot = document.createElement('div');

            var size      = 1.5  + Math.random() * 2.5;
            var alpha     = 0.3  + Math.random() * 0.45;
            var orbitR    = 60   + Math.random() * 85;
            var startA    = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            var speed     = (0.00012 + Math.random() * 0.00022)
                * (Math.random() < 0.5 ? 1 : -1);
            var floatAmp  = 7   + Math.random() * 13;
            var floatFreq = 0.5 + Math.random() * 0.9;
            var phase     = Math.random() * Math.PI * 2;
            var opBase    = 0.2 + Math.random() * 0.35;
            var opAmp     = 0.1 + Math.random() * 0.2;

            dot.style.position      = 'absolute';
            dot.style.top           = '50%';
            dot.style.left          = '50%';
            dot.style.width         = size + 'px';
            dot.style.height        = size + 'px';
            dot.style.borderRadius  = '50%';
            dot.style.background    = 'rgba(16,185,129,' + alpha + ')';
            dot.style.boxShadow     = '0 0 ' + (size * 2) + 'px rgba(16,185,129,0.8)';
            dot.style.pointerEvents = 'none';
            dot.style.zIndex        = '6';
            dot.style.willChange    = 'transform,opacity';
            dot.style.transform     = 'translate(-50%,-50%)';

            shockwaveWrapper.appendChild(dot);

            particles.push({
                el: dot, angle: startA, orbitR, speed,
                floatAmp, floatFreq, phase, opBase, opAmp,
                t: Math.random() * Math.PI * 2,
            });
        }

        var heroVisible = true;

        function tickAmbient() {
            if (heroVisible) {
                for (var j = 0; j < particles.length; j++) {
                    var p = particles[j];
                    p.t     += 0.011;
                    p.angle += p.speed;

                    var bx = Math.cos(p.angle) * p.orbitR;
                    var by = Math.sin(p.angle) * p.orbitR;
                    var fx = Math.sin(p.t * p.floatFreq + p.phase)              * p.floatAmp;
                    var fy = Math.cos(p.t * p.floatFreq * 0.7 + p.phase * 1.3) * p.floatAmp;
                    var op = p.opBase + Math.sin(p.t * 0.85 + p.phase) * p.opAmp;
                    op = Math.max(0.04, Math.min(0.85, op));

                    p.el.style.transform =
                        'translate(calc(-50% + ' + (bx + fx).toFixed(2) + 'px),'
                        + 'calc(-50% + '         + (by + fy).toFixed(2) + 'px))';
                    p.el.style.opacity = op.toFixed(3);
                }
            }
            requestAnimationFrame(tickAmbient);
        }

        requestAnimationFrame(tickAmbient);

        var heroEl = document.getElementById('home');
        if (heroEl) {
            new IntersectionObserver(function(entries) {
                heroVisible = entries[0].isIntersecting;
            }, { threshold: 0.05 }).observe(heroEl);
        }
    }

    /* ─── 6c. Trigger shockwave ─── */
    function triggerShockwaveBurst(stagger) {
        stagger = stagger || 110;

        burstRings.forEach(function(el, i) {
            setTimeout(function() {
                el.classList.remove('active');
                void el.offsetWidth;
                el.classList.add('active');
            }, i * stagger);
        });

        spawnBurstParticles(24);
    }

    /* ─── 6d. Init ─── */
    initAmbientParticles(13);
    setTimeout(triggerShockwaveBurst, 900);
    var burstInterval = setInterval(triggerShockwaveBurst, 8000);

    var photoCircle = document.querySelector('.hero-photo-circle');
    if (photoCircle) {
        photoCircle.addEventListener('click', function() {
            triggerShockwaveBurst(80);
        });
    }

    var heroSection = document.getElementById('home');
    if (heroSection) {
        new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                if (!burstInterval) burstInterval = setInterval(triggerShockwaveBurst, 8000);
            } else {
                clearInterval(burstInterval);
                burstInterval = null;
            }
        }, { threshold: 0.1 }).observe(heroSection);
    }

});
