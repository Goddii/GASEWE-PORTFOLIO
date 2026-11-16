/**
 * GODWIN.OS // PERSONAL & CREATIVE LAYER
 * Interactive Field Notes Drawer & Diagnostics Controller
 */

export function initGodwinOS() {
  const section = document.getElementById('about');
  if (!section) return;

  const entries = section.querySelectorAll('[data-godwinos-entry]');
  if (!entries.length) return;

  entries.forEach((entry) => {
    const trigger = entry.querySelector('.godwinos__entry-trigger');
    const drawer = entry.querySelector('.godwinos__entry-drawer');
    if (!trigger || !drawer) return;

    trigger.addEventListener('click', () => {
      const isOpen = entry.classList.contains('is-open');

      if (isOpen) {
        // Close entry
        entry.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.style.maxHeight = '0px';
      } else {
        // Open entry
        entry.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        drawer.style.maxHeight = `${drawer.scrollHeight}px`;
      }
    });

    // Keyboard accessibility
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // Re-measure max-height on window resize for any currently open drawers
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      entries.forEach((entry) => {
        if (entry.classList.contains('is-open')) {
          const drawer = entry.querySelector('.godwinos__entry-drawer');
          if (drawer) {
            drawer.style.maxHeight = `${drawer.scrollHeight}px`;
          }
        }
      });
    }, 150);
  });
}
