import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createParticleAttributes } from '~/components/three/particleGeometry';
import { generateDigitPositions } from '~/components/three/digitGeometry';
import { fragmentShader, vertexShader } from '~/components/three/particleShader';
import { subscribeScrollProgress } from '~/lib/scrollProgress';
import { subscribeAuditState, type AuditState } from '~/lib/auditState';

const PARTICLE_COUNT = 6000;
const SCRUB_SPEED = 6;
const MOUSE_LERP = 5;
const AUDIT_LERP = 4;

function auditStateToNumeric(s: AuditState): number {
  switch (s) {
    case 'processing':
      return 1;
    case 'revealing':
      return 2;
    case 'done':
      return 3;
    default:
      return 0;
  }
}

function Particles(): React.ReactElement {
  const pointsRef = useRef<THREE.Points>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const mouseStrengthTarget = useRef(0);
  const mouseStrengthCurrent = useRef(0);
  const lastMouseAt = useRef(0);

  // Audit state refs
  const auditStateNum = useRef(0);
  const auditMixTarget = useRef(0);
  const auditMixCurrent = useRef(0);
  const digitAttrRef = useRef<THREE.BufferAttribute | null>(null);

  const { size } = useThree();

  const geometry = useMemo(() => {
    const attrs = createParticleAttributes(PARTICLE_COUNT);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(attrs.cloud, 3));
    g.setAttribute('aGrid', new THREE.BufferAttribute(attrs.grid, 3));
    g.setAttribute('aConstellation', new THREE.BufferAttribute(attrs.constellation, 3));

    // Initialize aDigit attribute with zeros — populated when audit completes
    const digitArr = new Float32Array(PARTICLE_COUNT * 3);
    const digitAttr = new THREE.BufferAttribute(digitArr, 3);
    digitAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aDigit', digitAttr);
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
        uAuditState: { value: 0 },
        uAuditMix: { value: 0 },
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

  // Capture the digit attribute ref once geometry is built
  useEffect(() => {
    digitAttrRef.current = geometry.attributes.aDigit as THREE.BufferAttribute;
  }, [geometry]);

  // Subscriptions: scroll + mouse + audit state
  useEffect(() => {
    const unsubscribeScroll = subscribeScrollProgress((p) => {
      targetProgress.current = p;
    });

    const unsubscribeAudit = subscribeAuditState((state, payload) => {
      // On 'done', generate digit positions from the maturity score
      if (state === 'done' && payload.score !== undefined && digitAttrRef.current) {
        const positions = generateDigitPositions(payload.score.toFixed(1), PARTICLE_COUNT);
        (digitAttrRef.current.array as Float32Array).set(positions);
        digitAttrRef.current.needsUpdate = true;
      }
      auditStateNum.current = auditStateToNumeric(state);
      auditMixTarget.current = state === 'idle' ? 0 : 1;
    });

    const onMouseMove = (e: MouseEvent): void => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseStrengthTarget.current = 1;
      lastMouseAt.current = performance.now();
    };
    const onMouseLeave = (): void => {
      mouseStrengthTarget.current = 0;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      unsubscribeScroll();
      unsubscribeAudit();
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    material.uniforms.uAspect!.value = size.width / Math.max(1, size.height);
  }, [size.width, size.height, material]);

  useFrame((_, dt) => {
    const scrollK = Math.min(1, dt * SCRUB_SPEED);
    currentProgress.current += (targetProgress.current - currentProgress.current) * scrollK;
    material.uniforms.uProgress!.value = currentProgress.current;

    const mK = Math.min(1, dt * MOUSE_LERP);
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * mK;
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * mK;
    material.uniforms.uMouse!.value.set(mouseCurrent.current.x, mouseCurrent.current.y);

    if (performance.now() - lastMouseAt.current > 2000) {
      mouseStrengthTarget.current = 0;
    }
    mouseStrengthCurrent.current +=
      (mouseStrengthTarget.current - mouseStrengthCurrent.current) * Math.min(1, dt * 2.5);
    material.uniforms.uMouseStrength!.value = mouseStrengthCurrent.current;

    // Audit transition
    const auditK = Math.min(1, dt * AUDIT_LERP);
    auditMixCurrent.current += (auditMixTarget.current - auditMixCurrent.current) * auditK;
    material.uniforms.uAuditState!.value = auditStateNum.current;
    material.uniforms.uAuditMix!.value = auditMixCurrent.current;

    material.uniforms.uTime!.value += dt;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default function ParticleField(): React.ReactElement {
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
