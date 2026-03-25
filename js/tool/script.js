(function () {
  'use strict';

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

  Promise.all([loadModule('kodiak-header', 'modules/tool-header.html')]).then(() => {
    initializeApp();
  });

  function initializeApp() {
    const backdrop = document.querySelector('.kodiak-backdrop');
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
      if (backdrop) backdrop.hidden = false;
    }

    function hideBackdrop() {
      if (backdrop) backdrop.hidden = true;
    }

    function openModal(modal) {
      if (!modal) return;
      modal.hidden = false;
      showBackdrop();
      lockScroll(true);
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.hidden = true;
      hideBackdrop();
      lockScroll(false);
    }

    openModalButton?.addEventListener('click', () => openModal(supportModal));
    closeModalButton?.addEventListener('click', () => closeModal(supportModal));
    acceptConsentButton?.addEventListener('click', () => {
      localStorage.setItem(consentKey, 'true');
      closeModal(consentModal);
    });
    declineConsentButton?.addEventListener('click', () => {
      window.location.href = 'about:blank';
    });

    backdrop?.addEventListener('click', () => {
      if (supportModal && !supportModal.hidden) closeModal(supportModal);
      if (consentModal && !consentModal.hidden) closeModal(consentModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (supportModal && !supportModal.hidden) closeModal(supportModal);
      if (consentModal && !consentModal.hidden) closeModal(consentModal);
    });

    if (localStorage.getItem(consentKey) === null && consentModal) {
      openModal(consentModal);
    }
  }
})();