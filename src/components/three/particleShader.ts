/**
 * Shaders del ParticleField.
 *
 * El vertex shader interpola entre tres buffers de posiciones (cloud → grid →
 * constellation) según `uProgress` (0..1) y aplica un swirl orgánico con
 * `uTime`.
 *
 * El fragment shader pinta cada punto como un disco con borde suave,
 * cambiando de color en tres etapas (azul → iris → verde).
 */

export const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aGrid;
  attribute vec3 aConstellation;

  varying float vMix;
  varying float vDepth;

  // Hash determinista a partir de la posición original
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  void main() {
    float p = clamp(uProgress, 0.0, 1.0);
    vec3 pos;

    if (p < 0.5) {
      float t = smoothstep(0.0, 0.5, p);
      pos = mix(position, aGrid, t);
    } else {
      float t = smoothstep(0.5, 1.0, p);
      pos = mix(aGrid, aConstellation, t);
    }

    // Wobble orgánico — fase distinta por partícula
    float phase = hash(position) * 6.2831;
    float wobble = 0.08 * (0.5 + 0.5 * p);
    pos.x += sin(uTime * 0.35 + phase) * wobble;
    pos.y += cos(uTime * 0.28 + phase * 1.3) * wobble;
    pos.z += sin(uTime * 0.42 + phase * 0.7) * wobble;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Point size con atenuación por profundidad
    float pixelRatio = 1.5;
    gl_PointSize = (90.0 / -mv.z) * pixelRatio * (1.0 + p * 0.35);

    vMix = p;
    vDepth = -mv.z;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColorA; // cloud — azul
  uniform vec3 uColorB; // grid  — iris
  uniform vec3 uColorC; // const — verde
  uniform float uOpacity;

  varying float vMix;
  varying float vDepth;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    // Disco con borde suave
    float alpha = smoothstep(0.5, 0.05, d);

    // Mezcla tricolor según vMix (0..1)
    vec3 color;
    if (vMix < 0.5) {
      color = mix(uColorA, uColorB, vMix * 2.0);
    } else {
      color = mix(uColorB, uColorC, (vMix - 0.5) * 2.0);
    }

    // Ligera atenuación por profundidad
    float depthFade = clamp(1.0 - vDepth * 0.04, 0.5, 1.0);

    gl_FragColor = vec4(color, alpha * uOpacity * depthFade);
  }
`;
