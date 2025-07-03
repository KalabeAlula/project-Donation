import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface CauseIconProps {
  type: string;
  color: string;
}

const CauseIcon: React.FC<CauseIconProps> = ({ type, color }) => {
  // This component uses a simple colored sphere instead of custom 3D shapes
  // You can enhance this by using specific parts of your 3D model from public folder
  
  return (
    <div className="h-24 w-24 bg-white rounded-full shadow-lg p-4">
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh>
          {/* Use appropriate geometry based on cause type */}
          {type === 'water' && <sphereGeometry args={[0.8, 32, 32]} />}
          {type === 'education' && <boxGeometry args={[1, 1, 1]} />}
          {type === 'medical' && <cylinderGeometry args={[0.7, 0.7, 1, 32]} />}
          {type === 'environment' && <coneGeometry args={[0.8, 1.5, 16]} />}
          
          {/* Apply the color */}
          <meshStandardMaterial 
            color={color} 
            metalness={0.3} 
            roughness={0.4}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default CauseIcon;