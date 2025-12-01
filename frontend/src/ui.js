import { updateVectorField } from './vectorFieldRenderer.js';
import { renderStreamlines, clearStreamlines } from './streamlinesRenderer.js';
import * as THREE from 'three';

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

// UI principal: controle de campo e domínio
(function initFieldUI() {
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed',
    top: '12px',
    left: '12px',
    zIndex: '1000',
    width: '300px',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(0,0,0,0.2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: 'sans-serif',
    color: '#222',
    maxHeight: 'calc(100vh - 24px)',
    overflowY: 'auto',
    overscrollBehavior: 'contain'
  });

  panel.innerHTML = `
    <div style="font-weight:600; margin-bottom:8px;">Campo Vetorial (P, Q, R)</div>
    <div style="display:grid; grid-template-columns: 1fr; gap:6px;">
      <select id="vfs-preset" style="padding:6px; border-radius:6px;">
        <option value="custom">— Presets —</option>
        <option value="(x,y,z)">Radial (x, y, z)</option>
        <option value="(-y,x,0)">Rotacional plano (−y, x, 0)</option>
        <option value="(-x,-y,-z)">Sumidouro (−x, −y, −z)</option>
        <option value="(-y,x,0.2*z)">Swirl 3D (−y, x, 0.2z)</option>
      </select>
      <input id="vfs-P" placeholder="P(x,y,z)" value="x" style="padding:6px; border-radius:6px;" />
      <input id="vfs-Q" placeholder="Q(x,y,z)" value="y" style="padding:6px; border-radius:6px;" />
      <input id="vfs-R" placeholder="R(x,y,z)" value="z" style="padding:6px; border-radius:6px;" />
    </div>
    <div style="font-weight:600; margin:8px 0 4px;">Colorir por</div>
    <select id="vfs-mode" style="padding:6px; border-radius:6px; width:100%;">
      <option value="magnitude" selected>Magnitude do campo |F|</option>
      <option value="div">Divergente div F</option>
      <option value="curl">Rotacional |curl F|</option>
    </select>
    <div style="font-weight:600; margin:8px 0 4px;">Domínio</div>
    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; align-items:center;">
      <label style="grid-column: span 1;">x</label>
      <input id="vfs-xmin" type="number" step="0.1" value="-2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <input id="vfs-xmax" type="number" step="0.1" value="2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <span></span>
      <label style="grid-column: span 1;">y</label>
      <input id="vfs-ymin" type="number" step="0.1" value="-2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <input id="vfs-ymax" type="number" step="0.1" value="2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <span></span>
      <label style="grid-column: span 1;">z</label>
      <input id="vfs-zmin" type="number" step="0.1" value="-2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <input id="vfs-zmax" type="number" step="0.1" value="2" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <span></span>
    </div>
    <div style="font-weight:600; margin:8px 0 4px;">Resolução</div>
    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; align-items:center;">
      <label>nx</label>
      <input id="vfs-nx" type="number" min="3" max="21" step="2" value="9" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>ny</label>
      <input id="vfs-ny" type="number" min="3" max="21" step="2" value="9" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>nz</label>
      <input id="vfs-nz" type="number" min="3" max="21" step="2" value="9" style="grid-column: span 2; padding:4px; border-radius:6px;" />
    </div>
    <div style="font-weight:600; margin:8px 0 4px;">Escala das setas</div>
    <div style="display:grid; grid-template-columns: 1fr 60px; gap:8px; align-items:center;">
      <input id="vfs-scale" type="range" min="0.3" max="3" step="0.1" value="1" />
      <input id="vfs-scale-num" type="number" min="0.3" max="3" step="0.1" value="1" style="padding:4px; border-radius:6px;" />
    </div>
    <div style="font-weight:600; margin:8px 0 4px;">Raio das setas</div>
    <div style="display:grid; grid-template-columns: 1fr 60px; gap:8px; align-items:center;">
      <input id="vfs-radius" type="range" min="0.5" max="3" step="0.1" value="1" />
      <input id="vfs-radius-num" type="number" min="0.5" max="3" step="0.1" value="1" style="padding:4px; border-radius:6px;" />
    </div>
    <label style="display:flex; align-items:center; gap:6px; margin-top:8px;">
      <input id="vfs-auto" type="checkbox" />
      Aplicar automaticamente
    </label>
    <div style="display:flex; gap:8px; margin-top:10px;">
      <button id="vfs-render" style="flex:1; padding:8px; border-radius:6px; border:1px solid #1976d2; background:#2196f3; color:#fff;">Renderizar</button>
      <span id="vfs-status" style="align-self:center; font-size:12px; color:#444;"></span>
    </div>
    <hr style="margin:12px 0; border:none; border-top:1px solid rgba(0,0,0,0.1)" />
    <div style="font-weight:600; margin:6px 0 4px;">Linhas de Fluxo</div>
    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; align-items:center;">
      <label>Seeds nx</label>
      <input id="vfs-seeds-nx" type="number" min="3" max="21" step="2" value="7" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>ny</label>
      <input id="vfs-seeds-ny" type="number" min="3" max="21" step="2" value="7" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <span></span>
      <label>Passo h</label>
      <input id="vfs-h" type="number" step="0.01" value="0.1" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>maxSteps</label>
      <input id="vfs-maxsteps" type="number" min="50" max="5000" step="50" value="400" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>Vel. desenho</label>
      <input id="vfs-drawspeed" type="number" min="5" max="500" step="5" value="100" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label>Direção</label>
      <select id="vfs-direction" style="grid-column: span 2; padding:6px; border-radius:6px;">
        <option value="both" selected>Ambas</option>
        <option value="forward">Adiante</option>
        <option value="backward">Atrás</option>
      </select>
      <span></span>
      <label>Vel. partículas</label>
      <input id="vfs-particlespeed" type="number" min="1" max="100" step="1" value="4" style="grid-column: span 2; padding:4px; border-radius:6px;" />
      <label style="grid-column: span 3;"><input id="vfs-animate-draw" type="checkbox" checked /> Animar desenho</label>
    </div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button id="vfs-stream" style="flex:1; padding:8px; border-radius:6px; border:1px solid #1976d2; background:#42a5f5; color:#fff;">Gerar Streamlines</button>
      <button id="vfs-clear-stream" style="flex:1; padding:8px; border-radius:6px; border:1px solid #9e9e9e; background:#e0e0e0; color:#222;">Limpar</button>
    </div>
    <div id="vfs-stream-status" style="margin-top:6px; font-size:12px; color:#444;"></div>
    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; align-items:center; margin-top:6px;">
      <label>Cor por</label>
      <select id="vfs-stream-color" style="grid-column: span 5; padding:6px; border-radius:6px;">
        <option value="single">Única (azul)</option>
        <option value="speed">Velocidade |F|</option>
      </select>
    </div>
  `;

  document.body.appendChild(panel);

  // Acrescentar seção de Seeds por clique (programaticamente)
  const seedsSection = document.createElement('div');
  seedsSection.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; align-items:center; margin-top:6px;">
      <label style="grid-column: span 3;"><input id="vfs-click-seeds" type="checkbox" /> Seeds por clique</label>
      <button id="vfs-clear-seeds" style="grid-column: span 3; padding:6px; border-radius:6px; border:1px solid #9e9e9e; background:#fafafa;">Limpar Seeds</button>
      <span id="vfs-seed-count" style="grid-column: span 6; font-size:12px; color:#444;">0 seeds</span>
    </div>
  `;
  panel.appendChild(seedsSection);

  const qs = (id) => panel.querySelector(id);
  const elPreset = qs('#vfs-preset');
  const elP = qs('#vfs-P');
  const elQ = qs('#vfs-Q');
  const elR = qs('#vfs-R');
  const elXmin = qs('#vfs-xmin');
  const elXmax = qs('#vfs-xmax');
  const elYmin = qs('#vfs-ymin');
  const elYmax = qs('#vfs-ymax');
  const elZmin = qs('#vfs-zmin');
  const elZmax = qs('#vfs-zmax');
  const elMode = qs('#vfs-mode');
  const elNx = qs('#vfs-nx');
  const elNy = qs('#vfs-ny');
  const elNz = qs('#vfs-nz');
  const elScale = qs('#vfs-scale');
  const elScaleNum = qs('#vfs-scale-num');
  const elRadius = qs('#vfs-radius');
  const elRadiusNum = qs('#vfs-radius-num');
  const elRender = qs('#vfs-render');
  const elAuto = qs('#vfs-auto');
  const elStatus = qs('#vfs-status');
  const elSeedsNx = qs('#vfs-seeds-nx');
  const elSeedsNy = qs('#vfs-seeds-ny');
  const elH = qs('#vfs-h');
  const elMaxSteps = qs('#vfs-maxsteps');
  const elDrawSpeed = qs('#vfs-drawspeed');
  const elDirection = qs('#vfs-direction');
  const elParticleSpeed = qs('#vfs-particlespeed');
  const elAnimateDraw = qs('#vfs-animate-draw');
  const elStreamColor = qs('#vfs-stream-color');
  const elStreamBtn = qs('#vfs-stream');
  const elClearStreamBtn = qs('#vfs-clear-stream');
  const elStreamStatus = qs('#vfs-stream-status');
  const elClickSeeds = panel.querySelector('#vfs-click-seeds');
  const elClearSeeds = panel.querySelector('#vfs-clear-seeds');
  const elSeedCount = panel.querySelector('#vfs-seed-count');

  function splitVectorString(str) {
    const result = [];
    let current = '';
    let depth = 0;
    for (const char of str) {
      if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        if (char === '(') depth++;
        if (char === ')') depth--;
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  elPreset.addEventListener('change', () => {
    const v = elPreset.value;
    if (v && v !== 'custom') {
      // tentar extrair três componentes separados do preset "(P,Q,R)"
      try {
        const inner = v.replace(/^\(|\)$/g, '');
        const parts = splitVectorString(inner);
        if (parts.length === 3) {
          elP.value = parts[0];
          elQ.value = parts[1];
          elR.value = parts[2];
        }
      } catch (_) { /* ignore */ }
    }
  });

  function clampInt(n, min, max) {
    n = Math.round(Number(n));
    if (!isFinite(n)) n = min;
    return Math.max(min, Math.min(max, n));
  }

  async function doRender() {
    if (!window.vfsScene) return;
    const P = elP.value.trim() || '0';
    const Q = elQ.value.trim() || '0';
    const R = elR.value.trim() || '0';
    const field = `(${P}, ${Q}, ${R})`;

    const x0 = Number(elXmin.value); const x1 = Number(elXmax.value);
    const y0 = Number(elYmin.value); const y1 = Number(elYmax.value);
    const z0 = Number(elZmin.value); const z1 = Number(elZmax.value);
    const nx = clampInt(elNx.value, 3, 21);
    const ny = clampInt(elNy.value, 3, 21);
    const nz = clampInt(elNz.value, 3, 21);
    let scale = Number(elScaleNum.value);
    if (!isFinite(scale)) scale = 1;
    scale = Math.min(3, Math.max(0.3, scale));
    let radiusScale = Number(elRadiusNum.value);
    if (!isFinite(radiusScale)) radiusScale = 1;
    radiusScale = Math.min(3, Math.max(0.5, radiusScale));

    elNx.value = nx; elNy.value = ny; elNz.value = nz;
    elScale.value = String(scale);
    elScaleNum.value = String(scale);
    elRadius.value = String(radiusScale);
    elRadiusNum.value = String(radiusScale);

    const domain = {
      x: [Math.min(x0, x1), Math.max(x0, x1)],
      y: [Math.min(y0, y1), Math.max(y0, y1)],
      z: [Math.min(z0, z1), Math.max(z0, z1)],
    };
    const resolution = { nx, ny, nz };

    elRender.disabled = true;
    const prevText = elRender.textContent;
    elRender.textContent = 'Renderizando...';
    elStatus.textContent = '';
    try {
      await updateVectorField(window.vfsScene, { field, domain, resolution, mode: elMode.value, scale, radiusScale, useInstancing: true });
      elStatus.textContent = 'OK';
      elStatus.style.color = '#2e7d32';
    } catch (err) {
      console.error(err);
      elStatus.textContent = (err && err.message) ? err.message : 'Erro';
      elStatus.style.color = '#b71c1c';
    } finally {
      elRender.disabled = false;
      elRender.textContent = prevText;
    }
  }

  elRender.addEventListener('click', doRender);
  // Enter para renderizar
  [elP, elQ, elR, elXmin, elXmax, elYmin, elYmax, elZmin, elZmax, elNx, elNy, elNz]
    .forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') doRender(); }));

  // Sync slider and numeric input
  elScale.addEventListener('input', () => {
    elScaleNum.value = elScale.value;
  });
  elScaleNum.addEventListener('input', () => {
    elScale.value = elScaleNum.value;
  });
  elRadius.addEventListener('input', () => {
    elRadiusNum.value = elRadius.value;
  });
  elRadiusNum.addEventListener('input', () => {
    elRadius.value = elRadiusNum.value;
  });
  // Debounce helper for auto-apply
  function debounce(fn, ms = 400) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
  const debouncedRender = debounce(doRender, 450);
  function maybeAutoApply() {
    if (elAuto && elAuto.checked) debouncedRender();
  }
  // Auto-apply on input changes
  [elP, elQ, elR,
    elXmin, elXmax, elYmin, elYmax, elZmin, elZmax,
    elNx, elNy, elNz,
    elMode,
    elScale, elScaleNum,
    elRadius, elRadiusNum]
    .forEach((el) => el.addEventListener('input', maybeAutoApply));
  elPreset.addEventListener('change', maybeAutoApply);

  function clampInt(n, min, max) {
    n = Math.round(Number(n));
    if (!isFinite(n)) n = min;
    return Math.max(min, Math.min(max, n));
  }

  async function doStreamlines() {
    if (!window.vfsScene) return;
    const P = elP.value.trim() || '0';
    const Q = elQ.value.trim() || '0';
    const R = elR.value.trim() || '0';
    const field = `(${P}, ${Q}, ${R})`;
    const x0 = Number(elXmin.value); const x1 = Number(elXmax.value);
    const y0 = Number(elYmin.value); const y1 = Number(elYmax.value);
    const z0 = Number(elZmin.value); const z1 = Number(elZmax.value);
    const seedsNx = clampInt(elSeedsNx.value, 3, 21);
    const seedsNy = clampInt(elSeedsNy.value, 3, 21);
    const h = Number(elH.value) || 0.1;
    const maxSteps = clampInt(elMaxSteps.value, 50, 5000);
    const particleSpeed = Math.max(1, Math.min(100, Number(elParticleSpeed && elParticleSpeed.value) || 4));
    const animateDraw = !!(elAnimateDraw && elAnimateDraw.checked);
    elSeedsNx.value = seedsNx; elSeedsNy.value = seedsNy;
    elH.value = String(h); elMaxSteps.value = String(maxSteps);
    const drawSpeed = Math.max(5, Math.min(500, Number(elDrawSpeed && elDrawSpeed.value) || 100));
    const domain = { x: [Math.min(x0, x1), Math.max(x0, x1)], y: [Math.min(y0, y1), Math.max(y0, y1)], z: [Math.min(z0, z1), Math.max(z0, z1)] };
    try {
      elStreamBtn.disabled = true;
      elStreamStatus.textContent = 'Gerando...';
      elStreamStatus.style.color = '#444';
      const payload = (seedState.seeds && seedState.seeds.length)
        ? { field, domain, seeds: seedState.seeds.slice(), h, maxSteps, direction: elDirection.value, drawSpeed, colorMode: elStreamColor.value, particleSpeed, animateDraw }
        : { field, domain, seedsNx, seedsNy, h, maxSteps, direction: elDirection.value, drawSpeed, colorMode: elStreamColor.value, particleSpeed, animateDraw };
      await renderStreamlines(window.vfsScene, payload);
      elStreamStatus.textContent = 'OK';
      elStreamStatus.style.color = '#2e7d32';
    } catch (e) {
      console.error('Erro streamlines:', e);
      elStreamStatus.textContent = (e && e.message) ? e.message : 'Erro';
      elStreamStatus.style.color = '#b71c1c';
    } finally {
      elStreamBtn.disabled = false;
    }
  }
  elStreamBtn.addEventListener('click', doStreamlines);
  elClearStreamBtn.addEventListener('click', () => clearStreamlines(window.vfsScene));

  // Seeds por clique (plano z = meio do domínio atual)
  const seedState = { enabled: false, seeds: [], markers: null };
  function updateSeedCount() { if (elSeedCount) elSeedCount.textContent = `${seedState.seeds.length} seeds`; }
  function ensureMarkerGroup() {
    if (!seedState.markers) {
      seedState.markers = new THREE.Group();
      seedState.markers.name = 'vfsSeedMarkers';
      if (window.vfsScene) window.vfsScene.add(seedState.markers);
    }
  }
  function addSeedMarker(p) {
    ensureMarkerGroup();
    const geo = new THREE.SphereGeometry(0.06, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe53935, toneMapped: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    seedState.markers.add(m);
  }
  function clearSeeds() {
    seedState.seeds = [];
    updateSeedCount();
    if (seedState.markers && window.vfsScene) {
      window.vfsScene.remove(seedState.markers);
      seedState.markers.children.forEach(c => { c.geometry && c.geometry.dispose(); c.material && c.material.dispose && c.material.dispose(); });
      seedState.markers = null;
    }
  }
  if (elClearSeeds) elClearSeeds.addEventListener('click', clearSeeds);
  if (elClickSeeds) elClickSeeds.addEventListener('change', () => { seedState.enabled = !!elClickSeeds.checked; });
  updateSeedCount();

  const raycaster = new THREE.Raycaster();
  function onCanvasClick(ev) {
    if (!seedState.enabled) return;
    const renderer = window.vfsRenderer;
    const camera = window.vfsCamera;
    if (!renderer || !camera) return;
    const zmin = Number(elZmin.value), zmax = Number(elZmax.value);
    const zmid = (zmin + zmax) / 2;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zmid);
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x, y }, camera);
    const point = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, point)) {
      // Clampar seed ao domínio atual (x,y)
      const xmin = Number(elXmin.value), xmax = Number(elXmax.value);
      const ymin = Number(elYmin.value), ymax = Number(elYmax.value);
      const px = Math.max(Math.min(point.x, Math.max(xmin, xmax)), Math.min(xmin, xmax));
      const py = Math.max(Math.min(point.y, Math.max(ymin, ymax)), Math.min(ymin, ymax));
      const p = [px, py, point.z];
      seedState.seeds.push(p);
      addSeedMarker(p);
      updateSeedCount();
    }
  }
  if (window.vfsRenderer) {
    window.vfsRenderer.domElement.addEventListener('pointerdown', onCanvasClick);
  }
})();












