import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage'; // Ensure this path is correct
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ✅ Updated default view to 'landing'
  const [currentView, setCurrentView] = useState('landing');

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
        const filteredMedicines = data.data.filter(item => item.is_medicine === true);
        setResults(filteredMedicines);

        const newHistoryItem = {
          id: Date.now(),
          date: new Date().toISOString(),
          imageName: selectedImage.name,
          itemCount: filteredMedicines.length,
          results: filteredMedicines
        };

        const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
        setHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to connect to backend server.");
    }
    setLoading(false);
  };

  const handleDownloadReport = async () => {
    if (!results.length) return alert("No data to download!");
    try {
      const response = await fetch('http://127.0.0.1:5000/download_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (error) {
      alert("Error downloading report.");
    }
  };

  const loadHistoryItem = (item) => {
    setResults(item.results);
    setCurrentView('scanner');
  };

  const clearHistory = () => {
    if (window.confirm('Clear all history?')) {
      setHistory([]);
      localStorage.removeItem('scanHistory');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="app-layout">
      {/* Sidebar - Only visible if not on Landing Page */}
      {currentView !== 'landing' && (
        <div className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">➕</div>
              <span>MediScan Pro</span>
            </div>
          </div>

          <div className="nav-menu">
            {/* Added Home Link */}
            <div className="nav-item" onClick={() => setCurrentView('landing')}>
              🏠 Home
            </div>
            <div className={`nav-item ${currentView === 'scanner' ? 'active' : ''}`} onClick={() => setCurrentView('scanner')}>
              🔍 Scanner
            </div>
            <div className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
              📜 History {history.length > 0 && <span className="badge">{history.length}</span>}
            </div>
            {history.length > 0 && <button className="clear-history" onClick={clearHistory}>Clear History</button>}
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Header - Hidden on Landing Page */}
        {currentView !== 'landing' && (
          <div className="header">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1 className="header-title">
              {currentView === 'scanner' ? 'Prescription Analysis' : 'Scan History'}
            </h1>
          </div>
        )}

        <div className="content-area">
          {/* ✅ Conditional View Logic */}
          {currentView === 'landing' ? (
            <LandingPage onStartScan={() => setCurrentView('scanner')} />
          ) : currentView === 'history' ? (
            <div className="history-list">
              {history.length > 0 ? history.map(item => (
                <div key={item.id} className="history-card" onClick={() => loadHistoryItem(item)}>
                  <div className="history-info">
                    <h4>{item.imageName}</h4>
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <div className="history-meta">{item.itemCount} Items</div>
                </div>
              )) : <p>No history found.</p>}
            </div>
          ) : (
            <>
              {/* Scanner View */}
              <div className="upload-section">
                <div className="upload-container">
                  <label className="dropzone">
                    <input type="file" style={{ display: 'none' }} onChange={handleImageChange} accept="image/*" />
                    <div className="dropzone-text">
                      {selectedImage ? selectedImage.name : 'Click to Upload Prescription'}
                    </div>
                  </label>
                  <button className="scan-button" onClick={handleScan} disabled={!selectedImage || loading}>
                    {loading ? <div className="spinner"></div> : "Analyze Document"}
                  </button>
                </div>
              </div>

              {results.length > 0 && (
                <div className="results-grid">
                  <div className="image-panel">
                    <h3>Document Preview</h3>
                    <img src={selectedImage ? URL.createObjectURL(selectedImage) : ""} className="preview-image" alt="preview" />
                  </div>

                  <div className="results-panel">
                    <div className="panel-header">
                      <h3>Detected Medicines</h3>
                      <button className="download-button" onClick={handleDownloadReport}>Download Report</button>
                    </div>

                    {results.map((item, index) => {
                      const isUnknown = item.description === "Medical information not available in local database.";
                      return (
                        <div key={index} className="result-card medicine">
                          <div className="card-header">
                            <span className="line-number">Item {index + 1}</span>
                            {isUnknown ?
                              <span className="verified-badge" style={{ background: '#ff9800' }}>Unknown</span> :
                              <span className="verified-badge">Verified</span>
                            }
                          </div>
                          <div className="card-body">
                            <h4 className="final-med-title">{item.medicine_name}</h4>
                            <div className="db-details">
                              <p className="uses"><strong>Uses:</strong> {item.description}</p>
                              <p className="summary"><strong>Summary:</strong> {item.summary}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;