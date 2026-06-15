(function () {
    'use strict';

    function initTitleRotator(containerId, options) {
        var wrap = document.getElementById(containerId);
        if (!wrap) return;

        var items = Array.prototype.slice.call(wrap.querySelectorAll('.hero-title-item'));
        if (items.length < 2) return;

        var cfg = {
            interval:    (options && options.interval)    || 3000,
            startDelay:  (options && options.startDelay)  || 1200,
            exitDuration:(options && options.exitDuration) || 420,
        };

        var current = 0;

        items.forEach(function (item) { item.classList.remove('hero-title-active'); });
        items[0].classList.add('hero-title-active');

        function next() {
            var leaving = items[current];
            current = (current + 1) % items.length;
            var entering = items[current];

            leaving.classList.add('hero-title-leaving');

            setTimeout(function () {
                leaving.classList.remove('hero-title-active');
                leaving.classList.remove('hero-title-leaving');
            }, cfg.exitDuration);

            entering.classList.add('hero-title-active');
        }

        var timer = null;

        function start() {
            timer = setInterval(next, cfg.interval);
        }

        setTimeout(start, cfg.startDelay);

        return function destroy() { clearInterval(timer); };
    }

    document.addEventListener('DOMContentLoaded', function () {
        initTitleRotator('titleRotate', {
            interval:     3000,
            startDelay:   1200,
            exitDuration: 420,
        });
    });

    window.initTitleRotator = initTitleRotator;
})();