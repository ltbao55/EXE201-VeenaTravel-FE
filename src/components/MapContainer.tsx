import React from 'react';

interface MapContainerProps {
  mapId: string;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  mapId, 
  className = "map-view" 
}) => {
  return (
    <div className="map-container">
      <div id={mapId} className={className}>
        {/* Interactive map will be rendered here */}
      </div>
    </div>
  );
};

export default MapContainer;
