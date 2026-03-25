import React, { useState } from 'react';
import axios from 'axios';
import AssetViewer from './AssetViewer';
import AvatarViewer from './AvatarViewer';
import './index.css';

const API_URL = 'https://nexeranexera-backend.onrender.com';

export default function App() {
  const [currentTab, setCurrentTab] = useState('assets');
  
  // Asset Lab State
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  
  // Sim Trainer State
  const [cmd, setCmd] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState({
    animation: 'idle', target: 'center', explanation: 'System Ready. Waiting for instructor command.'
  });

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setAssetLoading(true);
    const formData = new FormData();
    if (inputText.trim()) formData.append('prompt', inputText);
    if (selectedFile) formData.append('image', selectedFile);
    try {
      const res = await axios.post(`${API_URL}/generate-asset`, formData);
      setModelData(res.data);
    } catch (error) { console.error(error); } finally { setAssetLoading(false); }
  };

  const handleInteract = async () => {
    if (!cmd.trim()) return;
    setAvatarLoading(true);
    try {
      const res = await axios.post(`${API_URL}/interact-avatar`, { command: cmd });
      setAvatarResponse(res.data);
      setCmd(''); 
    } catch (error) { console.error(error); } finally { setAvatarLoading(false); }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="nav-header">
        <div className="logo"><div className="logo-dot"></div>NexEra Learning Platform</div>
        <div className="tab-switcher">
          <button className={`tab-btn ${currentTab === 'assets' ? 'active' : ''}`} onClick={() => setCurrentTab('assets')}>Asset Lab</button>
          <button className={`tab-btn ${currentTab === 'avatar' ? 'active' : ''}`} onClick={() => setCurrentTab('avatar')}>Sim Trainer</button>
        </div>
        <div style={{fontSize: '11px', color: '#8b949e'}}>v2.4.0-stable</div>
      </header>

      {/* WORKSPACE */}
      <div className="main-workspace">
        <aside className="sidebar">
          {currentTab === 'assets' ? (
            <>
              <div>
                <h2>Asset Lab Control</h2>
                <p className="text-muted">Generate 3D education assets using AI vision or text.</p>
                <div className="mb-3">
                  <label className="status-label">Description</label>
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="e.g. 'A rusted medieval helmet'" rows={3} />
                </div>
                <div className="mb-3">
                  <label className="status-label">Reference Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} style={{fontSize: '12px', marginTop: '8px'}} />
                </div>
                <button className={`btn btn-primary ${assetLoading ? 'btn-loading' : ''}`} onClick={handleGenerate} disabled={assetLoading}>
                  {assetLoading ? 'Processing...' : 'Generate Asset'}
                </button>
              </div>
              {modelData && (
                <div className="status-panel">
                  <div className="status-row">
                    <span className="status-label">Status</span>
                    <span className="status-value" style={{color: modelData.error ? '#da3633' : '#238636'}}>
                      {modelData.error ? 'FAILED' : 'SUCCESS'}
                    </span>
                  </div>
                  <p className="text-muted" style={{marginTop: '10px', marginBottom: 0}}>{modelData.summary}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <h2>Sim Trainer Console</h2>
                <p className="text-muted">Issue natural language commands to control the avatar.</p>
                <div className="mb-3">
                  <label className="status-label">Command Input</label>
                  <input type="text" value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="e.g. 'Point at the fire extinguisher'" onKeyDown={(e) => e.key === 'Enter' && handleInteract()} />
                </div>
                <button className={`btn btn-primary ${avatarLoading ? 'btn-loading' : ''}`} onClick={handleInteract} disabled={avatarLoading}>
                  {avatarLoading ? 'Transmitting...' : 'Send Command'}
                </button>
              </div>
              <div className="status-panel">
                <div className="status-row"><span className="status-label">Action</span><span className="status-value">{avatarResponse.animation.toUpperCase()}</span></div>
                <div className="status-row"><span className="status-label">Target</span><span className="status-value">{avatarResponse.target.toUpperCase()}</span></div>
                <div style={{borderTop: '1px solid var(--border-subtle)', margin: '8px 0'}}></div>
                <span className="status-label">System Log:</span>
                <p style={{fontSize: '12px', color: '#8b949e', marginTop: '4px'}}>"{avatarResponse.explanation}"</p>
              </div>
              <div className="status-panel" style={{background: 'transparent', borderStyle: 'dashed'}}>
                <span className="status-label">Manual Override Active</span>
                <div style={{display: 'flex', gap: '5px', marginTop: '8px'}}>
                  {['W','A','S','D'].map(k => <span key={k} style={{background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#8b949e'}}>{k}</span>)}
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="viewer-area">
          {currentTab === 'assets' ? <AssetViewer url={modelData?.model_url} /> : <AvatarViewer animationName={avatarResponse.animation} target={avatarResponse.target} />}
        </main>
      </div>
    </div>
  );
}
