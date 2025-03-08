import { useState, useEffect } from 'react';
import { CustomizableElement } from '@/lib/supabase';

interface ElementControlsProps {
  customizationMap: CustomizableElement[];
  selectedElementId: string | null | undefined;
  customizations: {
    text: { [key: string]: string };
    colors: { [key: string]: string };
    images: { [key: string]: string };
  };
  onUpdateText: (key: string, value: string) => void;
  onUpdateColor: (key: string, value: string) => void;
  onUpdateImage: (key: string, value: string) => void;
}

export default function ElementControls({
  customizationMap,
  selectedElementId,
  customizations,
  onUpdateText,
  onUpdateColor,
  onUpdateImage
}: ElementControlsProps) {
  const [selectedElement, setSelectedElement] = useState<CustomizableElement | null>(null);

  // Update the selected element when selectedElementId changes
  useEffect(() => {
    if (!selectedElementId) {
      setSelectedElement(null);
      return;
    }

    const element = customizationMap.find(el => el.id === selectedElementId);
    if (element) {
      setSelectedElement(element);
    }
  }, [selectedElementId, customizationMap]);

  // Get the current value for an element's property
  const getPropertyValue = (element: CustomizableElement, property: string): string => {
    const [type, key] = element.target.split('.');
    
    switch (type) {
      case 'text':
        if (property === 'text') return customizations.text[key] || '';
        break;
      case 'colors':
        if (property === 'color' || property === 'backgroundColor') 
          return customizations.colors[key] || '';
        break;
      case 'images':
        if (property === 'imageUrl') return customizations.images[key] || '';
        break;
    }
    
    return '';
  };
  
  // Handle updating a property
  const handlePropertyUpdate = (property: string, value: string) => {
    if (!selectedElement) return;
    
    const [type, key] = selectedElement.target.split('.');
    
    switch (type) {
      case 'text':
        if (property === 'text') onUpdateText(key, value);
        else if (property === 'color') onUpdateColor(`${key}Color`, value);
        break;
      case 'colors':
        onUpdateColor(key, value);
        break;
      case 'images':
        if (property === 'imageUrl') onUpdateImage(key, value);
        break;
    }
  };

  if (!selectedElement) {
    return (
      <div className="text-center text-gray-400 py-6">
        <p className="text-sm">Select an element to customize it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium">
        {selectedElement.label}
      </h3>
      
      <div className="space-y-3">
        {/* Text property */}
        {selectedElement.properties.includes('text') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Text Content</label>
            <textarea 
              className="w-full p-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm"
              value={getPropertyValue(selectedElement, 'text')}
              onChange={(e) => handlePropertyUpdate('text', e.target.value)}
              rows={2}
            />
          </div>
        )}
        
        {/* Color property */}
        {selectedElement.properties.includes('color') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Text Color</label>
            <div className="flex gap-1.5 flex-wrap">
              {['#ffffff', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#818cf8', '#c084fc'].map(color => (
                <button 
                  key={color}
                  className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: getPropertyValue(selectedElement, 'color') === color ? '0 0 0 2px white' : 'none'
                  }}
                  onClick={() => handlePropertyUpdate('color', color)}
                />
              ))}
              <input 
                type="color" 
                className="w-6 h-6 p-0.5 rounded bg-gray-800 border border-gray-700"
                value={getPropertyValue(selectedElement, 'color')}
                onChange={(e) => handlePropertyUpdate('color', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Background Color property */}
        {selectedElement.properties.includes('backgroundColor') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Background Color</label>
            <div className="flex gap-1.5 flex-wrap">
              {['#333333', '#1f2937', '#111827', '#0f172a', '#312e81', '#4c1d95', '#831843'].map(color => (
                <button 
                  key={color}
                  className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: getPropertyValue(selectedElement, 'backgroundColor') === color ? '0 0 0 2px white' : 'none'
                  }}
                  onClick={() => handlePropertyUpdate('backgroundColor', color)}
                />
              ))}
              <input 
                type="color" 
                className="w-6 h-6 p-0.5 rounded bg-gray-800 border border-gray-700"
                value={getPropertyValue(selectedElement, 'backgroundColor')}
                onChange={(e) => handlePropertyUpdate('backgroundColor', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Font Size property */}
        {selectedElement.properties.includes('fontSize') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Font Size</label>
            <select 
              className="w-full p-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm"
              value={getPropertyValue(selectedElement, 'fontSize')}
              onChange={(e) => handlePropertyUpdate('fontSize', e.target.value)}
            >
              {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                <option key={size} value={`${size}px`}>{size}px</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Image URL property */}
        {selectedElement.properties.includes('imageUrl') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Image URL</label>
            <div className="flex gap-1.5">
              <input 
                type="text"
                className="flex-1 p-1.5 rounded bg-gray-800 border border-gray-700 text-white text-sm"
                value={getPropertyValue(selectedElement, 'imageUrl')}
                onChange={(e) => handlePropertyUpdate('imageUrl', e.target.value)}
              />
            </div>
            <div className="mt-1.5">
              <div className="w-full h-20 bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={getPropertyValue(selectedElement, 'imageUrl')} 
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Opacity property for background overlay */}
        {selectedElement.properties.includes('overlayOpacity') && (
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Overlay Opacity</label>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="w-full bg-gray-800"
              value={getPropertyValue(selectedElement, 'overlayOpacity')}
              onChange={(e) => handlePropertyUpdate('overlayOpacity', e.target.value)}
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 