'use client';

// Temporary debug component - remove after testing
export default function Debug() {
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'black', 
        color: 'white', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '5px'
      }}>
        <div>Publisher: {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'NOT FOUND'}</div>
        <div>Header Ad: {process.env.NEXT_PUBLIC_ADSENSE_HEADER_AD || 'NOT FOUND'}</div>
        <div>Auto Ads: {process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS || 'NOT FOUND'}</div>
      </div>
    );
  }
  return null;
}