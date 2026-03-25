(function () {
  'use strict';

  // 모듈 로더 함수
  async function loadModule(containerId, modulePath) {
    try {
      const response = await fetch(modulePath);
      if (!response.ok) {
        throw new Error(`Failed to load module: ${modulePath}`);
      }
      const html = await response.text();
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
      }
    } catch (error) {
      console.error(`Error loading module ${modulePath}:`, error);
    }
  }

  // 헤더와 푸터 로드 (페이지 로드 시 실행)
  // 파일:// 환경에서의 fetch 경로 문제를 피하려면 상대 경로를 사용합니다.
  Promise.all([
    loadModule('kodiak-header', 'modules/header.html'),
    loadModule('kodiak-footer', 'modules/footer.html'),
  ]).then(() => {
    // 모듈 로드 완료 후 초기화 실행
    initializeApp();
  });

  function initializeApp() {
    const backdrop = document.querySelector('.kodiak-backdrop');
    const nav = document.querySelector('.kodiak-nav');
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const dropdownButtons = Array.from(document.querySelectorAll('[data-dropdown-target]'));
    const supportModal = document.getElementById('support-modal');
    const consentModal = document.getElementById('consent-modal');
    const openModalButton = document.querySelector('[data-open-modal]');
    const closeModalButton = supportModal?.querySelector('[data-close-modal]');
    const acceptConsentButton = document.querySelector('[data-accept-consent]');
    const declineConsentButton = document.querySelector('[data-decline-consent]');
    const consentKey = 'kodiakx-consent-accepted';

    function lockScroll(shouldLock) {
      document.body.classList.toggle('kodiak-lock-scroll', shouldLock);
    }

    function showBackdrop() {
      if (backdrop) {
        backdrop.hidden = false;
      }
    }

    function hideBackdrop() {
      if (backdrop && !hasOpenLayer()) {
        backdrop.hidden = true;
      }
    }

    function getDropdownByName(name) {
      return document.getElementById(`kodiak-dropdown-${name}`);
    }

    function closeDropdown(button) {
      const targetName = button.dataset.dropdownTarget;
      const dropdown = getDropdownByName(targetName);

      if (!dropdown) {
        return;
      }

      button.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('is-open');

      window.setTimeout(() => {
        if (!dropdown.classList.contains('is-open')) {
          dropdown.hidden = true;
        }
      }, 220);
    }

    function openDropdown(button) {
      const targetName = button.dataset.dropdownTarget;
      const dropdown = getDropdownByName(targetName);

      if (!dropdown) {
        return;
      }

      dropdown.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        dropdown.classList.add('is-open');
      });
    }

    function closeAllDropdowns(exceptButton = null) {
      dropdownButtons.forEach((button) => {
        if (exceptButton && button === exceptButton) {
          return;
        }

        if (button.getAttribute('aria-expanded') === 'true') {
          closeDropdown(button);
        }
      });
    }

    function openModal(modal) {
      if (!modal) {
        return;
      }

      modal.hidden = false;
      showBackdrop();
      lockScroll(true);
    }

    function closeModal(modal) {
      if (!modal) {
        return;
      }

      modal.hidden = true;
      if (!hasOpenLayer()) {
        hideBackdrop();
        lockScroll(false);
      }
    }

    function hasOpenLayer() {
      const openModalExists = [supportModal, consentModal].some((modal) => modal && !modal.hidden);
      const mobileOpen = nav?.classList.contains('is-mobile-open');
      return openModalExists || mobileOpen;
    }

    dropdownButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        closeAllDropdowns(button);

        if (isExpanded) {
          closeDropdown(button);
          return;
        }

        openDropdown(button);
      });
    });

    document.addEventListener('click', (event) => {
      const clickedInsideDropdown = event.target.closest('.kodiak-nav__group');
      const clickedInsideModal = event.target.closest('.kodiak-modal__dialog');
      const clickedInsideNav = event.target.closest('.kodiak-nav') || event.target.closest('.kodiak-mobile-toggle');

      if (!clickedInsideDropdown) {
        closeAllDropdowns();
      }

      if (!clickedInsideNav && nav?.classList.contains('is-mobile-open')) {
        nav.classList.remove('is-mobile-open');
      }

      if (!clickedInsideModal && event.target === backdrop) {
        closeModal(supportModal);
        if (localStorage.getItem(consentKey) === null && consentModal && !consentModal.hidden) {
          return;
        }
        closeModal(consentModal);
      }

      if (!hasOpenLayer()) {
        hideBackdrop();
        lockScroll(false);
      }
    });

    openModalButton?.addEventListener('click', () => {
      closeAllDropdowns();
      openModal(supportModal);
    });

    closeModalButton?.addEventListener('click', () => {
      closeModal(supportModal);
    });

    acceptConsentButton?.addEventListener('click', () => {
      localStorage.setItem(consentKey, 'true');
      closeModal(consentModal);
    });

    declineConsentButton?.addEventListener('click', () => {
      window.location.href = 'about:blank';
    });

    backdrop?.addEventListener('click', () => {
      closeAllDropdowns();
      closeModal(supportModal);

      if (localStorage.getItem(consentKey) !== null) {
        closeModal(consentModal);
      }

      if (nav?.classList.contains('is-mobile-open')) {
        nav.classList.remove('is-mobile-open');
      }

      if (!hasOpenLayer()) {
        hideBackdrop();
        lockScroll(false);
      }
    });

    mobileToggle?.addEventListener('click', () => {
      const isOpen = nav?.classList.toggle('is-mobile-open');

      if (!isOpen) {
        closeAllDropdowns();
        if (!hasOpenLayer()) {
          hideBackdrop();
          lockScroll(false);
        }
        return;
      }

      showBackdrop();
      lockScroll(true);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      closeAllDropdowns();
      closeModal(supportModal);

      if (localStorage.getItem(consentKey) !== null) {
        closeModal(consentModal);
      }

      if (nav?.classList.contains('is-mobile-open')) {
        nav?.classList.remove('is-mobile-open');
      }

      if (!hasOpenLayer()) {
        hideBackdrop();
        lockScroll(false);
      }
    });

    if (localStorage.getItem(consentKey) === null) {
      openModal(consentModal);
    }
  }
})();
