import { Canvas } from '@react-three/fiber';
import SVGMesh from './SVGMesh'; 
{/*import { OrbitControls } from '@react-three/drei'; */}

export default function SpinningLogo() {
  return (
      <div className="w-[60px] h-[60px] relative z-50">
        <Canvas camera={{ position: [0, 0, 50], fov: 45 }} frameloop="always" dpr={[1, 2]}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 15]} intensity={1} />
          <SVGMesh url="/logo.svg" />
          {/*<OrbitControls enableZoom={false} enableRotate={false} enablePan={false} /> */}
        </Canvas>
      </div>
    
  );
}
