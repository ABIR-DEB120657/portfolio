/* ============================================================
   ABOUT PAGE JS — v3.1
   ──────────────────────────────────────────────────────────
   Step  2 → Floating Particles  (18 dots, 20–30s float)
   Step  5 → Typing Effect       (terminal, once, no loop)
   Step  6 → Scroll Reveal       (opacity + translateY)
   Step  7 → Education Timeline  (vehicle moves → line draws
                                   progressively behind it;
                                   node appears on arrival)
   Step  9 → What I Do Stagger   (0.2s gap per card)
   Step 11 → Mouse Parallax      (grid layer + ABIR watermark)
   ──────────────────────────────────────────────────────────
   Vehicle order:
     Car    SSC  → HSC         (segment  0 % → ~36 %)
     Rocket HSC  → B.Sc        (segment ~36% → ~70 %)
     Man    B.Sc → Future Goal  (segment ~70% → 100 %)

   Fixes v3.1:
     • p.style.animation = 'none'  ← stops any CSS animation
       that would fight JS-driven strokeDashoffset each frame
     • svg.style.overflow = 'visible'  ← vehicles / labels
       outside the viewBox are no longer clipped by browser
     • drawTo(tSSC) called at the top of runVehicles so the
       tiny initial segment (path-start → SSC node) is drawn
       before the car appears
     • fillTo added to every segment: after vehicle fades out,
       drawTo(fillTo) completes the line all the way to the
       destination node (closes the ½-GAP stub that the old
       "to = tNode − GAP" left undrawn)
     • IntersectionObserver threshold lowered 0.22 → 0.18
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */
const qs   = (sel, ctx = document) => ctx.querySelector(sel);
const qsa  = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rnd  = (min, max) => Math.random() * (max - min) + min;

const isDesktop    = () => window.innerWidth > 768;
const wantsReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const s       = document.createElement('style');
    s.id          = id;
    s.textContent = css;
    document.head.appendChild(s);
}


/* ══════════════════════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    if (!qs('.about-page')) return;

    initParticles();
    initScrollReveal();
    initEduTimeline();
    initStaggerCards();
    initTypingEffect();
    initMouseParallax();
});


/* ══════════════════════════════════════════════════════════
   STEP 2 — FLOATING PARTICLES
══════════════════════════════════════════════════════════ */
function initParticles() {
    if (wantsReduced()) return;
    const page = qs('.about-page');
    if (!page) return;

    injectStyle('ab-particle-kf', `
        @keyframes abParticleFloat {
          from { transform: translateY(0)              scale(1.0);  }
          to   { transform: translateY(var(--float-y)) scale(0.72); }
        }
        [data-theme="light"] .ab-particle { background: #059669 !important; }
    `);

    const wrap = document.createElement('div');
    wrap.className = 'ab-particles-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = `
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0; overflow: hidden;
    `;
    page.prepend(wrap);

    for (let i = 0; i < 18; i++) {
        const dot  = document.createElement('span');
        dot.className = 'ab-particle';
        const size = rnd(1.8, 4.2).toFixed(1);
        const dur  = rnd(20, 30).toFixed(1);
        const del  = rnd(-28, 0).toFixed(1);
        const op   = rnd(0.06, 0.18).toFixed(2);
        const ty   = `-${rnd(28, 72).toFixed(0)}px`;
        dot.style.cssText = `
            position: absolute;
            left: ${rnd(2, 97).toFixed(1)}%;
            top:  ${rnd(4, 94).toFixed(1)}%;
            width: ${size}px; height: ${size}px;
            border-radius: 50%; background: #00ff88;
            opacity: ${op};
            animation: abParticleFloat ${dur}s ${del}s ease-in-out infinite alternate;
            will-change: transform;
        `;
        dot.style.setProperty('--float-y', ty);
        wrap.appendChild(dot);
    }
}


/* ══════════════════════════════════════════════════════════
   STEP 5 — TYPING EFFECT
══════════════════════════════════════════════════════════ */
function initTypingEffect() {
    const codeEl = qs('.terminal-code');
    if (!codeEl) return;

    const originalHTML = codeEl.innerHTML.trim();
    codeEl.innerHTML   = '';

    injectStyle('ab-cursor-kf', `
        @keyframes abCursorBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        .ab-type-cursor {
          display: inline-block; width: 2px; height: 1.05em;
          background: #00ff88; border-radius: 1px;
          vertical-align: middle; margin-left: 2px;
          box-shadow: 0 0 6px rgba(0,255,136,.70);
          animation: abCursorBlink 0.72s step-end infinite;
        }
        .ab-type-cursor.done { animation: none; opacity: 0; transition: opacity 0.9s ease; }
    `);

    if (wantsReduced()) { codeEl.innerHTML = originalHTML; return; }

    const cursor      = document.createElement('span');
    cursor.className  = 'ab-type-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    const START_DELAY = 1100;
    const CHAR_MS     = 42;
    let idx = 0, built = '';

    setTimeout(() => {
        codeEl.appendChild(cursor);
        const tick = setInterval(() => {
            if (idx >= originalHTML.length) {
                clearInterval(tick);
                setTimeout(() => {
                    cursor.classList.add('done');
                    setTimeout(() => cursor.remove(), 950);
                }, 2000);
                return;
            }
            const ch = originalHTML[idx];
            if (ch === '<') {
                const close = originalHTML.indexOf('>', idx);
                if (close !== -1) { built += originalHTML.slice(idx, close + 1); idx = close + 1; }
                else { built += originalHTML[idx++]; }
            } else if (ch === '&') {
                const semi = originalHTML.indexOf(';', idx);
                if (semi !== -1 && semi - idx <= 9) { built += originalHTML.slice(idx, semi + 1); idx = semi + 1; }
                else { built += originalHTML[idx++]; }
            } else {
                built += originalHTML[idx++];
            }
            codeEl.innerHTML = built;
            codeEl.appendChild(cursor);
        }, CHAR_MS);
    }, START_DELAY);
}


/* ══════════════════════════════════════════════════════════
   STEP 6 — SCROLL REVEAL
══════════════════════════════════════════════════════════ */
function initScrollReveal() {
    const SELECTORS = ['.about-section-title', '.qi-card', '.hobby-card'];
    const els = qsa(SELECTORS.join(', '));
    if (!els.length) return;

    if (wantsReduced()) {
        els.forEach(el => el.classList.add('reveal', 'visible'));
        return;
    }

    els.forEach(el => el.classList.add('reveal'));

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    els.forEach(el => obs.observe(el));
}


/* ══════════════════════════════════════════════════════════
   STEP 7 — EDUCATION JOURNEY TIMELINE
   ──────────────────────────────────────────────────────────
   Flow:
     1. Section enters viewport
     2. SSC node fades in  (it's the journey start)
     3. Car appears at SSC edge → moves toward HSC
        → line draws behind car each frame
     4. Car fades out → line drawn fully to HSC → HSC node fades in
     5. Rocket appears at HSC edge → moves toward B.Sc
        → line continues drawing behind rocket
     6. Rocket fades out → line drawn fully to B.Sc → B.Sc node fades in
     7. Walking man appears at B.Sc edge → moves to Future Goal
        → line finishes drawing
     8. Man fades out → line drawn fully to Future Goal → node fades in
══════════════════════════════════════════════════════════ */
function initEduTimeline() {
    const path     = document.getElementById('edu-draw-path');
    const glowPath = qs('.edu-glow-path');
    const section  = document.getElementById('about-education');
    if (!path || !section) return;

    /* ── FIX 1: set SVG overflow visible ──
       Browsers clip SVG content to the viewBox by default.
       Vehicles and their text labels (CAR / ROCKET / WALK)
       can extend outside the viewBox; without this they vanish. */
    const svg = path.closest('svg');
    if (svg) svg.style.overflow = 'visible';

    /* ── Inject CSS: nodes start invisible, animate to visible ── */
    injectStyle('ab-edu-nodes', `
        /* Nodes hidden until vehicle arrives */
        .edu-node-g {
            opacity:          0;
            transform-origin: center;
            transition:       opacity 0.65s ease, transform 0.65s ease;
        }
        .edu-node-g.edu-node-visible {
            opacity: 1;
        }

        /* Pulse ring — only plays after node is revealed */
        .edu-pulse-ring {
            transform-box:    fill-box;
            transform-origin: center;
        }
        @keyframes eduNodePulse {
            0%   { opacity: 0.35; r: 28; }
            50%  { opacity: 0.08; r: 38; }
            100% { opacity: 0.35; r: 28; }
        }
        @keyframes eduNodePulseLg {
            0%   { opacity: 0.25; r: 34; }
            50%  { opacity: 0.06; r: 46; }
            100% { opacity: 0.25; r: 34; }
        }
        .edu-node-g.edu-node-visible .edu-pulse-ring {
            animation: eduNodePulse 2.2s ease-in-out infinite;
        }
        .edu-node-g.edu-node-visible .edu-pulse-bright,
        .edu-node-g.edu-node-visible .edu-pulse-future {
            animation: eduNodePulseLg 2.2s ease-in-out infinite;
        }

        /* Vehicle base — hidden until JS shows them */
        .edu-vehicle { display: none; }

        /* Exhaust smoke subtle animation */
        @keyframes eduExhaust {
            0%   { opacity: 0.4;  transform: translateX(0); }
            100% { opacity: 0;    transform: translateX(-8px); }
        }
        .edu-exhaust-1 { animation: eduExhaust 0.6s ease-out infinite; }
        .edu-exhaust-2 { animation: eduExhaust 0.6s 0.2s ease-out infinite; }
        .edu-exhaust-3 { animation: eduExhaust 0.6s 0.4s ease-out infinite; }
    `);

    const totalLen = path.getTotalLength();

    /* ── FIX 2: disable CSS animation AND set dashoffset/dasharray ──
       A CSS @keyframes animation on the path element (if defined in
       about.css) can override inline-style strokeDashoffset changes
       each frame, making the line appear stuck or invisible.
       Setting animation:'none' gives JS full control.             */
    [path, glowPath].forEach(p => {
        if (!p) return;
        p.style.animation        = 'none';
        p.style.strokeDasharray  = `${totalLen}`;
        p.style.strokeDashoffset = `${totalLen}`;
        p.style.transition       = 'none';
    });

    const nodes = qsa('.edu-node-g');

    /* Reduced-motion: reveal everything instantly */
    if (wantsReduced()) {
        [path, glowPath].forEach(p => { if (p) p.style.strokeDashoffset = '0'; });
        nodes.forEach(n => n.classList.add('edu-node-visible'));
        return;
    }

    /* ── FIX 3: threshold lowered 0.22 → 0.18 ── */
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            /* SSC node appears first (the journey start) */
            setTimeout(() => {
                if (nodes[0]) nodes[0].classList.add('edu-node-visible');
            }, 350);

            /* Vehicles start shortly after SSC node is visible */
            setTimeout(() => runVehicles(path, glowPath, totalLen, nodes), 950);

            obs.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    obs.observe(section);
}


/* ══════════════════════════════════════════════════════════
   RUN VEHICLES — orchestrates all 3 vehicles in sequence
══════════════════════════════════════════════════════════ */
function runVehicles(path, glowPath, totalLen, nodes) {

    /* ── Find path-length ratio t closest to SVG point (tx, ty) ── */
    function findT(tx, ty) {
        let best = 0, bestDist = Infinity;
        const STEPS = 600;
        for (let i = 0; i <= STEPS; i++) {
            const t = i / STEPS;
            const p = path.getPointAtLength(t * totalLen);
            const d = Math.hypot(p.x - tx, p.y - ty);
            if (d < bestDist) { bestDist = d; best = t; }
        }
        return best;
    }

    const tSSC  = findT(100, 165);
    const tHSC  = findT(340, 143);
    const tBSc  = findT(580, 82);
    const tGoal = findT(850, 48);

    /* Gap so vehicle starts/ends at node EDGE, not centre (~24px) */
    const GAP = 24 / totalLen;

    /* ── drawTo: update both paths' dashoffset each frame ── */
    function drawTo(t) {
        const offset = (totalLen - t * totalLen).toFixed(2);
        path.style.strokeDashoffset = offset;
        if (glowPath) glowPath.style.strokeDashoffset = offset;
    }

    /* ── revealNode: fade in node i ── */
    function revealNode(i) {
        if (nodes && nodes[i]) nodes[i].classList.add('edu-node-visible');
    }

    /* ── FIX 4: draw initial segment (path-start → SSC node) ──
       Without this, the line stays fully hidden until the car
       starts moving. Since the SVG path's M point IS the SSC
       node (x=100, y=165), tSSC ≈ 0, so this effectively just
       unlocks the dashoffset for the car's first drawTo call.   */
    drawTo(tSSC);

    /* ── Segment definitions ──
       fillTo  = t to call drawTo() with AFTER the vehicle fades out.
                 This closes the ½-GAP stub that "to = tNode − GAP"
                 leaves between the vehicle's last drawn position and
                 the destination node centre.                        */
    const segments = [
        {
            fn:           animateCar,
            from:         tSSC + GAP,
            to:           tHSC - GAP,
            fillTo:       tHSC,          /* ← FIX 5: complete line to HSC  */
            duration:     2800,
            nodeOnArrive: 1,             /* HSC appears when car arrives   */
        },
        {
            fn:           animateRocket,
            from:         tHSC + GAP,
            to:           tBSc - GAP,
            fillTo:       tBSc,          /* ← complete line to B.Sc        */
            duration:     2600,
            nodeOnArrive: 2,             /* B.Sc appears when rocket arrives*/
        },
        {
            fn:           animateMan,
            from:         tBSc + GAP,
            to:           tGoal - GAP,
            fillTo:       tGoal,         /* ← complete line to Future Goal */
            duration:     3200,
            nodeOnArrive: 3,             /* Future Goal when man arrives   */
        },
    ];

    /* ── Run segments one by one ── */
    (function next(idx) {
        if (idx >= segments.length) return;
        const seg = segments[idx];
        seg.fn(path, totalLen, seg, drawTo, () => {
            /* Complete line to exact node position (close the GAP gap) */
            drawTo(seg.fillTo);
            /* Reveal destination node */
            revealNode(seg.nodeOnArrive);
            /* Small pause, then next vehicle */
            setTimeout(() => next(idx + 1), 480);
        });
    })(0);
}


/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

/* Point + tangent angle at ratio t */
function getPointAngle(path, t, totalLen) {
    const L     = t * totalLen;
    const p     = path.getPointAtLength(L);
    const L2    = Math.min(L + 2, totalLen);
    const p2    = path.getPointAtLength(L2);
    const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
    return { x: p.x, y: p.y, angle };
}

/* Ease-in-out cubic */
function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Fade in a vehicle element */
function showVehicle(el) {
    el.style.display    = 'block';
    el.style.opacity    = '0';
    el.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.opacity = '1'; });
    });
}

/* Fade out and hide a vehicle element */
function hideVehicle(el, cb) {
    el.style.transition = 'opacity 0.50s ease';
    el.style.opacity    = '0';
    setTimeout(() => { el.style.display = 'none'; cb && cb(); }, 530);
}


/* ══════════════════════════════════════════════════════════
   VEHICLE 1 — CAR  (SSC → HSC)
   • Travels along path, scaled 0.65
   • Rotates with path tangent angle
   • Exhaust dots animated via CSS
══════════════════════════════════════════════════════════ */
function animateCar(path, totalLen, seg, drawTo, onDone) {
    const car = document.getElementById('edu-car');
    if (!car) { onDone && onDone(); return; }

    showVehicle(car);

    const startTime          = performance.now();
    const { from, to, duration } = seg;

    function frame(now) {
        const elapsed = now - startTime;
        const raw     = Math.min(elapsed / duration, 1);
        const t       = from + easeInOut(raw) * (to - from);

        /* Draw line up to current car position each frame */
        drawTo(t);

        const { x, y, angle } = getPointAngle(path, t, totalLen);
        car.setAttribute('transform',
            `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(0.65)`
        );

        if (raw < 1) {
            requestAnimationFrame(frame);
        } else {
            hideVehicle(car, onDone);
        }
    }

    requestAnimationFrame(frame);
}


/* ══════════════════════════════════════════════════════════
   VEHICLE 2 — ROCKET  (HSC → B.Sc)
   • Nose cone leads → base angle − 90°
   • Flame ellipses flicker each rAF
══════════════════════════════════════════════════════════ */
function animateRocket(path, totalLen, seg, drawTo, onDone) {
    const rocket = document.getElementById('edu-rocket');
    if (!rocket) { onDone && onDone(); return; }

    showVehicle(rocket);

    const startTime          = performance.now();
    const { from, to, duration } = seg;

    /* Grab flame ellipses (last 2 ellipse elements inside rocket) */
    const ellipses   = Array.from(rocket.querySelectorAll('ellipse'));
    const flameOuter = ellipses[ellipses.length - 2] || null;
    const flameInner = ellipses[ellipses.length - 1] || null;

    let flickerRaf;
    function flicker() {
        if (flameOuter) flameOuter.setAttribute('ry', (6 + Math.random() * 3).toFixed(1));
        if (flameInner) flameInner.setAttribute('ry', (3 + Math.random() * 2).toFixed(1));
        flickerRaf = requestAnimationFrame(flicker);
    }
    flickerRaf = requestAnimationFrame(flicker);

    function frame(now) {
        const elapsed = now - startTime;
        const raw     = Math.min(elapsed / duration, 1);
        const t       = from + easeInOut(raw) * (to - from);

        /* Draw line behind rocket */
        drawTo(t);

        const { x, y, angle } = getPointAngle(path, t, totalLen);
        /* angle - 90 so rocket's nose (top) points forward */
        rocket.setAttribute('transform',
            `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${(angle - 90).toFixed(2)}) scale(0.65)`
        );

        if (raw < 1) {
            requestAnimationFrame(frame);
        } else {
            cancelAnimationFrame(flickerRaf);
            hideVehicle(rocket, onDone);
        }
    }

    requestAnimationFrame(frame);
}


/* ══════════════════════════════════════════════════════════
   VEHICLE 3 — WALKING MAN  (B.Sc → Future Goal)
   • Arms and legs oscillate via sine wave each frame
   • Tilt capped ±25° so man doesn't look upside-down
══════════════════════════════════════════════════════════ */
function animateMan(path, totalLen, seg, drawTo, onDone) {
    const man  = document.getElementById('edu-man');
    if (!man) { onDone && onDone(); return; }

    const leg1 = document.getElementById('edu-man-leg1');
    const leg2 = document.getElementById('edu-man-leg2');
    const arm1 = document.getElementById('edu-man-arm1');
    const arm2 = document.getElementById('edu-man-arm2');

    showVehicle(man);

    const startTime          = performance.now();
    const { from, to, duration } = seg;
    const STRIDE_MS          = 400;  /* ms per full walking cycle */

    function setLimbs(phase) {
        const leg = Math.sin(phase) * 9;   /* ± 9 px swing */
        const arm = Math.sin(phase) * 7;

        if (leg1) { leg1.setAttribute('x2', (-leg).toFixed(1)); leg1.setAttribute('y2', '16'); }
        if (leg2) { leg2.setAttribute('x2',  (leg).toFixed(1)); leg2.setAttribute('y2', '16'); }
        if (arm1) { arm1.setAttribute('x2', (arm - 2).toFixed(1)); arm1.setAttribute('y2', '-2'); }
        if (arm2) { arm2.setAttribute('x2', (-arm + 2).toFixed(1)); arm2.setAttribute('y2', '-2'); }
    }

    function frame(now) {
        const elapsed = now - startTime;
        const raw     = Math.min(elapsed / duration, 1);
        const t       = from + easeInOut(raw) * (to - from);

        /* Draw line behind walking man */
        drawTo(t);

        const { x, y, angle } = getPointAngle(path, t, totalLen);

        /* Limb oscillation */
        setLimbs((elapsed / STRIDE_MS) * Math.PI * 2);

        /* Cap tilt so man stays upright-ish */
        const tilt = Math.max(-25, Math.min(25, angle));
        man.setAttribute('transform',
            `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${tilt.toFixed(2)}) scale(0.65)`
        );

        if (raw < 1) {
            requestAnimationFrame(frame);
        } else {
            hideVehicle(man, onDone);
        }
    }

    requestAnimationFrame(frame);
}


/* ══════════════════════════════════════════════════════════
   STEP 9 — WHAT I DO CARDS — STAGGER
══════════════════════════════════════════════════════════ */
function initStaggerCards() {
    const grid = qs('.wid-grid');
    if (!grid) return;

    const cards = qsa('.wid-card', grid);
    if (!cards.length) return;

    if (wantsReduced()) {
        cards.forEach(c => c.classList.add('reveal', 'visible'));
        return;
    }

    cards.forEach((card, i) => {
        card.classList.add('reveal');
        card.style.transitionDelay = `${(i * 0.20).toFixed(2)}s`;
    });

    const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        cards.forEach(c => c.classList.add('visible'));
        obs.unobserve(grid);
    }, { threshold: 0.10 });

    obs.observe(grid);
}


/* ══════════════════════════════════════════════════════════
   STEP 11 — MOUSE PARALLAX (Desktop only)
══════════════════════════════════════════════════════════ */
function initMouseParallax() {
    if (!isDesktop() || wantsReduced()) return;

    const page = qs('.about-page');
    if (!page) return;

    /* Subtle dot-grid layer */
    const gridLayer = document.createElement('div');
    gridLayer.setAttribute('aria-hidden', 'true');
    gridLayer.style.cssText = `
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background-image:
            linear-gradient(rgba(0,255,136,.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,.022) 1px, transparent 1px);
        background-size: 60px 60px;
        will-change: background-position;
    `;
    page.prepend(gridLayer);

    injectStyle('ab-wm-theme', `
        [data-theme="light"] .ab-watermark {
          -webkit-text-stroke: 1px rgba(5,150,105,.055);
                  text-stroke: 1px rgba(5,150,105,.055);
        }
    `);

    /* Ghost watermark */
    const wm = document.createElement('div');
    wm.className   = 'ab-watermark';
    wm.textContent = 'ABIR';
    wm.setAttribute('aria-hidden', 'true');
    wm.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        font-size: clamp(100px, 19vw, 200px);
        font-weight: 900; letter-spacing: .15em;
        color: transparent;
        -webkit-text-stroke: 1px rgba(0,255,136,.042);
                text-stroke: 1px rgba(0,255,136,.042);
        pointer-events: none; user-select: none; z-index: 0;
        font-family: 'Inter', system-ui, sans-serif;
        text-transform: uppercase; white-space: nowrap;
        will-change: transform;
    `;
    page.appendChild(wm);

    const MAX_PX    = 15;
    const LERP_RATE = 0.07;
    const FLOAT_AMP = 10;
    const FLOAT_MS  = 8000;

    let tx = 0, ty = 0, cx = 0, cy = 0, rafId;

    document.addEventListener('mousemove', e => {
        tx = ((e.clientX / window.innerWidth)  - 0.5) * 2 * MAX_PX;
        ty = ((e.clientY / window.innerHeight) - 0.5) * 2 * MAX_PX;
    }, { passive: true });

    document.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

    function frame(now) {
        cx += (tx - cx) * LERP_RATE;
        cy += (ty - cy) * LERP_RATE;
        const floatY = Math.sin((now / FLOAT_MS) * Math.PI * 2) * FLOAT_AMP;
        wm.style.transform = `translate(calc(-50% + ${cx.toFixed(2)}px), calc(-50% + ${(cy + floatY).toFixed(2)}px))`;
        gridLayer.style.backgroundPosition = `${(cx * 0.30).toFixed(2)}px ${(cy * 0.30).toFixed(2)}px`;
        rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    window.addEventListener('resize', () => {
        if (!isDesktop()) {
            cancelAnimationFrame(rafId); rafId = null;
            wm.style.transform = 'translate(-50%, -50%)';
            gridLayer.style.backgroundPosition = '0px 0px';
        } else if (!rafId) {
            rafId = requestAnimationFrame(frame);
        }
    });

    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
    });
}