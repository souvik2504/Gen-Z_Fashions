// Alternative: client/src/components/SimpleImageZoom.js
import React, { useState, useRef } from 'react';

const SimpleImageZoom = ({ src, alt, className = '' }) => {
  const [isZooming, setIsZooming] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTransformOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="flex">
      {/* Main Image */}
      <div
        ref={containerRef}
        className={`relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg ${className}`}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        style={{ cursor: 'crosshair' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* {!isZooming && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            🔍 Hover to zoom
          </div>
        )} */}
      </div>

      {/* Zoom Window */}
      {isZooming && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-96 h-96 bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: '250%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: transformOrigin,
            }}
          />
          
          {/* <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            🔍 2.5x Zoom
          </div> */}
        </div>
      )}
    </div>
  );
};

export default SimpleImageZoom;
