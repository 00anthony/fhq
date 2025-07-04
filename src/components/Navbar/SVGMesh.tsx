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
    const loadSVG = async () => {
      try {
        const res = await fetch(url);
        const svgText = await res.text();

        const loader = new SVGLoader();
        const data = loader.parse(svgText);
        const paths = data.paths;
        const group = new THREE.Group();

        paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path);

          shapes.forEach((shape) => {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 20,
              bevelEnabled: false,
            });

            geometry.center(); // ✅ this recenters each mesh properly

            const material = new THREE.MeshStandardMaterial({
              color: '#c52424',
              side: THREE.DoubleSide,
              metalness: 0,
              roughness: 1,
              wireframe: true,
            });

            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
          });
        });

        // Scale and add to scene
        group.scale.set(0.03, 0.03, 0.03);
        if (groupRef.current) {
          groupRef.current.add(group);
        }

      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSVG();
  }, [url]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return <group ref={groupRef} />;
}
