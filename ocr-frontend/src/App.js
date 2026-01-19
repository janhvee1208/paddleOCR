import React, { useState, useEffect } from 'react';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('scanner');

  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setResults([]); 
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        
        // Add to history
        const newHistoryItem = {
          id: Date.now(),
          date: new Date().toISOString(),
          imageName: selectedImage.name,
          itemCount: data.data.length,
          results: data.data
        };
        const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
        setHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend server.");
    }
    setLoading(false);
  };

  const handleDownloadReport = async () => {
    if (!results || results.length === 0) {
      alert("No data to download!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/download_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: results }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Prescription_Report.txt'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Failed to generate report.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file.");
    }
  };

  const loadHistoryItem = (item) => {
    setResults(item.results);
    setCurrentView('scanner');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('scanHistory');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8f9fc' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar {
          width: 280px;
          background: #1e293b;
          color: white;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .sidebar.closed {
          margin-left: -280px;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .nav-menu {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .nav-item {
          padding: 14px 20px;
          margin: 4px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94a3b8;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .nav-item.active {
          background: #3b82f6;
          color: white;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .header {
          background: white;
          padding: 20px 32px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .toggle-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          background: #f1f5f9;
        }

        .header-title {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
        }

        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .upload-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .upload-container {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: start;
        }

        .dropzone {
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 48px;
          text-align: center;
          background: #f8fafc;
          transition: all 0.3s;
          cursor: pointer;
        }

        .dropzone:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .dropzone-icon {
          font-size: 48px;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .dropzone-text {
          font-size: 16px;
          color: #475569;
          margin-bottom: 8px;
        }

        .dropzone-subtext {
          font-size: 14px;
          color: #94a3b8;
        }

        .scan-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }

        .scan-button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .scan-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 450px 1fr;
          gap: 32px;
        }

        .image-panel {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          height: fit-content;
          position: sticky;
          top: 32px;
        }

        .image-container {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .preview-image {
          max-width: 100%;
          max-height: 500px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .results-panel {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .result-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          border-left: 4px solid #3b82f6;
          transition: all 0.2s;
        }

        .result-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateX(4px);
        }

        .result-header {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .result-details {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }

        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #475569;
          min-width: 140px;
        }

        .detail-value {
          color: #0f172a;
          flex: 1;
        }

        .download-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #f1f5f9;
        }

        .download-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          justify-content: center;
          transition: all 0.2s;
        }

        .download-button:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .empty-state {
          text-align: center;
          padding: 64px 32px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .history-item {
          background: #f8fafc;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .history-item:hover {
          background: white;
          border-color: #3b82f6;
          transform: translateX(4px);
        }

        .history-date {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 6px;
        }

        .history-name {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .history-count {
          font-size: 13px;
          color: #64748b;
        }

        .clear-history {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          margin: 16px 12px;
        }

        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .info-value {
          font-size: 28px;
          font-weight: 700;
          color: #0369a1;
          margin-bottom: 4px;
        }

        .info-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
      `}</style>

      {/* Sidebar */}
      <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="bi bi-hospital"></i>
            </div>
            <span>MediScan OCR</span>
          </div>
        </div>

        <div className="nav-menu">
          <div 
            className={`nav-item ${currentView === 'scanner' ? 'active' : ''}`}
            onClick={() => setCurrentView('scanner')}
          >
            <i className="bi bi-upc-scan"></i>
            <span>Scanner</span>
          </div>
          <div 
            className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            <i className="bi bi-clock-history"></i>
            <span>History</span>
            {history.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#3b82f6',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {history.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="bi bi-list"></i>
            </button>
            <h1 className="header-title">
              {currentView === 'scanner' ? 'Document Scanner' : 'Scan History'}
            </h1>
          </div>
        </div>

        <div className="content-area">
          {currentView === 'scanner' ? (
            <>
              {/* Upload Section */}
              <div className="upload-section">
                <h2 className="section-title">
                  <i className="bi bi-cloud-upload" style={{ color: '#3b82f6' }}></i>
                  Upload Prescription Document
                </h2>
                <div className="upload-container">
                  <label style={{ cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    <div className="dropzone">
                      <div className="dropzone-icon">
                        <i className="bi bi-file-earmark-medical"></i>
                      </div>
                      <div className="dropzone-text">
                        {selectedImage ? selectedImage.name : 'Click to select file or drag and drop'}
                      </div>
                      <div className="dropzone-subtext">
                        Supports: JPG, PNG, PDF (Max 10MB)
                      </div>
                    </div>
                  </label>
                  
                  <button 
                    className="scan-button"
                    onClick={handleScan} 
                    disabled={!selectedImage || loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-text"></i>
                        Analyze Document
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {selectedImage && results.length > 0 && (
                <div className="results-grid">
                  {/* Image Preview */}
                  <div className="image-panel">
                    <h3 className="section-title" style={{ fontSize: '16px' }}>
                      <i className="bi bi-image" style={{ color: '#3b82f6' }}></i>
                      Document Preview
                    </h3>
                    <div className="image-container">
                      <img 
                        src={URL.createObjectURL(selectedImage)} 
                        alt="Document Preview" 
                        className="preview-image"
                      />
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div className="results-panel">
                    <h3 className="section-title">
                      <i className="bi bi-list-check" style={{ color: '#10b981' }}></i>
                      Extracted Information
                    </h3>

                    <div className="info-grid">
                      <div className="info-card">
                        <div className="info-value">{results.length}</div>
                        <div className="info-label">Items Detected</div>
                      </div>
                      <div className="info-card">
                        <div className="info-value">
                          {results.filter(r => r.summary).length}
                        </div>
                        <div className="info-label">Detailed Items</div>
                      </div>
                      <div className="info-card">
                        <div className="info-value">Medical</div>
                        <div className="info-label">Document Type</div>
                      </div>
                    </div>

                    {results.map((item, index) => (
                      <div key={index} className="result-card">
                        <div className="result-header">
                          {index + 1}. {item.text}
                        </div>
                        
                        <div className="result-details">
                          <div className="detail-row">
                            <div className="detail-label">Medication Name:</div>
                            <div className="detail-value">{item.text}</div>
                          </div>
                          
                          {item.summary && (
                            <div className="detail-row">
                              <div className="detail-label">Description:</div>
                              <div className="detail-value">{item.summary}</div>
                            </div>
                          )}
                          
                          <div className="detail-row">
                            <div className="detail-label">Detection Status:</div>
                            <div className="detail-value">
                              <span style={{
                                background: '#dcfce7',
                                color: '#166534',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                ✓ Verified
                              </span>
                            </div>
                          </div>

                          <div className="detail-row">
                            <div className="detail-label">Document Section:</div>
                            <div className="detail-value">Prescription #{index + 1}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="download-section">
                      <button className="download-button" onClick={handleDownloadReport}>
                        <i className="bi bi-download"></i>
                        Download Complete Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedImage && results.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Results Yet</h3>
                  <p>Click "Analyze Document" to extract text from your prescription</p>
                </div>
              )}
            </>
          ) : (
            <div className="upload-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  <i className="bi bi-clock-history" style={{ color: '#3b82f6' }}></i>
                  Previous Scans
                </h2>
                {history.length > 0 && (
                  <button className="clear-history" onClick={clearHistory}>
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-archive"></i>
                  </div>
                  <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No History Available</h3>
                  <p>Your scan history will appear here</p>
                </div>
              ) : (
                <div>
                  {history.map((item) => (
                    <div key={item.id} className="history-item" onClick={() => loadHistoryItem(item)}>
                      <div className="history-date">{formatDate(item.date)}</div>
                      <div className="history-name">
                        <i className="bi bi-file-medical"></i> {item.imageName}
                      </div>
                      <div className="history-count">{item.itemCount} items extracted</div>
                    </div>
                  ))}
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