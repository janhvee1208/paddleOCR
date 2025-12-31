import React, { useState } from 'react';
import './App.css'; // You can keep this for custom tweaks if needed

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend server.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">
            💊 Prescription OCR
          </h1>
          <p className="lead text-muted">
            Upload a handwritten prescription to extract text automatically.
          </p>
        </div>

        {/* Upload Card */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body p-4 text-center">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <input 
                type="file" 
                className="form-control w-auto" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <button 
                className={`btn btn-lg ${loading ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleScan} 
                disabled={!selectedImage || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Scanning...
                  </>
                ) : (
                  "Scan Prescription"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {selectedImage && (
          <div className="row g-4">
            
            {/* Left Column: Image Preview  */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white fw-bold">
                  📄 Original Document
                </div>
                <div className="card-body d-flex align-items-center justify-content-center bg-dark bg-opacity-10">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "400px", objectFit: "contain" }} 
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Results  */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                  <span>📝 Extracted Text</span>
                  {results.length > 0 && (
                    <span className="badge bg-success rounded-pill">{results.length} items found</span>
                  )}
                </div>
                <div className="card-body p-0">
                  {results.length === 0 && !loading ? (
                    <div className="text-center text-muted py-5">
                      <p className="mb-0">No text detected yet. Click "Scan" to begin.</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {results.map((item, index) => (
                        <div key={index} className="list-group-item list-group-item-action p-3">
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1 text-primary fw-bold">{item.text}</h5>
                            <small className={item.confidence > 0.8 ? "text-success fw-bold" : "text-warning fw-bold"}>
                              {(item.confidence * 100).toFixed(1)}%
                            </small>
                          </div>
                          <p className="mb-0 small text-muted">Confidence Score</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default App;