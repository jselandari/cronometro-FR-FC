// ---------- Estado ----------
const state = {
  running: false,
  startTs: null,
  elapsedSec: 0,
  rafId: null
};

// ---------- Referencias DOM ----------
const $ = (id) => document.getElementById(id);
const timerEl      = $('timer');
const statusEl     = $('status');
const mainBtn      = $('mainBtn');
const entry        = $('entry');
const elapsedNote  = $('elapsedNote');
const countInput   = $('countInput');
const minusBtn     = $('minusBtn');
const plusBtn      = $('plusBtn');
const result       = $('result');
const resultValue  = $('resultValue');
const resultDetail = $('resultDetail');

// ---------- Utilidades ----------
function formatTime(ms) {
  const totalTenths = Math.floor(ms / 100);
  const tenths      = totalTenths % 10;
  const totalSec    = Math.floor(totalTenths / 10);
  const seconds     = totalSec % 60;
  const minutes     = Math.floor(totalSec / 60);
  return String(minutes).padStart(2, '0') + ':' +
         String(seconds).padStart(2, '0') + '.' + tenths;
}

// ---------- Cronómetro ----------
function tick() {
  if (!state.running) return;
  const now = performance.now();
  state.elapsedSec = (now - state.startTs) / 1000;
  timerEl.textContent = formatTime(now - state.startTs);
  state.rafId = requestAnimationFrame(tick);
}

function toggleTimer() {
  if (state.running) {
    // Detener
    state.running = false;
    cancelAnimationFrame(state.rafId);
    mainBtn.textContent = 'Reiniciar';
    mainBtn.className   = 'primary-btn reset';
    statusEl.textContent = 'Contá y luego ingresá el número';

    entry.classList.add('show');
    elapsedNote.textContent = `Tiempo: ${formatTime(state.elapsedSec * 1000)}`;
    countInput.focus();
  } else {
    // Si ya terminó, "Reiniciar" vuelve al estado inicial
    if (mainBtn.textContent === 'Reiniciar') {
      resetTimer();
      return;
    }
    // Iniciar
    state.running  = true;
    state.startTs  = performance.now() - (state.elapsedSec * 1000);
    mainBtn.textContent = 'Detener';
    mainBtn.className   = 'primary-btn stop';
    statusEl.textContent = 'Contando...';
    tick();
  }
}

function resetTimer() {
  state.running = false;
  cancelAnimationFrame(state.rafId);
  state.elapsedSec = 0;
  timerEl.textContent = '00:00.0';
  mainBtn.textContent = 'Iniciar';
  mainBtn.className   = 'primary-btn start';
  statusEl.textContent = 'Tocá Iniciar y contá en tu cabeza';
  entry.classList.remove('show');
  result.classList.remove('show');
  countInput.value = 0;
}

// ---------- Cálculo ----------
function calcular() {
  const count = parseInt(countInput.value, 10) || 0;
  const secs  = state.elapsedSec;

  if (secs < 1 || count < 1) {
    resultValue.textContent  = '—';
    resultDetail.textContent = 'Tiempo insuficiente o conteo inválido';
    result.classList.add('show');
    return;
  }
  const rate = (count / secs) * 60;
  resultValue.textContent  = rate.toFixed(1);
  resultDetail.textContent = `${count} beats en ${secs.toFixed(1)} s`;
  result.classList.add('show');
}

// ---------- Eventos ----------
mainBtn.addEventListener('click', toggleTimer);

minusBtn.addEventListener('click', () => {
  countInput.value = Math.max(0, (parseInt(countInput.value, 10) || 0) - 1);
  if (!state.running && state.elapsedSec > 0) calcular();
});

plusBtn.addEventListener('click', () => {
  countInput.value = (parseInt(countInput.value, 10) || 0) + 1;
  if (!state.running && state.elapsedSec > 0) calcular();
});

countInput.addEventListener('input', () => {
  if (!state.running && state.elapsedSec > 0) calcular();
});

// ---------- Service Worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}