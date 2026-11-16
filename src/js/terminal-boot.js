/**
 * terminal-boot.js — Terminal Boot Sequence for Portfolio Hero
 *
 * Requirements:
 * 1. State Management: Uses sessionStorage ('hasBooted') so sequence only
 *    plays on very first page load per session. Skips directly to main hero if already booted.
 * 2. Visual Aesthetic: Cyber-industrial, deep charcoal background (#0a0a0a),
 *    vibrant emerald green text (#10b981 / #00ff66) with subtle glowing CRT scanline overlay effect.
 * 3. Boot Sequence Steps: Sequentially typed out with realistic delays:
 *    - > INITIALIZING KERNEL [GODWIN_OS v4.2]...
 *    - > MOUNTING VIRTUAL FILESYSTEM... [OK]
 *    - > ESTABLISHING NEURAL LINK: OK (Latency: 14ms)
 *    - > LOADING CREATIVE_TECHNOLOGIST_MODULES... [SUCCESS]
 *    - > STATUS: ONLINE // AVAILABLE FOR SELECT BUILDS
 * 4. Transition: Once finished (approx 1.5s - 2s), smoothly fades out terminal
 *    with CSS opacity transition and reveals the main portfolio Hero underneath.
 * 5. Accessibility: Skip Intro button in top right corner + ESC key + prefers-reduced-motion support.
 */

import { isReducedMotion } from './motion-core.js';

export const BOOT_STORAGE_KEY = 'hasBooted';

export const BOOT_STEPS = [
  {
    prefix: '> ',
    text: 'INITIALIZING KERNEL [GODWIN_OS v4.2]...',
    highlight: '[GODWIN_OS v4.2]',
    charDelay: 7,
    pauseAfter: 50,
  },
  {
    prefix: '> ',
    text: 'MOUNTING VIRTUAL FILESYSTEM... [OK]',
    highlight: '[OK]',
    charDelay: 7,
    pauseAfter: 50,
  },
  {
    prefix: '> ',
    text: 'ESTABLISHING NEURAL LINK: OK (Latency: 14ms)',
    highlight: 'OK (Latency: 14ms)',
    charDelay: 6,
    pauseAfter: 50,
  },
  {
    prefix: '> ',
    text: 'LOADING CREATIVE_TECHNOLOGIST_MODULES... [SUCCESS]',
    highlight: '[SUCCESS]',
    charDelay: 6,
    pauseAfter: 60,
  },
  {
    prefix: '> ',
    text: 'STATUS: ONLINE // AVAILABLE FOR SELECT BUILDS',
    highlight: 'ONLINE // AVAILABLE FOR SELECT BUILDS',
    charDelay: 7,
    pauseAfter: 280,
  },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatLineContent(fullText, currentLength, highlight) {
  const visible = fullText.slice(0, currentLength);
  if (!highlight) {
    return escapeHtml(visible);
  }

  const highlightIndex = fullText.indexOf(highlight);
  if (highlightIndex === -1 || visible.length <= highlightIndex) {
    return escapeHtml(visible);
  }

  const beforeHighlight = visible.slice(0, highlightIndex);
  const highlightedPortion = visible.slice(
    highlightIndex,
    highlightIndex + highlight.length
  );
  const afterHighlight = visible.slice(highlightIndex + highlight.length);

  return `${escapeHtml(beforeHighlight)}<span class="terminal-boot__accent">${escapeHtml(
    highlightedPortion
  )}</span>${escapeHtml(afterHighlight)}`;
}

export function hasBootedSession() {
  try {
    return sessionStorage.getItem(BOOT_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setBootedSession() {
  try {
    sessionStorage.setItem(BOOT_STORAGE_KEY, 'true');
  } catch (e) {}
  document.documentElement.classList.add('has-booted');
}

/**
 * Initializes the terminal boot sequence component.
 *
 * @param {Object} options
 * @param {Function} [options.onReveal] Callback triggered when the terminal starts fading out
 * @returns {Promise<{ skipped: boolean }>}
 */
export function initTerminalBoot({ onReveal } = {}) {
  const terminal = document.querySelector('[data-terminal-boot]');
  if (!terminal) {
    if (typeof onReveal === 'function') onReveal({ immediate: true });
    return Promise.resolve({ skipped: true });
  }

  const linesContainer = terminal.querySelector('[data-terminal-lines]');
  const skipBtn = terminal.querySelector('[data-terminal-skip]');
  const reduced = isReducedMotion();
  const alreadyBooted = hasBootedSession();

  // If already booted in this session OR prefers-reduced-motion:
  // skip directly to main hero immediately without sequence
  if (alreadyBooted || reduced) {
    setBootedSession();
    terminal.classList.add('is-hidden');
    terminal.setAttribute('aria-hidden', 'true');
    terminal.style.display = 'none';

    if (typeof onReveal === 'function') {
      onReveal({ immediate: true });
    }
    return Promise.resolve({ skipped: true });
  }

  return new Promise((resolve) => {
    let currentStepIndex = 0;
    let currentCharIndex = 0;
    let activeTimer = null;
    let isTerminated = false;

    // Build line DOM elements upfront
    const lineElements = BOOT_STEPS.map((step) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-boot__line';

      const promptEl = document.createElement('span');
      promptEl.className = 'terminal-boot__prompt';
      promptEl.textContent = step.prefix;

      const contentEl = document.createElement('span');
      contentEl.className = 'terminal-boot__text';

      lineEl.appendChild(promptEl);
      lineEl.appendChild(contentEl);
      return { lineEl, contentEl, step };
    });

    // Create persistent caret cursor
    const cursorEl = document.createElement('span');
    cursorEl.className = 'terminal-boot__cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.textContent = '█';

    function renderCompletedState() {
      if (!linesContainer) return;
      linesContainer.innerHTML = '';
      lineElements.forEach(({ lineEl, contentEl, step }) => {
        contentEl.innerHTML = formatLineContent(step.text, step.text.length, step.highlight);
        linesContainer.appendChild(lineEl);
      });
      const lastLine = lineElements[lineElements.length - 1];
      if (lastLine) {
        lastLine.lineEl.appendChild(cursorEl);
      }
    }

    function cleanup() {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
    }

    function complete(immediate = false) {
      if (isTerminated) return;
      isTerminated = true;
      cleanup();
      setBootedSession();

      if (immediate) {
        terminal.classList.add('is-hidden');
        terminal.setAttribute('aria-hidden', 'true');
        terminal.style.display = 'none';
        if (typeof onReveal === 'function') {
          onReveal({ immediate: true });
        }
        resolve({ skipped: true });
        return;
      }

      // 4. Smooth CSS opacity transition out and reveal Hero underneath
      terminal.classList.add('is-exiting');

      // Trigger hero entrance reveal concurrently with terminal fade-out
      if (typeof onReveal === 'function') {
        onReveal({ immediate: false });
      }

      const finishTransition = () => {
        terminal.classList.add('is-hidden');
        terminal.setAttribute('aria-hidden', 'true');
        terminal.style.display = 'none';
        resolve({ skipped: false });
      };

      terminal.addEventListener('transitionend', finishTransition, { once: true });
      setTimeout(finishTransition, 700);
    }

    function skip() {
      if (isTerminated) return;
      renderCompletedState();
      complete(false);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        skip();
      }
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', skip, { once: true });
    }
    window.addEventListener('keydown', handleKeyDown);

    // Sequential Typing Engine
    function startNextLine() {
      if (isTerminated) return;
      if (currentStepIndex >= BOOT_STEPS.length) {
        // Sequence finished! Dwell for final pause before fading out
        const lastStep = BOOT_STEPS[BOOT_STEPS.length - 1];
        activeTimer = setTimeout(() => {
          complete(false);
        }, lastStep.pauseAfter || 280);
        return;
      }

      const { lineEl, contentEl, step } = lineElements[currentStepIndex];
      linesContainer.appendChild(lineEl);
      lineEl.appendChild(cursorEl);
      currentCharIndex = 0;

      function typeChar() {
        if (isTerminated) return;
        if (currentCharIndex < step.text.length) {
          currentCharIndex += 1;
          contentEl.innerHTML = formatLineContent(
            step.text,
            currentCharIndex,
            step.highlight
          );

          // Add slight organic jitter (±2ms) for realistic terminal typing cadence
          const jitter = (Math.random() - 0.5) * 3;
          const delay = Math.max(3, Math.round(step.charDelay + jitter));
          activeTimer = setTimeout(typeChar, delay);
        } else {
          // Line finished typing!
          currentStepIndex += 1;
          activeTimer = setTimeout(startNextLine, step.pauseAfter);
        }
      }

      typeChar();
    }

    // Begin sequence
    if (linesContainer) {
      linesContainer.innerHTML = '';
    }
    startNextLine();
  });
}

/**
 * On-demand execution of the Terminal Boot Sequence (for Command Palette & Easter Egg)
 */
export function runTerminalBootModal() {
  const terminalEl = document.querySelector('[data-terminal-boot]');
  if (!terminalEl) return;

  terminalEl.classList.remove('is-hidden');
  terminalEl.style.opacity = '1';
  terminalEl.style.visibility = 'visible';
  terminalEl.style.pointerEvents = 'all';

  initTerminalBoot(true).then(() => {
    setTimeout(() => {
      terminalEl.style.opacity = '0';
      terminalEl.style.pointerEvents = 'none';
      setTimeout(() => {
        terminalEl.style.visibility = 'hidden';
      }, 500);
    }, 400);
  });
}
