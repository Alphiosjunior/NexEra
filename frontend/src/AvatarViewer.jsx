import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import TrainingRoom from './TrainingRoom';
import * as THREE from 'three';

const LOCATIONS = {
  'board': new THREE.Vector3(0, 0, -6),
  'teacher_desk': new THREE.Vector3(0, 0, -4),
  'student_desk': new THREE.Vector3(0, 0, 2),
  'extinguisher': new THREE.Vector3(9, 0, 0),
  'center': new THREE.Vector3(0, 0, 0),
  'none': null
};

// Obstacle positions
const OBSTACLES = [
  // Student chairs
  new THREE.Vector3(-5.2, 0, 1.8), new THREE.Vector3(-2.1, 0, 2.3), new THREE.Vector3(1.4, 0, 1.9), new THREE.Vector3(4.8, 0, 2.1),
  new THREE.Vector3(-4.7, 0, 4.8), new THREE.Vector3(-1.2, 0, 4.4), new THREE.Vector3(2.3, 0, 4.9), new THREE.Vector3(5.1, 0, 4.6),
  new THREE.Vector3(-2.8, 0, 7.2), new THREE.Vector3(0.9, 0, 7.4), new THREE.Vector3(3.7, 0, 7.1),
  // Teacher desk
  new THREE.Vector3(0, 0, -4),
  // Fire extinguisher
  new THREE.Vector3(11, 0, 0)
];

function findPath(start, end) {
  const path = [];
  const current = start.clone();
  
  while (current.distanceTo(end) > 0.5) {
    const direction = end.clone().sub(current).normalize();
    let nextPos = current.clone().add(direction.multiplyScalar(0.8));
    
    // Check for obstacles
    for (const obstacle of OBSTACLES) {
      if (nextPos.distanceTo(obstacle) < 2.5) {
        const avoidDir = nextPos.clone().sub(obstacle).normalize();
        nextPos.add(avoidDir.multiplyScalar(2));
      }
    }
    
    path.push(nextPos.clone());
    current.copy(nextPos);
    
    if (path.length > 15) break;
  }
  
  path.push(end);
  return path;
}

function Avatar({ animationName, targetLocation }) {
  const group = useRef();
  const { scene, animations } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb');
  const { actions } = useAnimations(animations, group);

  const [destination, setDestination] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [pathQueue, setPathQueue] = useState([]);

  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, space: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(k)) {
        if (k === ' ') keys.current.space = true;
        else if (k === 'arrowup') keys.current.w = true;
        else if (k === 'arrowdown') keys.current.s = true;
        else if (k === 'arrowleft') keys.current.a = true;
        else if (k === 'arrowright') keys.current.d = true;
        else keys.current[k] = true;
        
        setManualMode(true);
        setDestination(null);
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === ' ') keys.current.space = false;
      else if (k === 'arrowup') keys.current.w = false;
      else if (k === 'arrowdown') keys.current.s = false;
      else if (k === 'arrowleft') keys.current.a = false;
      else if (k === 'arrowright') keys.current.d = false;
      else keys.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // AI Logic with pathfinding
  useEffect(() => {
    if (targetLocation && LOCATIONS[targetLocation] && group.current) {
      setManualMode(false);
      const start = group.current.position.clone();
      const end = LOCATIONS[targetLocation];
      const path = findPath(start, end);
      setPathQueue(path);
    }
  }, [targetLocation]);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Manual Control
    if (manualMode) {
      const speed = keys.current.shift ? 6 : 3;
      const rotSpeed = 2.5;
      let moving = false;

      // Rotation
      if (keys.current.a) group.current.rotation.y += rotSpeed * delta;
      if (keys.current.d) group.current.rotation.y -= rotSpeed * delta;

      // Movement
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), group.current.rotation.y);
      if (keys.current.w) {
        group.current.position.add(forward.multiplyScalar(speed * delta));
        moving = true;
      }
      if (keys.current.s) {
        group.current.position.add(forward.multiplyScalar(-speed * delta));
        moving = true;
      }

      // Jump
      if (keys.current.space && !isJumping) {
        setIsJumping(true);
        group.current.position.y = 1.2;
      }
      
      if (isJumping) {
        group.current.position.y -= 4 * delta;
        if (group.current.position.y <= 0) {
          group.current.position.y = 0;
          setIsJumping(false);
        }
      }

      // Animation
      const anim = moving ? (keys.current.shift ? 'run' : 'walk') : 'idle';
      const action = actions[anim] || actions['idle'];
      if (action && !action.isRunning()) {
        Object.values(actions).forEach(a => a.stop());
        action.play();
      }
    }
    // AI Control with obstacle avoidance
    else if (pathQueue.length > 0) {
      const currentTarget = pathQueue[0];
      const distance = group.current.position.distanceTo(currentTarget);
      
      if (distance > 0.3) {
        const direction = currentTarget.clone().sub(group.current.position).normalize();
        group.current.position.add(direction.multiplyScalar(3 * delta));
        group.current.lookAt(currentTarget.x, group.current.position.y, currentTarget.z);
        
        const walkAction = actions['walk'];
        if (walkAction && !walkAction.isRunning()) {
          Object.values(actions).forEach(a => a.stop());
          walkAction.play();
        }
      } else {
        const newQueue = pathQueue.slice(1);
        setPathQueue(newQueue);
        
        if (newQueue.length === 0) {
          let targetAnim = 'idle';
          const animName = animationName.toLowerCase();
          
          if (animName.includes('wave')) {
            targetAnim = 'agree';
            group.current.lookAt(0, group.current.position.y, 2);
          } else if (animName.includes('point')) {
            targetAnim = 'agree';
            group.current.lookAt(11, group.current.position.y, 0);
          } else if (animName.includes('safety')) {
            targetAnim = 'idle';
          }
          
          const action = actions[targetAnim];
          if (action) {
            Object.values(actions).forEach(a => a.stop());
            action.reset().play();
          }
        }
      }
    } else {
      // Default idle
      const idleAction = actions['idle'];
      if (idleAction && !idleAction.isRunning()) {
        Object.values(actions).forEach(a => a.stop());
        idleAction.play();
      }
    }
  });

  return <primitive ref={group} object={scene} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />;
}

export default function AvatarViewer({ animationName, target }) {
  return (
    <Canvas shadows camera={{ position: [0, 8, 12], fov: 50 }}>
      <Suspense fallback={null}>
        <TrainingRoom />
        <Avatar animationName={animationName} targetLocation={target} />
      </Suspense>
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}