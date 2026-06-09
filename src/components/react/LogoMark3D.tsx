import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Procedural environment map so transmission has something to refract. */
function ProceduralEnv(): null {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Gem(): React.ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Una sola malla. Vertex colors iris↑ / verde↓ + transmission para el efecto cristal.
  // Three.js interpola los colores entre vértices del icosaedro → gradient suave.
  const geometry = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.3, 0);
    const positions = geom.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    // Versiones saturadas para compensar la dilución por transmission.
    const irisColor = new THREE.Color('#9D7CFF');
    const greenColor = new THREE.Color('#33D964');
    const tmpColor = new THREE.Color();

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const range = maxY - minY || 1;

    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const t = (y - minY) / range; // 0 abajo, 1 arriba
      tmpColor.copy(greenColor).lerp(irisColor, t);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, []);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state, dt) => {
    if (!groupRef.current || reduced) return;
    const t = state.clock.elapsedTime;
    const boost = hovered ? 2.5 : 1;
    groupRef.current.rotation.x +=
      dt * 0.17 * boost * (1 + Math.sin(t * 0.13) * 0.35);
    groupRef.current.rotation.y +=
      dt * 0.29 * boost * (1 + Math.cos(t * 0.09) * 0.28);
    groupRef.current.rotation.z +=
      dt * 0.11 * boost * (1 + Math.sin(t * 0.07) * 0.45);
    groupRef.current.position.x = Math.sin(t * 0.41) * 0.05;
    groupRef.current.position.y = Math.cos(t * 0.31) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Una sola malla: vertex colors (gradient) + transmission (cristal difuso). */}
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          vertexColors
          metalness={1}
          roughness={0.1}
          transmission={1}
          thickness={1.0}
          ior={1.5}
          attenuationColor="#20095b"
          attenuationDistance={3.0}
          iridescence={0}
          clearcoat={0.1}
          clearcoatRoughness={0.3}
          envMapIntensity={0.4}
        />
      </mesh>

      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#1c0a58" transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}

export default function LogoMark3D(): React.ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <ProceduralEnv />
        <ambientLight intensity={0.1} />
        {/* Iris desde arriba — refuerza el iris en la mitad superior del núcleo */}
        <pointLight position={[2.5, 3, 2.5]} intensity={2.0} color="#7C5CFF" />
        {/* Verde WhatsApp desde abajo — refuerza el verde en la mitad inferior */}
        <pointLight position={[-2.5, -3, 2]} intensity={2.0} color="#22C55E" />
        {/* Fill blanco suave desde arriba — define forma sin lavar colores */}
        <pointLight position={[0, 2, 1]} intensity={0.35} color="#ffffff" />
        {/* Rim sutil detrás — silueta */}
        <pointLight position={[0, 0, -3]} intensity={0.3} color="#ffffff" />
        <Gem />
      </Canvas>
    </div>
  );
}
