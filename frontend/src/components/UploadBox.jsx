import React, { useRef, useState } from 'react';

function UploadBox({ onFileSelect, selectedFile, error, loading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Health Report File</label>
      <div 
        className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        />
        <div className="upload-zone-icon">
          {loading ? '⏳' : '📁'}
        </div>
        <div className="upload-zone-title">
          {selectedFile ? 'File Selected' : 'Click or Drag & Drop'}
        </div>
        <div className="upload-zone-subtitle">
          PDF, JPG, PNG or GIF (max 10MB)
        </div>
        
        {selectedFile && (
          <div className="upload-zone-file-name">
            {selectedFile.name}
          </div>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default UploadBox;
