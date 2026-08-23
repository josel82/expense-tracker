import { useState } from 'react';
import Papa from 'papaparse';

function App() {
  const [file, setFile] = useState(null);
  const [sheetName, setSheetName] = useState(''); // New state for sheet name
  const [previewData, setPreviewData] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const n8n_webhook_url = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus({ type: 'idle', message: '' });

    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreviewData(results.data);
      },
      error: (err) => {
        setStatus({ type: 'error', message: 'Error parsing CSV for preview' });
      }
    });
  };

  const uploadFile = async () => {
    if (!file || !sheetName) {
      setStatus({ type: 'error', message: 'Please provide both a file and a sheet name.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Sending to n8n...' });

    const formData = new FormData();
    formData.append('data', file);
    formData.append('targetSheet', sheetName); // Send the sheet name as a text field

    try {
      const response = await fetch(n8n_webhook_url, { method: 'POST', body: formData });
      if (response.ok) {
        setStatus({ type: 'success', message: `Uploaded to "${sheetName}" successfully!` });
        setFile(null);
        setSheetName(''); // Reset field
        setPreviewData([]);
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Expense Tracker Uploader</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '2px dashed #4A90E2', padding: '20px', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>1. Select CSV File</label>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>2. Target Sheet Name</label>
          <input 
            type="text" 
            placeholder="e.g. April_2026" 
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Preview Table Section remains the same */}
      {previewData.length > 0 && (
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <h3>Preview (First 5 rows)</h3>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                {Object.keys(previewData[0]).map((key) => (
                  <th key={key} style={{ padding: '8px' }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} style={{ padding: '8px' }}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button 
        onClick={uploadFile} 
        disabled={!file || !sheetName || status.type === 'loading'}
        style={{ 
          marginTop: '20px', width: '100%', padding: '12px', 
          backgroundColor: (!file || !sheetName) ? '#ccc' : '#4A90E2', 
          color: 'white', border: 'none', 
          borderRadius: '4px', cursor: (file && sheetName) ? 'pointer' : 'not-allowed' 
        }}
      >
        {status.type === 'loading' ? 'Processing...' : 'Confirm & Upload to n8n'}
      </button>

      {status.message && (
        <div style={{ 
          marginTop: '20px', padding: '10px', borderRadius: '4px',
          backgroundColor: status.type === 'error' ? '#ffebee' : '#e8f5e9',
          color: status.type === 'error' ? '#c62828' : '#2e7d32'
        }}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default App;
