import React, { Suspense, useRef, useEffect } from 'react';
import { ContactShadows, useGLTF, Text } from '@react-three/drei';

function Model({ url, position, scale, rotation }) {
  const { scene } = useGLTF(url);
  const clone = scene.clone();
  return <primitive object={clone} position={position} scale={scale} rotation={rotation} />;
}

function ClassroomLabel({ position, text, color = "#2563eb" }) {
  return (
    <Text
      position={position}
      fontSize={0.3}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

function CurvedDisplay({ position, args, color, roughness = 0.1 }) {
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current && meshRef.current.geometry) {
      const geometry = meshRef.current.geometry;
      const positionAttribute = geometry.attributes.position;
      
      if (!geometry.userData.curved) {
        for (let i = 0; i < positionAttribute.count; i++) {
          const x = positionAttribute.getX(i);
          const z = positionAttribute.getZ(i);
          
          const curveAmount = 0.3;
          const newZ = z + (x * x * curveAmount) / (args[0] * args[0]);
          
          positionAttribute.setZ(i, newZ);
        }
        
        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
        geometry.userData.curved = true;
      }
    }
  }, []);
  
  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[...args, 32, 1]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

export default function TrainingRoom() {
  const chairUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb";
  const extinguisherUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SpecGlossVsMetalRough/glTF-Binary/SpecGlossVsMetalRough.glb";

  return (
    <group>
      {/* Professional Lighting Setup */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-5, 3, -3]} intensity={0.3} color="#ffffff" />
      <pointLight position={[5, 3, 3]} intensity={0.3} color="#ffffff" />
      
      {/* Custom Sky based on current time */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial 
          color={(() => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 12) return "#87CEEB"; // Morning blue
            if (hour >= 12 && hour < 18) return "#87CEEB"; // Afternoon blue
            if (hour >= 18 && hour < 20) return "#ff6b35"; // Sunset orange
            return "#191970"; // Night dark blue
          })()} 
          side={2}
        />
      </mesh>

      {/* Classroom Floor with grass outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial 
          color="#f1f5f9" 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Grass outside classroom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 15]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>
      
      <ContactShadows resolution={512} scale={25} blur={2} opacity={0.3} />
      
      <Suspense fallback={null}>
        {/* Interactive Whiteboard (Target: 'board') */}
        <group position={[0, 2.5, -7]}>
          <CurvedDisplay position={[0, 0, 0]} args={[10, 5]} color="#ffffff" roughness={0.1} />
          <CurvedDisplay position={[0, 0, -0.1]} args={[10.2, 5.2]} color="#1e293b" />
          <ClassroomLabel position={[0, -3.2, 0]} text="Interactive Whiteboard" />
        </group>

        {/* Teacher's Workstation (Target: 'teacher_desk') */}
        <group position={[0, 0, -4]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[8, 0.1, 2.5]} />
            <meshStandardMaterial color="#374151" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[7.8, 0.8, 2.3]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <ClassroomLabel position={[0, -0.5, 0]} text="Teacher Workstation" />
        </group>

        {/* Student Learning Stations (Target: 'student_desk') - All 11 chairs */}
        <group>
          {/* Random placement with good spacing */}
          <Model url={chairUrl} position={[-5.2, 0, 1.8]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[-2.1, 0, 2.3]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[1.4, 0, 1.9]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[4.8, 0, 2.1]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          
          <Model url={chairUrl} position={[-4.7, 0, 4.8]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[-1.2, 0, 4.4]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[2.3, 0, 4.9]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[5.1, 0, 4.6]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          
          <Model url={chairUrl} position={[-2.8, 0, 7.2]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[0.9, 0, 7.4]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          <Model url={chairUrl} position={[3.7, 0, 7.1]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI, 0]} />
          
          {/* Student Tables with matching random positions */}
          <mesh position={[-5.2, 0.7, 0.8]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[-2.1, 0.7, 1.3]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[1.4, 0.7, 0.9]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[4.8, 0.7, 1.1]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          
          <mesh position={[-4.7, 0.7, 3.8]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[-1.2, 0.7, 3.4]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[2.3, 0.7, 3.9]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[5.1, 0.7, 3.6]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          
          <mesh position={[-2.8, 0.7, 6.2]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[0.9, 0.7, 6.4]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          <mesh position={[3.7, 0.7, 6.1]}><boxGeometry args={[1.2, 0.05, 0.8]} /><meshStandardMaterial color="#8b5cf6" /></mesh>
          
          <ClassroomLabel position={[0, -0.5, 4]} text="Student Learning Area" />
        </group>

        {/* Fire Extinguisher - NEW (Target: 'extinguisher') */}
        <group position={[11, 0, 0]}>
          <Model 
            url={extinguisherUrl} 
            position={[0, 1.5, 0]} 
            scale={[3, 3, 3]} 
            rotation={[0, -Math.PI/2, 0]} 
          />
          <ClassroomLabel position={[0, -0.8, 0]} text="Fire Extinguisher" />
        </group>

        {/* Classroom Walls */}
        <mesh position={[0, 3, -8]} receiveShadow>
          <boxGeometry args={[24, 6, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
        
        <mesh position={[-12, 3, 0]} receiveShadow>
          <boxGeometry args={[0.2, 6, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
        
        {/* Right wall - solid */}
        <mesh position={[12, 3, 0]} receiveShadow>
          <boxGeometry args={[0.2, 6, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
      </Suspense>
    </group>
  );
}