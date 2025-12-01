import * as THREE from 'three';

let currentCurve = null;

export function renderCurve(scene, points) {
    if (currentCurve) {
        scene.remove(currentCurve);
        currentCurve.geometry.dispose();
        currentCurve.material.dispose();
        currentCurve = null;
    }

    if (!points || points.length < 2) return;

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points.length * 3);

    for (let i = 0; i < points.length; i++) {
        vertices[i * 3] = points[i][0];
        vertices[i * 3 + 1] = points[i][1];
        vertices[i * 3 + 2] = points[i][2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0xff9800, // Laranja
        linewidth: 3
    });

    currentCurve = new THREE.Line(geometry, material);
    scene.add(currentCurve);
}

export function clearCurve(scene) {
    if (currentCurve) {
        scene.remove(currentCurve);
        currentCurve.geometry.dispose();
        currentCurve.material.dispose();
        currentCurve = null;
    }
}
