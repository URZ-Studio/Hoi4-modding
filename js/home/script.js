(function () {
  'use strict';

  async function loadModule(containerId, modulePath) {
    try {
      const response = await fetch(modulePath);
      if (!response.ok) throw new Error('Failed to load ' + modulePath);
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = await response.text();
    } catch (error) {
      console.error('KodiakX page module could not be loaded:', error);
    }
  }

  Promise.all([
    loadModule('kodiak-header', 'modules/header.html'),
    loadModule('kodiak-footer', 'modules/footer.html')
  ]).then(initializeNavigation);

  function initializeNavigation() {
    const nav = document.getElementById('studio-nav');
    const toggle = document.querySelector('[data-mobile-toggle]');
    if (!nav || !toggle) return;

    function closeMenu() {
      nav.classList.remove('is-mobile-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
    }

    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-mobile-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-mobile-open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }
})();