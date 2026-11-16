/**
 * audio-fx.js — Tactile Web Audio Synthesizer
 * Zero audio assets (0kB): Generates micro-haptic clicks, ticks, and chimes
 * using pure browser native AudioContext oscillators.
 */

let audioCtx = null;
let isMuted = true; // default muted for respectful UX

// Read saved state if available
try {
  const saved = localStorage.getItem('godwin_sfx_enabled');
  if (saved !== null) {
    isMuted = saved !== 'true';
  }
} catch (e) {}

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesize a 3ms mechanical tick (for hover on HUD & palette items)
 */
export function playTick() {
  if (isMuted) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.004);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.004);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.005);
}

/**
 * Synthesize a crisp 6ms tactile click (for button presses and category switches)
 */
export function playClick() {
  if (isMuted) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(750, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.008);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.009);
}

/**
 * Synthesize a two-tone harmonic chime (for copy success and sandbox confirmation)
 */
export function playSuccess() {
  if (isMuted) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [523.25, 659.25].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.06;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.06, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}

/**
 * Toggle sound on/off
 */
export function toggleSound() {
  isMuted = !isMuted;
  try {
    localStorage.setItem('godwin_sfx_enabled', (!isMuted).toString());
  } catch (e) {}

  updateSoundButtonUI();

  if (!isMuted) {
    getContext();
    playSuccess();
  }

  return !isMuted;
}

export function isSoundEnabled() {
  return !isMuted;
}

function updateSoundButtonUI() {
  const buttons = document.querySelectorAll('[data-sound-toggle]');
  buttons.forEach((btn) => {
    btn.setAttribute('aria-pressed', (!isMuted).toString());
    const label = btn.querySelector('.sound-toggle__label');
    if (label) {
      label.textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
    }
    btn.classList.toggle('is-active', !isMuted);
  });
}

/**
 * Initialize sound event listeners across the site
 */
export function initAudioFX() {
  // Update UI indicators
  updateSoundButtonUI();

  // Connect sound toggle button(s)
  document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSound();
    });
  });

  // Attach micro-clicks to filter buttons and links
  document.addEventListener('click', (e) => {
    if (
      e.target.closest('.project-filter-btn') ||
      e.target.closest('.hero__btn') ||
      e.target.closest('.site-nav__link') ||
      e.target.closest('.bento-card__btn')
    ) {
      playClick();
    }
  });

  // Attach subtle ticks to constellation nodes and filter hover
  document.addEventListener(
    'mouseenter',
    (e) => {
      if (
        e.target &&
        e.target.classList &&
        (e.target.classList.contains('project-filter-btn') ||
          e.target.classList.contains('constellation__node') ||
          e.target.classList.contains('godwinos__entry-trigger'))
      ) {
        playTick();
      }
    },
    true
  );
}
