(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════
       STATE
    ═══════════════════════════════════════════════════════════════ */
    const TOTAL   = 4;
    let currentIdx = 0;   // index of card currently at depth-0
    let busy       = false;

    const cards    = Array.from(document.querySelectorAll('#sStack .s-card'));
    const btnNext  = document.getElementById('sBtnNext');
    const btnPrev  = document.getElementById('sBtnPrev');
    let   ctrNum   = null;
    let   railNodes = [];

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — DEPTH ASSIGNMENT
    ═══════════════════════════════════════════════════════════════ */
    function applyDepths() {
        cards.forEach((c, i) => {
            c.removeAttribute('data-depth');
            const d = (i - currentIdx + TOTAL) % TOTAL;
            if (d < 4) c.setAttribute('data-depth', String(d));
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — ACTIVE BADGE
    ═══════════════════════════════════════════════════════════════ */
    function updateActiveBadge() {
        cards.forEach((c, i) => {
            const badge = c.querySelector('.s-active-badge');
            if (!badge) return;
            badge.style.display = (i === currentIdx) ? 'inline-flex' : 'none';
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — SIDEBAR RAIL
    ═══════════════════════════════════════════════════════════════ */
    function updateRail() {
        railNodes.forEach((node, i) => {
            node.classList.remove('active', 'done');
            if      (i < currentIdx)  node.classList.add('done');
            else if (i === currentIdx) node.classList.add('active');
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — COUNTER + BUTTONS
    ═══════════════════════════════════════════════════════════════ */
    function updateUI() {
        if (ctrNum) ctrNum.textContent = String(currentIdx + 1).padStart(2, '0');
        if (btnPrev) btnPrev.disabled = currentIdx === 0;
        if (btnNext) btnNext.disabled = currentIdx === TOTAL - 1;
        updateRail();
        updateActiveBadge();
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 18 — 3D TILT + MOUSE SPOTLIGHT (per-theme color)
    ═══════════════════════════════════════════════════════════════ */
    const THEME_SPOTLIGHT = {
        backend:  'rgba(0,245,255,0.13)',
        frontend: 'rgba(139,92,246,0.13)',
        database: 'rgba(59,130,246,0.13)',
        tools:    'rgba(249,115,22,0.13)',
    };

    function initTiltSpotlight() {
        const stack = document.getElementById('sStack');
        if (!stack) return;

        const TILT_MAX = 8;

        function getActiveCard() {
            return stack.querySelector('.s-card[data-depth="0"]');
        }

        stack.addEventListener('mousemove', e => {
            const card = getActiveCard();
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;

            const dx = (e.clientX - cx) / (rect.width  / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);

            const rotateX = (-Math.max(-1, Math.min(1, dy)) * TILT_MAX).toFixed(2);
            const rotateY = ( Math.max(-1, Math.min(1, dx)) * TILT_MAX).toFixed(2);

            card.style.setProperty('--tilt-x', `${rotateX}deg`);
            card.style.setProperty('--tilt-y', `${rotateY}deg`);

            const mx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
            const my = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
            card.style.setProperty('--mouse-x', `${mx}%`);
            card.style.setProperty('--mouse-y', `${my}%`);

            // per-theme spotlight color
            const theme   = card.getAttribute('data-theme') || 'backend';
            const color   = THEME_SPOTLIGHT[theme] || THEME_SPOTLIGHT.backend;
            const color2  = color.replace(/[\d.]+\)$/, '0.07)');
            card.style.setProperty('--spotlight-color',  color);
            card.style.setProperty('--spotlight-color2', color2);
        });

        stack.addEventListener('mouseleave', () => {
            const card = getActiveCard();
            if (!card) return;
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 19 — DRAG TO DROP ZONE (focus mode)
    ═══════════════════════════════════════════════════════════════ */
    let focusMode  = false;

    function enterFocusMode(card) {
        if (focusMode) return;
        focusMode = true;

        const dz = document.getElementById('sDropZone');
        card.classList.add('s-focused');
        if (dz) dz.classList.add('dz-active');
    }

    function exitFocusMode() {
        if (!focusMode) return;
        focusMode = false;

        const dz = document.getElementById('sDropZone');
        cards.forEach(c => c.classList.remove('s-focused'));
        if (dz) dz.classList.remove('dz-active');
    }

    function initDragToDropZone() {
        const stack = document.getElementById('sStack');
        const dz    = document.getElementById('sDropZone');
        if (!stack) return;

        let dragging  = false;
        let startX    = 0, startY = 0;
        let currX     = 0, currY  = 0;
        let dragCard  = null;

        function getActiveCard() {
            return stack.querySelector('.s-card[data-depth="0"]');
        }

        function isOverDropZone(x, y) {
            if (!dz) return false;
            const r = dz.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        }

        function onStart(e) {
            if (busy || focusMode) return;
            const top = getActiveCard();
            if (!top) return;

            dragging  = true;
            dragCard  = top;
            startX    = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            startY    = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            currX     = startX;
            currY     = startY;

            dragCard.style.transition = 'none';
            if (dz) dz.classList.add('dz-hover');
        }

        function onMove(e) {
            if (!dragging || !dragCard) return;
            currX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            currY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const dx = currX - startX;
            const dy = currY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const p    = Math.min(dist / 180, 1);

            dragCard.style.transform =
                `translate(${(dx * 0.4).toFixed(1)}px, ${(dy * 0.4).toFixed(1)}px) ` +
                `scale(${(1 - p * 0.06).toFixed(3)}) ` +
                `rotate(${(dx * 0.02).toFixed(2)}deg)`;
            dragCard.style.opacity = (1 - p * 0.25).toFixed(3);

            if (dz) {
                dz.classList.toggle('dz-over', isOverDropZone(currX, currY));
            }
        }

        function onEnd() {
            if (!dragging || !dragCard) return;
            dragging = false;

            if (dz) {
                dz.classList.remove('dz-hover');
                dz.classList.remove('dz-over');
            }

            const overZone = isOverDropZone(currX, currY);

            dragCard.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease';
            dragCard.style.transform  = '';
            dragCard.style.opacity    = '';

            setTimeout(() => {
                if (dragCard) dragCard.style.transition = '';
            }, 460);

            if (overZone) {
                enterFocusMode(dragCard);
            }

            dragCard = null;
        }

        stack.addEventListener('mousedown',  onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onEnd);

        stack.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove,  { passive: true });
        window.addEventListener('touchend',  onEnd);

        // click outside focused card → exit focus
        document.addEventListener('click', e => {
            if (!focusMode) return;
            const focused = stack.querySelector('.s-focused');
            if (focused && !focused.contains(e.target)) {
                exitFocusMode();
            }
        });

        // drop zone click → exit focus
        if (dz) {
            dz.addEventListener('click', () => {
                if (focusMode) exitFocusMode();
            });
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       DAY/LIGHT MODE SYNC
    ═══════════════════════════════════════════════════════════════ */
    function isDay() {
        const root = document.documentElement;
        return root.getAttribute('data-theme') === 'day'
            || root.getAttribute('data-theme') === 'light'
            || document.body.getAttribute('data-theme') === 'light';
    }

    function syncCardBg() {
        const day = isDay();
        cards.forEach(card => {
            if (day) {
                card.style.setProperty('background-color', 'rgba(255,255,255,0.85)', 'important');
            } else {
                card.style.removeProperty('background-color');
            }
        });
    }

    const mo = new MutationObserver(syncCardBg);
    mo.observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-theme', 'class']
    });

    /* ═══════════════════════════════════════════════════════════════
       BULLET ANIMATION — fires from stack centre → crosshair
    ═══════════════════════════════════════════════════════════════ */
    function fireBullet(onDone, reverse) {
        const stack   = document.getElementById('sStack');
        const dz      = document.getElementById('sDropZone');
        if (!stack || !dz) { onDone && onDone(); return; }

        const stackR  = stack.getBoundingClientRect();
        const dzR     = dz.getBoundingClientRect();

        const stackCX = stackR.left + stackR.width  / 2;
        const stackCY = stackR.top  + stackR.height / 2;
        const dzCX    = dzR.left    + dzR.width     / 2;
        const dzCY    = dzR.top     + dzR.height    / 2;

        // reverse=true  → dropzone → stack  (prevCard)
        // reverse=false → stack → dropzone  (nextCard)
        const fromX = reverse ? dzCX    : stackCX;
        const fromY = reverse ? dzCY    : stackCY;
        const toX   = reverse ? stackCX : dzCX;
        const toY   = reverse ? stackCY : dzCY;
        const cpX   = (fromX + toX) / 2 + (reverse ? -120 : 120);
        const cpY   = Math.min(fromY, toY) - 80;

        // bullet element create
        const bullet  = document.createElement('div');
        bullet.style.cssText = `
            position: fixed;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: var(--cyan, #00f5ff);
            box-shadow: 0 0 8px 3px rgba(0,245,255,0.8);
            pointer-events: none;
            z-index: 9999;
            transition: none;
        `;
        document.body.appendChild(bullet);

        bullet.style.left = fromX + 'px';
        bullet.style.top  = fromY + 'px';

        const dur = 600;
        const t0  = performance.now();

        (function step(now) {
            const t  = Math.min((now - t0) / dur, 1);
            const et = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
            const x  = (1-et)*(1-et)*fromX + 2*(1-et)*et*cpX + et*et*toX;
            const y  = (1-et)*(1-et)*fromY + 2*(1-et)*et*cpY + et*et*toY;
            const s  = 0.4 + 0.6 * Math.sin(et * Math.PI);

            bullet.style.left      = x + 'px';
            bullet.style.top       = y + 'px';
            bullet.style.transform = `translate(-50%,-50%) scale(${s})`;

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                bullet.remove();

                if (reverse) {
                    // stack impact — brief glow on the top card
                    const topCard = stack.querySelector('.s-card[data-depth="0"]');
                    if (topCard) {
                        topCard.style.transition = 'box-shadow 0.1s ease';
                        topCard.style.boxShadow  = '0 0 24px 6px rgba(0,245,255,0.55)';
                        setTimeout(() => { topCard.style.boxShadow = ''; }, 450);
                    }
                } else {
                    // crosshair impact
                    const crosshair = dz.querySelector('.s-crosshair');
                    if (crosshair) {
                        crosshair.style.transition = 'filter 0.1s ease';
                        crosshair.style.filter = 'drop-shadow(0 0 12px rgba(0,245,255,1)) drop-shadow(0 0 4px #fff)';
                        dz.querySelector('.s-ring-1') && (dz.querySelector('.s-ring-1').style.stroke = 'rgba(0,245,255,0.90)');
                        dz.querySelector('.s-ring-2') && (dz.querySelector('.s-ring-2').style.stroke = 'rgba(0,245,255,0.70)');
                        setTimeout(() => {
                            crosshair.style.filter = '';
                            dz.querySelectorAll('.s-ring').forEach(r => r.style.stroke = '');
                        }, 500);
                    }
                }
                onDone && onDone();
            }
        })(t0);
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — NEXT / PREV
    ═══════════════════════════════════════════════════════════════ */
    function nextCard() {
        if (busy || currentIdx >= TOTAL - 1) return;
        busy = true;

        const exitCard = cards[currentIdx];
        exitCard.classList.add('s-exit');
        fireBullet(() => {});

        setTimeout(() => {
            exitCard.classList.remove('s-exit');
            currentIdx++;
            applyDepths();
            updateUI();

            const enterCard = cards[currentIdx];
            enterCard.classList.add('s-enter');
            enterCard.addEventListener('animationend',
                () => enterCard.classList.remove('s-enter'), { once: true });

            setTimeout(() => { busy = false; }, 400);
        }, 520);
    }

    function prevCard() {
        if (busy || currentIdx <= 0) return;
        busy = true;

        fireBullet(() => {}, true);

        currentIdx--;
        applyDepths();
        updateUI();

        const enterCard = cards[currentIdx];
        enterCard.classList.add('s-enter');
        enterCard.addEventListener('animationend',
            () => enterCard.classList.remove('s-enter'), { once: true });

        setTimeout(() => { busy = false; }, 680);
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — CLICK NON-ACTIVE CARD → BRING TO FRONT
    ═══════════════════════════════════════════════════════════════ */
    function initCardClick() {
        cards.forEach((card, i) => {
            card.addEventListener('click', () => {
                if (busy) return;
                const depth = parseInt(card.getAttribute('data-depth'));
                if (depth === 0) return;

                busy = true;
                currentIdx = i;
                applyDepths();
                updateUI();

                const enterCard = cards[currentIdx];
                enterCard.classList.add('s-enter');
                enterCard.addEventListener('animationend',
                    () => enterCard.classList.remove('s-enter'), { once: true });

                setTimeout(() => { busy = false; }, 680);
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 20 — NAV BUTTONS + KEYBOARD
    ═══════════════════════════════════════════════════════════════ */
    function initNav() {
        if (btnNext) btnNext.addEventListener('click', nextCard);
        if (btnPrev) btnPrev.addEventListener('click', prevCard);

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown'  || e.key === 'ArrowRight') nextCard();
            if (e.key === 'ArrowUp'    || e.key === 'ArrowLeft')  prevCard();
            if (e.key === 'Escape') exitFocusMode();
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       INIT
    ═══════════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', () => {
        ctrNum    = document.getElementById('sCtrNum');
        railNodes = Array.from(document.querySelectorAll('.s-rail-node'));

        applyDepths();
        updateUI();
        syncCardBg();

        setTimeout(syncCardBg, 100);
        setTimeout(syncCardBg, 400);

        mo.observe(document.body, {
            attributes: true, attributeFilter: ['data-theme', 'class']
        });

        initNav();
        initCardClick();
        initTiltSpotlight();
        initDragToDropZone();
    });

})();