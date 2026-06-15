// noinspection CssUnresolvedCustomProperty

/* ============================================================
   GITHUB-API.JS — Fetch public repos & render project cards
   Step 5 of 5 — projects.js integration
   ============================================================ */
(function () {
    'use strict';

    /* ── তোমার GitHub username ── */
    const GITHUB_USERNAME = 'AbirDeb';

    /* ── GitHub API fail হলে static data ── */
    const STATIC_PROJECTS = [
        {
            name       : 'Nexus One',
            full_name  : 'Institutional Management Ecosystem',
            description: 'Web-based university management system with role-based access, attendance tracking, and dynamic grading using Spring Boot + Thymeleaf.',
            topics     : ['Spring Boot', 'Thymeleaf', 'MySQL', 'Java'],
            html_url   : '#',
            homepage   : '#',
            icon       : 'fa-graduation-cap'
        },
        {
            name       : 'Image Compression',
            full_name  : 'Research Implementation',
            description: 'Intelligent lossless image compression using hybrid spatial-packing and entropy-coding algorithms, written natively in Java SE.',
            topics     : ['Java SE', 'DSA', 'Algorithm Design'],
            html_url   : '#',
            homepage   : null,
            icon       : 'fa-compress-alt'
        },
        {
            name       : 'Portfolio Website',
            full_name  : 'Personal Portfolio',
            description: 'Dual-theme (Day/Night) portfolio with canvas animations — sun, clouds, airplane, stars, shooting stars. Built with Spring Boot + Thymeleaf.',
            topics     : ['Spring Boot', 'CSS3', 'JavaScript', 'Canvas API'],
            html_url   : '#',
            homepage   : '#',
            icon       : 'fa-user-astronaut'
        }
    ];

    /* ── topic list → filter-compatible data-tags string ──
       projects.js filterProjects checks: tags.includes('java'|'spring'|'web')
    ── */
    function buildTagString(topics, language) {
        const all    = (topics || []).concat(language ? [language] : []);
        const tagSet = new Set();

        all.forEach(function (t) {
            const l = t.toLowerCase();
            tagSet.add(l);

            if (l.includes('java'))                         tagSet.add('java');
            if (l.includes('spring') || l.includes('boot')) tagSet.add('spring');
            if (
                l.includes('html')   || l.includes('css')    ||
                l.includes('js')     || l.includes('javascript') ||
                l.includes('web')    || l.includes('thymeleaf')  ||
                l.includes('react')  || l.includes('canvas')     ||
                l.includes('tailwind')
            ) tagSet.add('web');
        });

        return Array.from(tagSet).join(' ');
    }

    /* ── Card HTML builder ── */
    function buildCard(project, index) {
        const topics   = project.topics && project.topics.length
            ? project.topics : [project.language || 'Code'];
        const icon     = project.icon || 'fa-code-branch';
        const tagStr   = buildTagString(topics, project.language || '');
        const demoBtn  = project.homepage
            ? `<a href="${project.homepage}" target="_blank" rel="noopener"
                  class="btn btn-primary"
                  style="flex:1;justify-content:center;font-size:0.72rem;">
                   <i class="fas fa-external-link-alt"></i> Demo
               </a>`
            : `<a href="${project.html_url}" target="_blank" rel="noopener"
                  class="btn btn-primary"
                  style="flex:1;justify-content:center;font-size:0.72rem;opacity:0.65;">
                   <i class="fas fa-eye"></i> View
               </a>`;

        const card          = document.createElement('div');

        /* ✅ project-card class — projects.js AnimationObserver targets this  */
        /* ✅ data-tags          — filter + counter use this                   */
        /* ✅ NO fade-up class   — projects.js handles entry animation now      */
        card.className      = 'project-card';
        card.dataset.tags   = tagStr;
        card.style.cssText  = 'display:flex;flex-direction:column;';

        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div class="card-icon" style="margin:0;font-size:1.5rem;">
                    <i class="fas ${icon}"></i>
                </div>
                <div>
                    <h3 style="margin:0;">${project.name.replace(/-/g, ' ')}</h3>
                    <p class="font-mono text-cyan" style="font-size:0.75rem;margin:0;">
                        ${project.full_name || ''}
                    </p>
                </div>
            </div>
            <p class="project-desc">${project.description || 'No description available.'}</p>
            <div class="tech-stack-wrap">
                ${topics.slice(0, 5).map(function (t) {
            return '<span class="badge">' + t + '</span>';
        }).join('')}
            </div>
            <div style="display:flex;gap:12px;margin-top:auto;padding-top:20px;">
                <a href="${project.html_url}" target="_blank" rel="noopener"
                   class="btn btn-outline"
                   style="flex:1;justify-content:center;font-size:0.72rem;">
                    <i class="fab fa-github"></i> Source
                </a>
                ${demoBtn}
            </div>`;

        return card;
    }

    /* ── Render into #github-projects ── */
    function renderProjects(list) {
        const container = document.getElementById('github-projects');
        if (!container) return;

        container.innerHTML = '';
        list.forEach(function (project, i) {
            container.appendChild(buildCard(project, i));
        });

        /* projects.js MutationObserver picks up the new cards automatically.
           No separate IntersectionObserver needed here anymore. */
    }

    /* ── Fetch from GitHub API ── */
    async function fetchRepos() {
        const container = document.getElementById('github-projects');
        if (!container) return;

        container.innerHTML = `
            <div class="card" style="grid-column:1/-1;text-align:center;padding:44px;">
                <i class="fas fa-spinner fa-spin"
                   style="font-size:2rem;color:var(--cyan);margin-bottom:12px;display:block;"></i>
                <p class="font-mono text-muted" style="font-size:0.8rem;letter-spacing:0.08em;">
                    Fetching from GitHub...
                </p>
            </div>`;

        try {
            const res = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=8&type=public`,
                { headers: { Accept: 'application/vnd.github.v3+json' } }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const repos    = await res.json();
            const filtered = repos
                .filter(function (r) { return !r.fork && r.description; })
                .slice(0, 4);

            if (!filtered.length) throw new Error('No suitable repos found');

            renderProjects(filtered);

        } catch (err) {
            console.warn('[github-api] Fallback to static data —', err.message);
            renderProjects(STATIC_PROJECTS);
        }
    }

    document.addEventListener('DOMContentLoaded', fetchRepos);
}());