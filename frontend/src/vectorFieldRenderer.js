import * as THREE from 'three';

let current = {
  mesh: null,
  group: null,
  legend: null,
};

const yAxis = new THREE.Vector3(0, 1, 0);

function buildConeGeometry() {
  // Cone alinhado ao +Y, altura=1, raio=0.1
  const geo = new THREE.ConeGeometry(0.08, 1, 8, 1, false);
  // mover para que a base fique no centro e a ponta em y=+0.5
  geo.translate(0, 0.5, 0);
  return geo;
}

function colormap(value01) {
  // Gradiente simples: azul -> ciano -> amarelo -> vermelho
  const x = THREE.MathUtils.clamp(value01, 0, 1);
  const c = new THREE.Color();
  if (x < 0.33) {
    const t = x / 0.33;
    c.setRGB(0, t, 1); // (0,0,1) -> (0,1,1)
  } else if (x < 0.66) {
    const t = (x - 0.33) / 0.33;
    c.setRGB(t, 1, 1 - t); // (0,1,1) -> (1,1,0)
  } else {
    const t = (x - 0.66) / 0.34;
    c.setRGB(1, 1 - t, 0); // (1,1,0) -> (1,0,0)
  }
  return c;
}

function normalize01(value, minVal, maxVal) {
  if (!isFinite(value) || !isFinite(minVal) || !isFinite(maxVal) || maxVal <= minVal) return 0;
  const t = (value - minVal) / (maxVal - minVal);
  return THREE.MathUtils.clamp(t, 0, 1);
}

function createLegend() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    width: '220px',
    height: '14px',
    background: 'linear-gradient(90deg, #0033ff, #00ffff, #ffff00, #ff0000)',
    border: '1px solid rgba(0,0,0,0.3)',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  });
  const label = document.createElement('div');
  label.textContent = 'Magnitude (min → max)';
  Object.assign(label.style, {
    position: 'absolute',
    top: '-18px',
    right: '0',
    color: '#222',
    fontFamily: 'sans-serif',
    fontSize: '12px',
  });
  el.appendChild(label);
  return el;
}

export async function renderVectorField(scene, options = {}) {
  // Remove renderizações anteriores
  if (current.mesh) {
    scene.remove(current.mesh);
    current.mesh.geometry.dispose();
    current.mesh.material.dispose();
    current.mesh = null;
  }
  if (current.group) {
    scene.remove(current.group);
    current.group = null;
  }
  if (current.legend) {
    current.legend.remove();
    current.legend = null;
  }

  const {
    field = '(x, y, z)',
    domain = { x: [-2, 2], y: [-2, 2], z: [-2, 2] },
    resolution = { nx: 9, ny: 9, nz: 9 },
    mode = 'magnitude', // 'magnitude' | 'div' | 'curl'
    scale = 1.0,        // fator global de escala das setas
    radiusScale = 1.0,  // fator de grossura das setas
    useInstancing = false, // modo compatibilidade: desliga instancing por padrão
  } = options;

  // Buscar valores do backend
  const res = await fetch('/api/vector-field/evaluate-grid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, domain, resolution })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('Falha ao avaliar campo: ' + (err.error || res.statusText));
  }
  const { points, values, shape } = await res.json();

  // Base: magnitudes do campo para orientação e (por padrão) coloração
  const mags = values.map(v => Math.hypot(v[0], v[1], v[2]));
  const maxMag = mags.reduce((a, b) => Math.max(a, b), 0.0001); // usado para escalar comprimento

  // Determinar valores de coloração conforme modo
  let colorVals = mags.slice();
  let legendLabel = 'Magnitude (min -> max)';

  if (mode === 'div') {
    const r = await fetch('/api/vector-field/div', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, domain, resolution })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error('Falha ao calcular divergente: ' + (err.error || r.statusText));
    }
    const { values: divVals } = await r.json();
    colorVals = divVals;
    legendLabel = 'Divergente (min -> max)';
  } else if (mode === 'curl') {
    const r = await fetch('/api/vector-field/curl', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, domain, resolution })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error('Falha ao calcular rotacional: ' + (err.error || r.statusText));
    }
    const { values: curlVals } = await r.json();
    colorVals = curlVals.map(v => Math.hypot(v[0], v[1], v[2]));
    legendLabel = 'Rotacional |curl| (min -> max)';
  }

  // Estatísticas para normalização de cor
  let minVal = Infinity, maxVal = -Infinity;
  for (const v of colorVals) {
    if (typeof v === 'number') {
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
  }
  if (!isFinite(minVal) || !isFinite(maxVal) || maxVal === minVal) {
    minVal = 0; maxVal = 1; // fallback para evitar divisão por zero
  }

  // Aproximar espaçamento
  const [nx, ny, nz] = shape || [resolution.nx, resolution.ny, resolution.nz];
  const dx = (domain.x[1] - domain.x[0]) / Math.max(1, nx - 1);
  const dy = (domain.y[1] - domain.y[0]) / Math.max(1, ny - 1);
  const dz = (domain.z[1] - domain.z[0]) / Math.max(1, nz - 1);
  let spacing = Math.min(dx, dy, dz);
  if (!isFinite(spacing) || spacing <= 0) {
    const ex = Math.abs(domain.x[1] - domain.x[0]);
    const ey = Math.abs(domain.y[1] - domain.y[0]);
    const ez = Math.abs(domain.z[1] - domain.z[0]);
    const base = (ex + ey + ez) / 3 || 1;
    const denom = Math.max(nx, ny, nz, 1);
    spacing = Math.max(base / denom, 0.5);
  }

  const count = points.length;
  const cone = buildConeGeometry();
  const group = new THREE.Group();
  if (useInstancing) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.InstancedMesh(cone, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    }
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const p = points[i];
      const v = values[i];
      const mag = mags[i];
      const dir = new THREE.Vector3(v[0], v[1], v[2]);
      if (dir.lengthSq() < 1e-12) dir.set(0, 1, 0);
      dir.normalize();
      const len = Math.max(0.25 * spacing, (mag / maxMag) * 0.8 * spacing) * scale;
      dummy.position.set(p[0], p[1], p[2]);
      dummy.quaternion.setFromUnitVectors(yAxis, dir);
      const radius = Math.max(0.05 * spacing, 0.05) * Math.sqrt(Math.max(scale, 0.0001)) * Math.max(radiusScale, 0.1);
      dummy.scale.set(radius, len, radius);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const cval = colorVals[i];
      const t = normalize01(cval, minVal, maxVal);
      const c = colormap(t);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
  } else {
    // Fallback sem instancing: um Mesh por seta com material colorido
    for (let i = 0; i < count; i++) {
      const p = points[i];
      const v = values[i];
      const mag = mags[i];
      const dir = new THREE.Vector3(v[0], v[1], v[2]);
      if (dir.lengthSq() < 1e-12) dir.set(0, 1, 0);
      dir.normalize();
      const len = Math.max(0.25 * spacing, (mag / maxMag) * 0.8 * spacing) * scale;
      const radius = Math.max(0.05 * spacing, 0.05) * Math.sqrt(Math.max(scale, 0.0001)) * Math.max(radiusScale, 0.1);
      const t = normalize01(colorVals[i], minVal, maxVal);
      const c = colormap(t);
      const mat = new THREE.MeshBasicMaterial({ color: c, toneMapped: false, side: THREE.DoubleSide });
      const m = new THREE.Mesh(cone, mat);
      m.position.set(p[0], p[1], p[2]);
      m.quaternion.setFromUnitVectors(yAxis, dir);
      m.scale.set(radius, len, radius);
      group.add(m);
    }
  }
  scene.add(group);

  const legend = createLegend();
  legend.querySelector('div').textContent = legendLabel;
  document.body.appendChild(legend);

  current.mesh = null;
  current.group = group;
  current.legend = legend;
}

export async function updateVectorField(scene, options) {
  return renderVectorField(scene, options);
}
