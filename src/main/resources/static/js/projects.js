/**
 * projects.js — Stacked Card Deck | Abir Deb Portfolio
 * Paper airplane ✈ flies to GitHub 🐙 on Next; back on Prev.
 * Dynamically builds cards from JSON, reuses existing #projectModal.
 */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════
       STATE
    ═══════════════════════════════════════════════ */
    var PROJECTS = [];   // full project array loaded from JSON tag
    var TOTAL    = 0;
    var queue    = [];   // visible/upcoming card indices (front → back)
    var ghQ      = [];   // indices already sent to GitHub (most-recent last)
    var busy     = false;

    /* ═══════════════════════════════════════════════
       DOM REFERENCES (assigned in DOMContentLoaded)
    ═══════════════════════════════════════════════ */
    var cStack, cards, btnNext, btnPrev, plane, ghEl, cNum, cFill, cTot;

    /* ═══════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════ */
    function truncate(str, max) {
        if (!str) return '';
        str = String(str);
        return str.length > max ? str.slice(0, max).trimEnd() + '\u2026' : str;
    }

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    /* ═══════════════════════════════════════════════
       BUILD CARD ELEMENTS DYNAMICALLY
    ═══════════════════════════════════════════════ */
    function buildCards() {
        PROJECTS.forEach(function (project, i) {

            /* ── Card root ── */
            var card = document.createElement('div');
            card.className = 'c-card';
            card.setAttribute('data-idx', String(i));
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', 'View ' + (project.title || 'project'));

            /* ── Tag: "01 // project" ── */
            var tagEl = document.createElement('span');
            tagEl.className = 'c-tag';
            tagEl.textContent = pad2(i + 1) + ' // project';

            /* ── Meta row: category + optional featured badge ── */
            var metaRow = document.createElement('div');
            metaRow.className = 'c-meta-row';
            metaRow.style.cssText =
                'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;';

            var catEl = document.createElement('span');
            catEl.className = 'c-category';
            catEl.textContent = project.category || 'Project';
            metaRow.appendChild(catEl);

            if (project.featured) {
                var featBadge = document.createElement('span');
                featBadge.className = 'c-featured';
                featBadge.innerHTML = '<i class="fas fa-star"></i> Featured';
                metaRow.appendChild(featBadge);
            }

            /* ── Title ── */
            var titleEl = document.createElement('h3');
            titleEl.className = 'c-h';
            titleEl.textContent = project.title || 'Untitled Project';

            /* ── Short description ── */
            var subEl = document.createElement('p');
            subEl.className = 'c-sub';
            subEl.textContent = truncate(project.description || '', 130);

            /* ── Tag chips ── */
            var chipsEl = document.createElement('div');
            chipsEl.className = 'c-chips';
            var tags = Array.isArray(project.tags) ? project.tags : [];
            tags.slice(0, 6).forEach(function (t) {
                var chip = document.createElement('span');
                chip.className = 'c-chip';
                chip.textContent = String(t);
                chipsEl.appendChild(chip);
            });

            /* ── Footer: "View Details" button ── */
            var footer = document.createElement('div');
            footer.className = 'c-footer';

            var detailBtn = document.createElement('button');
            detailBtn.className = 'c-details-btn';
            detailBtn.setAttribute('type', 'button');
            detailBtn.setAttribute('data-idx', String(i));
            detailBtn.innerHTML = '<i class="fas fa-arrow-right"></i> View Details';

            /* Stop propagation so card-click doesn't double-fire */
            detailBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                openProjectModal(PROJECTS[i]);
            });
            footer.appendChild(detailBtn);

            /* ── Assemble ── */
            card.appendChild(tagEl);
            card.appendChild(metaRow);
            card.appendChild(titleEl);
            card.appendChild(subEl);
            card.appendChild(chipsEl);
            card.appendChild(footer);

            /* Whole card click → modal (only front card is interactive) */
            card.addEventListener('click', function () {
                if (card.getAttribute('data-depth') === '0') {
                    openProjectModal(PROJECTS[i]);
                }
            });

            /* Keyboard: Enter / Space on focused card */
            card.addEventListener('keydown', function (e) {
                if ((e.key === 'Enter' || e.key === ' ') &&
                    card.getAttribute('data-depth') === '0') {
                    e.preventDefault();
                    openProjectModal(PROJECTS[i]);
                }
            });

            cStack.appendChild(card);
        });

        /* Cache NodeList → array after all cards are inserted */
        cards = Array.from(cStack.querySelectorAll('.c-card'));
    }

    /* ═══════════════════════════════════════════════
       DEPTH SYSTEM
       Only depths 0-3 are visible (matches CSS).
       Cards not in first-4 of queue get no data-depth → hidden.
    ═══════════════════════════════════════════════ */
    function applyDepths() {
        cards.forEach(function (c) { c.removeAttribute('data-depth'); });
        queue.forEach(function (idx, d) {
            if (d < 4) {
                cards[idx].setAttribute('data-depth', String(d));
            }
        });
    }

    /* ═══════════════════════════════════════════════
       UI STATE UPDATE
       cNum  = current project number (1-based, grows as we move forward)
       cFill = progress bar height proportional to position
    ═══════════════════════════════════════════════ */
    function updateUI() {
        /* n = how many projects we've "sent to github" + 1 = current position */
        var n = ghQ.length + 1;
        cNum.textContent       = pad2(n);
        cFill.style.height     = (n / TOTAL * 100) + '%';
        btnPrev.disabled       = ghQ.length === 0;
        btnNext.disabled       = queue.length <= 1;
    }

    /* ═══════════════════════════════════════════════
       SHAKE — boundary hit
    ═══════════════════════════════════════════════ */
    function shakeStack() {
        cStack.classList.add('shake');
        cStack.addEventListener('animationend', function () {
            cStack.classList.remove('shake');
        }, { once: true });
    }

    /* ═══════════════════════════════════════════════
       PAPER AIRPLANE FLIGHT
       Quadratic bezier arc from card-stack center → GitHub logo center
       (or reverse), rendered via requestAnimationFrame.
       All coordinates are relative to #c-arena (position:relative parent).
    ═══════════════════════════════════════════════ */
    function flyPlane(towardGithub, onDone) {
        var arenaEl   = document.getElementById('c-arena');
        var arenaRect = arenaEl.getBoundingClientRect();
        var stackRect = cStack.getBoundingClientRect();
        var ghRect    = ghEl.getBoundingClientRect();

        /* Centers relative to arena */
        var sx = stackRect.left + stackRect.width  / 2 - arenaRect.left;
        var sy = stackRect.top  + stackRect.height / 2 - arenaRect.top;
        var ex = ghRect.left    + ghRect.width     / 2 - arenaRect.left;
        var ey = ghRect.top     + ghRect.height    / 2 - arenaRect.top;

        var startX = towardGithub ? sx : ex;
        var startY = towardGithub ? sy : ey;
        var endX   = towardGithub ? ex : sx;
        var endY   = towardGithub ? ey : sy;

        /* Control point: arc to the right going forward, left going back */
        var cpX = (startX + endX) / 2 + (towardGithub ? 80 : -80);
        var cpY = (startY + endY) / 2 - 60;

        var DURATION  = 410; /* ms — feels snappy but readable */
        var startTime = performance.now();

        plane.style.display = 'block';

        function step(now) {
            var elapsed = now - startTime;
            var t = Math.min(elapsed / DURATION, 1);
            var u = 1 - t;

            /* Quadratic bezier position: B(t) = u²P0 + 2ut·P1 + t²P2 */
            var x = u*u * startX + 2*u*t * cpX + t*t * endX;
            var y = u*u * startY + 2*u*t * cpY + t*t * endY;

            /* Tangent derivative for heading angle */
            var dx = 2 * (u * (cpX - startX) + t * (endX - cpX));
            var dy = 2 * (u * (cpY - startY) + t * (endY - cpY));
            var angle = Math.atan2(dy, dx) * (180 / Math.PI);

            /* Position element (center the 46×46 plane on the bezier point) */
            plane.style.left      = (x - 23) + 'px';
            plane.style.top       = (y - 23) + 'px';
            plane.style.transform = 'rotate(' + angle + 'deg)';

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                plane.style.display = 'none';
                if (typeof onDone === 'function') onDone();
            }
        }

        requestAnimationFrame(step);
    }

    /* ═══════════════════════════════════════════════
       GITHUB LOGO PULSE
    ═══════════════════════════════════════════════ */
    function pulseGithub(ms) {
        ghEl.classList.add('pulse');
        setTimeout(function () {
            ghEl.classList.remove('pulse');
        }, ms || 860);
    }

    /* ═══════════════════════════════════════════════
       DO NEXT — front card exits toward GitHub
       Timeline:
         0ms   → c-exit animation starts on front card
         320ms → paper plane launches toward GitHub logo
         530ms → queue is rearranged; depths reassigned
    ═══════════════════════════════════════════════ */
    function doNext() {
        if (busy) return;
        if (queue.length <= 1) { shakeStack(); return; }

        busy = true;

        var exitIdx  = queue[0];
        var exitCard = cards[exitIdx];

        /* Step 1 — card shrinks/rotates upward */
        exitCard.classList.add('c-exit');

        /* Step 2 — plane launches */
        setTimeout(function () {
            flyPlane(true, function () {
                pulseGithub(560);
            });
        }, 320);

        /* Step 3 — rearrange queue */
        setTimeout(function () {
            exitCard.classList.remove('c-exit');
            exitCard.removeAttribute('data-depth');
            ghQ.push(queue.shift());
            applyDepths();
            updateUI();

            /* Small cooldown so CSS transitions finish before next action */
            setTimeout(function () { busy = false; }, 340);
        }, 530);
    }

    /* ═══════════════════════════════════════════════
       DO PREV — restore most-recent card from GitHub
       Timeline:
         0ms   → GitHub pulses
         200ms → plane launches back toward stack
         ~610ms (plane lands) → card enters from below
    ═══════════════════════════════════════════════ */
    function doPrev() {
        if (busy) return;
        if (ghQ.length === 0) { shakeStack(); return; }

        busy = true;

        /* Step 1 — pulse logo */
        pulseGithub(860);

        /* Step 2 — plane launches back */
        setTimeout(function () {
            flyPlane(false, function () {

                /* Step 3 — plane landed: restore card from ghQ front of queue */
                var backIdx  = ghQ.pop();
                queue.unshift(backIdx);
                applyDepths();

                var backCard = cards[backIdx];
                backCard.classList.add('c-enter');
                backCard.addEventListener('animationend', function () {
                    backCard.classList.remove('c-enter');
                }, { once: true });

                updateUI();

                setTimeout(function () { busy = false; }, 500);
            });
        }, 200);
    }

    /* ═══════════════════════════════════════════════
       PROJECT MODAL — open
       Populates the existing #projectModal markup.
    ═══════════════════════════════════════════════ */
    function openProjectModal(project) {
        if (!project) return;

        var modal         = document.getElementById('projectModal');
        var featuredBadge = document.getElementById('modalFeaturedBadge');
        var categoryEl    = document.getElementById('modalCategory');
        var titleEl       = document.getElementById('modalTitle');
        var descEl        = document.getElementById('modalDescription');
        var tagsEl        = document.getElementById('modalTags');
        var githubLink    = document.getElementById('modalGithub');
        var liveLink      = document.getElementById('modalLive');

        if (!modal) return;

        /* Featured badge */
        if (project.featured) {
            featuredBadge.classList.add('visible');
        } else {
            featuredBadge.classList.remove('visible');
        }

        /* Text fields */
        if (categoryEl) categoryEl.textContent = project.category    || 'Project';
        if (titleEl)    titleEl.textContent    = project.title       || 'Untitled';
        if (descEl)     descEl.textContent     = project.description || '';

        /* Tag chips */
        if (tagsEl) {
            tagsEl.innerHTML = '';
            var tags = Array.isArray(project.tags) ? project.tags : [];
            tags.forEach(function (t) {
                var chip = document.createElement('span');
                chip.className   = 'modal-tag';
                chip.textContent = String(t);
                tagsEl.appendChild(chip);
            });
        }

        /* GitHub link */
        if (githubLink) {
            if (project.githubUrl) {
                githubLink.href = project.githubUrl;
                githubLink.classList.remove('hidden');
            } else {
                githubLink.classList.add('hidden');
            }
        }

        /* Live link */
        if (liveLink) {
            if (project.liveUrl) {
                liveLink.href = project.liveUrl;
                liveLink.classList.remove('hidden');
            } else {
                liveLink.classList.add('hidden');
            }
        }

        /* Show */
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        /* Move focus to modal panel for accessibility */
        var panel = modal.querySelector('.modal-panel');
        if (panel) {
            panel.setAttribute('tabindex', '-1');
            panel.focus();
        }
    }

    /* ═══════════════════════════════════════════════
       PROJECT MODAL — close
    ═══════════════════════════════════════════════ */
    function closeProjectModal() {
        var modal = document.getElementById('projectModal');
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    /* ═══════════════════════════════════════════════
       INIT
    ═══════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {

        /* ── 1. Load project data from embedded JSON script tag ── */
        var dataEl = document.getElementById('projectsData');
        if (!dataEl) {
            console.error('[projects.js] #projectsData <script type="application/json"> not found.');
            return;
        }
        try {
            PROJECTS = JSON.parse(dataEl.textContent.trim() || '[]');
        } catch (err) {
            console.error('[projects.js] Failed to parse project JSON:', err);
            PROJECTS = [];
        }

        /* ── FIX: Jackson writeValueAsString(null) returns "null" string,
           JSON.parse("null") = null (not array) → TOTAL = null.length → TypeError.
           Force to empty array if parse result is not an array. ── */
        if (!Array.isArray(PROJECTS)) PROJECTS = [];

        TOTAL = PROJECTS.length;
        if (TOTAL === 0) {
            console.warn('[projects.js] No projects to display.');
            return;
        }

        /* ── 2. Initial queue: all projects in order ── */
        queue = PROJECTS.map(function (_, i) { return i; });
        ghQ   = [];

        /* ── 3. Grab DOM refs ── */
        cStack  = document.getElementById('cStack');
        btnNext = document.getElementById('btnNext');
        btnPrev = document.getElementById('btnPrev');
        plane   = document.getElementById('pPlane');
        ghEl    = document.getElementById('cGh');
        cNum    = document.getElementById('cNum');
        cFill   = document.getElementById('cFill');
        cTot    = document.getElementById('cTot');

        if (!cStack || !btnNext || !btnPrev || !plane || !ghEl || !cNum || !cFill) {
            console.error('[projects.js] Required DOM elements missing. Check IDs.');
            return;
        }

        /* Total label */
        if (cTot) cTot.textContent = pad2(TOTAL);

        /* ── 4. Build cards, apply initial state ── */
        buildCards();
        applyDepths();
        updateUI();

        /* ── 5. Button listeners ── */
        btnNext.addEventListener('click', doNext);
        btnPrev.addEventListener('click', doPrev);

        /* ── 6. Keyboard navigation ── */
        document.addEventListener('keydown', function (e) {
            var modal     = document.getElementById('projectModal');
            var modalOpen = modal && modal.classList.contains('is-open');

            /* Escape always closes modal */
            if (e.key === 'Escape') {
                if (modalOpen) {
                    e.preventDefault();
                    closeProjectModal();
                }
                return;
            }

            /* Don't navigate cards while modal is open */
            if (modalOpen) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                doNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                doPrev();
            }
        });

        /* ── 7. Modal close wiring ── */
        var modal      = document.getElementById('projectModal');
        var modalClose = document.getElementById('modalClose');

        /* Close button (X) */
        if (modalClose) {
            modalClose.addEventListener('click', closeProjectModal);
        }

        /* Backdrop click */
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeProjectModal();
            });
        }

        /* ── 8. Swipe support (mobile) ── */
        var touchStartX = 0;
        var touchStartY = 0;

        if (cStack) {
            cStack.addEventListener('touchstart', function (e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            cStack.addEventListener('touchend', function (e) {
                var dx = e.changedTouches[0].clientX - touchStartX;
                var dy = e.changedTouches[0].clientY - touchStartY;
                /* Only trigger if horizontal swipe dominates */
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                    if (dx < 0) doNext(); else doPrev();
                }
            }, { passive: true });
        }

    }); /* end DOMContentLoaded */

    /* ── Expose on window so Thymeleaf onclick or other scripts can call them ── */
    window.openProjectModal  = openProjectModal;
    window.closeProjectModal = closeProjectModal;

}());