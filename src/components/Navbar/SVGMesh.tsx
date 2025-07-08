import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

interface SVGMeshProps {
  url: string;
}

export default function SVGMesh({ url }: SVGMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let isMounted = true;
    const loader = new SVGLoader();

    const loadSVG = async () => {
      try {
        const res = await fetch(url);
        const svgText = await res.text();

        const data = loader.parse(svgText);
        const paths = data.paths;
        const svgGroup = new THREE.Group();

        paths.forEach((path) => {
          const shapes = path.toShapes(true); 
          shapes.forEach((shape) => {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 20,
              bevelEnabled: false,
            });
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
              color: '#c52424',
              side: THREE.DoubleSide,
              metalness: 0.8,
              roughness: 0.3,
              emissive: '#c52424',
              emissiveIntensity: 0.1,
            });

            const mesh = new THREE.Mesh(geometry, material);
            svgGroup.add(mesh);
          });
        });

        svgGroup.scale.set(0.03, 0.03, 0.03);

        if (isMounted && groupRef.current) {
          groupRef.current.add(svgGroup);
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSVG();

    return () => {
      isMounted = false;
      // Optional: clean up geometry/material from previous renders
      if (groupRef.current) {
        groupRef.current.clear();
      }
    };
  }, [url]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return <group ref={groupRef} />;
}
