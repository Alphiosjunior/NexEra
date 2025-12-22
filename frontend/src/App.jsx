import React, { useState } from 'react';
import axios from 'axios';
import AssetViewer from './AssetViewer';
import AvatarViewer from './AvatarViewer';
import './index.css';

// LIVE BACKEND URL
const API_URL = 'https://nexera-backend-xued.onrender.com';

export default function App() {
  const [currentTab, setCurrentTab] = useState('assets');
  
  // Asset Generator State
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);

  // Avatar Trainer State
  const [cmd, setCmd] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState({
    animation: 'idle',
    target: 'center',
    explanation: 'Avatar ready for commands'
  });

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) return;
    
    setAssetLoading(true);
    const formData = new FormData();
    if (inputText.trim()) formData.append('prompt', inputText);
    if (selectedFile) formData.append('image', selectedFile);
    
    try {
      // Updated to use Live API
      const res = await axios.post(`${API_URL}/generate-asset`, formData);
      setModelData(res.data);
    } catch (error) {
      console.error('Asset generation failed:', error);
    } finally {
      setAssetLoading(false);
    }
  };

  const handleInteract = async () => {
    if (!cmd.trim()) return;
    
    setAvatarLoading(true);
    try {
      // Updated to use Live API
      const res = await axios.post(`${API_URL}/interact-avatar`, { command: cmd });
      setAvatarResponse(res.data);
      setCmd('');
    } catch (error) {
      console.error('Avatar interaction failed:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      
      {/* Header */}
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setCurrentTab('assets')}
            style={{ 
              border: 'none', 
              background: currentTab === 'assets' ? 'var(--bg-panel)' : 'transparent',
              color: currentTab === 'assets' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: currentTab === 'assets' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            3D Asset Lab
          </button>
          <button 
            onClick={() => setCurrentTab('avatar')}
            style={{ 
              border: 'none', 
              background: currentTab === 'avatar' ? 'var(--bg-panel)' : 'transparent',
              color: currentTab === 'avatar' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: currentTab === 'avatar' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            Simulation Trainer
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          {currentTab === 'assets' ? (
            <div>
              <h2>Generate 3D Assets</h2>
              <p className="text-muted mb-4">
                Describe objects in natural language to generate interactive 3D models for educational content.
              </p>
              
              <div className="mb-3">
                <label className="status-label mb-2" style={{display: 'block'}}>Object Description</label>
                <textarea 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="e.g., medieval helmet, rubber duck, camping lantern"
                  rows={3}
                />
              </div>
              
              <div className="mb-3">
                <label className="status-label mb-2" style={{display: 'block'}}>Upload Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                />
              </div>
              
              <button 
                className={`btn btn-primary ${assetLoading ? 'btn-loading' : ''}`}
                onClick={handleGenerate} 
                disabled={assetLoading || (!inputText.trim() && !selectedFile)}
              >
                {assetLoading ? '' : 'Generate Asset'}
              </button>
              
              {modelData && (
                modelData.error ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'black',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #a855f7',
                    marginTop: 'var(--space-4)'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 'var(--text-lg)', color: 'black' }}>Not Found</h4>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', opacity: 0.8, color: 'black' }}>{modelData.summary}</p>
                  </div>
                ) : (
                  <div className="status-panel">
                    <h4>Asset Information</h4>
                    <div className="status-row">
                      <span className="status-label">Status</span>
                      <span className="status-value">Ready</span>
                    </div>
                    <div className="status-row">
                      <span className="status-label">Type</span>
                      <span className="status-value">3D Model</span>
                    </div>
                    <p className="text-muted mt-3">{modelData.summary}</p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div>
              <h2>Avatar Training</h2>
              <p className="text-muted mb-4">
                Control the classroom avatar using natural language commands. Guide movement and actions through conversation.
              </p>
              
              <div className="mb-3">
                <label className="status-label mb-2" style={{display: 'block'}}>Voice Command</label>
                <textarea 
                  value={cmd} 
                  onChange={(e) => setCmd(e.target.value)} 
                  placeholder="e.g., Walk to the whiteboard, Go to the teacher's desk, Wave hello"
                  rows={3}
                />
              </div>
              
              <button 
                className={`btn btn-primary ${avatarLoading ? 'btn-loading' : ''}`}
                onClick={handleInteract}
                disabled={avatarLoading || !cmd.trim()}
              >
                {avatarLoading ? '' : 'Send Command'}
              </button>
              
              <div className="status-panel">
                <h4>Avatar Status</h4>
                <div className="status-row">
                  <span className="status-label">Action</span>
                  <span className="status-value">{avatarResponse.animation}</span>
                </div>
                <div className="status-row">
                  <span className="status-label">Target</span>
                  <span className="status-value">{avatarResponse.target}</span>
                </div>
                <div className="status-row">
                  <span className="status-label">Status</span>
                  <span className="status-value">{avatarLoading ? 'Processing...' : 'Ready'}</span>
                </div>
                <p className="text-muted mt-3">{avatarResponse.explanation}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 3D Viewer */}
        <div className="content">
          <div className="viewer-container">
            {currentTab === 'assets' ? (
              <AssetViewer url={modelData?.model_url} />
            ) : (
              <AvatarViewer 
                animationName={avatarResponse.animation} 
                target={avatarResponse.target} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}