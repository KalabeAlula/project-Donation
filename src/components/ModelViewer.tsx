import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerProps {
  modelPath?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animate?: boolean;
  labels?: {
    topText?: string;
    bottomText?: string;
    topPosition?: [number, number, number];
    bottomPosition?: [number, number, number];
  };
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath = '/scene.gltf',
  scale = 0.5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  animate = true,
  labels = {
    topText: 'Impact',
    bottomText: 'Your donations at work',
    topPosition: [0, 2.8, 0],
    bottomPosition: [0, -2.5, 0]
  }
}) => {
  const gltf = useLoader(GLTFLoader, modelPath);
  const modelRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (modelRef.current && animate) {
      // Rotate the model
      modelRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      <primitive 
        ref={modelRef}
        object={gltf.scene} 
        scale={scale} 
        position={position}
        rotation={rotation}
      />
      
      {labels.topText && (
        <Text
          position={labels.topPosition}
          fontSize={0.4}
          color="#0ea5e9"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {labels.topText}
        </Text>
      )}
      
      {labels.bottomText && (
        <Text
          position={labels.bottomPosition}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.woff"
        >
          {labels.bottomText}
        </Text>
      )}
    </group>
  );
};

export default ModelViewer;