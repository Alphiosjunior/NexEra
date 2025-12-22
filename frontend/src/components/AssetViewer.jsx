import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'

function Model({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function AssetViewer({ url }) {
  if (!url) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        No model selected
      </div>
    )
  }

  return (
    <Canvas>
      <Stage adjustCamera intensity={0.5}>
        <Model url={url} />
      </Stage>
      <OrbitControls />
    </Canvas>
  )
}

export default AssetViewer