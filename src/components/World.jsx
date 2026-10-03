import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PROJECTS } from '../content/portfolio.js';

const CAMERA_POSITIONS = [
  [0, 4.1, 24],
  [0, 2.15, 8.4],
  [0, 1.8, 3.15],
  [4.1, 1.85, -0.35],
  [4.6, 6.5, 2.15],
  [0.8, 6.35, -0.1],
  [-4.5, 6.35, -1.5],
  [0.2, 10.6, 20.5],
];

const CAMERA_LOOKS = [
  [0, 4.2, -0.5],
  [0, 2.3, -3.4],
  [0, 2.1, -4.8],
  [-1.8, 2.1, -4.25],
  [0, 6.1, -4.5],
  [-4.4, 6.2, -4.5],
  [0.2, 6.2, -4.7],
  [0, 4.7, -0.5],
];

function between(points, value) {
  const scaled = THREE.MathUtils.clamp(value, 0, 1) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const eased = local * local * (3 - 2 * local);
  return new THREE.Vector3(...points[index]).lerp(new THREE.Vector3(...points[index + 1]), eased);
}

function Block({ position, size, color, rotation = [0, 0, 0], roughness = 0.88, metalness = 0, emissive = '#000000', emissiveIntensity = 0, cast = true, receive = true }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
    </mesh>
  );
}

function Gable({ z, color = '#34241f' }) {
  const shape = useMemo(() => {
    const polygon = new THREE.Shape();
    polygon.moveTo(-7.1, 5.15);
    polygon.lineTo(7.1, 5.15);
    polygon.lineTo(0, 10.05);
    polygon.closePath();
    return polygon;
  }, []);
  return (
    <mesh position={[0, 0, z]} castShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Window({ position, width = 1.3, height = 1.45, warm = true }) {
  const glass = warm ? '#ffd891' : '#94c8c2';
  const glow = warm ? '#f6a94b' : '#78c4bb';
  return (
    <group position={position}>
      <Block position={[0, 0, 0]} size={[width + 0.38, height + 0.38, 0.2]} color="#29211d" />
      <Block position={[0, 0, 0.12]} size={[width, height, 0.07]} color={glass} emissive={glow} emissiveIntensity={0.85} roughness={0.32} />
      <Block position={[0, 0, 0.17]} size={[0.075, height, 0.09]} color="#52392c" />
      <Block position={[0, 0, 0.18]} size={[width, 0.075, 0.09]} color="#52392c" />
      <pointLight position={[0, 0, 0.42]} color={glow} intensity={1.25} distance={5} decay={2} />
    </group>
  );
}

function Lantern({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <Block position={[0, -0.08, 0]} size={[0.43, 0.52, 0.43]} color="#24201d" metalness={0.28} />
      <Block position={[0, -0.05, 0.04]} size={[0.21, 0.28, 0.22]} color="#ffd98b" emissive="#ffab42" emissiveIntensity={2.6} roughness={0.2} />
      <Block position={[0, 0.22, 0]} size={[0.53, 0.08, 0.53]} color="#25201b" metalness={0.2} />
      <Block position={[0, -0.37, 0]} size={[0.53, 0.08, 0.53]} color="#25201b" metalness={0.2} />
      <pointLight position={[0, -0.12, 0.12]} color="#ffb85c" intensity={1.45} distance={6.5} decay={2} />
    </group>
  );
}

function StarField() {
  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const a = i * 2.399;
    const radius = 22 + (i % 13) * 2.4;
    return [Math.cos(a) * radius, 8 + ((i * 17) % 27), -8 - ((i * 29) % 38)];
  }), []);
  return (
    <group>
      {stars.map((position, i) => (
        <mesh key={i} position={position}>
          <boxGeometry args={[i % 11 === 0 ? 0.12 : 0.055, i % 11 === 0 ? 0.12 : 0.055, 0.055]} />
          <meshBasicMaterial color={i % 9 === 0 ? '#ffdca4' : '#c5d5d1'} transparent opacity={i % 9 === 0 ? 0.82 : 0.48} />
        </mesh>
      ))}
      <mesh position={[-23, 18, -26]}>
        <sphereGeometry args={[1.65, 20, 14]} />
        <meshBasicMaterial color="#e4d4ae" />
      </mesh>
      <mesh position={[-22.62, 18.28, -25.8]}>
        <sphereGeometry args={[1.56, 18, 12]} />
        <meshBasicMaterial color="#15201e" />
      </mesh>
      <pointLight position={[-22, 16, -23]} color="#98b8ad" intensity={0.65} distance={28} decay={2} />
    </group>
  );
}

function Pine({ x, z, height = 8, tint = '#23352a' }) {
  const layers = Math.max(3, Math.round(height / 2.15));
  return (
    <group position={[x, 0, z]}>
      <Block position={[0, height * 0.28, 0]} size={[0.75, height * 0.58, 0.75]} color="#503528" />
      {Array.from({ length: layers }, (_, i) => {
        const layerY = height * 0.43 + i * (height * 0.13);
        const width = height * 0.66 * (1 - i / (layers + 1));
        return (
          <Block
            key={i}
            position={[0, layerY, 0]}
            size={[width, height * 0.2, width]}
            color={i % 2 ? tint : '#2d4535'}
            roughness={1}
          />
        );
      })}
      <Block position={[0.2, height * 0.52, 0.2]} size={[0.14, 0.14, 0.14]} color="#d4a956" emissive="#d4a956" emissiveIntensity={0.5} />
    </group>
  );
}

function Flower({ position, color = '#d69669' }) {
  return (
    <group position={position}>
      <Block position={[0, 0.22, 0]} size={[0.075, 0.42, 0.075]} color="#4b6a47" />
      <Block position={[0, 0.46, 0]} size={[0.2, 0.16, 0.16]} color={color} emissive={color} emissiveIntensity={0.08} />
      <Block position={[0.11, 0.24, 0]} size={[0.22, 0.075, 0.12]} color="#66824f" />
    </group>
  );
}

function Artwork({ project, onOpen }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const [accent, deep, soft] = project.palette;
    ctx.fillStyle = deep;
    ctx.fillRect(0, 0, 384, 256);
    ctx.fillStyle = soft;
    ctx.globalAlpha = 0.19;
    for (let y = 16; y < 256; y += 24) {
      for (let x = (y % 48 ? 12 : 0); x < 384; x += 48) ctx.fillRect(x, y, 24, 4);
    }
    ctx.globalAlpha = 1;

    if (project.motif === 'sunrise') {
      ctx.fillStyle = '#1d3540'; ctx.fillRect(0, 152, 384, 104);
      ctx.fillStyle = accent; ctx.fillRect(225, 42, 58, 58); ctx.fillRect(209, 58, 90, 26);
      ctx.fillStyle = '#32665c'; ctx.fillRect(0, 165, 384, 18);
      ctx.fillStyle = '#ae704b'; ctx.fillRect(28, 116, 124, 71); ctx.fillRect(45, 95, 85, 23);
      ctx.fillStyle = '#e5bd79'; ctx.fillRect(69, 137, 22, 50); ctx.fillRect(110, 134, 24, 24);
      ctx.fillStyle = '#233d40'; ctx.fillRect(0, 208, 384, 10); ctx.fillRect(180, 191, 204, 8);
    } else if (project.motif === 'clouds') {
      ctx.fillStyle = '#739ca8'; ctx.fillRect(0, 0, 384, 160);
      ctx.fillStyle = '#d7e0d4'; ctx.fillRect(58, 64, 125, 34); ctx.fillRect(89, 43, 76, 26); ctx.fillRect(197, 112, 127, 33); ctx.fillRect(233, 91, 76, 25);
      ctx.fillStyle = '#415d6f'; ctx.fillRect(0, 173, 384, 83);
      ctx.fillStyle = '#f4cf8d'; ctx.fillRect(47, 195, 287, 6); ctx.fillRect(98, 219, 190, 4);
      ctx.fillStyle = '#e8ab68'; ctx.fillRect(283, 48, 12, 40); ctx.fillRect(263, 65, 52, 12);
    } else {
      ctx.fillStyle = '#274b40'; ctx.fillRect(0, 0, 384, 256);
      ctx.fillStyle = '#d4c29a'; ctx.fillRect(48, 32, 288, 192);
      ctx.fillStyle = '#497052'; ctx.fillRect(64, 48, 256, 160);
      ctx.fillStyle = accent; ctx.fillRect(106, 74, 59, 59); ctx.fillRect(92, 88, 87, 28);
      ctx.fillStyle = '#dcab6e'; ctx.fillRect(198, 59, 14, 14); ctx.fillRect(212, 73, 14, 14); ctx.fillRect(226, 87, 14, 14);
      ctx.fillStyle = '#e9d8b1'; ctx.fillRect(82, 164, 216, 7); ctx.fillRect(82, 181, 134, 5);
    }

    ctx.fillStyle = 'rgba(12, 16, 16, .67)';
    ctx.fillRect(0, 0, 384, 33);
    ctx.fillStyle = '#f2dfb5';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`FIELD NOTE   /   ${project.number}`, 14, 22);
    ctx.fillStyle = 'rgba(10, 14, 13, .76)';
    ctx.fillRect(0, 222, 384, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px monospace';
    ctx.fillText(project.name.toUpperCase(), 14, 246);

    const art = new THREE.CanvasTexture(canvas);
    art.colorSpace = THREE.SRGBColorSpace;
    art.magFilter = THREE.NearestFilter;
    art.minFilter = THREE.NearestFilter;
    art.generateMipmaps = false;
    return art;
  }, [project]);

  return (
    <group position={[0, 0, 0]}>
      <Block position={[0, 0, 0]} size={[3.45, 2.42, 0.24]} color="#39251d" />
      <Block position={[0, 0, 0.145]} size={[3.18, 2.16, 0.07]} color="#9c6e45" />
      <mesh
        position={[0, 0, 0.205]}
        onClick={(event) => { event.stopPropagation(); onOpen(project); }}
        onPointerOver={(event) => { event.stopPropagation(); document.body.classList.add('art-hover'); }}
        onPointerOut={() => document.body.classList.remove('art-hover')}
        castShadow
      >
        <planeGeometry args={[3.02, 2.02]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.44]} color={project.palette[0]} intensity={0.46} distance={4.3} decay={2} />
    </group>
  );
}

function PictureWall({ onOpen }) {
  return (
    <group>
      {PROJECTS.map((project, index) => (
        <group key={project.id} position={[(index - 1) * 4.1, 2.75, -4.87]}>
          <Artwork project={project} onOpen={onOpen} />
          <Block position={[0, -1.48, 0.04]} size={[2.9, 0.12, 0.42]} color="#493225" />
          <Block position={[-0.87, -1.36, 0.08]} size={[0.12, 0.2, 0.35]} color="#66452b" />
          <Block position={[0.87, -1.36, 0.08]} size={[0.12, 0.2, 0.35]} color="#66452b" />
        </group>
      ))}
    </group>
  );
}

function GrownPlant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <Block position={[0, 0.38, 0]} size={[0.67, 0.68, 0.67]} color="#9b573d" />
      <Block position={[0, 0.87, 0]} size={[0.12, 0.85, 0.12]} color="#56784b" />
      <Block position={[-0.34, 0.78, 0]} size={[0.63, 0.15, 0.18]} color="#6c9959" />
      <Block position={[0.25, 1.02, 0.06]} size={[0.54, 0.15, 0.18]} color="#7aa45d" />
      <Block position={[-0.05, 1.34, -0.1]} size={[0.54, 0.16, 0.17]} color="#557e53" />
    </group>
  );
}

function House({ onProjectOpen }) {
  const lowerWalls = '#54392b';
  const upperWalls = '#4a382f';
  const trim = '#261e1a';
  return (
    <group>
      {/* Grass plinth and warm timber floor */}
      <Block position={[0, -0.13, 0]} size={[15.8, 0.48, 12.8]} color="#443128" />
      <Block position={[0, 0.11, 0]} size={[14.9, 0.14, 11.9]} color="#76503a" />
      <Block position={[0, 0.22, 0]} size={[14.2, 0.08, 11.2]} color="#956a46" />

      {/* Ground-floor shell. The middle of the front wall stays open as an entrance. */}
      <Block position={[0, 2.72, -5.36]} size={[14.2, 5.18, 0.38]} color={lowerWalls} />
      <Block position={[-6.98, 2.72, 0]} size={[0.38, 5.18, 10.5]} color={lowerWalls} />
      <Block position={[6.98, 2.72, 0]} size={[0.38, 5.18, 10.5]} color={lowerWalls} />
      <Block position={[-5.36, 2.72, 5.25]} size={[3.12, 5.18, 0.38]} color={lowerWalls} />
      <Block position={[5.36, 2.72, 5.25]} size={[3.12, 5.18, 0.38]} color={lowerWalls} />
      <Block position={[0, 5.22, -5.05]} size={[14.1, 0.35, 10.25]} color="#684832" />

      {/* Second-floor rooms are set back, leaving the foyer open to the rafters. */}
      <Block position={[0, 5.52, -2.85]} size={[13.9, 0.28, 5.12]} color="#755239" />
      <Block position={[0, 7.72, -5.22]} size={[13.75, 4.28, 0.36]} color={upperWalls} />
      <Block position={[-6.78, 7.72, -2.85]} size={[0.36, 4.28, 5.08]} color={upperWalls} />
      <Block position={[6.78, 7.72, -2.85]} size={[0.36, 4.28, 5.08]} color={upperWalls} />
      <Gable z={5.47} />
      <Gable z={-5.43} color="#49352c" />
      <Block position={[-3.55, 8.22, 0]} size={[8.8, 0.52, 12.65]} color="#30211d" rotation={[0, 0, 0.61]} />
      <Block position={[3.55, 8.22, 0]} size={[8.8, 0.52, 12.65]} color="#38251f" rotation={[0, 0, -0.61]} />
      <Block position={[0, 5.2, 0]} size={[15.15, 0.36, 12.25]} color="#241d19" />

      {/* Front porch, posts, steps, open door */}
      <Block position={[0, 0.1, 6.44]} size={[10.7, 0.36, 2.9]} color="#76523a" />
      <Block position={[-4.75, 1.65, 7.54]} size={[0.35, 3.05, 0.35]} color="#392820" />
      <Block position={[4.75, 1.65, 7.54]} size={[0.35, 3.05, 0.35]} color="#392820" />
      <Block position={[0, 3.2, 7.54]} size={[9.8, 0.3, 0.35]} color="#543826" />
      <Block position={[1.24, 1.35, 5.12]} size={[0.16, 2.55, 0.18]} color="#281d18" />
      <group position={[1.31, 1.28, 5.05]} rotation={[0, -0.82, 0]}>
        <Block position={[0.62, 0, 0]} size={[1.24, 2.52, 0.18]} color="#63412e" />
        <Block position={[0.62, 0.2, 0.12]} size={[0.09, 0.09, 0.07]} color="#e6bb70" metalness={0.4} />
      </group>
      {Array.from({ length: 4 }, (_, i) => (
        <Block key={i} position={[0, 0.16 - i * 0.23, 8.2 + i * 0.49]} size={[4.8 - i * 0.32, 0.22, 0.54]} color={i % 2 ? '#5c4331' : '#715038'} />
      ))}

      {/* Exterior windows and upstairs glow */}
      <Window position={[-5.15, 3.05, 5.49]} width={1.38} height={1.52} />
      <Window position={[5.15, 3.05, 5.49]} width={1.38} height={1.52} />
      <Window position={[-3.45, 7.75, 5.47]} width={1.65} height={1.55} />
      <Window position={[3.45, 7.75, 5.47]} width={1.65} height={1.55} />
      <Window position={[0, 7.75, -5.02]} width={2.2} height={1.72} warm={false} />
      <Block position={[0, 5.44, 5.52]} size={[8.4, 0.18, 0.48]} color="#3a2820" />
      <Block position={[0, 5.65, 5.62]} size={[0.42, 0.48, 0.42]} color="#4c3325" />

      {/* Lower room: rug, sofa, table, books and a tiny lamp */}
      <Block position={[0, 0.31, 0.2]} size={[7.4, 0.08, 4.4]} color="#47584a" />
      <Block position={[0, 0.38, 0.2]} size={[6.9, 0.04, 3.95]} color="#9d6849" />
      <Block position={[-0.2, 0.79, 2.7]} size={[4.5, 0.78, 0.82]} color="#80543c" />
      <Block position={[-0.2, 1.32, 2.78]} size={[4.6, 0.32, 0.76]} color="#aa7951" />
      <Block position={[-2.28, 0.98, 2.25]} size={[0.34, 1.22, 1.7]} color="#67432f" />
      <Block position={[1.88, 0.98, 2.25]} size={[0.34, 1.22, 1.7]} color="#67432f" />
      <Block position={[0, 0.73, 0.1]} size={[2.45, 0.19, 1.25]} color="#573a2b" />
      <Block position={[0, 0.88, 0.1]} size={[2.06, 0.11, 0.92]} color="#c49a66" />
      <Block position={[-4.45, 1.25, -0.6]} size={[1.48, 2.55, 0.48]} color="#34271f" />
      <Block position={[-4.45, 2.42, -0.31]} size={[1.55, 0.13, 0.67]} color="#855c3d" />
      <Block position={[-4.45, 1.88, -0.31]} size={[1.55, 0.12, 0.67]} color="#855c3d" />
      <Block position={[-4.45, 1.32, -0.31]} size={[1.55, 0.12, 0.67]} color="#855c3d" />
      <Block position={[-4.7, 1.1, -0.15]} size={[0.28, 0.34, 0.28]} color="#d0a36c" />
      <Block position={[-4.18, 2.12, -0.16]} size={[0.35, 0.35, 0.3]} color="#9ba46f" />
      <GrownPlant position={[5.5, 0.28, 3.35]} scale={0.86} />

      {/* Lit work wall */}
      <PictureWall onOpen={onProjectOpen} />
      <Lantern position={[-6.35, 3.35, -4.9]} scale={0.8} />
      <Lantern position={[6.26, 3.35, -4.9]} scale={0.8} />

      {/* Staircase to the upper rooms */}
      {Array.from({ length: 12 }, (_, i) => (
        <Block
          key={i}
          position={[5.4, 0.48 + i * 0.39, 3.75 - i * 0.62]}
          size={[2.5, 0.34, 0.82]}
          color={i % 2 ? '#765238' : '#8b6242'}
        />
      ))}
      <Block position={[4.15, 3.1, -0.17]} size={[0.18, 5.5, 0.18]} color="#50392a" />
      <Block position={[6.65, 3.1, -0.17]} size={[0.18, 5.5, 0.18]} color="#50392a" />
      <Block position={[5.4, 5.12, -0.17]} size={[2.7, 0.18, 0.18]} color="#604530" />

      {/* Upper room: shelves, low writing desk, pinned notes, a chair */}
      <Block position={[-4.7, 6.78, -2.75]} size={[2.1, 2.6, 0.58]} color="#322720" />
      {[6.05, 6.65, 7.25].map((y) => <Block key={y} position={[-4.7, y, -2.37]} size={[2.16, 0.12, 0.72]} color="#79543a" />)}
      {[-5.35, -4.88, -4.38].map((x, i) => <Block key={x} position={[x, 6.35 + (i % 2) * 0.55, -2.29]} size={[0.32, 0.48, 0.18]} color={i % 2 ? '#b0784b' : '#687850'} />)}
      <Block position={[1.7, 6.22, -3.05]} size={[3.1, 0.16, 1.15]} color="#806044" />
      <Block position={[0.35, 5.82, -2.93]} size={[0.16, 0.74, 0.82]} color="#5d412e" />
      <Block position={[3.05, 5.82, -2.93]} size={[0.16, 0.74, 0.82]} color="#5d412e" />
      <Block position={[1.15, 5.7, -1.88]} size={[0.92, 1.2, 0.86]} color="#4f493c" />
      <Block position={[1.15, 6.37, -1.88]} size={[1.02, 0.16, 0.91]} color="#8e6a48" />
      <Block position={[2.15, 6.34, -4.88]} size={[1.15, 0.62, 0.14]} color="#172b2d" emissive="#5b9290" emissiveIntensity={0.3} />
      <Block position={[2.15, 6.74, -4.89]} size={[1.5, 0.12, 0.2]} color="#705138" />
      <Lantern position={[4.7, 8.5, -4.8]} scale={0.72} />
      <GrownPlant position={[-6.05, 5.7, -0.8]} scale={0.72} />
      <Block position={[-1.2, 6.05, -4.97]} size={[1.05, 0.72, 0.08]} color="#314b44" emissive="#43684f" emissiveIntensity={0.18} />
      <Block position={[-1.2, 6.05, -4.89]} size={[0.11, 0.55, 0.06]} color="#d1aa72" />
      <Block position={[-1.2, 6.05, -4.88]} size={[0.64, 0.1, 0.06]} color="#d1aa72" />

      {/* A few books and pots break up the silhouette */}
      <Block position={[-3.7, 6.12, -2.27]} size={[0.18, 0.42, 0.18]} color="#b98156" rotation={[0, 0, 0.08]} />
      <Block position={[-3.47, 6.12, -2.27]} size={[0.18, 0.42, 0.18]} color="#d0b278" />
      <Block position={[-3.23, 6.12, -2.27]} size={[0.18, 0.42, 0.18]} color="#657b68" />
      <GrownPlant position={[3.9, 5.68, -1.6]} scale={0.75} />
    </group>
  );
}

function OutdoorWorld() {
  const trees = useMemo(() => [
    [-14, 7, 11], [-18, -6, 14], [-13, -17, 11], [-8, -22, 9], [12, 8, 12], [17, -4, 14], [13, -17, 10], [21, -20, 13], [-24, 11, 13], [24, 13, 12],
  ], []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, -2]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1c2b23" roughness={1} />
      </mesh>
      <Block position={[0, -0.18, 16.5]} size={[4.6, 0.18, 20.4]} color="#51443a" />
      {Array.from({ length: 8 }, (_, i) => (
        <Block key={i} position={[0, -0.06, 8 + i * 2.45]} size={[2.75, 0.22, 1.74]} color={i % 2 ? '#54483e' : '#625044'} />
      ))}
      <Block position={[-6.2, -0.08, 4.2]} size={[3.3, 0.5, 0.55]} color="#392d25" />
      <Block position={[6.2, -0.08, 4.2]} size={[3.3, 0.5, 0.55]} color="#392d25" />
      {trees.map(([x, z, height], index) => <Pine key={`${x}-${z}`} x={x} z={z} height={height} tint={index % 2 ? '#263b2d' : '#304432'} />)}
      <Flower position={[-7.1, 0, 5.8]} color="#dc9a65" />
      <Flower position={[-6.5, 0, 5.5]} color="#d9c27e" />
      <Flower position={[7.25, 0, 6.0]} color="#c77a64" />
      <Flower position={[8.0, 0, 5.5]} color="#dfc47e" />
      <Lantern position={[-5.2, 1.95, 7.5]} scale={0.86} />
      <Lantern position={[5.2, 1.95, 7.5]} scale={0.86} />
      <StarField />
    </group>
  );
}

function CameraRail({ progress }) {
  const reduceMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);
  const lookTarget = useRef(new THREE.Vector3(...CAMERA_LOOKS[0]));
  const currentLook = useRef(new THREE.Vector3(...CAMERA_LOOKS[0]));
  const desired = useRef(new THREE.Vector3(...CAMERA_POSITIONS[0]));
  useFrame(({ camera }, delta) => {
    desired.current.copy(between(CAMERA_POSITIONS, progress));
    lookTarget.current.copy(between(CAMERA_LOOKS, progress));
    const ease = reduceMotion ? 1 : 1 - Math.exp(-delta * 2.8);
    camera.position.lerp(desired.current, ease);
    currentLook.current.lerp(lookTarget.current, ease);
    camera.lookAt(currentLook.current);
  });
  return null;
}

export default function World({ progress, onProjectOpen }) {
  return (
    <>
      <color attach="background" args={['#11191a']} />
      <fog attach="fog" args={['#11191a', 28, 72]} />
      <ambientLight intensity={0.68} color="#bed0c2" />
      <hemisphereLight skyColor="#758a91" groundColor="#38271f" intensity={0.54} />
      <directionalLight position={[-13, 22, 12]} color="#d3ddcb" intensity={1.05} castShadow shadow-mapSize-width={1536} shadow-mapSize-height={1536} shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
      <pointLight position={[0, 10, 2]} color="#d38b4e" intensity={1.15} distance={25} decay={2} />
      <OutdoorWorld />
      <House onProjectOpen={onProjectOpen} />
      <CameraRail progress={progress} />
    </>
  );
}
