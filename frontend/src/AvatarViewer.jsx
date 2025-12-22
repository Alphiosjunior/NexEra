import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import TrainingRoom from './TrainingRoom';
import * as THREE from 'three';

// Professional coordinate system for educational spaces
const LOCATIONS = {
  'board': new THREE.Vector3(0, 0, -5.5),
  'teacher_desk': new THREE.Vector3(0, 0, -5.5),
  'lantern': new THREE.Vector3(-5, 0, -2.5),
  'student_desk': new THREE.Vector3(3, 0, 2.5),
  'center': new THREE.Vector3(0, 0, 0),
  'none': null
};

// Obstacle positions (chairs and tables)
const OBSTACLES = [
  // Student chairs
  new THREE.Vector3(-5.2, 0, 1.8), new THREE.Vector3(-2.1, 0, 2.3), new THREE.Vector3(1.4, 0, 1.9), new THREE.Vector3(4.8, 0, 2.1),
  new THREE.Vector3(-4.7, 0, 4.8), new THREE.Vector3(-1.2, 0, 4.4), new THREE.Vector3(2.3, 0, 4.9), new THREE.Vector3(5.1, 0, 4.6),
  new THREE.Vector3(-2.8, 0, 7.2), new THREE.Vector3(0.9, 0, 7.4), new THREE.Vector3(3.7, 0, 7.1),
  // Teacher desk
  new THREE.Vector3(0, 0, -4),
  // VR station
  new THREE.Vector3(-6, 0, -3)
];

function findPath(start, end) {
  const path = [];
  const current = start.clone();
  
  while (current.distanceTo(end) > 0.5) {
    const direction = end.clone().sub(current).normalize();
    let nextPos = current.clone().add(direction.multiplyScalar(0.5));
    
    // Check for obstacles
    for (const obstacle of OBSTACLES) {
      if (nextPos.distanceTo(obstacle) < 2) {
        // Avoid obstacle by going around it
        const avoidDir = nextPos.clone().sub(obstacle).normalize();
        nextPos.add(avoidDir.multiplyScalar(1.5));
      }
    }
    
    path.push(nextPos.clone());
    current.copy(nextPos);
    
    // Safety break
    if (path.length > 20) break;
  }
  
  path.push(end);
  return path;
}

function LoadingIndicator() {
  return (
    <Html center>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '16px 24px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #e2e8f0',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        Loading Avatar...
      </div>
    </Html>
  );
}

function Avatar({ animationName, targetLocation }) {
  const group = useRef();
  const { scene, animations } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb');
  const { actions } = useAnimations(animations, group);
  
  const [destination, setDestination] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [pathQueue, setPathQueue] = useState([]);
  const [actionTimer, setActionTimer] = useState(null);

  // Professional animation system with timer
  useEffect(() => {
    const animationMap = {
      'idle': 'idle',
      'agree': 'agree', 
      'headshake': 'headShake',
      'run': 'run',
      'walk': 'walk'
    };
    
    const clipName = animationMap[animationName?.toLowerCase()] || 'idle';
    const action = actions[clipName] || actions['idle'];
    
    if (action) {
      Object.values(actions).forEach(a => a.fadeOut(0.3));
      action.reset().fadeIn(0.3).play();
      
      // Clear existing timer
      if (actionTimer) clearTimeout(actionTimer);
      
      // Set 7-second timer for non-movement actions
      if (!['run', 'walk', 'idle'].includes(clipName)) {
        const timer = setTimeout(() => {
          const idleAction = actions['idle'];
          if (idleAction) {
            Object.values(actions).forEach(a => a.fadeOut(0.3));
            idleAction.reset().fadeIn(0.3).play();
          }
        }, 7000);
        setActionTimer(timer);
      }
    }
    
    return () => {
      if (action) action.fadeOut(0.3);
      if (actionTimer) clearTimeout(actionTimer);
    };
  }, [animationName, actions]);

  // Destination management with pathfinding
  useEffect(() => {
    if (targetLocation && LOCATIONS[targetLocation] && group.current) {
      const start = group.current.position.clone();
      const end = LOCATIONS[targetLocation];
      const path = findPath(start, end);
      setPathQueue(path);
      setIsMoving(true);
    }
  }, [targetLocation]);

  // Smooth movement with pathfinding
  useFrame((state, delta) => {
    if (pathQueue.length > 0 && group.current && isMoving) {
      const currentTarget = pathQueue[0];
      const currentPos = group.current.position;
      const distance = currentPos.distanceTo(currentTarget);
      
      if (distance > 0.1) {
        const speed = Math.min(3 * delta, distance * 0.1);
        const direction = currentTarget.clone().sub(currentPos).normalize();
        
        currentPos.add(direction.multiplyScalar(speed));
        
        const lookTarget = new THREE.Vector3(currentTarget.x, currentPos.y, currentTarget.z);
        group.current.lookAt(lookTarget);
      } else {
        // Move to next waypoint
        const newQueue = pathQueue.slice(1);
        setPathQueue(newQueue);
        
        if (newQueue.length === 0) {
          setIsMoving(false);
          // Auto-switch to idle after movement completes
          setTimeout(() => {
            const idleAction = actions['idle'];
            if (idleAction) {
              Object.values(actions).forEach(a => a.fadeOut(0.3));
              idleAction.reset().fadeIn(0.3).play();
            }
          }, 500);
        }
      }
    }
  });

  return (
    <primitive 
      ref={group} 
      object={scene} 
      scale={[1.6, 1.6, 1.6]} 
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    />
  );
}

export default function AvatarViewer({ animationName, target }) {
  return (
    <Canvas 
      shadows 
      camera={{ 
        position: [8, 6, 10], 
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
    >
      <Suspense fallback={<LoadingIndicator />}>
        <TrainingRoom />
        <Avatar animationName={animationName} targetLocation={target} />
      </Suspense>
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </Canvas>
  );
}