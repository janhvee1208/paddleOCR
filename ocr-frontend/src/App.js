import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage, { SESSION_KEY } from './components/AuthPage';
import './App.css';

const API = 'http://127.0.0.1:5000';

/* ─────────────────────────────
   PostgreSQL history helpers
───────────────────────────── */
async function fetchHistory(userId) {
  try {
    const res  = await fetch(`${API}/history/${userId}`);
    const data = await res.json();
    return data.success ? data.history : [];
  } catch { return []; }
}

async function saveHistoryToDB(userId, imageName, itemCount, results) {
  try {
    const res = await fetch(`${API}/history`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_id: userId, image_name: imageName, item_count: itemCount, results }),
    });
    const data = await res.json();
    return data.success ? data.id : null;
  } catch { return null; }
}

async function deleteHistoryFromDB(historyId, userId) {
  try {
    await fetch(`${API}/history/${historyId}?user_id=${userId}`, { method: 'DELETE' });
  } catch {}
}

/* ─────────────────────────────
   Camera Modal
───────────────────────────── */
function CameraModal({ onCapture, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setCameraReady(true); }
      })
      .catch(() => alert('Camera access denied or unavailable.'));
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setFlashActive(true); setTimeout(() => setFlashActive(false), 300);
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      onClose();
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-header">
          <span className="camera-title"><span>📷</span> Capture Prescription</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="camera-viewport">
          {flashActive && <div className="camera-flash" />}
          <video ref={videoRef} className="camera-feed" playsInline muted />
          {!cameraReady && (<div className="camera-loading"><div className="cam-spinner" /><p>Starting camera…</p></div>)}
          <div className="cam-guide tl" /><div className="cam-guide tr" />
          <div className="cam-guide bl" /><div className="cam-guide br" />
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="camera-actions">
          <button className="btn-capture" onClick={capture} disabled={!cameraReady}><span className="capture-inner" /></button>
          <p className="camera-hint">Position the prescription inside the guides and tap</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Upload Zone
───────────────────────────── */
function UploadZone({ selectedImage, onImageChange }) {
  const [dragging, setDragging] = useState(false);
  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) onImageChange(f); };

  return (
    <label className={`dropzone-modern ${dragging ? 'dragging' : ''} ${selectedImage ? 'has-image' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
      <input type="file" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])} accept="image/*" />
      {selectedImage && previewUrl ? (
        <div className="preview-wrapper">
          <img src={previewUrl} alt="prescription preview" className="preview-thumb" />
          <div className="preview-overlay">
            <div className="preview-meta">
              <span className="preview-file-icon">🖼️</span>
              <div><p className="preview-fname">{selectedImage.name}</p><p className="preview-fsize">{(selectedImage.size / 1024).toFixed(1)} KB · Click to change</p></div>
            </div>
            <span className="preview-change-btn">Change Image</span>
          </div>
        </div>
      ) : (
        <div className="dropzone-idle">
          <div className="dz-icon-ring"><span className="dz-icon">📄</span></div>
          <p className="dz-heading">Drop your prescription here</p>
          <p className="dz-sub">or <span className="dz-link">browse files</span> — JPG, PNG, WEBP supported</p>
        </div>
      )}
    </label>
  );
}

/* ─────────────────────────────
   Result Card
───────────────────────────── */
function ResultCard({ item, index }) {
  const isUnknown = item.description === 'Medical information not available in local database.';
  return (
    <div className={`result-card-modern ${isUnknown ? 'rc-unknown' : 'rc-verified'}`}>
      <div className="rc-header">
        <div className="rc-num">#{index + 1}</div>
        <h4 className="rc-name">{item.medicine_name}</h4>
        <span className={`rc-badge ${isUnknown ? 'badge-warn' : 'badge-ok'}`}>{isUnknown ? '⚠ Unknown' : '✓ Verified'}</span>
      </div>
      <div className="rc-body">
        <div className="rc-field"><span className="rc-label">Medical Uses</span><p className="rc-text">{item.description}</p></div>
        <div className="rc-field"><span className="rc-label">Patient Summary</span><p className="rc-text">{item.summary}</p></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   User Menu
───────────────────────────── */
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="user-menu-wrap">
      <button className="user-avatar-btn" onClick={() => setOpen(!open)}>
        <span className="user-initials">{initials}</span>
        <span className="user-name-short">{user.name.split(' ')[0]}</span>
        <span className="user-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="ud-header">
            <div className="ud-avatar">{initials}</div>
            <div>
              <p className="ud-name">{user.name}</p>
              <p className="ud-email">{user.email}</p>
            </div>
          </div>
          {/* DB badge */}
          <div className="ud-db-badge">
            <span>🗄️</span> History stored in PostgreSQL
          </div>
          <div className="ud-divider" />
          <button className="ud-logout" onClick={() => { setOpen(false); onLogout(); }}>🚪 Sign Out</button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────
   Main App
───────────────────────────── */
function App() {
  const [currentUser,  setCurrentUser]  = useState(null);   // { id, name, email }
  const [selectedImage,setSelectedImage]= useState(null);
  const [results,      setResults]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [history,      setHistory]      = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [currentView,  setCurrentView]  = useState('landing');
  const [showCamera,   setShowCamera]   = useState(false);

  /* ── Restore session ── */
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s?.id && s?.email) setCurrentUser(s);
    } catch {}
  }, []);

  /* ── Load history from PostgreSQL when user logs in ── */
  useEffect(() => {
    if (!currentUser?.id) { setHistory([]); return; }
    setHistoryLoading(true);
    fetchHistory(currentUser.id).then((h) => { setHistory(h); setHistoryLoading(false); });
  }, [currentUser]);

  /* ── Auth ── */
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentView('scanner');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setHistory([]);
    setResults([]);
    setSelectedImage(null);
    setCurrentView('landing');
  };

  /* ── Scanner ── */
  const handleImageChange = (file) => { setSelectedImage(file); setResults([]); };

  const handleScan = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const formData = new FormData(); formData.append('file', selectedImage);
    try {
      const response = await fetch(`${API}/predict`, { method: 'POST', body: formData });
      const data     = await response.json();

      if (data.success) {
        const filtered = data.data.filter((i) => i.is_medicine === true);
        setResults(filtered);

        // ── Save to PostgreSQL ──
        if (currentUser?.id && filtered.length > 0) {
          const savedId = await saveHistoryToDB(
            currentUser.id,
            selectedImage.name,
            filtered.length,
            filtered
          );
          if (savedId) {
            // Prepend to local history state so UI updates instantly
            const newItem = {
              id:        savedId,
              imageName: selectedImage.name,
              itemCount: filtered.length,
              results:   filtered,
              date:      new Date().toISOString(),
            };
            setHistory((prev) => [newItem, ...prev].slice(0, 50));
          }
        }
      } else {
        alert('Error: ' + data.error);
      }
    } catch { alert('Failed to connect to backend server.'); }
    setLoading(false);
  };

  const handleDownloadReport = async () => {
    if (!results.length) return alert('No data to download!');
    try {
      const response = await fetch(`${API}/download_report`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: results }),
      });
      if (response.ok) {
        const blob = await response.blob(); const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.setAttribute('download', 'Prescription_Report.txt');
        document.body.appendChild(a); a.click(); a.remove();
      }
    } catch { alert('Error downloading report.'); }
  };

  const loadHistoryItem = (item) => {
    setResults(item.results);
    setSelectedImage(null);
    setCurrentView('scanner');
  };

  const clearHistory = async () => {
    if (!window.confirm('Clear ALL your scan history from the database?')) return;
    // Delete each record from PostgreSQL
    await Promise.all(history.map((item) => deleteHistoryFromDB(item.id, currentUser.id)));
    setHistory([]);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  /* ═══════════════ LANDING ═══════════════ */
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage onStartScan={() => currentUser ? setCurrentView('scanner') : setCurrentView('auth')} />
        {showCamera && <CameraModal onCapture={handleImageChange} onClose={() => setShowCamera(false)} />}
      </>
    );
  }

  /* ═══════════════ AUTH ═══════════════ */
  if (currentView === 'auth') return <AuthPage onLogin={handleLogin} />;

  /* ═══════════════ APP SHELL ═══════════════ */
  return (
    <div className="app-layout">
      {showCamera && <CameraModal onCapture={handleImageChange} onClose={() => setShowCamera(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar-modern ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">💊</div>
          {sidebarOpen && <span className="brand-name">Medi<span>Scan</span> Pro</span>}
        </div>

        <nav className="sidebar-nav">
          {[
            { view: 'landing', icon: '🏠', label: 'Home'    },
            { view: 'scanner', icon: '🔍', label: 'Scanner' },
            { view: 'history', icon: '📜', label: 'History' },
          ].map(({ view, icon, label }) => (
            <button key={view} className={`snav-item ${currentView === view ? 'active' : ''}`} onClick={() => setCurrentView(view)}>
              <span className="snav-icon">{icon}</span>
              {sidebarOpen && <span className="snav-label">{label}</span>}
              {sidebarOpen && view === 'history' && history.length > 0 && (
                <span className="snav-badge">{history.length}</span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && history.length > 0 && (
          <button className="sidebar-clear-btn" onClick={clearHistory}>🗑 Clear History</button>
        )}

        {/* DB indicator */}
        {sidebarOpen && (
          <div className="sidebar-db-badge">
            <span>🗄️</span> PostgreSQL
          </div>
        )}

        {/* Sidebar user */}
        {currentUser && sidebarOpen && (
          <div className="sidebar-user">
            <div className="su-avatar">{currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
            <div className="su-info">
              <p className="su-name">{currentUser.name}</p>
              <p className="su-email">{currentUser.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="main-modern">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span>{sidebarOpen ? '✕' : '☰'}</span>
          </button>
          <h1 className="topbar-title">
            {currentView === 'scanner' ? '🔍 Prescription Analysis' : '📜 Scan History'}
          </h1>
          <div className="topbar-right-group">
            <div className="topbar-pill"><span className="topbar-dot" /> PostgreSQL · Live</div>
            {currentUser && <UserMenu user={currentUser} onLogout={handleLogout} />}
          </div>
        </header>

        <div className="page-content">

          {/* ══ SCANNER ══ */}
          {currentView === 'scanner' && (
            <div className="scanner-view">
              <div className="upload-card">
                <div className="upload-card-head">
                  <div><h2 className="uc-title">Upload Prescription</h2>
                  <p className="uc-sub">Drag & drop, browse files, or capture with your camera</p></div>
                </div>
                <UploadZone selectedImage={selectedImage} onImageChange={handleImageChange} />
                <div className="upload-actions">
                  <button className="btn-camera" onClick={() => setShowCamera(true)}>📷 Take Photo</button>
                  <button className="btn-scan-main" onClick={handleScan} disabled={!selectedImage || loading}>
                    {loading ? <><span className="btn-spinner" /> Analyzing…</> : <>🔬 Analyze Prescription</>}
                  </button>
                </div>
              </div>

              {results.length > 0 && (
                <div className="results-section">
                  <div className="results-top-bar">
                    <div>
                      <h2 className="results-heading">Detected Medications</h2>
                      <p className="results-count">{results.length} medication{results.length !== 1 ? 's' : ''} identified · saved to database</p>
                    </div>
                    <button className="btn-download" onClick={handleDownloadReport}>⬇ Download Report</button>
                  </div>
                  <div className="results-split">
                    {selectedImage && (
                      <div className="doc-preview-card">
                        <p className="dp-label">📄 Document Preview</p>
                        <div className="dp-img-wrap">
                          <img src={URL.createObjectURL(selectedImage)} alt="prescription" className="dp-img" />
                        </div>
                        <div className="dp-meta">
                          <span>{selectedImage.name}</span>
                          <span>{(selectedImage.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    )}
                    <div className="rc-list">
                      {results.map((item, i) => <ResultCard key={i} item={item} index={i} />)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {currentView === 'history' && (
            <div className="history-view">
              <div className="history-head">
                <h2 className="results-heading">
                  {currentUser ? `${currentUser.name.split(' ')[0]}'s Scan History` : 'Scan History'}
                </h2>
                <p className="results-count">
                  {historyLoading
                    ? 'Loading from database…'
                    : `${history.length} scan${history.length !== 1 ? 's' : ''} saved in PostgreSQL`
                  }
                </p>
              </div>

              {historyLoading ? (
                <div className="history-loading">
                  <div className="history-spinner" />
                  <p>Fetching your history from the database…</p>
                </div>
              ) : history.length > 0 ? (
                <div className="history-grid">
                  {history.map((item) => (
                    <div key={item.id} className="hcard" onClick={() => loadHistoryItem(item)}>
                      <div className="hcard-icon">📋</div>
                      <div className="hcard-info">
                        <p className="hcard-name">{item.imageName}</p>
                        <p className="hcard-date">{formatDate(item.date)}</p>
                      </div>
                      <div className="hcard-count">
                        <strong>{item.itemCount}</strong>
                        <small>items</small>
                      </div>
                      <span className="hcard-arrow">→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="history-empty">
                  <div className="empty-icon">🗒️</div>
                  <p>No scans yet. Upload your first prescription!</p>
                  <button className="btn-scan-main" onClick={() => setCurrentView('scanner')}>Go to Scanner</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;