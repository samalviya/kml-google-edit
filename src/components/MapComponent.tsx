import React, { useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, DrawingManager } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { Polygon as PolygonType } from '../types';
import { checkPolygonOverlap, validatePolygon } from '../utils/polygonUtils';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 64px)',
};

const center = {
  lat: 0,
  lng: 0,
};

interface MapComponentProps {
  polygons: PolygonType[];
  setPolygons: React.Dispatch<React.SetStateAction<PolygonType[]>>;
  drawingMode: boolean;
  setDrawingMode: React.Dispatch<React.SetStateAction<boolean>>;
  editingPolygonId: string | null;
  setEditingPolygonId: React.Dispatch<React.SetStateAction<string | null>>;
}

const MapComponent: React.FC<MapComponentProps> = ({
  polygons,
  setPolygons,
  drawingMode,
  setDrawingMode,
  editingPolygonId,
  setEditingPolygonId,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon.getPath().getArray();
      const newPolygon: PolygonType = {
        id: uuidv4(),
        paths: path.map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })),
      };

      if (!validatePolygon(newPolygon)) {
        toast.error('Invalid polygon: self-intersecting lines detected.');
        polygon.setMap(null);
        return;
      }

      if (checkPolygonOverlap(newPolygon, polygons)) {
        toast.error('Polygon overlaps with an existing polygon.');
        polygon.setMap(null);
        return;
      }

      setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
      setDrawingMode(false);
      polygon.setMap(null);
    },
    [polygons, setPolygons, setDrawingMode]
  );

  const onPolygonEdit = useCallback(
    (id: string, path: google.maps.LatLng[]) => {
      const updatedPolygon: PolygonType = {
        id,
        paths: path.map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })),
      };

      if (!validatePolygon(updatedPolygon)) {
        toast.error('Invalid polygon: self-intersecting lines detected.');
        return;
      }

      const otherPolygons = polygons.filter((p) => p.id !== id);
      if (checkPolygonOverlap(updatedPolygon, otherPolygons)) {
        toast.error('Polygon overlaps with an existing polygon.');
        return;
      }

      setPolygons((prevPolygons) =>
        prevPolygons.map((p) => (p.id === id ? updatedPolygon : p))
      );
    },
    [polygons, setPolygons]
  );

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['drawing']}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={3}
        onLoad={onLoad}
      >
        {drawingMode && (
          <DrawingManager
            drawingMode={google.maps.drawing.OverlayType.POLYGON}
            onPolygonComplete={onPolygonComplete}
            options={{
              polygonOptions: {
                fillColor: '#FF0000',
                fillOpacity: 0.3,
                strokeWeight: 2,
                editable: true,
                zIndex: 1,
              },
            }}
          />
        )}
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            paths={polygon.paths}
            options={{
              fillColor: editingPolygonId === polygon.id ? '#00FF00' : '#FF0000',
              fillOpacity: 0.3,
              strokeWeight: 2,
              editable: editingPolygonId === polygon.id,
              zIndex: 1,
            }}
            onMouseUp={() => {
              if (editingPolygonId === polygon.id) {
                const path = mapRef.current
                  ?.getPath()
                  .getArray()
                  .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));
                if (path) {
                  onPolygonEdit(polygon.id, path);
                }
              }
            }}
            onClick={() => {
              if (editingPolygonId === null) {
                setEditingPolygonId(polygon.id);
              } else if (editingPolygonId === polygon.id) {
                setEditingPolygonId(null);
              }
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;