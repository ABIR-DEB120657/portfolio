document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ════════════════════════════════════════════
       FORCE DARK — Step 14 CSS টা activate করে
    ════════════════════════════════════════════ */
    document.body.classList.add('skills-page');

    /* ════════════════════════════════════════════
       PARTICLES
       hero-particles.js যদি #particles target করে
       সেই collision থেকে বাঁচাতে ID check করা হয়েছে
    ════════════════════════════════════════════ */
    const pCont = document.getElementById('particles');

    const PARTICLE_COLORS_DARK  = ['#00f5d4', '#b14ef5', '#ff2d78', '#00c5ff'];
    const PARTICLE_COLORS_LIGHT = ['#4f46e5', '#0d9488', '#d97706', '#7c3aed'];

    function getParticleColors() {
        return document.documentElement.getAttribute('data-theme') === 'light'
            ? PARTICLE_COLORS_LIGHT
            : PARTICLE_COLORS_DARK;
    }

    if (pCont) {
        const colors = getParticleColors();
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.setProperty('--dur',   (6  + Math.random() * 10) + 's');
            p.style.setProperty('--delay', (Math.random() * 8) + 's');
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            const sz = (Math.random() < 0.5 ? 2 : 3) + 'px';
            p.style.width  = sz;
            p.style.height = sz;
            pCont.appendChild(p);
        }

        /* ── Theme toggle হলে live particle color update ── */
        const themeObserver = new MutationObserver(() => {
            const updatedColors = getParticleColors();
            document.querySelectorAll('.particle').forEach(p => {
                p.style.background = updatedColors[
                    Math.floor(Math.random() * updatedColors.length)
                    ];
            });
        });

        themeObserver.observe(document.documentElement, {
            attributes:      true,
            attributeFilter: ['data-theme']
        });
    }

    /* ════════════════════════════════════════════
       TUBE LIGHT — FLICKER + SPARKS
    ════════════════════════════════════════════ */
    const tubeEl = document.getElementById('tubeLight');
    let flickerTO = null;

    function spawnSparks() {
        if (!tubeEl) return;
        const tubeBar = tubeEl.querySelector('.tube-bar');
        if (!tubeBar) return;

        const barRect  = tubeBar.getBoundingClientRect();
        const wrapRect = tubeEl.getBoundingClientRect();
        const barLeft  = barRect.left - wrapRect.left;
        const count    = 8 + Math.floor(Math.random() * 6);

        for (let i = 0; i < count; i++) {
            const s = document.createElement('div');
            s.className = 'spark';

            const startX = barLeft + Math.random() * barRect.width;
            const startY = (barRect.top - wrapRect.top) + barRect.height;
            s.style.left = startX + 'px';
            s.style.top  = startY + 'px';

            const dx = (Math.random() - 0.5) * 70;
            const dy = 35 + Math.random() * 65;
            s.style.setProperty('--dx',  dx + 'px');
            s.style.setProperty('--dy',  dy + 'px');
            s.style.setProperty('--dur', (0.4 + Math.random() * 0.45) + 's');

            tubeEl.appendChild(s);
            setTimeout(() => s.remove(), 950);
        }
    }

    function triggerFlicker() {
        if (!tubeEl) return;
        tubeEl.classList.remove('tube-flicker');
        void tubeEl.offsetWidth; // reflow force
        tubeEl.classList.add('tube-flicker');
        spawnSparks();
        clearTimeout(flickerTO);
        flickerTO = setTimeout(() => tubeEl.classList.remove('tube-flicker'), 1050);
    }

    /* ════════════════════════════════════════════
       TUBE PARALLAX — mouse move
       cursor.js এর সাথে conflict নেই —
       ওটা cursor DOM elements handle করে, এটা tube position
    ════════════════════════════════════════════ */
    document.addEventListener('mousemove', (e) => {
        if (!tubeEl) return;
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        tubeEl.style.transform = `translate(${(dx * 12).toFixed(2)}px, ${(dy * 7).toFixed(2)}px)`;
    });

    /* ════════════════════════════════════════════
       GLITCH OVERLAY
    ════════════════════════════════════════════ */
    const glitchOverlay = document.getElementById('glitchOverlay');
    let glitchTO = null;

    function triggerGlitch() {
        if (!glitchOverlay) return;
        glitchOverlay.classList.remove('active');
        void glitchOverlay.offsetWidth;
        glitchOverlay.classList.add('active');
        clearTimeout(glitchTO);
        glitchTO = setTimeout(() => glitchOverlay.classList.remove('active'), 320);
    }

    /* ════════════════════════════════════════════
       SCRAMBLE REVEAL
       global scramble.js এর সাথে collision এড়াতে
       এখানে "skillsScramble" prefix দেওয়া হয়েছে
    ════════════════════════════════════════════ */
    const SKILLS_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&▮▯※/.';

    function skillsScramble(el, finalText, duration) {
        const len   = finalText.length;
        const start = performance.now();

        function frame(now) {
            const elapsed     = now - start;
            const progress    = Math.min(elapsed / duration, 1);
            const revealCount = Math.floor(progress * len);
            let out = '';
            for (let i = 0; i < len; i++) {
                if (i < revealCount || finalText[i] === ' ' || finalText[i] === '&') {
                    out += finalText[i];
                } else {
                    out += SKILLS_CHARS[Math.floor(Math.random() * SKILLS_CHARS.length)];
                }
            }
            el.textContent = out;
            if (progress < 1) requestAnimationFrame(frame);
            else el.textContent = finalText;
        }
        requestAnimationFrame(frame);
    }

    /* ════════════════════════════════════════════
       CARD EFFECT HELPERS
    ════════════════════════════════════════════ */
    function resetCardEffects(card) {
        card.querySelectorAll('.skill-text').forEach(el => {
            el.textContent = el.dataset.original;
        });
        card.querySelectorAll('.skill-bar-fill').forEach(el => {
            el.style.transition = 'none';
            el.style.width = '0%';
        });
    }

    function activateCardEffects(card) {
        const texts = card.querySelectorAll('.skill-text');
        const items = card.querySelectorAll('.skill-item');

        texts.forEach((el, i) => {
            setTimeout(() => skillsScramble(el, el.dataset.original, 550), i * 70);
        });

        items.forEach((item, i) => {
            const fill  = item.querySelector('.skill-bar-fill');
            if (!fill) return;
            const level = item.dataset.level || '80';
            fill.style.transition = 'none';
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
                fill.style.width = level + '%';
            }, i * 70 + 180);
        });
    }

    /* ════════════════════════════════════════════
       CAROUSEL STATE
    ════════════════════════════════════════════ */
    const cards   = document.querySelectorAll('.skill-card');
    const dots    = document.querySelectorAll('.dot');
    const counter = document.getElementById('currentIdx');
    const N       = cards.length;
    let current   = 0;
    let autoTimer;

    const ANGLE_STEP = 360 / N;

    /* ── Responsive radius — Step 13 CSS breakpoints এর সাথে sync ── */
    function getRadius() {
        if (window.matchMedia('(max-width: 480px)').matches) return 180;
        if (window.matchMedia('(max-width: 768px)').matches) return 220;
        return 320;
    }

    /* ════════════════════════════════════════════
       POSITION CARDS — 3D ring layout
    ════════════════════════════════════════════ */
    function positionCards(active) {
        const radius = getRadius();

        cards.forEach((card, i) => {
            const offset  = i - active;
            const angle   = offset * ANGLE_STEP;
            const rad     = angle * Math.PI / 180;
            const tx      = Math.sin(rad) * radius;
            const tz      = Math.cos(rad) * radius - radius;
            const scale   = 0.72 + 0.28 * Math.cos(rad);
            const opacity = 0.3  + 0.70 * ((Math.cos(rad) + 1) / 2);

            card.style.transform  = `translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) scale(${scale.toFixed(3)})`;
            card.style.opacity    = opacity.toFixed(3);
            card.style.zIndex     = Math.round(scale * 10);
            card.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease';

            const isActive = (i === active);
            card.classList.toggle('is-active', isActive);
            if (!isActive) resetCardEffects(card);
        });

        /* Dots + counter */
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
        if (counter) counter.textContent = String(active + 1).padStart(2, '0');

        /* Animate active card */
        activateCardEffects(cards[active]);

        /* Snap glow */
        const inner = cards[active].querySelector('.skill-card-inner');
        if (inner) {
            inner.classList.remove('snap-glow');
            void inner.offsetWidth;
            inner.classList.add('snap-glow');
        }
    }

    /* ════════════════════════════════════════════
       GO TO — rotates carousel + triggers fx
    ════════════════════════════════════════════ */
    function goTo(idx) {
        current = ((idx % N) + N) % N;
        positionCards(current);
        triggerFlicker();
        triggerGlitch();
    }

    /* ════════════════════════════════════════════
       NAV BUTTONS
    ════════════════════════════════════════════ */
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(autoTimer);
            goTo(current - 1);
            startAuto();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(autoTimer);
            goTo(current + 1);
            startAuto();
        });
    }

    /* ════════════════════════════════════════════
       DOT CLICKS
    ════════════════════════════════════════════ */
    dots.forEach(d => {
        d.addEventListener('click', () => {
            clearInterval(autoTimer);
            goTo(+d.dataset.dot);
            startAuto();
        });
    });

    /* ════════════════════════════════════════════
       TOUCH SWIPE
    ════════════════════════════════════════════ */
    const scene = document.querySelector('.carousel-scene');
    let touchStartX = 0;

    if (scene) {
        scene.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        scene.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) {
                clearInterval(autoTimer);
                goTo(current + (dx < 0 ? 1 : -1));
                startAuto();
            }
        }, { passive: true });
    }

    /* ════════════════════════════════════════════
       KEYBOARD NAV
       script.js এ যদি arrow key listener থাকে
       এটা শুধু .skills-section এ থাকলে চলবে —
       তাই page-level guard দেওয়া হয়েছে
    ════════════════════════════════════════════ */
    if (document.querySelector('.skills-section')) {
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp') {
                clearInterval(autoTimer);
                goTo(current - 1);
                startAuto();
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                clearInterval(autoTimer);
                goTo(current + 1);
                startAuto();
            }
        });
    }

    /* ════════════════════════════════════════════
       RESIZE — radius recalculate
    ════════════════════════════════════════════ */
    let resizeTO;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTO);
        resizeTO = setTimeout(() => positionCards(current), 120);
    });

    /* ════════════════════════════════════════════
       AUTO-ADVANCE — 4 seconds
    ════════════════════════════════════════════ */
    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    /* ════════════════════════════════════════════
       INIT
    ════════════════════════════════════════════ */
    positionCards(0);
    startAuto();
    setTimeout(triggerFlicker, 700); // initial flicker on page load
    /* ════════════════════════════════════════════
       CARD CLICK — OVERLAY WITH SURROUNDING NODES
    ════════════════════════════════════════════ */
    const CARD_DATA = [
        {
            nodes: [
                { pos: 'tl', label: 'CORE',      title: 'Languages',  items: ['Java & OOP', 'Maven Build'] },
                { pos: 'tr', label: 'FRAMEWORK',  title: 'Spring',     items: ['Spring Boot', 'Spring MVC'] },
                { pos: 'bl', label: 'API',        title: 'REST & Data', items: ['REST API Design', 'JPA / Hibernate'] },
                { pos: 'br', label: 'TAGS',       title: 'Stack',      items: ['JAVA', 'SPRING', 'REST', 'JPA'] },
            ],
            color: '#00f5d4'
        },
        {
            nodes: [
                { pos: 'tl', label: 'MARKUP',    title: 'Structure',  items: ['HTML5', 'Thymeleaf'] },
                { pos: 'tr', label: 'STYLE',     title: 'Visual',     items: ['CSS3 & Animations', 'Bootstrap'] },
                { pos: 'bl', label: 'LOGIC',     title: 'Scripting',  items: ['JavaScript (ES6+)', 'Responsive Design'] },
                { pos: 'br', label: 'TAGS',      title: 'Stack',      items: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'] },
            ],
            color: '#b14ef5'
        },
        {
            nodes: [
                { pos: 'tl', label: 'RELATIONAL', title: 'SQL',       items: ['MySQL', 'PostgreSQL'] },
                { pos: 'tr', label: 'NOSQL',      title: 'Document',  items: ['MongoDB', 'Redis'] },
                { pos: 'bl', label: 'DESIGN',     title: 'Schema',    items: ['SQL Query Design', 'Schema Modeling'] },
                { pos: 'br', label: 'TAGS',       title: 'Stack',     items: ['MYSQL', 'POSTGRES', 'MONGO', 'REDIS'] },
            ],
            color: '#ffd600'
        },
        {
            nodes: [
                { pos: 'tl', label: 'VERSION',   title: 'Control',    items: ['Git & GitHub'] },
                { pos: 'tr', label: 'DEVOPS',    title: 'Container',  items: ['Docker', 'Linux CLI'] },
                { pos: 'bl', label: 'IDE',       title: 'Editor',     items: ['IntelliJ IDEA', 'VS Code'] },
                { pos: 'br', label: 'TAGS',      title: 'Stack',      items: ['GIT', 'DOCKER', 'LINUX', 'POSTMAN'] },
            ],
            color: '#00e676'
        },
    ];

    const overlay    = document.getElementById('skillOverlay');
    const cardSlot   = document.getElementById('sovCardSlot');
    const sovSvg     = document.getElementById('sovSvg');
    const sovNodes   = document.getElementById('sovNodes');
    const sovClose   = document.getElementById('sovClose');

    let activeOverlayCard = null;

    const COLORS_LIGHT = ['#4f46e5', '#0d9488', '#d97706', '#7c3aed'];

    function getColor(idx) {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return isLight ? COLORS_LIGHT[idx] : CARD_DATA[idx].color;
    }

    function openOverlay(cardEl, cardIdx) {
        const data  = CARD_DATA[cardIdx];
        const color = getColor(cardIdx);

        /* Clone card into slot */
        cardSlot.innerHTML = '';
        const clone = cardEl.cloneNode(true);
        clone.style.cssText = '';
        clone.classList.remove('is-active', 'card-focused');
        clone.classList.add('is-active');
        cardSlot.appendChild(clone);

        /* Animate bars in clone */
        clone.querySelectorAll('.skill-bar-fill').forEach((fill, i) => {
            const level = fill.closest('.skill-item')?.dataset.level || '80';
            fill.style.transition = 'none';
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
                fill.style.width = level + '%';
            }, i * 60 + 200);
        });

        /* Build nodes */
        sovNodes.innerHTML = '';
        sovSvg.innerHTML   = '';

        data.nodes.forEach((n, i) => {
            const node = document.createElement('div');
            node.className = 'sov-node';
            node.dataset.pos  = n.pos;
            node.dataset.card = cardIdx;
            node.innerHTML = `
                <div class="sov-node-label">${n.label}</div>
                <div class="sov-node-title">${n.title}</div>
                <ul class="sov-node-items">
                    ${n.items.map(it => `<li>${it}</li>`).join('')}
                </ul>
            `;
            sovNodes.appendChild(node);
            setTimeout(() => node.classList.add('visible'), i * 90 + 150);
        });

        /* Show overlay first so rects are available */
        overlay.classList.add('active');

        /* Draw SVG lines after layout */
        setTimeout(() => {
            const innerRect = overlay.querySelector('.skill-overlay-inner').getBoundingClientRect();
            const slotRect  = cardSlot.getBoundingClientRect();
            const cx = slotRect.left + slotRect.width  / 2 - innerRect.left;
            const cy = slotRect.top  + slotRect.height / 2 - innerRect.top;

            sovSvg.setAttribute('viewBox',
                `0 0 ${innerRect.width} ${innerRect.height}`);

            sovNodes.querySelectorAll('.sov-node').forEach((node, i) => {
                const nr   = node.getBoundingClientRect();
                const pos  = node.dataset.pos;

                /* Node edge closest to center */
                let nx, ny;
                if (pos === 'tl') { nx = nr.right  - innerRect.left; ny = nr.bottom - innerRect.top; }
                if (pos === 'tr') { nx = nr.left   - innerRect.left; ny = nr.bottom - innerRect.top; }
                if (pos === 'bl') { nx = nr.right  - innerRect.left; ny = nr.top    - innerRect.top; }
                if (pos === 'br') { nx = nr.left   - innerRect.left; ny = nr.top    - innerRect.top; }

                /* Dot on card edge */
                const dot = document.createElement('div');
                dot.className = 'sov-dot';
                dot.style.background = color;
                dot.style.boxShadow  = `0 0 8px ${color}`;
                dot.style.left = (cx - 3.5) + 'px';
                dot.style.top  = (cy - 3.5) + 'px';
                sovNodes.appendChild(dot);
                setTimeout(() => dot.classList.add('visible'), i * 90 + 200);

                /* Curved path */
                const mx = (cx + nx) / 2;
                const my = (cy + ny) / 2;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d',
                    `M${cx},${cy} C${mx},${cy} ${mx},${ny} ${nx},${ny}`);
                path.setAttribute('class', 'sov-line');
                path.setAttribute('stroke', color);
                sovSvg.appendChild(path);

                setTimeout(() => path.classList.add('drawn'), i * 90 + 250);
            });
        }, 50);
    }

    function closeOverlay() {
        overlay.classList.remove('active');
        setTimeout(() => {
            cardSlot.innerHTML = '';
            sovNodes.innerHTML = '';
            sovSvg.innerHTML   = '';
        }, 400);
        activeOverlayCard = null;
    }

    /* Card click */
    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            const cardIdx = parseInt(card.dataset.index ?? i);
            if (activeOverlayCard === card) {
                closeOverlay();
            } else {
                activeOverlayCard = card;
                openOverlay(card, cardIdx);
            }
        });
    });

    /* Close button */
    if (sovClose) sovClose.addEventListener('click', closeOverlay);

    /* Click outside */
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeOverlay();
    });
});
