import React from 'react';
import { MapPin, Trash2, Save, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { Polygon } from '../types';
import { exportKML, importKML } from '../utils/kmlUtils';

interface ToolbarProps {
  setDrawingMode: React.Dispatch<React.SetStateAction<boolean>>;
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  editingPolygonId: string | null;
  setEditingPolygonId: React.Dispatch<React.SetStateAction<string | null>>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  setDrawingMode,
  polygons,
  setPolygons,
  editingPolygonId,
  setEditingPolygonId,
}) => {
  const handleNewPolygon = () => {
    setDrawingMode(true);
    setEditingPolygonId(null);
  };

  const handleDeletePolygon = () => {
    if (editingPolygonId) {
      setPolygons((prevPolygons) => prevPolygons.filter((p) => p.id !== editingPolygonId));
      setEditingPolygonId(null);
      toast.success('Polygon deleted successfully');
    } else {
      toast.warn('Please select a polygon to delete');
    }
  };

  const handleSaveKML = () => {
    if (polygons.length === 0) {
      toast.warn('No polygons to save');
      return;
    }
    const kmlString = exportKML(polygons);
    const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polygons.kml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('KML file saved successfully');
  };

  const handleImportKML = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const importedPolygons = importKML(content);
          setPolygons(importedPolygons);
          toast.success('KML file imported successfully');
        } catch (error) {
          toast.error('Error importing KML file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={handleNewPolygon}
        >
          <MapPin className="mr-2" size={20} />
          New Polygon
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={handleDeletePolygon}
        >
          <Trash2 className="mr-2" size={20} />
          Delete Polygon
        </button>
      </div>
      <div className="flex space-x-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
          onClick={handleSaveKML}
        >
          <Save className="mr-2" size={20} />
          Save KML
        </button>
        <label className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer">
          <Upload className="mr-2" size={20} />
          Import KML
          <input type="file" className="hidden" accept=".kml" onChange={handleImportKML} />
        </label>
      </div>
    </div>
  );
};

export default Toolbar;