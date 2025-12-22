import React, { useState } from 'react';
import axios from 'axios';
import AssetViewer from './AssetViewer';
import AvatarViewer from './AvatarViewer';
import './index.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('test1');
  
  // Test 1 State
  const [inputText, setInputText] = useState('');
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Test 2 State
  const [cmd, setCmd] = useState('');
  const [avatarResponse, setAvatarResponse] = useState({ animation: 'Idle', target: 'none', explanation: 'System Ready' });

  // --- API HANDLERS (Keep your existing logic) ---
  const handleGenerate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('prompt', inputText);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    try {
      const res = await axios.post('http://localhost:8000/generate-asset', formData);
      setModelData(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleInteract = async () => {
    try {
      const res = await axios.post('http://localhost:8000/interact-avatar', { command: cmd });
      setAvatarResponse(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      
      {/* 1. TECHNICAL HEADER */}
      <header style={{
        height: '48px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-3)',
        justifyContent: 'space-between',
        background: 'var(--bg-panel)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 12, height: 12, background: 'var(--accent-primary)', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '-0.02em' }}>NexEra Education Platform</span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>v2.4.0-stable</span>
        </div>

        {/* Tab Switcher (Segmented Control style) */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button 
                onClick={() => setCurrentTab('test1')}
                style={{ 
                    border: 'none', 
                    background: currentTab === 'test1' ? 'var(--bg-panel)' : 'transparent',
                    color: currentTab === 'test1' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: currentTab === 'test1' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                }}
            >
                3D Asset Lab
            </button>
            <button 
                onClick={() => setCurrentTab('test2')}
                style={{ 
                    border: 'none', 
                    background: currentTab === 'test2' ? 'var(--bg-panel)' : 'transparent',
                    color: currentTab === 'test2' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: currentTab === 'test2' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                }}
            >
                Simulation Trainer
            </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR (Controls) */}
        <aside style={{ 
            width: '320px', 
            borderRight: '1px solid var(--border-subtle)', 
            padding: 'var(--space-4)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-4)',
            background: 'var(--bg-panel)'
        }}>
          
          {currentTab === 'test1' ? (
            <>
              <div>
                <span className="label">Generator Input</span>
                <textarea 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Describe an object (e.g. 'futuristic helmet', 'red car')..." 
                    rows={4}
                    style={{ resize: 'none' }}
                />
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '11px', cursor: 'pointer', padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-panel)' }}>
                        {selectedFile ? selectedFile.name.slice(0, 12) + '...' : 'Upload Ref Image'}
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <button className="primary" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Processing...' : 'Generate Asset'}
                    </button>
                </div>
              </div>

              {modelData && (
                <div className="card">
                    <span className="label" style={{ color: 'var(--accent-blue)' }}>Analysis Complete</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {modelData.summary}
                    </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <span className="label">Instructor Command Console</span>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        value={cmd} 
                        onChange={(e) => setCmd(e.target.value)} 
                        placeholder="e.g. 'Walk to the whiteboard'..." 
                        onKeyDown={(e) => e.key === 'Enter' && handleInteract()}
                    />
                    <span style={{ position: 'absolute', right: 8, top: 8, fontSize: '10px', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)', padding: '0 4px', borderRadius: 3 }}>ENTER</span>
                </div>
                <div style={{ marginTop: 'var(--space-2)' }}>
                    <button className="primary" style={{ width: '100%' }} onClick={handleInteract}>Transmit Command</button>
                </div>
              </div>

              <div className="card">
                <span className="label">Telemetry</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div>
                        <span className="label">Action</span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary)' }}>
                            {avatarResponse.animation.toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <span className="label">Target</span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                            {avatarResponse.target.toUpperCase()}
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                    <span className="label">System Log</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        "{avatarResponse.explanation}"
                    </p>
                </div>
              </div>

              <div className="card" style={{ background: 'transparent', border: '1px dashed var(--border-subtle)' }}>
                <span className="label">Manual Override</span>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <kbd style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)' }}>W</kbd>
                    <kbd style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)' }}>A</kbd>
                    <kbd style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)' }}>S</kbd>
                    <kbd style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '2px 6px', fontSize: 11, color: 'var(--text-secondary)' }}>D</kbd>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>to Navigate</span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT VIEWPORT (The Canvas) */}
        <main style={{ flex: 1, position: 'relative', background: 'var(--bg-app)' }}>
            {currentTab === 'test1' ? (
                <AssetViewer url={modelData?.model_url} />
            ) : (
                <AvatarViewer animationName={avatarResponse.animation} target={avatarResponse.target} />
            )}
            
            {/* Overlay Watermark (Optional for "Pro" feel) */}
            <div style={{ 
                position: 'absolute', bottom: 20, right: 20, 
                pointerEvents: 'none', opacity: 0.3, 
                fontSize: '10px', fontFamily: 'var(--font-mono)' 
            }}>
                RENDER_ENGINE::THREE.JS // LATENCY: 12ms
            </div>
        </main>

      </div>
    </div>
  );
}