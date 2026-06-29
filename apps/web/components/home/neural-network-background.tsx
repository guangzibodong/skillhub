"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

type NodeConnection = { node: NeuralNode; strength: number };

type NetworkMeshes = {
  nodesMesh: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  connectionsMesh: THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>;
  nodePositions: Float32Array;
  formationTargets: Float32Array[];
  connectionStartPoints: Float32Array;
  connectionEndPoints: Float32Array;
  connectionStartNodeIndices: Uint16Array;
  connectionEndNodeIndices: Uint16Array;
  nodeVisibility: Float32Array;
};

class NeuralNode {
  position: THREE.Vector3;
  connections: NodeConnection[] = [];
  level: number;
  type: number;
  size: number;
  distanceFromRoot = 0;
  helixT = 0;

  constructor(position: THREE.Vector3, level = 0, type = 0, random = Math.random) {
    this.position = position;
    this.level = level;
    this.type = type;
    this.size = type === 0 ? randFloat(0.8, 1.4, random) : randFloat(0.5, 1.0, random);
  }

  addConnection(node: NeuralNode, strength = 1) {
    if (this.isConnectedTo(node)) return;
    this.connections.push({ node, strength });
    node.connections.push({ node: this, strength });
  }

  isConnectedTo(node: NeuralNode) {
    return this.connections.some((connection) => connection.node === node);
  }
}

const GREEN_PALETTE = [0x70e95f, 0x55d7b9, 0x9fee70, 0x73cbd7, 0xf3f5ec].map((color) => new THREE.Color(color));
const NETWORK_SEED = 4319;
const STAR_SEED = 8841;
const DEFAULT_FORMATION = 0;
const DEFAULT_DENSITY = 1;

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function randFloat(min: number, max: number, random: () => number) {
  return min + (max - min) * random();
}

function randFloatSpread(range: number, random: () => number) {
  return range * (random() - 0.5);
}

function createStarfield(random = seededRandom(STAR_SEED)) {
  const count = 8000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const radius = randFloat(50, 150, random);
    const phi = Math.acos(randFloatSpread(2, random));
    const theta = randFloat(0, Math.PI * 2, random);
    const offset = index * 3;
    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[offset + 2] = radius * Math.cos(phi);

    const colorChoice = random();
    if (colorChoice < 0.62) colors.set([0.82, 1, 0.78], offset);
    else if (colorChoice < 0.84) colors.set([0.45, 0.9, 0.86], offset);
    else colors.set([0.95, 1, 0.88], offset);
    sizes[index] = randFloat(0.1, 0.3, random);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float twinkle = sin(uTime * 2.0 + position.x * 100.0) * 0.3 + 0.7;
        gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

const pulseUniforms = {
  uTime: { value: 0 },
  uPulsePositions: {
    value: [new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3)],
  },
  uPulseTimes: { value: [-1e3, -1e3, -1e3] },
  uPulseColors: {
    value: [new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1)],
  },
  uPulseSpeed: { value: 18 },
  uBaseNodeSize: { value: 0.52 },
  uMorphDim: { value: 0 },
};

const noiseFunctions = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`;

const nodeShader = {
  vertexShader: `${noiseFunctions}
    attribute float nodeSize;
    attribute float nodeType;
    attribute vec3 nodeColor;
    attribute float distanceFromRoot;
    attribute float nodeVisibility;

    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;
    uniform float uBaseNodeSize;
    uniform float uMorphDim;

    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    varying float vGlow;
    varying float vNodeVisibility;

    float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
      if (pulseTime < 0.0) return 0.0;
      float timeSinceClick = uTime - pulseTime;
      if (timeSinceClick < 0.0 || timeSinceClick > 4.0) return 0.0;
      float pulseRadius = timeSinceClick * uPulseSpeed;
      float distToClick = distance(worldPos, pulsePos);
      float pulseThickness = 3.0;
      float waveProximity = abs(distToClick - pulseRadius);
      return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(4.0, 0.0, timeSinceClick);
    }

    void main() {
      vNodeType = nodeType;
      vColor = nodeColor;
      vDistanceFromRoot = distanceFromRoot;
      vNodeVisibility = nodeVisibility;
      vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vPosition = worldPos;
      float totalPulseIntensity = 0.0;
      for (int i = 0; i < 3; i++) {
        totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
      }
      vPulseIntensity = min(totalPulseIntensity, 1.0);
      float breathe = sin(uTime * 0.7 + distanceFromRoot * 0.15) * 0.15 + 0.85;
      float baseSize = nodeSize * breathe;
      float pulseSize = baseSize * (1.0 + vPulseIntensity * 2.5);
      vGlow = 0.5 + 0.5 * sin(uTime * 0.5 + distanceFromRoot * 0.2);
      vec3 modifiedPosition = position;
      if (nodeType > 0.5) {
        float noise = snoise(position * 0.08 + uTime * 0.08);
        modifiedPosition += normalize(position + vec3(0.001)) * noise * 0.15;
      }
      vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition, 1.0);
      gl_PointSize = pulseSize * uBaseNodeSize * nodeVisibility * mix(1.0, 0.78, uMorphDim) * (1000.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uMorphDim;
    uniform vec3 uPulseColors[3];

    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    varying float vGlow;
    varying float vNodeVisibility;

    void main() {
      vec2 center = 2.0 * gl_PointCoord - 1.0;
      float dist = length(center);
      if (dist > 1.0) discard;
      float glow1 = 1.0 - smoothstep(0.0, 0.5, dist);
      float glow2 = 1.0 - smoothstep(0.0, 1.0, dist);
      float glowStrength = pow(glow1, 1.2) + glow2 * 0.3;
      float breatheColor = 0.9 + 0.1 * sin(uTime * 0.6 + vDistanceFromRoot * 0.25);
      vec3 baseColor = vColor * breatheColor;
      vec3 finalColor = baseColor;
      if (vPulseIntensity > 0.0) {
        vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.4);
        finalColor = mix(baseColor, pulseColor, vPulseIntensity * 0.8);
        finalColor *= (1.0 + vPulseIntensity * 0.85);
        glowStrength *= (1.0 + vPulseIntensity);
      }
      float coreBrightness = smoothstep(0.4, 0.0, dist);
      finalColor += vec3(1.0) * coreBrightness * 0.12;
      float alpha = glowStrength * (0.58 - 0.20 * dist) * vNodeVisibility;
      float camDistance = length(vPosition - cameraPosition);
      float distanceFade = smoothstep(100.0, 15.0, camDistance);
      if (vNodeType > 0.5) {
        finalColor *= 1.04;
        alpha *= 0.9;
      }
      finalColor *= (1.0 + vGlow * 0.1) * mix(0.32, 1.0, vNodeVisibility) * mix(1.0, 0.66, uMorphDim);
      alpha *= mix(1.0, 0.58, uMorphDim);
      gl_FragColor = vec4(finalColor, alpha * distanceFade);
    }
  `,
};

const connectionShader = {
  vertexShader: `${noiseFunctions}
    attribute vec3 startPoint;
    attribute vec3 endPoint;
    attribute float connectionStrength;
    attribute float pathIndex;
    attribute vec3 connectionColor;

    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;

    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    varying float vDistanceFromCamera;

    float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
      if (pulseTime < 0.0) return 0.0;
      float timeSinceClick = uTime - pulseTime;
      if (timeSinceClick < 0.0 || timeSinceClick > 4.0) return 0.0;
      float pulseRadius = timeSinceClick * uPulseSpeed;
      float distToClick = distance(worldPos, pulsePos);
      float pulseThickness = 3.0;
      float waveProximity = abs(distToClick - pulseRadius);
      return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(4.0, 0.0, timeSinceClick);
    }

    void main() {
      float t = position.x;
      vPathPosition = t;
      vec3 midPoint = mix(startPoint, endPoint, 0.5);
      float pathOffset = sin(t * 3.14159) * 0.15;
      vec3 perpendicular = normalize(cross(normalize(endPoint - startPoint), vec3(0.0, 1.0, 0.0)));
      if (length(perpendicular) < 0.1) perpendicular = vec3(1.0, 0.0, 0.0);
      midPoint += perpendicular * pathOffset;
      vec3 p0 = mix(startPoint, midPoint, t);
      vec3 p1 = mix(midPoint, endPoint, t);
      vec3 finalPos = mix(p0, p1, t);
      float noiseTime = uTime * 0.15;
      float noise = snoise(vec3(pathIndex * 0.08, t * 0.6, noiseTime));
      finalPos += perpendicular * noise * 0.12;
      vec3 worldPos = (modelMatrix * vec4(finalPos, 1.0)).xyz;
      float totalPulseIntensity = 0.0;
      for (int i = 0; i < 3; i++) {
        totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
      }
      vPulseIntensity = min(totalPulseIntensity, 1.0);
      vColor = connectionColor;
      vConnectionStrength = connectionStrength;
      vDistanceFromCamera = length(worldPos - cameraPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uMorphDim;
    uniform vec3 uPulseColors[3];

    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    varying float vDistanceFromCamera;

    void main() {
      float flowPattern1 = sin(vPathPosition * 25.0 - uTime * 4.0) * 0.5 + 0.5;
      float flowPattern2 = sin(vPathPosition * 15.0 - uTime * 2.5 + 1.57) * 0.5 + 0.5;
      float combinedFlow = (flowPattern1 + flowPattern2 * 0.5) / 1.5;
      vec3 baseColor = vColor * (0.8 + 0.2 * sin(uTime * 0.6 + vPathPosition * 12.0));
      float flowIntensity = 0.4 * combinedFlow * vConnectionStrength;
      vec3 finalColor = baseColor;
      if (vPulseIntensity > 0.0) {
        vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
        finalColor = mix(baseColor, pulseColor * 1.2, vPulseIntensity * 0.7);
        flowIntensity += vPulseIntensity * 0.8;
      }
      finalColor *= (0.55 + flowIntensity * 0.82 + vConnectionStrength * 0.38);
      float baseAlpha = 0.7 * vConnectionStrength;
      float flowAlpha = combinedFlow * 0.3;
      float alpha = baseAlpha + flowAlpha;
      alpha = mix(alpha, min(1.0, alpha * 2.5), vPulseIntensity);
      float distanceFade = smoothstep(100.0, 15.0, vDistanceFromCamera);
      finalColor *= mix(1.0, 0.62, uMorphDim);
      alpha *= mix(1.0, 0.65, uMorphDim);
      gl_FragColor = vec4(finalColor, alpha * distanceFade);
    }
  `,
};

function generateNeuralNetwork(formationIndex: number, densityFactor = 1, random = seededRandom(NETWORK_SEED)) {
  let nodes: NeuralNode[] = [];
  let rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0, random);

  const generateCrystallineSphere = () => {
    rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0, random);
    rootNode.size = 2;
    nodes.push(rootNode);
    const layers = 5;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let layer = 1; layer <= layers; layer += 1) {
      const radius = layer * 4;
      const numPoints = Math.floor(layer * 12 * densityFactor);

      for (let index = 0; index < numPoints; index += 1) {
        const phi = Math.acos(1 - (2 * (index + 0.5)) / numPoints);
        const theta = (2 * Math.PI * index) / goldenRatio;
        const position = new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        );
        const isLeaf = layer === layers || random() < 0.3;
        const node = new NeuralNode(position, layer, isLeaf ? 1 : 0, random);
        node.distanceFromRoot = radius;
        nodes.push(node);

        if (layer > 1) {
          const previousLayerNodes = nodes.filter((candidate) => candidate.level === layer - 1 && candidate !== rootNode);
          previousLayerNodes.sort((a, b) => position.distanceTo(a.position) - position.distanceTo(b.position));
          for (let previousIndex = 0; previousIndex < Math.min(3, previousLayerNodes.length); previousIndex += 1) {
            const distance = position.distanceTo(previousLayerNodes[previousIndex].position);
            const strength = 1 - distance / (radius * 2);
            node.addConnection(previousLayerNodes[previousIndex], Math.max(0.3, strength));
          }
        } else {
          rootNode.addConnection(node, 0.9);
        }
      }

      const layerNodes = nodes.filter((node) => node.level === layer && node !== rootNode);
      for (const node of layerNodes) {
        const nearby = layerNodes
          .filter((candidate) => candidate !== node)
          .sort((a, b) => node.position.distanceTo(a.position) - node.position.distanceTo(b.position))
          .slice(0, 5);

        for (const nearNode of nearby) {
          const distance = node.position.distanceTo(nearNode.position);
          if (distance < radius * 0.8 && !node.isConnectedTo(nearNode)) node.addConnection(nearNode, 0.6);
        }
      }
    }

    const outerNodes = nodes.filter((node) => node.level >= 3);
    for (let index = 0; index < Math.min(20, outerNodes.length); index += 1) {
      const first = outerNodes[Math.floor(random() * outerNodes.length)];
      const second = outerNodes[Math.floor(random() * outerNodes.length)];
      if (first && second && first !== second && !first.isConnectedTo(second) && Math.abs(first.level - second.level) > 1) first.addConnection(second, 0.4);
    }
  };

  const generateHelixLattice = () => {
    rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0, random);
    rootNode.size = 1.8;
    nodes.push(rootNode);
    const helixArrays: NeuralNode[][] = [];
    for (let helix = 0; helix < 4; helix += 1) {
      const phase = (helix / 4) * Math.PI * 2;
      const helixNodes: NeuralNode[] = [];
      for (let index = 0; index < Math.floor(50 * densityFactor); index += 1) {
        const t = index / (Math.floor(50 * densityFactor) - 1);
        const y = (t - 0.5) * 30;
        const radius = 12 * (Math.sin(t * Math.PI) * 0.7 + 0.3);
        const angle = phase + t * Math.PI * 6;
        const node = new NeuralNode(new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle)), Math.ceil(t * 5), index > 45 || random() < 0.25 ? 1 : 0, random);
        node.distanceFromRoot = Math.sqrt(radius * radius + y * y);
        node.helixT = t;
        nodes.push(node);
        helixNodes.push(node);
      }
      helixArrays.push(helixNodes);
      rootNode.addConnection(helixNodes[0], 1);
      for (let index = 0; index < helixNodes.length - 1; index += 1) helixNodes[index].addConnection(helixNodes[index + 1], 0.85);
    }
    for (let helix = 0; helix < 4; helix += 1) {
      const current = helixArrays[helix];
      const next = helixArrays[(helix + 1) % 4];
      for (let index = 0; index < current.length; index += 5) current[index].addConnection(next[Math.round(current[index].helixT * (next.length - 1))], 0.7);
    }
  };

  const generateFractalWeb = () => {
    rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0, random);
    rootNode.size = 1.6;
    nodes.push(rootNode);
    const createBranch = (startNode: NeuralNode, direction: THREE.Vector3, depth: number, strength: number, scale: number) => {
      if (depth > 4) return;
      const endPosition = new THREE.Vector3().copy(startNode.position).add(direction.clone().multiplyScalar(5 * scale));
      const newNode = new NeuralNode(endPosition, depth, depth === 4 || random() < 0.3 ? 1 : 0, random);
      newNode.distanceFromRoot = rootNode.position.distanceTo(endPosition);
      nodes.push(newNode);
      startNode.addConnection(newNode, strength);
      if (depth < 4) {
        for (let index = 0; index < 3; index += 1) {
          const angle = (index / 3) * Math.PI * 2;
          const perp1 = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
          const perp2 = direction.clone().cross(perp1).normalize();
          createBranch(newNode, direction.clone().add(perp1.multiplyScalar(Math.cos(angle) * 0.7)).add(perp2.multiplyScalar(Math.sin(angle) * 0.7)).normalize(), depth + 1, strength * 0.7, scale * 0.75);
        }
      }
    };
    for (let index = 0; index < 6; index += 1) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 6);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      createBranch(rootNode, new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi)).normalize(), 1, 0.9, 1);
    }
  };

  if (formationIndex % 3 === 1) generateHelixLattice();
  else if (formationIndex % 3 === 2) generateFractalWeb();
  else generateCrystallineSphere();

  return { nodes, rootNode };
}

function jitteredColor(color: THREE.Color, random: () => number) {
  return color.clone().offsetHSL(randFloatSpread(0.03, random), randFloatSpread(0.08, random), randFloatSpread(0.08, random));
}

function normalizeFormationTarget(target: Float32Array, targetRadius: number) {
  let maxRadius = 0;

  for (let index = 0; index < target.length; index += 3) {
    const radius = Math.hypot(target[index], target[index + 1], target[index + 2]);
    maxRadius = Math.max(maxRadius, radius);
  }

  if (maxRadius <= 0) return target;

  const scale = targetRadius / maxRadius;
  for (let index = 0; index < target.length; index += 1) target[index] *= scale;

  return target;
}

function createDoubleHelixTarget(nodeCount: number) {
  const target = new Float32Array(nodeCount * 3);
  const random = seededRandom(NETWORK_SEED + 9021);
  const turns = 4.25;
  const radius = 8.2;

  for (let index = 0; index < nodeCount; index += 1) {
    const t = nodeCount <= 1 ? 0 : index / (nodeCount - 1);
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * 34;
    const strand = index % 4;
    const offset = index * 3;

    if (strand < 2) {
      const phase = angle + strand * Math.PI;
      target[offset] = Math.cos(phase) * radius + randFloatSpread(0.28, random);
      target[offset + 1] = y + randFloatSpread(0.42, random);
      target[offset + 2] = Math.sin(phase) * radius + randFloatSpread(0.28, random);
    } else {
      const mix = strand === 2 ? 0.35 : 0.65;
      const rungRadius = radius * (1 - mix * 2);
      target[offset] = Math.cos(angle) * rungRadius + randFloatSpread(0.35, random);
      target[offset + 1] = y + randFloatSpread(0.32, random);
      target[offset + 2] = Math.sin(angle) * rungRadius + randFloatSpread(0.35, random);
    }
  }

  return normalizeFormationTarget(target, 24);
}

function createBrainTarget(nodeCount: number) {
  const target = new Float32Array(nodeCount * 3);
  const random = seededRandom(NETWORK_SEED + 9137);

  for (let index = 0; index < nodeCount; index += 1) {
    const lobe = index % 2 === 0 ? -1 : 1;
    const u = (index * 0.61803398875) % 1;
    const v = (index * 0.754877666 + 0.23) % 1;
    const theta = u * Math.PI * 2;
    const phi = Math.acos(1 - 2 * v);
    const surface = 0.62 + random() * 0.38;
    const gyri = Math.sin(theta * 5 + phi * 3 + lobe) * 0.75 + Math.sin(theta * 9 - phi * 2) * 0.32;
    const offset = index * 3;

    target[offset] = lobe * 4.4 + Math.sin(phi) * Math.cos(theta) * 5.8 * surface + lobe * gyri * 0.35;
    target[offset + 1] = Math.cos(phi) * 10.2 * surface + gyri * 0.5 + randFloatSpread(0.35, random);
    target[offset + 2] = Math.sin(phi) * Math.sin(theta) * 5.4 * surface + gyri * 0.28;

    if (Math.abs(target[offset]) < 2.1) target[offset] += lobe * 1.6;
  }

  return normalizeFormationTarget(target, 24);
}

function createNeuralCanopyTarget(nodeCount: number) {
  const target = new Float32Array(nodeCount * 3);
  const random = seededRandom(NETWORK_SEED + 9283);
  const branches = 9;

  for (let index = 0; index < nodeCount; index += 1) {
    const t = nodeCount <= 1 ? 0 : index / (nodeCount - 1);
    const offset = index * 3;

    if (t < 0.18) {
      const trunkT = t / 0.18;
      const twist = trunkT * Math.PI * 2.4;
      target[offset] = Math.cos(twist) * (0.7 + trunkT * 0.8);
      target[offset + 1] = -16 + trunkT * 13;
      target[offset + 2] = Math.sin(twist) * (0.7 + trunkT * 0.8);
    } else {
      const branchT = (t - 0.18) / 0.82;
      const branch = index % branches;
      const angle = (branch / branches) * Math.PI * 2 + Math.sin(branchT * 5 + branch) * 0.35;
      const fork = 0.72 + ((index * 17) % 11) / 18;
      const radius = (4 + branchT * 18) * fork;
      target[offset] = Math.cos(angle) * radius + randFloatSpread(1.1, random);
      target[offset + 1] = -4 + branchT * 22 - branchT * branchT * 7 + randFloatSpread(0.8, random);
      target[offset + 2] = Math.sin(angle) * radius * 0.72 + randFloatSpread(1.1, random);
    }
  }

  return normalizeFormationTarget(target, 25);
}

function createOrbitalRingsTarget(nodeCount: number) {
  const target = new Float32Array(nodeCount * 3);
  const random = seededRandom(NETWORK_SEED + 9419);

  for (let index = 0; index < nodeCount; index += 1) {
    const ring = index % 5;
    const angle = ((index * 0.277777777 + ring * 0.09) % 1) * Math.PI * 2;
    const radius = 7.5 + ring * 3.2 + Math.sin(angle * 3 + ring) * 0.7;
    const tilt = -0.8 + ring * 0.4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * Math.sin(tilt) + Math.cos(angle * 2 + ring) * 1.2;
    const z = Math.sin(angle) * radius * Math.cos(tilt);
    const offset = index * 3;

    if (index % 13 === 0) {
      target[offset] = randFloatSpread(4.5, random);
      target[offset + 1] = randFloatSpread(4.5, random);
      target[offset + 2] = randFloatSpread(4.5, random);
    } else {
      target[offset] = x + randFloatSpread(0.45, random);
      target[offset + 1] = y + randFloatSpread(0.45, random);
      target[offset + 2] = z + randFloatSpread(0.45, random);
    }
  }

  return normalizeFormationTarget(target, 25);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function createNetworkVisualization(formationIndex = DEFAULT_FORMATION, densityFactor = DEFAULT_DENSITY): NetworkMeshes {
  const random = seededRandom(NETWORK_SEED + formationIndex * 101);
  const neuralNetwork = generateNeuralNetwork(formationIndex, densityFactor, random);
  const nodePositions: number[] = [];
  const nodeTypes: number[] = [];
  const nodeSizes: number[] = [];
  const nodeColors: number[] = [];
  const distancesFromRoot: number[] = [];

  neuralNetwork.nodes.forEach((node) => {
    nodePositions.push(node.position.x, node.position.y, node.position.z);
    nodeTypes.push(node.type);
    nodeSizes.push(node.size);
    distancesFromRoot.push(node.distanceFromRoot);
    const color = jitteredColor(GREEN_PALETTE[Math.min(node.level, GREEN_PALETTE.length - 1)], random);
    nodeColors.push(color.r, color.g, color.b);
  });

  const nodesGeometry = new THREE.BufferGeometry();
  const nodePositionArray = new Float32Array(nodePositions);
  const nodeVisibilityArray = new Float32Array(neuralNetwork.nodes.length).fill(1);
  const formationTargets = [
    nodePositionArray.slice(),
    createDoubleHelixTarget(neuralNetwork.nodes.length),
    createBrainTarget(neuralNetwork.nodes.length),
    createNeuralCanopyTarget(neuralNetwork.nodes.length),
    createOrbitalRingsTarget(neuralNetwork.nodes.length),
  ];
  nodesGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositionArray, 3));
  nodesGeometry.setAttribute("nodeType", new THREE.Float32BufferAttribute(nodeTypes, 1));
  nodesGeometry.setAttribute("nodeSize", new THREE.Float32BufferAttribute(nodeSizes, 1));
  nodesGeometry.setAttribute("nodeColor", new THREE.Float32BufferAttribute(nodeColors, 3));
  nodesGeometry.setAttribute("distanceFromRoot", new THREE.Float32BufferAttribute(distancesFromRoot, 1));
  nodesGeometry.setAttribute("nodeVisibility", new THREE.BufferAttribute(nodeVisibilityArray, 1));

  const nodesMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(pulseUniforms),
    vertexShader: nodeShader.vertexShader,
    fragmentShader: nodeShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);

  const connectionPositions: number[] = [];
  const connectionColors: number[] = [];
  const connectionStrengths: number[] = [];
  const startPoints: number[] = [];
  const endPoints: number[] = [];
  const connectionStartNodeIndices: number[] = [];
  const connectionEndNodeIndices: number[] = [];
  const pathIndices: number[] = [];
  const processedConnections = new Set<string>();
  let pathIndex = 0;

  neuralNetwork.nodes.forEach((node, nodeIndex) => {
    node.connections.forEach((connection) => {
      const connectedIndex = neuralNetwork.nodes.indexOf(connection.node);
      if (connectedIndex === -1) return;
      const key = [Math.min(nodeIndex, connectedIndex), Math.max(nodeIndex, connectedIndex)].join("-");
      if (processedConnections.has(key)) return;
      processedConnections.add(key);
      for (let segmentIndex = 0; segmentIndex < 20; segmentIndex += 1) {
        const t = segmentIndex / 19;
        connectionPositions.push(t, 0, 0);
        startPoints.push(node.position.x, node.position.y, node.position.z);
        endPoints.push(connection.node.position.x, connection.node.position.y, connection.node.position.z);
        connectionStartNodeIndices.push(nodeIndex);
        connectionEndNodeIndices.push(connectedIndex);
        pathIndices.push(pathIndex);
        connectionStrengths.push(connection.strength);
        const level = Math.min(Math.floor((node.level + connection.node.level) / 2), GREEN_PALETTE.length - 1);
        const color = jitteredColor(GREEN_PALETTE[level], random);
        connectionColors.push(color.r, color.g, color.b);
      }
      pathIndex += 1;
    });
  });

  const connectionsGeometry = new THREE.BufferGeometry();
  const connectionStartPointArray = new Float32Array(startPoints);
  const connectionEndPointArray = new Float32Array(endPoints);
  const connectionStartNodeIndexArray = new Uint16Array(connectionStartNodeIndices);
  const connectionEndNodeIndexArray = new Uint16Array(connectionEndNodeIndices);
  connectionsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connectionPositions, 3));
  connectionsGeometry.setAttribute("startPoint", new THREE.BufferAttribute(connectionStartPointArray, 3));
  connectionsGeometry.setAttribute("endPoint", new THREE.BufferAttribute(connectionEndPointArray, 3));
  connectionsGeometry.setAttribute("connectionStrength", new THREE.Float32BufferAttribute(connectionStrengths, 1));
  connectionsGeometry.setAttribute("connectionColor", new THREE.Float32BufferAttribute(connectionColors, 3));
  connectionsGeometry.setAttribute("pathIndex", new THREE.Float32BufferAttribute(pathIndices, 1));

  const connectionsMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(pulseUniforms),
    vertexShader: connectionShader.vertexShader,
    fragmentShader: connectionShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const connectionsMesh = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);

  GREEN_PALETTE.forEach((color, index) => {
    if (index < 3) {
      nodesMaterial.uniforms.uPulseColors.value[index].copy(color);
      connectionsMaterial.uniforms.uPulseColors.value[index].copy(color);
    }
  });

  return {
    nodesMesh,
    connectionsMesh,
    nodePositions: nodePositionArray,
    formationTargets,
    connectionStartPoints: connectionStartPointArray,
    connectionEndPoints: connectionEndPointArray,
    connectionStartNodeIndices: connectionStartNodeIndexArray,
    connectionEndNodeIndices: connectionEndNodeIndexArray,
    nodeVisibility: nodeVisibilityArray,
  };
}

function disposeMesh(mesh: THREE.Object3D | null) {
  if (!mesh) return;
  const object = mesh as THREE.Object3D & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
  object.geometry?.dispose();
  if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
  else object.material?.dispose();
}

export function NeuralNetworkBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    camera.position.set(0, 7, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enablePan = false;
    controls.enableZoom = false;

    const composer = new EffectComposer(renderer);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.35, 0.6, 0.78);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const starField = createStarfield();
    scene.add(starField);
    const networkMeshes = createNetworkVisualization();
    const {
      nodesMesh,
      connectionsMesh,
      nodePositions,
      formationTargets,
      connectionStartPoints,
      connectionEndPoints,
      connectionStartNodeIndices,
      connectionEndNodeIndices,
      nodeVisibility,
    } = networkMeshes;
    scene.add(nodesMesh);
    scene.add(connectionsMesh);

    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const interactionPoint = new THREE.Vector3();
    let animationFrame = 0;
    let lastPulseIndex = 0;
    let pointerDown: { x: number; y: number } | null = null;
    let currentMorphDim = 0;
    const nodePositionAttribute = nodesMesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const nodeVisibilityAttribute = nodesMesh.geometry.getAttribute("nodeVisibility") as THREE.BufferAttribute;
    const connectionStartAttribute = connectionsMesh.geometry.getAttribute("startPoint") as THREE.BufferAttribute;
    const connectionEndAttribute = connectionsMesh.geometry.getAttribute("endPoint") as THREE.BufferAttribute;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
      bloomPass.resolution.set(width, height);
    };

    const updateNodeVisibility = () => {
      const cellSize = 5.0;
      const bucketCounts = new Map<string, number>();
      const nodeBuckets: string[] = [];

      for (let index = 0; index < nodePositions.length; index += 3) {
        const key = [
          Math.floor(nodePositions[index] / cellSize),
          Math.floor(nodePositions[index + 1] / cellSize),
          Math.floor(nodePositions[index + 2] / cellSize),
        ].join(":");
        nodeBuckets.push(key);
        bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
      }

      for (let nodeIndex = 0; nodeIndex < nodeVisibility.length; nodeIndex += 1) {
        const density = bucketCounts.get(nodeBuckets[nodeIndex]) ?? 1;
        let targetVisibility = 1;

        if (density > 8) {
          const keepScore = (nodeIndex * 37 + density * 11) % 10;
          targetVisibility = keepScore < 2 ? 0.42 : 0.04 + (keepScore % 3) * 0.04;
        } else if (density > 4) {
          targetVisibility = 1 - smoothstep(4, 8, density) * 0.6;
        }

        nodeVisibility[nodeIndex] += (targetVisibility - nodeVisibility[nodeIndex]) * 0.12;
      }

      nodeVisibilityAttribute.needsUpdate = true;
    };

    const triggerPulse = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      interactionPlane.normal.copy(camera.position).normalize();
      interactionPlane.constant = -interactionPlane.normal.dot(camera.position) + camera.position.length() * 0.5;
      if (!raycaster.ray.intersectPlane(interactionPlane, interactionPoint)) return;
      const time = clock.getElapsedTime();
      lastPulseIndex = (lastPulseIndex + 1) % 3;
      const pulseColor = GREEN_PALETTE[Math.floor(Math.random() * GREEN_PALETTE.length)];
      for (const material of [nodesMesh.material, connectionsMesh.material]) {
        material.uniforms.uPulsePositions.value[lastPulseIndex].copy(interactionPoint);
        material.uniforms.uPulseTimes.value[lastPulseIndex] = time;
        material.uniforms.uPulseColors.value[lastPulseIndex].copy(pulseColor);
      }
    };

    const updateNetworkMorph = () => {
      const viewportHeight = Math.max(1, window.innerHeight || mount.clientHeight || 1);
      const morphProgress = Math.max(0, window.scrollY / (viewportHeight * 0.9));
      currentMorphDim = smoothstep(0.18, 0.75, morphProgress);
      nodesMesh.material.uniforms.uMorphDim.value = currentMorphDim;
      connectionsMesh.material.uniforms.uMorphDim.value = currentMorphDim;
      const lastStage = formationTargets.length - 1;
      const clampedProgress = Math.min(lastStage, morphProgress);
      const stageIndex = Math.min(lastStage - 1, Math.floor(clampedProgress));
      const localProgress = clampedProgress - stageIndex;
      const targetMix = smoothstep(0.12, 0.88, localProgress);
      const currentTarget = formationTargets[stageIndex];
      const nextTarget = formationTargets[stageIndex + 1];
      const morphSpeed = 0.045;

      for (let index = 0; index < nodePositions.length; index += 1) {
        const desiredPosition = currentTarget[index] * (1 - targetMix) + nextTarget[index] * targetMix;
        nodePositions[index] += (desiredPosition - nodePositions[index]) * morphSpeed;
      }

      updateNodeVisibility();

      for (let vertexIndex = 0; vertexIndex < connectionStartNodeIndices.length; vertexIndex += 1) {
        const pointOffset = vertexIndex * 3;
        const startOffset = connectionStartNodeIndices[vertexIndex] * 3;
        const endOffset = connectionEndNodeIndices[vertexIndex] * 3;

        connectionStartPoints[pointOffset] = nodePositions[startOffset];
        connectionStartPoints[pointOffset + 1] = nodePositions[startOffset + 1];
        connectionStartPoints[pointOffset + 2] = nodePositions[startOffset + 2];
        connectionEndPoints[pointOffset] = nodePositions[endOffset];
        connectionEndPoints[pointOffset + 1] = nodePositions[endOffset + 1];
        connectionEndPoints[pointOffset + 2] = nodePositions[endOffset + 2];
      }

      nodePositionAttribute.needsUpdate = true;
      connectionStartAttribute.needsUpdate = true;
      connectionEndAttribute.needsUpdate = true;
    };


    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerDown) return;
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      pointerDown = null;
      if (Math.sqrt(dx * dx + dy * dy) < 8) triggerPulse(event.clientX, event.clientY);
    };


    const animate = () => {
      const time = clock.getElapsedTime();
      nodesMesh.material.uniforms.uTime.value = time;
      connectionsMesh.material.uniforms.uTime.value = time;
      updateNetworkMorph();
      bloomPass.strength = THREE.MathUtils.lerp(1.35, 0.95, currentMorphDim);
      bloomPass.threshold = THREE.MathUtils.lerp(0.78, 0.86, currentMorphDim);
      nodesMesh.rotation.y = Math.sin(time * 0.04) * 0.05;
      connectionsMesh.rotation.y = Math.sin(time * 0.04) * 0.05;
      starField.rotation.y += 0.0002;
      (starField.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      controls.update();
      composer.render();
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      disposeMesh(nodesMesh);
      disposeMesh(connectionsMesh);
      disposeMesh(starField);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="home-neural-background" aria-hidden="true" />;
}
