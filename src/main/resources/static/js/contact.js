// your code (function () {
'use strict';

const TOTAL = 4;
let queue = [0, 1, 2, 3];
let binQ  = [];
let busy  = false;

const cards   = Array.from(document.querySelectorAll('#cStack .c-card'));
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const ball    = document.getElementById('pBall');
const lid     = document.getElementById('cLid');
const bin     = document.getElementById('dustbin-zone');

// ── BUG 1 FIX: moved from top-level → declared here, assigned in DOMContentLoaded ──
let cNum  = null;
let cFill = null;

/* ═══════════════════════════════════════════════════════════════
   STEP 4: Progress Rail — refs populated after DOMContentLoaded
═══════════════════════════════════════════════════════════════ */
// ── BUG 2 FIX: renamed railDots → railNodes (selects .c-rail-node, not .c-rail-dot) ──
let railNodes = [];
let railEl    = null;

/* ══════════════════════════════════════════════════════════════
   DAY MODE — inline style enforcement
══════════════════════════════════════════════════════════════ */
function isDay() {
    const root = document.documentElement;
    return root.getAttribute('data-theme') === 'day'
        || root.getAttribute('data-theme') === 'light'
        || document.body.getAttribute('data-theme') === 'day'
        || document.body.getAttribute('data-theme') === 'light'
        || root.classList.contains('day')
        || root.classList.contains('light')
        || root.classList.contains('day-mode');
}

function syncCardBg() {
    const day = isDay();
    cards.forEach(card => {
        if (day) {
            card.style.setProperty('background',       'rgba(248,251,255,0.97)', 'important');
            card.style.setProperty('background-color', 'rgba(248,251,255,0.97)', 'important');
            card.style.setProperty('background-image', 'none',                  'important');
        } else {
            card.style.removeProperty('background');
            card.style.removeProperty('background-color');
            card.style.removeProperty('background-image');
        }
    });
}

const mo = new MutationObserver(syncCardBg);
mo.observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme', 'class']
});

function applyDepths() {
    cards.forEach(c => c.removeAttribute('data-depth'));
    queue.forEach((idx, d) => {
        if (d < 4) cards[idx].setAttribute('data-depth', String(d));
    });
}

function updateRail() {
    if (!railEl || !railNodes.length) return;

    const step     = binQ.length;
    const progress = TOTAL > 1 ? step / (TOTAL - 1) : 0;

    railEl.style.setProperty('--rail-progress', progress.toFixed(4));

    // ── BUG 2 FIX: class added to .c-rail-node (not .c-rail-dot) ──
    railNodes.forEach((node, i) => {
        node.classList.remove('active', 'done');
        if      (i < step)   node.classList.add('done');
        else if (i === step) node.classList.add('active');
    });
}

function updateUI() {
    const n = binQ.length + 1;
    // ── BUG 1 FIX: null-safe guards so crash never happens ──
    if (cNum)  cNum.textContent   = String(n).padStart(2, '0');
    if (cFill) cFill.style.height = (n / TOTAL * 100) + '%';
    btnPrev.disabled = binQ.length === 0;
    btnNext.disabled = queue.length <= 1;
    updateRail();
}

function flyBall(towardBin, onDone) {
    const arenaR = document.getElementById('c-arena').getBoundingClientRect();
    const stackR = document.getElementById('cStack').getBoundingClientRect();
    const binR   = bin.getBoundingClientRect();

    const sx = stackR.left + stackR.width  / 2 - arenaR.left - 23;
    const sy = stackR.top  + stackR.height / 2 - arenaR.top  - 23;
    const dx = binR.left   + binR.width    / 2 - arenaR.left - 23;
    const dy = binR.top    + binR.height   / 2 - arenaR.top  - 23;

    const fromX = towardBin ? sx : dx,  fromY = towardBin ? sy : dy;
    const toX   = towardBin ? dx : sx,  toY   = towardBin ? dy : sy;
    const cpX   = (fromX + toX) / 2 + (towardBin ? 80 : -80);
    const cpY   = Math.min(fromY, toY) - 110;

    ball.style.left      = fromX + 'px';
    ball.style.top       = fromY + 'px';
    ball.style.transform = '';
    ball.style.display   = 'block';

    const dur = 680, t0 = performance.now();

    (function step(now) {
        const t  = Math.min((now - t0) / dur, 1);
        const et = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const x  = (1 - et) * (1 - et) * fromX + 2 * (1 - et) * et * cpX + et * et * toX;
        const y  = (1 - et) * (1 - et) * fromY + 2 * (1 - et) * et * cpY + et * et * toY;
        const s  = 0.22 + 0.78 * Math.sin(et * Math.PI);
        const r  = towardBin ? et * 600 : -et * 600;

        ball.style.left      = x + 'px';
        ball.style.top       = y + 'px';
        ball.style.transform = `scale(${s}) rotate(${r}deg)`;

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            ball.style.display   = 'none';
            ball.style.transform = '';
            onDone && onDone();
        }
    })(t0);
}

function openLid(ms) {
    lid.classList.add('open');
    setTimeout(() => lid.classList.remove('open'), ms);
}

function doNext() {
    if (busy || queue.length <= 1) return;
    busy = true;

    const exitCard = cards[queue[0]];
    exitCard.classList.add('c-exit');

    setTimeout(() => flyBall(true, () => openLid(560)), 320);

    setTimeout(() => {
        exitCard.classList.remove('c-exit');
        exitCard.removeAttribute('data-depth');
        binQ.push(queue.shift());
        applyDepths();
        updateUI();
        setTimeout(() => { busy = false; }, 350);
    }, 530);
}

function doPrev() {
    if (busy || binQ.length === 0) return;
    busy = true;
    openLid(860);

    setTimeout(() => {
        flyBall(false, () => {
            const backIdx  = binQ.pop();
            queue.unshift(backIdx);
            applyDepths();

            const backCard = cards[backIdx];
            backCard.classList.add('c-enter');
            backCard.addEventListener('animationend',
                () => backCard.classList.remove('c-enter'), { once: true });

            updateUI();
            setTimeout(() => { busy = false; }, 500);
        });
    }, 200);
}

function submitContact(btn) {
    const name = document.getElementById('c-name')?.value.trim();
    const eml  = document.getElementById('c-email')?.value.trim();
    const msg  = document.getElementById('c-message')?.value.trim();
    const ok   = document.getElementById('c-fb-ok');
    const err  = document.getElementById('c-fb-err');

    ok.style.display = err.style.display = 'none';

    if (!name || !eml || !msg) {
        err.style.display   = 'block';
        btn.style.animation = 'shake 0.4s ease';
        setTimeout(() => btn.style.animation = '', 400);
        return;
    }
    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp;Sending...';
    setTimeout(() => {
        btn.innerHTML    = '<i class="fas fa-check"></i>&nbsp;Sent!';
        ok.style.display = 'block';
    }, 1500);
}

/* ═══════════════════════════════════════════════════════════════
   STEP 6: Email copy button
═══════════════════════════════════════════════════════════════ */
function initCopyEmail() {
    const copyBtn = document.getElementById('cCopyEmail');
    if (!copyBtn) return;

    const defaultHTML = '📋';
    const copiedHTML  = '✓ Copied';

    copyBtn.innerHTML = defaultHTML;

    copyBtn.addEventListener('click', () => {
        const email = copyBtn.dataset.email;

        navigator.clipboard.writeText(email).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = copiedHTML;

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = defaultHTML;
            }, 2000);
        }).catch(() => {
            copyBtn.innerHTML = '✗ Failed';
            setTimeout(() => {
                copyBtn.innerHTML = defaultHTML;
            }, 2000);
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   STEP 7: DUSTBIN DROP ZONE
═══════════════════════════════════════════════════════════════ */
function doFlyToBin() {
    if (busy || queue.length <= 1) return;
    busy = true;

    const exitCard = cards[queue[0]];
    exitCard.classList.add('c-fly-to-bin');
    openLid(700);

    setTimeout(() => {
        exitCard.classList.remove('c-fly-to-bin');
        exitCard.removeAttribute('data-depth');
        binQ.push(queue.shift());
        applyDepths();
        updateUI();
        setTimeout(() => { busy = false; }, 350);
    }, 520);
}

/* ═══════════════════════════════════════════════════════════════
   STEP 7 + STEP 10: DRAG-TO-BIN
═══════════════════════════════════════════════════════════════ */
function initDragToBin() {
    const stack = document.getElementById('cStack');
    const dzBin = document.getElementById('dustbin-zone');
    const lidEl = document.getElementById('cLid');

    let dragging = false;
    let startY   = 0;
    let currY    = 0;
    let dragCard = null;

    function getTopCard() {
        return queue.length > 0 ? cards[queue[0]] : null;
    }

    function onStart(e) {
        if (busy || queue.length <= 1) return;
        const top = getTopCard();
        if (!top) return;

        dragging = true;
        dragCard = top;
        startY   = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        currY    = startY;

        dragCard.style.transition = 'none';

        if (dzBin) dzBin.classList.add('dz-hover');
        if (lidEl) lidEl.classList.add('open');
    }

    function onMove(e) {
        if (!dragging || !dragCard) return;

        currY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const dy = Math.max(0, currY - startY);
        const p  = Math.min(dy / 200, 1);

        dragCard.style.transform =
            `translateY(${dy.toFixed(1)}px) `           +
            `scale(${(1 - p * 0.15).toFixed(3)}) `     +
            `rotate(${(p * 14).toFixed(2)}deg)`;

        dragCard.style.opacity = (1 - p * 0.4).toFixed(3);
    }

    function onEnd() {
        if (!dragging || !dragCard) return;
        dragging = false;

        const dy = Math.max(0, currY - startY);

        if (dzBin) dzBin.classList.remove('dz-hover');
        if (lidEl) lidEl.classList.remove('open');

        if (dy > 100) {
            dragCard.style.transform  = '';
            dragCard.style.opacity    = '';
            dragCard.style.transition = '';
            doFlyToBin();
        } else {
            dragCard.style.transition =
                'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), ' +
                'opacity   0.35s ease';
            dragCard.style.transform = '';
            dragCard.style.opacity   = '';
            setTimeout(() => {
                if (dragCard) dragCard.style.transition = '';
            }, 460);
        }
        dragCard = null;
    }

    stack.addEventListener('mousedown',  onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);

    stack.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove,  { passive: true });
    window.addEventListener('touchend',  onEnd);

    if (dzBin) {
        dzBin.addEventListener('click', () => {
            if (!busy && queue.length > 1) doFlyToBin();
        });
    }
}

/* ═══════════════════════════════════════════════════════════════
   STEP 8: NAV ARROWS
═══════════════════════════════════════════════════════════════ */
function scrollToArena() {
    const arena = document.getElementById('c-arena');
    if (!arena) return;
    arena.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initNavScroll() {
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            doNext();
            scrollToArena();
        });
    }
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            doPrev();
            scrollToArena();
        });
    }
}

/* ═══════════════════════════════════════════════════════════════
   STEP 9: SPOTLIGHT + 3D TILT
═══════════════════════════════════════════════════════════════ */
function initSpotlightTilt() {
    const section = document.getElementById('c-arena');
    if (!section) return;

    const TILT_MAX = 8;

    function getActiveCard() {
        return section.querySelector('.c-card[data-depth="0"]');
    }

    function onMove(e) {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        section.style.setProperty('--mouse-x', `${x}px`);
        section.style.setProperty('--mouse-y', `${y}px`);

        const card = getActiveCard();
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cx = cardRect.left + cardRect.width  / 2;
        const cy = cardRect.top  + cardRect.height / 2;

        const dx = (e.clientX - cx) / (cardRect.width  / 2);
        const dy = (e.clientY - cy) / (cardRect.height / 2);

        const clampedX = Math.max(-1, Math.min(1, dx));
        const clampedY = Math.max(-1, Math.min(1, dy));

        const rotateY =  clampedX * TILT_MAX;
        const rotateX = -clampedY * TILT_MAX;

        card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
        card.classList.add('c-tilt-active');
    }

    function onLeave() {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--mouse-x', `${rect.width  / 2}px`);
        section.style.setProperty('--mouse-y', `${rect.height / 2}px`);

        cards.forEach(card => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            card.classList.remove('c-tilt-active');
        });
    }

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);

    onLeave();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
    applyDepths();

    // ── BUG 1 FIX: assign here after DOM is ready ──
    cNum  = document.getElementById('cNum');
    cFill = document.getElementById('cFill');

    // ── BUG 2 FIX: select .c-rail-node (not .c-rail-dot) ──
    railEl    = document.querySelector('.c-rail');
    railNodes = Array.from(document.querySelectorAll('.c-rail-node'));

    updateUI();

    syncCardBg();
    setTimeout(syncCardBg, 100);
    setTimeout(syncCardBg, 400);
    setTimeout(syncCardBg, 1000);

    mo.observe(document.body, {
        attributes: true, attributeFilter: ['data-theme', 'class']
    });

    initNavScroll();

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') doNext();
        if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  doPrev();
    });

    document.querySelectorAll('.c-in').forEach(el => {
        el.addEventListener('focus', () => {
            el.style.borderColor = 'var(--cyan)';
            el.style.boxShadow   = '0 0 0 3px var(--cyan-glow)';
        });
        el.addEventListener('blur', () => {
            el.style.borderColor = 'var(--cyan-border)';
            el.style.boxShadow   = 'none';
        });
    });

    initCopyEmail();
    initDragToBin();
    initSpotlightTilt();
});

window.submitContact = submitContact;