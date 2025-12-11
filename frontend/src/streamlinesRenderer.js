import * as THREE from 'three';

let current = {
  group: null,
  raf: null,
  animStates: [],
  particleStates: [],
};

export async function renderStreamlines(scene, options = {}) {
  // Remove anteriores
  if (current.group) {
    scene.remove(current.group);
    current.group.children.forEach(m => m.geometry && m.geometry.dispose());
    current.group.children.forEach(m => m.material && m.material.dispose && m.material.dispose());
    current.group = null;
  }
  if (current.raf) {
    cancelAnimationFrame(current.raf);
    current.raf = null;
  }
  current.animStates = [];
  current.particleStates = [];

  const {
    field = '(x, y, z)',
    domain = { x: [-2, 2], y: [-2, 2], z: [-2, 2] },
    seeds = null, // opcional; se faltar, geramos grade em z=mid
    seedsNx = 7,
    seedsNy = 7,
    h = 0.1,
    maxSteps = 400,
    bidirectional = true,
  } = options;
  const animateDraw = options.animateDraw !== false; // anima por padrão
  const drawSpeed = typeof options.drawSpeed === 'number' ? options.drawSpeed : 20; // vértices/segundo (mais lento por padrão)
  const particles = options.particles !== false; // partículas ligadas por padrão
  const particleSpeed = typeof options.particleSpeed === 'number' ? options.particleSpeed : 4; // vértices/segundo

  let seedsList = seeds;
  if (!Array.isArray(seedsList)) {
    // gerar grade em plano z = meio
    const zmid = (domain.z[0] + domain.z[1]) / 2;
    const xs = linspace(domain.x[0], domain.x[1], seedsNx);
    const ys = linspace(domain.y[0], domain.y[1], seedsNy);
    seedsList = [];
    for (let j = 0; j < seedsNy; j++) {
      for (let i = 0; i < seedsNx; i++) {
        seedsList.push([xs[i], ys[j], zmid]);
      }
    }
  }

  const bbox = { x: domain.x, y: domain.y, z: domain.z };
  const API_URL = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${API_URL}/api/streamlines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, seeds: seedsList, h, maxSteps, bbox, bidirectional })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('Falha ao gerar streamlines: ' + (err.error || res.statusText));
  }
  const payload = await res.json();
  const lines = payload.lines;
  const speeds = payload.speeds;
  const seedIndices = payload.seedIndices;

  const group = new THREE.Group();
  const colorMode = options.colorMode || 'single';
  const baseMat = new THREE.LineBasicMaterial({ color: 0x1976d2, linewidth: 1, depthTest: false, transparent: true, opacity: 0.9 });

  let vmin = Infinity, vmax = -Infinity;
  if (Array.isArray(speeds)) {
    for (const arr of speeds) {
      if (!Array.isArray(arr)) continue;
      for (const s of arr) {
        if (!isFinite(s)) continue;
        if (s < vmin) vmin = s;
        if (s > vmax) vmax = s;
      }
    }
    if (!isFinite(vmin) || !isFinite(vmax) || vmax <= vmin) { vmin = 0; vmax = 1; }
  }

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!Array.isArray(line) || line.length < 2) continue;
    const geom = new THREE.BufferGeometry();
    const arr = new Float32Array(line.length * 3);
    for (let i = 0; i < line.length; i++) {
      const p = line[i];
      arr[i * 3 + 0] = p[0];
      arr[i * 3 + 1] = p[1];
      arr[i * 3 + 2] = p[2];
    }
    geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    let mat = baseMat;
    if (colorMode === 'speed' && Array.isArray(speeds) && Array.isArray(speeds[li])) {
      const cols = new Float32Array(line.length * 3);
      for (let i = 0; i < line.length; i++) {
        const s = speeds[li][i];
        const t = normalize01(s, vmin, vmax);
        const c = colormap(t);
        cols[i * 3 + 0] = c.r;
        cols[i * 3 + 1] = c.g;
        cols[i * 3 + 2] = c.b;
      }
      geom.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      mat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 1, depthTest: false, transparent: true, opacity: 0.95 });
    }
    // Preparar desenho progressivo
    let animIndex = -1;
    if (animateDraw) {
      // Desenho de linhas usa número de vértices na drawRange
      // Para i segmentos visíveis, precisamos i+1 vértices
      geom.setDrawRange(0, 0);
      current.animStates.push({ geom, total: line.length, cur: 0, acc: 0 });
      animIndex = current.animStates.length - 1;
    }
    const ln = new THREE.Line(geom, mat);
    group.add(ln);

    // Partículas animadas percorrendo a linha
    if (particles) {
      // Tamanho da partícula depende do tamanho do domínio para ser mais visível
      const ex = Math.abs(domain.x[1] - domain.x[0]);
      const ey = Math.abs(domain.y[1] - domain.y[0]);
      const ez = Math.abs(domain.z[1] - domain.z[0]);
      const minRange = Math.max(0.001, Math.min(ex, ey, ez));
      const baseR = Math.max(0.04, 0.02 * minRange);
      const sphGeo = new THREE.SphereGeometry(baseR, 14, 14);
      const sphMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, toneMapped: false, depthTest: false });
      const particle = new THREE.Mesh(sphGeo, sphMat);
      particle.frustumCulled = false;
      // Se estiver animando o desenho, só tornamos visível quando houver segmento desenhado
      particle.visible = !animateDraw;
      particle.renderOrder = 999;
      // Posição inicial no ponto de semente
      const seedIndex = seedIndices ? seedIndices[li] : 0;
      particle.position.set(arr[seedIndex * 3], arr[seedIndex * 3 + 1], arr[seedIndex * 3 + 2]);
      group.add(particle);
      // velocidade relativa pela magnitude (se disponível)
      let spdArr = null;
      if (Array.isArray(speeds) && Array.isArray(speeds[li])) spdArr = speeds[li];
      current.particleStates.push({
        mesh: particle,
        positions: arr,
        count: line.length,
        idx: seedIndex,
        seedIndex: seedIndex, // Preservar para o loop
        spdArr,
        animIndex,
      });
    }
  }
  scene.add(group);
  current.group = group;

  // Loop de animação para revelar as linhas e mover partículas
  if ((animateDraw && current.animStates.length) || (particles && current.particleStates.length)) {
    let lastTs = performance.now();
    const tick = (ts) => {
      const dt = Math.max(0, (ts - lastTs) / 1000);
      lastTs = ts;
      let keepAnimating = false;
      // Desenho progressivo das linhas
      if (animateDraw) {
        for (const st of current.animStates) {
          if (st.cur < st.total) {
            st.acc += drawSpeed * dt;
            const inc = Math.floor(st.acc);
            if (inc > 0) {
              st.cur = Math.min(st.total, st.cur + inc);
              st.acc -= inc;
              st.geom.setDrawRange(0, st.cur);
            }
            keepAnimating = true;
          }
        }
      }
      // Mover partículas
      if (particles) {
        for (let i = 0; i < current.particleStates.length; i++) {
          const ps = current.particleStates[i];
          const n = ps.count;
          if (n < 2) continue;
          // velocidade relativa pela magnitude se disponível
          let rel = 1;
          if (ps.spdArr) {
            const k = Math.min(n - 1, Math.max(0, Math.floor(ps.idx)));
            const s = ps.spdArr[k];
            rel = normalize01(s, vmin, vmax);
            rel = 0.2 + 0.8 * rel; // evita zero
          }
          // restringir ao trecho já desenhado
          let allowed = n;
          if (animateDraw && ps.animIndex != null && ps.animIndex >= 0) {
            const st = current.animStates[ps.animIndex];
            allowed = Math.max(1, Math.min(n, st.cur));
          }
          if (allowed < 2) {
            const pIdx = Math.floor(ps.idx);
            ps.mesh.position.set(ps.positions[pIdx * 3], ps.positions[pIdx * 3 + 1], ps.positions[pIdx * 3 + 2]);
            keepAnimating = true;
          } else {
            // Atualizar índice (mover)
            ps.idx += particleSpeed * rel * dt;
            if (ps.idx >= ps.count - 1) ps.idx = 0; // loop para o início

            const i0 = Math.floor(ps.idx);

            // Verificar se está na parte desenhada
            if (animateDraw && i0 >= allowed - 1) {
              ps.mesh.visible = false;
              keepAnimating = true;
              continue;
            }

            // Se chegou aqui, está visível
            if (!ps.mesh.visible) ps.mesh.visible = true;

            const t = ps.idx - i0;
            const p0x = ps.positions[i0 * 3 + 0], p0y = ps.positions[i0 * 3 + 1], p0z = ps.positions[i0 * 3 + 2];
            const p1x = ps.positions[(i0 + 1) * 3 + 0], p1y = ps.positions[(i0 + 1) * 3 + 1], p1z = ps.positions[(i0 + 1) * 3 + 2];
            ps.mesh.position.set(
              p0x + (p1x - p0x) * t,
              p0y + (p1y - p0y) * t,
              p0z + (p1z - p0z) * t,
            );
          }
          keepAnimating = true;
        }
      }
      if (keepAnimating) {
        current.raf = requestAnimationFrame(tick);
      } else {
        current.raf = null;
      }
    };
    current.raf = requestAnimationFrame(tick);
  }
}

export function clearStreamlines(scene) {
  if (current.group) {
    scene.remove(current.group);
    current.group.children.forEach(m => m.geometry && m.geometry.dispose());
    current.group.children.forEach(m => m.material && m.material.dispose && m.material.dispose());
    current.group = null;
  }
}

function linspace(a, b, n) {
  if (n <= 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, i) => a + i * step);
}

function colormap(value01) {
  const x = THREE.MathUtils.clamp(value01, 0, 1);
  const c = new THREE.Color();
  if (x < 0.33) {
    const t = x / 0.33; c.setRGB(0, t, 1);
  } else if (x < 0.66) {
    const t = (x - 0.33) / 0.33; c.setRGB(t, 1, 1 - t);
  } else {
    const t = (x - 0.66) / 0.34; c.setRGB(1, 1 - t, 0);
  }
  return c;
}

function normalize01(value, minVal, maxVal) {
  if (!isFinite(value) || !isFinite(minVal) || !isFinite(maxVal) || maxVal <= minVal) return 0;
  const t = (value - minVal) / (maxVal - minVal);
  return THREE.MathUtils.clamp(t, 0, 1);
}

