import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';

// --- THE PROCESSED MODEL COMPONENT ---
function ProcessedModel({ url, isWireframe }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  // PROCESS & PREP LOGIC (Auto-Center & Wireframe)
  useEffect(() => {
    if (scene) {
      // 1. Traverse and apply Wireframe setting
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = isWireframe;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene, isWireframe]);

  return <primitive ref={modelRef} object={scene} />;
}

// --- CAMERA RIG FOR AUTO-CENTERING ---
function SelectToZoom({ children }) {
  const api = useBounds();
  return (
    <group
      onClick={(e) => (e.stopPropagation(), api.refresh(e.object).fit())}
      onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}
    >
      {children}
    </group>
  );
}

export default function AssetViewer({ url }) {
  const [wireframe, setWireframe] = useState(false);

  if (!url) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        color: '#666' 
      }}>
        <p>No model selected</p>
        <p style={{ fontSize: '14px', color: '#999' }}>Generate an asset to view it here</p>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_asset.glb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* --- VIEWER TOOLBAR (The "Process" UI) --- */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 10, 
        display: 'flex', 
        gap: '10px' 
      }}>
        <button 
          onClick={() => setWireframe(!wireframe)}
          style={{ 
            padding: '8px 12px', 
            background: 'white', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {wireframe ? 'Show Solid' : 'Show Wireframe'}
        </button>

        <button 
          onClick={handleDownload}
          style={{ 
            padding: '8px 12px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Download .GLB
        </button>
      </div>

      {/* --- 3D CANVAS --- */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Bounds ensures "Auto-scale and centre" logic */}
          <Bounds fit clip observe margin={1.2}>
            <SelectToZoom>
              <Stage environment="city" intensity={0.6} adjustCamera={false}>
                <ProcessedModel url={url} isWireframe={wireframe} />
              </Stage>
            </SelectToZoom>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}