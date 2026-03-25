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

const OBSTACLES = [
  new THREE.Vector3(-5.2, 0, 1.8), new THREE.Vector3(-2.1, 0, 2.3),
  new THREE.Vector3(1.4, 0, 1.9), new THREE.Vector3(4.8, 0, 2.1),
  new THREE.Vector3(-4.7, 0, 4.8), new THREE.Vector3(-1.2, 0, 4.4),
  new THREE.Vector3(2.3, 0, 4.9), new THREE.Vector3(5.1, 0, 4.6),
  new THREE.Vector3(-2.8, 0, 7.2), new THREE.Vector3(0.9, 0, 7.4),
  new THREE.Vector3(3.7, 0, 7.1), new THREE.Vector3(0, 0, -4),
  new THREE.Vector3(11, 0, 0)
];

// Actual Xbot.glb clips: agree, headShake, idle, run, sad_pose, sneak_pose, walk
const ANIMATION_MAP = {
  'idle':      'idle',
  'walk':      'walk',
  'run':       'run',
  'agree':     'agree',
  'wave':      'agree',
  'point':     'agree',
  'yes':       'agree',
  'nod':       'agree',
  'headshake': 'headShake',
  'no':        'headShake',
  'shake':     'headShake',
  'dance':     'run',
  'jump':      'run',
  'sad':       'sad_pose',
  'sit':       'sad_pose',
  'sitting':   'sad_pose',
  'safety':    'sneak_pose',
  'sneak':     'sneak_pose',
  'crouch':    'sneak_pose',
  'posture':   'sneak_pose',
};

function resolveAnimation(name) {
  if (!name) return 'idle';
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(ANIMATION_MAP)) {
    if (lower.includes(key)) return val;
  }
  return 'idle';
}

function findPath(start, end) {
  const path = [];
  const current = start.clone();
  while (current.distanceTo(end) > 0.5) {
    const direction = end.clone().sub(current).normalize();
    let nextPos = current.clone().add(direction.multiplyScalar(0.8));
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

function playAnim(actions, name) {
  const resolved = resolveAnimation(name);
  const action = actions[resolved] || actions['idle'];
  if (!action) return;
  Object.values(actions).forEach(a => a.fadeOut(0.3));
  action.reset().fadeIn(0.3).play();
}

function Avatar({ animationName, targetLocation }) {
  const group = useRef();
  const { scene, animations } = useGLTF(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb'
  );
  const { actions } = useAnimations(animations, group);
  const [pathQueue, setPathQueue] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, space: false });
  const arrivedRef = useRef(false);

  // Keyboard controls
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
        setPathQueue([]);
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

  // When AI command arrives — decide: walk then animate, or animate immediately
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    setManualMode(false);
    arrivedRef.current = false;

    const hasTarget = targetLocation && LOCATIONS[targetLocation];

    if (hasTarget && group.current) {
      // Need to walk first, then animate on arrival
      const start = group.current.position.clone();
      const end = LOCATIONS[targetLocation];
      const path = findPath(start, end);
      setPathQueue(path);
    } else {
      // No movement needed — play animation immediately
      setPathQueue([]);
      playAnim(actions, animationName);
    }
  }, [animationName, targetLocation, actions]);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Manual keyboard control
    if (manualMode) {
      const speed = keys.current.shift ? 6 : 3;
      let moving = false;
      if (keys.current.a) group.current.rotation.y += 2.5 * delta;
      if (keys.current.d) group.current.rotation.y -= 2.5 * delta;
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0), group.current.rotation.y
      );
      if (keys.current.w) { group.current.position.add(forward.clone().multiplyScalar(speed * delta)); moving = true; }
      if (keys.current.s) { group.current.position.add(forward.clone().multiplyScalar(-speed * delta)); moving = true; }
      if (keys.current.space && !isJumping) {
        setIsJumping(true);
        group.current.position.y = 1.2;
      }
      if (isJumping) {
        group.current.position.y -= 4 * delta;
        if (group.current.position.y <= 0) { group.current.position.y = 0; setIsJumping(false); }
      }
      const anim = moving ? (keys.current.shift ? 'run' : 'walk') : 'idle';
      const action = actions[anim] || actions['idle'];
      if (action && !action.isRunning()) {
        Object.values(actions).forEach(a => a.stop());
        action.play();
      }
      return;
    }

    // AI pathfinding
    if (pathQueue.length > 0) {
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
        // Arrived at final destination — play the intended animation
        if (newQueue.length === 0 && !arrivedRef.current) {
          arrivedRef.current = true;
          playAnim(actions, animationName);
        }
      }
    }
  });

  return (
    <primitive ref={group} object={scene} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />
  );
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
