/**
 * fintech-sandbox.js — Interactive M-Pesa Daraja State Machine Simulator
 * Visualizes Asynchronous Callbacks, HMAC Signatures & Idempotent Webhook Handling
 */

import { playClick, playSuccess } from './audio-fx.js';

let isRunning = false;
let currentScenario = 'happy';

const scenarios = {
  happy: {
    name: 'Scenario A: Happy Path (Instant STK Callback)',
    steps: [
      { text: '[DARAJA.AUTH] Requesting OAuth 2.0 bearer token from Safaricom...', type: 'info', delay: 300 },
      { text: '[DARAJA.AUTH] Token granted: exp_3599s // Scope: daraja_stk_push', type: 'accent', delay: 500 },
      { text: '[STK.DISPATCH] POST /mpesa/stkpush/v1/processrequest ...', type: 'info', delay: 400 },
      { text: '[PHONE.PIN] Simulating customer PIN entry on mobile handset...', type: 'warn', delay: 900 },
      { text: '[WEBHOOK.RECV] Safaricom STK Callback arriving on /api/v1/payments/callback', type: 'accent', delay: 700 },
      { text: '[CRYPTO.HMAC] Verifying X-Daraja-Signature against secret key: VALID ✓', type: 'success', delay: 400 },
      { text: '[IDEMP.CHECK] Redis check for key "idemp:TRX_99214A": MISS (Clean)', type: 'info', delay: 300 },
      { text: '[SQL.TRANS] BEGIN ISOLATION LEVEL SERIALIZABLE: Inserting ledger transaction', type: 'info', delay: 400 },
      { text: '[LEDGER.COMMIT] Wallet balance credited: KES +2,500.00 | Status: CONFIRMED ✓', type: 'success', delay: 500 },
    ],
  },
  timeout: {
    name: 'Scenario B: Network Dropout & Retry Backoff Queue',
    steps: [
      { text: '[DARAJA.AUTH] OAuth token validated (cached)', type: 'accent', delay: 300 },
      { text: '[STK.DISPATCH] POST /mpesa/stkpush/v1/processrequest ... HTTP 200 Accepted', type: 'info', delay: 400 },
      { text: '[PHONE.PIN] Customer entered PIN. Callback dispatched by Safaricom...', type: 'warn', delay: 800 },
      { text: '[NET.DROP] Connection reset by peer: Webhook callback timed out (504 Gateway)', type: 'error', delay: 700 },
      { text: '[QUEUE.ENQUEUE] Payment unresolved. Enqueuing query task with Exponential Backoff...', type: 'warn', delay: 600 },
      { text: '[RETRY.T1] Querying /mpesa/stkpushquery/v1/query (Attempt 1, delay 2000ms)...', type: 'info', delay: 800 },
      { text: '[DARAJA.QUERY] Safaricom confirms: ResultCode 0 (Transaction Successful)', type: 'accent', delay: 600 },
      { text: '[LEDGER.RECONCILE] Recovered payment from retry queue. Ledger credited safely! ✓', type: 'success', delay: 500 },
    ],
  },
  duplicate: {
    name: 'Scenario C: Duplicate Webhook Attack (Idempotency Lock)',
    steps: [
      { text: '[CALLBACK #1] Received STK callback for M-Pesa receipt QJH78190AK', type: 'accent', delay: 300 },
      { text: '[IDEMP.CHECK] Redis key "idemp:QJH78190AK" not found. Setting atomic lock (TTL 86400s)', type: 'info', delay: 400 },
      { text: '[LEDGER.UPDATE] Transaction recorded and credited: KES 2,500 ✓', type: 'success', delay: 500 },
      { text: '[ATTACK / RETRY] Second duplicate callback arrives with same receipt QJH78190AK...', type: 'warn', delay: 700 },
      { text: '[IDEMP.ALERT] Redis check: Key "idemp:QJH78190AK" ALREADY EXISTS (Lock Active)', type: 'error', delay: 400 },
      { text: '[PROTECTION] Duplicate webhook silently dropped. Double-crediting prevented! ✓', type: 'success', delay: 500 },
      { text: '[HTTP.RESP] Returning HTTP 200 OK to gateway to halt retries.', type: 'accent', delay: 300 },
    ],
  },
};

export function initFintechSandbox() {
  const container = document.querySelector('[data-fintech-sandbox]');
  if (!container) return;

  container.innerHTML = `
    <div class="fintech-sandbox">
      <div class="fintech-sandbox__header">
        <span>SYS.DARAJA // M-PESA STK WEBHOOK SIMULATOR</span>
        <span class="fintech-sandbox__badge">DAR-v2.1</span>
      </div>

      <div class="fintech-sandbox__body">
        <div class="fintech-sandbox__controls">
          <div class="fintech-sandbox__row">
            <label class="fintech-sandbox__label">Amount (KES)</label>
            <div class="fintech-sandbox__input-wrap">
              <span class="fintech-sandbox__prefix">KES</span>
              <input type="number" class="fintech-sandbox__input" data-amount-input value="2500" min="10" max="150000" />
            </div>
          </div>

          <div class="fintech-sandbox__row">
            <label class="fintech-sandbox__label">Simulation Scenario</label>
            <div class="fintech-sandbox__scenarios">
              <button type="button" class="fintech-sandbox__scenario-btn is-active" data-scenario="happy">
                <span>A. Happy Path (Normal Callback)</span>
                <span>✓</span>
              </button>
              <button type="button" class="fintech-sandbox__scenario-btn" data-scenario="timeout">
                <span>B. Network Drop &amp; Retry Backoff</span>
                <span>⟳</span>
              </button>
              <button type="button" class="fintech-sandbox__scenario-btn" data-scenario="duplicate">
                <span>C. Duplicate Webhook (Idempotency)</span>
                <span>🔒</span>
              </button>
            </div>
          </div>

          <button type="button" class="fintech-sandbox__trigger-btn" data-trigger-sim>
            <span>Trigger STK Simulation</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div class="fintech-sandbox__console">
          <div class="fintech-sandbox__console-head">
            <span>LIVE TELEMETRY LOG</span>
            <span data-sim-status>IDLE // READY</span>
          </div>
          <div class="fintech-sandbox__console-logs" data-sim-logs>
            <div class="fintech-log fintech-log--info">
              <span class="fintech-log__time">[00:00.00]</span>
              <span>Simulator initialized. Select scenario and click trigger to test.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const logsEl = container.querySelector('[data-sim-logs]');
  const statusEl = container.querySelector('[data-sim-status]');
  const triggerBtn = container.querySelector('[data-trigger-sim]');
  const scenarioBtns = container.querySelectorAll('[data-scenario]');

  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      playClick();
      scenarioBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentScenario = btn.getAttribute('data-scenario');
    });
  });

  triggerBtn.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;
    playClick();

    triggerBtn.disabled = true;
    statusEl.textContent = 'RUNNING // ACTIVE_PIPELINE';
    statusEl.style.color = 'var(--id-accent, #B6FF3B)';
    logsEl.innerHTML = '';

    const selected = scenarios[currentScenario] || scenarios.happy;
    let elapsed = 0;

    for (const step of selected.steps) {
      await new Promise((r) => setTimeout(r, step.delay));
      elapsed += step.delay;

      const timeStr = `[00:${String(Math.floor(elapsed / 1000)).padStart(2, '0')}.${String(
        Math.floor((elapsed % 1000) / 10)
      ).padStart(2, '0')}]`;

      const logRow = document.createElement('div');
      logRow.className = `fintech-log fintech-log--${step.type}`;
      logRow.innerHTML = `
        <span class="fintech-log__time">${timeStr}</span>
        <span>${step.text}</span>
      `;
      logsEl.appendChild(logRow);
      logsEl.scrollTop = logsEl.scrollHeight;
    }

    playSuccess();
    statusEl.textContent = 'COMPLETE // ALL INVARIANTS PASS';
    statusEl.style.color = '#4ade80';
    triggerBtn.disabled = false;
    isRunning = false;
  });
}
