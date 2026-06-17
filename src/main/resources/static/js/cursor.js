/* ═══════════════════════════════════════
   STEP 9 — MAGNETIC CURSOR
═══════════════════════════════════════ */
(function () {
    'use strict';

    // Mobile এ skip
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'mag-cursor-dot';
    ring.className = 'mag-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = 0, my = 0;
    var rx = 0, ry = 0;
    var scale = 1;
    var ringW = 36, ringH = 36;
    var isHidden = false;

    document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
    });
    document.addEventListener('mouseleave', function () {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
        isHidden = true;
    });
    document.addEventListener('mouseenter', function () {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
        isHidden = false;
    });
    document.addEventListener('mousedown', function () {
        dot.style.transform  = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px) scale(0.6)';
        ring.style.transform = 'translate(' + (rx - ringW / 2) + 'px,' + (ry - ringH / 2) + 'px) scale(0.85)';
    });
    document.addEventListener('mouseup', function () {
        dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px) scale(1)';
    });

    // Magnetic elements
    var MAGNETIC_SELECTORS = 'a, button, .btn-primary, .btn-outline, .social-link, .hero-tag, .orbit-tag';
    var activeEl = null;
    var elRect   = null;

    function bindMagnetic() {
        document.querySelectorAll(MAGNETIC_SELECTORS).forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                activeEl = el;
                elRect   = el.getBoundingClientRect();
                ring.style.width   = (elRect.width  + 18) + 'px';
                ring.style.height  = (elRect.height + 18) + 'px';
                ring.style.borderColor = 'rgba(16,185,129,0.8)';
                ring.style.background  = 'rgba(16,185,129,0.05)';
                ringW = elRect.width  + 18;
                ringH = elRect.height + 18;
            });
            el.addEventListener('mouseleave', function () {
                activeEl = null;
                ring.style.width       = '36px';
                ring.style.height      = '36px';
                ring.style.borderColor = '';
                ring.style.background  = '';
                ring.style.borderRadius = '50%';
                ringW = 36;
                ringH = 36;
                // Reset element position
                el.style.transform = '';
            });
            el.addEventListener('mousemove', function (e) {
                if (!activeEl) return;
                elRect = el.getBoundingClientRect();
                var cx  = elRect.left + elRect.width  / 2;
                var cy  = elRect.top  + elRect.height / 2;
                var dx  = (e.clientX - cx) * 0.30;
                var dy  = (e.clientY - cy) * 0.30;
                el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                el.style.transition = 'transform 0.15s ease';
            });
        });
    }

    // Run once + re-run after dynamic content
    setTimeout(bindMagnetic, 800);

    // Lerp ring to mouse
    function lerp(a, b, t) { return a + (b - a) * t; }

    function loop() {
        if (!isHidden) {
            var tx, ty;
            if (activeEl && elRect) {
                elRect = activeEl.getBoundingClientRect();
                tx = elRect.left + elRect.width  / 2;
                ty = elRect.top  + elRect.height / 2;
                var dx = (mx - tx) * 0.28;
                var dy = (my - ty) * 0.28;
                rx = lerp(rx, tx + dx - ringW / 2, 0.18);
                ry = lerp(ry, ty + dy - ringH / 2, 0.18);
                ring.style.borderRadius = Math.min(elRect.height / 2 + 9, 24) + 'px';
            } else {
                rx = lerp(rx, mx - ringW / 2, 0.14);
                ry = lerp(ry, my - ringH / 2, 0.14);
            }
            ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        }
        requestAnimationFrame(loop);
    }
    loop();
})();