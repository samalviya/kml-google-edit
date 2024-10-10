import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapComponent from './components/MapComponent';
import Toolbar from './components/Toolbar';
import { Polygon } from './types';

function App() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [editingPolygonId, setEditingPolygonId] = useState<string | null>(null);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Toolbar
        setDrawingMode={setDrawingMode}
        polygons={polygons}
        setPolygons={setPolygons}
        editingPolygonId={editingPolygonId}
        setEditingPolygonId={setEditingPolygonId}
      />
      <MapComponent
        polygons={polygons}
        setPolygons={setPolygons}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        editingPolygonId={editingPolygonId}
        setEditingPolygonId={setEditingPolygonId}
      />
    </div>
  );
}

export default App;