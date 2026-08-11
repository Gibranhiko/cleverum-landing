/**
 * Shaders del ParticleField.
 *
 * El vertex shader interpola entre tres buffers de posiciones (cloud → grid →
 * constellation) según `uProgress` (0..1) y aplica un swirl orgánico con
 * `uTime`. Además reacciona al estado del AI Audit con 4 modos:
 *   uAuditState=0 (idle)       — sin efecto, cycling normal con scroll.
 *   uAuditState=1 (processing) — converge al centro vía mix(pos, 0, 0.7*uAuditMix).
 *   uAuditState=2 (revealing)  — burst hacia afuera vía pos *= 1.5^uAuditMix.
 *   uAuditState=3 (done)       — forma el número vía mix(pos, aDigit, uAuditMix).
 *
 * El fragment shader pinta cada punto como un disco con borde suave,
 * cambiando de color en tres etapas (azul → iris → verde).
 */

export const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseStrength;
  uniform float uAspect;
  uniform float uAuditState;
  uniform float uAuditMix;
  attribute vec3 aGrid;
  attribute vec3 aConstellation;
  attribute vec3 aDigit;

  varying float vMix;
  varying float vDepth;
  varying float vMouseGlow;
  varying float vAuditTint;

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

    // === Audit state morphing ============================
    // Branch on uAuditState (set per-frame from JS).
    if (uAuditState > 2.5) {
      // done — morph toward digit positions
      pos = mix(pos, aDigit, uAuditMix);
    } else if (uAuditState > 1.5) {
      // revealing — expand radially
      pos *= mix(1.0, 1.5, uAuditMix);
    } else if (uAuditState > 0.5) {
      // processing — converge toward center
      pos = mix(pos, vec3(0.0, 0.0, 0.0), uAuditMix * 0.7);
    }
    vAuditTint = uAuditState * uAuditMix;
    // =====================================================

    // Respiración continua — la burbuja pulsa levemente desde el inicio,
    // aunque no haya scroll. Se calma durante el audit para no distorsionar.
    float breatheAmp = 0.03 * (1.0 - clamp(uAuditMix, 0.0, 1.0));
    pos *= 1.0 + breatheAmp * sin(uTime * 0.5);

    // Wobble orgánico — fase distinta por partícula
    float phase = hash(position) * 6.2831;
    float wobble = 0.08 * (0.5 + 0.5 * p);
    // Reduce wobble when forming the digit so it stays readable
    float wobbleScale = mix(1.0, 0.2, step(2.5, uAuditState) * uAuditMix);
    pos.x += sin(uTime * 0.35 + phase) * wobble * wobbleScale;
    pos.y += cos(uTime * 0.28 + phase * 1.3) * wobble * wobbleScale;
    pos.z += sin(uTime * 0.42 + phase * 0.7) * wobble * wobbleScale;

    // === Repulsión del cursor ============================
    vec3 mouseWorld = vec3(uMouse.x * 4.2 * uAspect, uMouse.y * 3.4, 0.0);
    vec3 toMouse = pos - mouseWorld;
    float dist = length(toMouse.xy) + 0.0001;
    float falloff = 1.0 - smoothstep(0.0, 1.8, dist);
    falloff *= uMouseStrength;
    // Mouse interaction softened during audit
    float mouseScale = mix(1.0, 0.3, clamp(uAuditMix, 0.0, 1.0) * step(0.5, uAuditState));
    pos.xy += normalize(toMouse.xy) * falloff * 0.55 * mouseScale;
    pos.z += falloff * 0.25 * mouseScale;
    vMouseGlow = falloff;
    // =====================================================

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float pixelRatio = 1.5;
    gl_PointSize = (90.0 / -mv.z) * pixelRatio * (1.0 + p * 0.35 + falloff * 0.8);

    vMix = p;
    vDepth = -mv.z;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorHot;
  uniform float uOpacity;

  varying float vMix;
  varying float vDepth;
  varying float vMouseGlow;
  varying float vAuditTint;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.05, d);

    vec3 color;
    if (vMix < 0.5) {
      color = mix(uColorA, uColorB, vMix * 2.0);
    } else {
      color = mix(uColorB, uColorC, (vMix - 0.5) * 2.0);
    }

    // Audit tint — processing (iris dominant), revealing (green dominant), done (warm)
    if (vAuditTint > 2.5) {
      // done — slight warm boost
      color = mix(color, uColorHot, 0.3);
    } else if (vAuditTint > 1.5) {
      // revealing — push toward green
      color = mix(color, uColorC, 0.45);
    } else if (vAuditTint > 0.5) {
      // processing — push toward iris
      color = mix(color, uColorB, 0.5);
    }

    color = mix(color, uColorHot, vMouseGlow * 0.7);

    float depthFade = clamp(1.0 - vDepth * 0.04, 0.5, 1.0);
    float a = alpha * uOpacity * depthFade * (1.0 + vMouseGlow * 0.5);

    gl_FragColor = vec4(color, a);
  }
`;
