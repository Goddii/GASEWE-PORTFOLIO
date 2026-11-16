import { projects } from '../data/projects.js';
import { site } from '../data/site.js';
import { runTerminalBootModal } from './terminal-boot.js';

let isOpen = false;
let selectedIndex = 0;
let currentItems = [];
let paletteEl = null;
let inputEl = null;
let resultsEl = null;
let lenisInstance = null;
let onSoundCallback = null;

export function registerPaletteSound(fn) {
  onSoundCallback = fn;
}

function playSound(type) {
  if (typeof onSoundCallback === 'function') {
    onSoundCallback(type);
  }
}

/**
 * Static command list for quick actions & section jumps
 */
const staticCommands = [
  {
    type: 'action',
    group: 'Quick Actions',
    title: 'Copy Email Address',
    tag: 'ACTION',
    desc: site.email,
    meta: 'COPY',
    execute: () => {
      navigator.clipboard.writeText(site.email).then(() => {
        showPaletteToast('Email copied to clipboard!');
      });
    },
  },
  {
    type: 'action',
    group: 'Quick Actions',
    title: 'Download Resume / CV',
    tag: 'PDF',
    desc: 'Godwin_Odhiambo_CV_Full.pdf',
    meta: 'DOWNLOAD',
    execute: () => {
      const a = document.createElement('a');
      a.href = site.cv;
      a.download = 'Godwin_Odhiambo_CV.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  },
  {
    type: 'action',
    group: 'Quick Actions',
    title: 'Open GitHub Profile',
    tag: 'EXTERNAL',
    desc: 'github.com/Goddii',
    meta: 'OPEN',
    execute: () => {
      window.open(site.github, '_blank', 'noopener');
    },
  },
  {
    type: 'action',
    group: 'Quick Actions',
    title: 'Open LinkedIn Profile',
    tag: 'EXTERNAL',
    desc: 'linkedin.com/in/godwin-odhiambo',
    meta: 'OPEN',
    execute: () => {
      window.open(site.linkedin, '_blank', 'noopener');
    },
  },
  {
    type: 'nav',
    group: 'Navigation',
    title: 'Selected Work & Systems',
    tag: 'NAV',
    desc: '11 Shipped Platforms & Projects',
    meta: '#WORK',
    execute: () => navigateTo('#work'),
  },
  {
    type: 'nav',
    group: 'Navigation',
    title: 'The Engineering Constellation',
    tag: 'NAV',
    desc: 'System Architecture & Domain Map',
    meta: '#SYSTEMS',
    execute: () => navigateTo('#systems'),
  },
  {
    type: 'nav',
    group: 'Navigation',
    title: 'Godwin.OS & Field Notes',
    tag: 'NAV',
    desc: 'Operational root, fintech telemetry & career timeline',
    meta: '#ABOUT',
    execute: () => navigateTo('#about'),
  },
  {
    type: 'nav',
    group: 'Navigation',
    title: 'Closing Sequence & Contact',
    tag: 'NAV',
    desc: 'Let’s make it happen — Get in touch',
    meta: '#CONTACT',
    execute: () => navigateTo('#contact'),
  },
  {
    type: 'action',
    group: 'System & Easter Eggs',
    title: 'Run Terminal Boot Sequence (GODWIN_OS)',
    tag: 'SYS',
    desc: 'ARM64 Neural Core Kernel Init Sequence',
    meta: 'godwinos --boot',
    execute: () => {
      runTerminalBootModal();
    },
  },
];

function navigateTo(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: -60, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function openCaseStudy(slug) {
  window.history.pushState({}, '', `/work/${slug}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Builds the list of searchable items from static commands + projects
 */
function getAllItems() {
  const projectItems = projects.map((p) => ({
    type: 'project',
    group: 'Projects',
    title: p.name,
    tag: (p.category || 'PROJECT').toUpperCase(),
    desc: p.tagline,
    meta: p.live ? 'LIVE' : 'CASE STUDY',
    slug: p.slug,
    stack: p.stack || [],
    execute: () => {
      openCaseStudy(p.slug);
    },
  }));

  return [...projectItems, ...staticCommands];
}

/**
 * Filter items by query
 */
function filterItems(query) {
  const q = query.trim().toLowerCase();
  const all = getAllItems();
  if (!q) return all;

  return all.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(q);
    const descMatch = item.desc && item.desc.toLowerCase().includes(q);
    const tagMatch = item.tag && item.tag.toLowerCase().includes(q);
    const stackMatch = item.stack && item.stack.some((s) => s.toLowerCase().includes(q));
    const metaMatch = item.meta && item.meta.toLowerCase().includes(q);
    return titleMatch || descMatch || tagMatch || stackMatch || metaMatch;
  });
}

function renderResults(items) {
  currentItems = items;
  if (!resultsEl) return;

  if (items.length === 0) {
    resultsEl.innerHTML = `
      <div class="cmd-palette__empty">
        <span>No matching systems, projects, or commands found.</span>
      </div>
    `;
    return;
  }

  // Group by category
  const groups = {};
  items.forEach((item, index) => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push({ item, globalIndex: index });
  });

  let html = '';
  Object.entries(groups).forEach(([groupName, groupItems]) => {
    html += `<div class="cmd-palette__group-title">${groupName}</div>`;
    groupItems.forEach(({ item, globalIndex }) => {
      const isSelected = globalIndex === selectedIndex;
      html += `
        <button
          type="button"
          class="cmd-palette__item ${isSelected ? 'is-selected' : ''}"
          data-cmd-index="${globalIndex}"
          role="option"
          aria-selected="${isSelected}"
        >
          <div class="cmd-palette__item-content">
            <div class="cmd-palette__item-header">
              <span class="cmd-palette__item-title">${item.title}</span>
              ${item.tag ? `<span class="cmd-palette__item-tag">${item.tag}</span>` : ''}
            </div>
            ${item.desc ? `<span class="cmd-palette__item-desc">${item.desc}</span>` : ''}
          </div>
          ${item.meta ? `<span class="cmd-palette__item-meta">${item.meta} ↵</span>` : ''}
        </button>
      `;
    });
  });

  resultsEl.innerHTML = html;

  // Scroll active item into view
  const selectedEl = resultsEl.querySelector('.is-selected');
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest' });
  }
}

function selectIndex(newIndex) {
  if (currentItems.length === 0) return;
  if (newIndex < 0) newIndex = currentItems.length - 1;
  if (newIndex >= currentItems.length) newIndex = 0;
  selectedIndex = newIndex;
  playSound('tick');
  renderResults(currentItems);
}

function executeCurrent() {
  if (currentItems.length === 0 || !currentItems[selectedIndex]) return;
  playSound('click');
  const action = currentItems[selectedIndex];
  closeCommandPalette();
  if (typeof action.execute === 'function') {
    action.execute();
  }
}

function showPaletteToast(msg) {
  let toast = document.querySelector('.cmd-palette-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cmd-palette-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #0f120c;
      border: 1px solid var(--id-accent, #B6FF3B);
      color: var(--id-accent, #B6FF3B);
      font-family: var(--id-font-mono, monospace);
      font-size: 0.85rem;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ ${msg}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2400);
}

export function openCommandPalette() {
  if (isOpen) return;
  isOpen = true;
  playSound('click');
  paletteEl.classList.add('is-open');
  paletteEl.setAttribute('aria-hidden', 'false');
  selectedIndex = 0;
  if (inputEl) {
    inputEl.value = '';
    inputEl.focus();
  }
  renderResults(getAllItems());
  document.body.style.overflow = 'hidden';
}

export function closeCommandPalette() {
  if (!isOpen) return;
  isOpen = false;
  paletteEl.classList.remove('is-open');
  paletteEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function toggleCommandPalette() {
  if (isOpen) closeCommandPalette();
  else openCommandPalette();
}

/**
 * Mounts the Command Palette DOM and binds listeners
 */
export function initCommandPalette(lenis) {
  lenisInstance = lenis;

  // 1. Build and inject DOM
  paletteEl = document.createElement('div');
  paletteEl.className = 'cmd-palette';
  paletteEl.setAttribute('role', 'dialog');
  paletteEl.setAttribute('aria-modal', 'true');
  paletteEl.setAttribute('aria-label', 'Command Palette');
  paletteEl.setAttribute('aria-hidden', 'true');

  paletteEl.innerHTML = `
    <div class="cmd-palette__backdrop" data-cmd-close></div>
    <div class="cmd-palette__dialog">
      <div class="cmd-palette__header">
        <span class="cmd-palette__prompt" aria-hidden="true">&gt;_</span>
        <input
          type="text"
          class="cmd-palette__input"
          data-cmd-input
          placeholder="Search systems, projects, commands... (ESC to exit)"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="button" class="cmd-palette__close-btn" data-cmd-close aria-label="Close command palette">
          <kbd>ESC</kbd>
        </button>
      </div>

      <div class="cmd-palette__results" data-cmd-results role="listbox"></div>

      <div class="cmd-palette__footer">
        <div class="cmd-palette__hints">
          <span class="cmd-palette__hint"><kbd class="cmd-palette__kbd">↑↓</kbd> Navigate</span>
          <span class="cmd-palette__hint"><kbd class="cmd-palette__kbd">↵</kbd> Select</span>
          <span class="cmd-palette__hint"><kbd class="cmd-palette__kbd">ESC</kbd> Close</span>
        </div>
        <span class="cmd-palette__sys">GODWIN_OS // PALETTE v1.0</span>
      </div>
    </div>
  `;

  document.body.appendChild(paletteEl);

  inputEl = paletteEl.querySelector('[data-cmd-input]');
  resultsEl = paletteEl.querySelector('[data-cmd-results]');

  // 2. Wire input search
  inputEl.addEventListener('input', (e) => {
    selectedIndex = 0;
    renderResults(filterItems(e.target.value));
  });

  // 3. Click listeners
  paletteEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-cmd-close]')) {
      closeCommandPalette();
      return;
    }

    const itemBtn = e.target.closest('.cmd-palette__item');
    if (itemBtn) {
      const idx = parseInt(itemBtn.getAttribute('data-cmd-index'), 10);
      if (!isNaN(idx)) {
        selectedIndex = idx;
        executeCurrent();
      }
    }
  });

  // 4. Hover listener on results
  resultsEl.addEventListener('mousemove', (e) => {
    const itemBtn = e.target.closest('.cmd-palette__item');
    if (itemBtn) {
      const idx = parseInt(itemBtn.getAttribute('data-cmd-index'), 10);
      if (!isNaN(idx) && idx !== selectedIndex) {
        selectedIndex = idx;
        const allItems = resultsEl.querySelectorAll('.cmd-palette__item');
        allItems.forEach((el, i) => {
          el.classList.toggle('is-selected', i === idx);
          el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        });
      }
    }
  });

  // 5. Global Keyboard listener (Cmd+K, Ctrl+K, /, Esc, Arrows, Enter)
  window.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.metaKey || e.ctrlKey;
    const isInputFocused =
      document.activeElement &&
      (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable);

    // Toggle shortcut: Cmd+K or Ctrl+K
    if (isCtrlOrCmd && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // '/' opens palette if not already typing in another input
    if (e.key === '/' && !isOpen && !isInputFocused) {
      e.preventDefault();
      openCommandPalette();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectIndex(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectIndex(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCurrent();
    }
  });

  // 6. Connect header trigger button(s)
  document.querySelectorAll('[data-cmd-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCommandPalette();
    });
  });
}
