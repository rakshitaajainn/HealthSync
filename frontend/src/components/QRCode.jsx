import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function QRCodeComponent({ value, size = 256, viewLink }) {
  const downloadQRCode = () => {
    const qr = document.getElementById('qr-code');
    if (!qr) return;
    const image = qr.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'qrcode.png';
    link.click();
  };

  const handleViewEmergency = () => {
    if (!viewLink) return;
    window.open(viewLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={styles.container}>
      <div style={styles.qrContainer}>
        <QRCodeCanvas
          id="qr-code"
          value={value}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      <div style={styles.actions}>
        <button onClick={downloadQRCode} style={styles.downloadBtn}>
          Download QR Code
        </button>
        {viewLink && (
          <button onClick={handleViewEmergency} style={styles.viewBtn}>
            View Emergency Profile
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  qrContainer: {
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  downloadBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  viewBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default QRCodeComponent;
