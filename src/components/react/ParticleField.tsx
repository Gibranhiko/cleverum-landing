import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createParticleAttributes } from '~/components/three/particleGeometry';
import { fragmentShader, vertexShader } from '~/components/three/particleShader';
import { subscribeScrollProgress } from '~/lib/scrollProgress';

const PARTICLE_COUNT = 6000;
const SCRUB_SPEED = 6; // velocidad con la que uProgress persigue al scroll
const MOUSE_LERP = 5; // velocidad con la que el cursor lerpa hacia el target

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  // Posición del cursor en NDC (-1..1).
  // target = valor real del último mousemove. current = valor suavizado.
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  // 0 cuando no hay mouse (touch / sin movimiento) → fadeOut suave
  const mouseStrengthTarget = useRef(0);
  const mouseStrengthCurrent = useRef(0);
  const lastMouseAt = useRef(0);

  const { size } = useThree();

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
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseStrength: { value: 0 },
        uAspect: { value: 1 },
        uColorA: { value: new THREE.Color('#4F8AF7') },
        uColorB: { value: new THREE.Color('#7C5CFF') },
        uColorC: { value: new THREE.Color('#22C55E') },
        uColorHot: { value: new THREE.Color('#FFFFFF') },
        uOpacity: { value: 0.55 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Subscripciones globales
  useEffect(() => {
    const unsubscribeScroll = subscribeScrollProgress((p) => {
      targetProgress.current = p;
    });

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseStrengthTarget.current = 1;
      lastMouseAt.current = performance.now();
    };

    const onMouseLeave = () => {
      mouseStrengthTarget.current = 0;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      unsubscribeScroll();
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Actualiza el aspect ratio cuando cambia el viewport
  useEffect(() => {
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  }, [size.width, size.height, material]);

  useFrame((_, dt) => {
    // 1) Scroll → uProgress (scrub)
    const scrollK = Math.min(1, dt * SCRUB_SPEED);
    currentProgress.current +=
      (targetProgress.current - currentProgress.current) * scrollK;
    material.uniforms.uProgress.value = currentProgress.current;

    // 2) Mouse → uMouse (lerp)
    const mK = Math.min(1, dt * MOUSE_LERP);
    mouseCurrent.current.x +=
      (mouseTarget.current.x - mouseCurrent.current.x) * mK;
    mouseCurrent.current.y +=
      (mouseTarget.current.y - mouseCurrent.current.y) * mK;
    material.uniforms.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);

    // Si llevamos > 2s sin mover el mouse, atenúa la repulsión
    if (performance.now() - lastMouseAt.current > 2000) {
      mouseStrengthTarget.current = 0;
    }
    mouseStrengthCurrent.current +=
      (mouseStrengthTarget.current - mouseStrengthCurrent.current) * Math.min(1, dt * 2.5);
    material.uniforms.uMouseStrength.value = mouseStrengthCurrent.current;

    // 3) Tiempo global
    material.uniforms.uTime.value += dt;

    // 4) Rotación lenta del campo
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
