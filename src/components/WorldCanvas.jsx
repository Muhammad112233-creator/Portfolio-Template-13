import { Canvas } from '@react-three/fiber';
import World from './World.jsx';

export default function WorldCanvas({ progress, onProjectOpen, onReady }) {
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.45]}
        camera={{ position: [0, 4.1, 24], fov: 47, near: 0.1, far: 130 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#11191a');
          onReady?.();
        }}
      >
        <World progress={progress} onProjectOpen={onProjectOpen} />
      </Canvas>
    </div>
  );
}
