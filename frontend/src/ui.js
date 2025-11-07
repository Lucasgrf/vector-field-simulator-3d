// Minimal UI for Phase 0: backend health test
(function initPhase0UI() {
  const btn = document.createElement('button');
  btn.textContent = 'Testar Backend';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: '1000',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #1976d2',
    background: '#2196f3',
    color: '#fff',
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  });
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Testando...';
    try {
      // Use Vite dev proxy to avoid CORS and host issues during development
      const res = await fetch('/api/health');
      const data = await res.json();
      console.log('Health:', data);
      btn.textContent = data.status === 'ok' ? 'Backend OK' : 'Backend (?)';
      btn.style.background = data.status === 'ok' ? '#43a047' : '#fb8c00';
      btn.style.borderColor = data.status === 'ok' ? '#2e7d32' : '#ef6c00';
    } catch (e) {
      console.error('Erro ao testar backend', e);
      btn.textContent = 'Backend Falhou';
      btn.style.background = '#e53935';
      btn.style.borderColor = '#b71c1c';
    } finally {
      btn.disabled = false;
      setTimeout(() => (btn.textContent = 'Testar Backend'), 2500);
    }
  });
  document.body.appendChild(btn);
})();
