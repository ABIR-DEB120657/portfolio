(function () {
    'use strict';

    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>/|\\';

    function scrambleText(el) {
        var original = el.getAttribute('data-original') || el.textContent;
        el.setAttribute('data-original', original);
        var totalFrames = original.length * 5;
        var frame = 0;

        var interval = setInterval(function () {
            el.textContent = original.split('').map(function (char, i) {
                if (char === ' ') return ' ';
                if (i < Math.floor(frame / 5)) return original[i];
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');

            frame++;
            if (frame > totalFrames) {
                clearInterval(interval);
                el.textContent = original;
            }
        }, 28);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var heroName = document.querySelector('.hero-name');
        if (!heroName) return;

        // Page load — fade-in শেষ হওয়ার পরে scramble
        setTimeout(function () {
            scrambleText(heroName);
        }, 900);

        // Hover এ scramble
        heroName.addEventListener('mouseenter', function () {
            scrambleText(heroName);
        });
    });
})();