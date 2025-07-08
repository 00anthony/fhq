'use client';

import { useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene: original } = useGLTF(url);
  const groupRef = useRef<THREE.Object3D>(null!);

  // 👇 Deep clone the scene so we can safely modify it
  const scene = useMemo(() => original.clone(true), [original]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: '#c52424',
          metalness: 0.8,
          roughness: 0.3,
          emissive: '#c52424',
          emissiveIntensity: 0.1,
        });
      }
    });

    const size = box.getSize(new THREE.Vector3()).length();
    const scaleFactor = 5 / size;
    scene.scale.setScalar(scaleFactor);

    groupRef.current.add(scene);
  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return <group ref={groupRef} />;
}

export default function ModelViewer() {
  return (
    <div className="w-16 h-16">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <Model url="/models/3D-logo.glb" />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 20]} intensity={1} />
      </Canvas>
    </div>
  );
}
