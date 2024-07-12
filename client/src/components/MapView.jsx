import React, { useState } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geotiff';
import 'leaflet-imageoverlay-rotated';

const { BaseLayer, Overlay } = LayersControl;

const MapView = () => {
  const [is3D, setIs3D] = useState(false);
  const geotiffURL = './a.tif'; // Replace with your GeoTIFF URL
  const imageBounds = [
    [51.5, -0.1], // Top left corner coordinates
    [51.5, -0.05], // Top right corner coordinates
    [51.49, -0.1], // Bottom left corner coordinates
  ];
  const imageURL = 'path/to/your/image.jpg'; // Replace with your image URL

  const handle3DButtonClick = () => {
    setIs3D(!is3D);
  };

  return (
    <div className="relative h-[80vh] mx-auto w-[80vw]">
      <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
        <LayersControl position="topright">
          <BaseLayer checked name="Normal">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>
          {is3D && (
            <BaseLayer name="3D">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </BaseLayer>
          )}
          <Overlay name="GeoTIFF">
            <GeoTIFFOverlay url={geotiffURL} />
          </Overlay>
          <Overlay name="Image">
            <ImageOverlayRotated
              url={imageURL}
              bounds={imageBounds}
              opacity={0.5}
            />
          </Overlay>
        </LayersControl>
      </MapContainer>
      <button
        className="absolute z-[2000] w-fit bottom-4 right-4 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-md hover:bg-gray-100 focus:outline-none"
        onClick={handle3DButtonClick}
      >
        {is3D ? '2D' : '3D'}
      </button>
    </div>
  );
};

// GeoTIFFOverlay Component
const GeoTIFFOverlay = ({ url }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    if (ref.current) {
      const layer = L.leafletGeotiff(url);
      ref.current.addLayer(layer);
    }
  }, [url]);

  return null;
};

// ImageOverlayRotated Component
const ImageOverlayRotated = ({ url, bounds, opacity }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    if (ref.current) {
      const layer = L.imageOverlay.rotated(url, bounds[0], bounds[1], bounds[2], {
        opacity,
      });
      ref.current.addLayer(layer);
    }
  }, [url, bounds, opacity]);

  return null;
};

export default MapView;
