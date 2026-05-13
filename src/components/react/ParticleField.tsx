import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createParticleAttributes } from '~/components/three/particleGeometry';
import { fragmentShader, vertexShader } from '~/components/three/particleShader';
import { subscribeScrollProgress } from '~/lib/scrollProgress';

const PARTICLE_COUNT = 6000;
// Cuán rápido el uniforme persigue el valor real de scroll (mayor = más responsive,
// menor = más "scrub"). 5–8 da una sensación cinematográfica.
const SCRUB_SPEED = 6;

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  const geometry = useMemo(() => {
    const attrs = createParticleAttributes(PARTICLE_COUNT);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(attrs.cloud, 3));
    g.setAttribute('aGrid', new THREE.BufferAttribute(attrs.grid, 3));
    g.setAttribute('aConstellation', new THREE.BufferAttribute(attrs.constellation, 3));
    return g;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color('#4F8AF7') },
        uColorB: { value: new THREE.Color('#7C5CFF') },
        uColorC: { value: new THREE.Color('#22C55E') },
        uOpacity: { value: 0.85 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Suscripción al scroll singleton — actualiza ref sin disparar re-renders.
  useEffect(() => {
    const unsubscribe = subscribeScrollProgress((p) => {
      targetProgress.current = p;
    });
    return () => {
      unsubscribe();
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, dt) => {
    // Lerp suave del progreso actual hacia el target (efecto scrub).
    const lerpFactor = Math.min(1, dt * SCRUB_SPEED);
    currentProgress.current +=
      (targetProgress.current - currentProgress.current) * lerpFactor;

    material.uniforms.uProgress.value = currentProgress.current;
    material.uniforms.uTime.value += dt;

    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.04;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default function ParticleField() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
