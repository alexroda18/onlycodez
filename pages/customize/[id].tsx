import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTemplateStore } from '@/lib/store';
import { copyCodeToClipboard, downloadCodeAsZip } from '@/lib/exportUtils';
import CanvaEditor from '@/components/CanvaEditor';
import ElementList from '@/components/ElementList';
import ElementControls from '@/components/ElementControls';
import CodeMirror from '@uiw/react-codemirror';
import { generateFinalCode } from '@/lib/codeGenerator';
import { CustomizableElement } from '@/lib/supabase';

export default function CustomizeTemplate() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [customizationMap, setCustomizationMap] = useState<CustomizableElement[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    customizations,
    updateTextCustomization,
    updateColorCustomization,
    updateImageCustomization,
    resetCustomizations
  } = useTemplateStore();

  // Fetch the template and generate customization map
  useEffect(() => {
    async function fetchTemplate() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Template not found');
          return;
        }

        setSelectedTemplate(data);
        
        // Generate customization map if it doesn't exist
        if (!data.customization_map) {
          const generatedMap: CustomizableElement[] = [];
          
          // Process text fields
          Object.keys(data.customizable_fields.text).forEach((key) => {
            generatedMap.push({
              id: `text-${key}`,
              label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
              type: 'text',
              target: `text.${key}`,
              properties: ['text', 'color', 'fontSize']
            });
          });
          
          // Process color fields
          Object.keys(data.customizable_fields.colors).forEach((key) => {
            // Check if this color is already covered by a text field
            const existingElement = generatedMap.find(el => 
              el.properties.includes('color') && key.includes(el.id.split('-')[1]));
            
            if (!existingElement) {
              generatedMap.push({
                id: `color-${key}`,
                label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                type: 'container',
                target: `colors.${key}`,
                properties: ['backgroundColor']
              });
            }
          });
          
          // Process image fields
          Object.keys(data.customizable_fields.images).forEach((key) => {
            generatedMap.push({
              id: `image-${key}`,
              label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
              type: 'image',
              target: `images.${key}`,
              properties: ['imageUrl']
            });
          });
          
          setCustomizationMap(generatedMap);
        } else {
          setCustomizationMap(data.customization_map);
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplate();

    // Cleanup function
    return () => {
      setSelectedTemplate(null);
      setSelectedElementId(null);
    };
  }, [id, setSelectedTemplate]);

  const handleCopyCode = async () => {
    if (!selectedTemplate) return;
    
    const success = await copyCodeToClipboard(selectedTemplate, customizations);
    
    if (success) {
      showNotification('success', 'Code copied to clipboard!');
    } else {
      showNotification('error', 'Failed to copy code. Please try again.');
    }
  };

  const handleDownloadCode = async () => {
    if (!selectedTemplate) return;
    
    const success = await downloadCodeAsZip(selectedTemplate, customizations);
    
    if (success) {
      showNotification('success', 'Template downloaded as ZIP file!');
    } else {
      showNotification('error', 'Failed to download template. Please try again.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading template...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="mb-6">{error || 'Template not found'}</p>
          <Link href="/templates" className="btn-primary">
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  const generatedCode = generateFinalCode(selectedTemplate, customizations);

  return (
    <div className="flex min-h-screen">
      {/* Dark Sidebar */}
      <div className="w-[220px] bg-[#222222] text-white flex flex-col">
        <div className="px-4 py-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">OnlyCodez</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {templates.map((template, index) => {
            // Safely convert id to string for comparison
            const currentId = typeof id === 'string' ? id : '';
            const templateId = template.template_id || '';
            
            return (
              <Link 
                href={`/customize/${templateId}`} 
                key={templateId || index}
                className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                  templateId === currentId ? 'bg-gray-700' : ''
                }`}
              >
                <span className={`inline-block w-6 h-6 mr-3 flex items-center justify-center rounded text-white
                  ${['bg-gray-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-lime-500', 'bg-cyan-500', 'bg-purple-500', 'bg-indigo-500'][index % 9]}`}
                >
                  {['🏠', '📊', '📝', '📘', '📊', '🔍', '🔊', '📐', '▶️'][index % 9]}
                </span>
                <span>Template {index}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#111111] text-white">
        {/* Full-height container with minimal padding */}
        <div className="flex flex-col p-3 gap-3">
          {/* Top: Preview Area - Fixed height */}
          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden flex flex-col h-[500px]">
            <div className="p-2 border-b border-gray-700 bg-[#333] flex justify-between items-center">
              <span className="font-medium">Preview area</span>
              <h1 className="text-xl font-semibold text-center flex-1">
                {selectedTemplate.name || `Template ${typeof id === 'string' ? id : 'Loading...'}`}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Copy Code
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {!showCode ? (
                <CanvaEditor
                  template={selectedTemplate}
                  customizations={customizations}
                  onUpdateText={updateTextCustomization}
                  onUpdateColor={updateColorCustomization}
                  onUpdateImage={updateImageCustomization}
                  selectedElementId={selectedElementId || undefined}
                />
              ) : (
                <div className="h-full text-sm">
                  <CodeMirror
                    value={generatedCode}
                    height="100%"
                    theme="dark"
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom: Design Area - Full size with scrolling */}
          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden flex flex-col mt-4">
            <div className="p-2 border-b border-gray-700 bg-[#333]">
              <span className="font-medium">Design area</span>
            </div>
            <div className="flex">
              {/* Left side - Vertical menu with buttons */}
              <div className="w-1/3 p-4 border-r border-gray-700 overflow-y-auto">
                <ElementList 
                  customizationMap={customizationMap}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                />
              </div>
              
              {/* Right side - Customization elements */}
              <div className="w-2/3 p-4 overflow-y-auto">
                <ElementControls 
                  customizationMap={customizationMap}
                  selectedElementId={selectedElementId}
                  customizations={customizations}
                  onUpdateText={updateTextCustomization}
                  onUpdateColor={updateColorCustomization}
                  onUpdateImage={updateImageCustomization}
                />
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={resetCustomizations}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`fixed bottom-4 right-4 p-3 rounded-md shadow-lg ${
              notification.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
            } flex justify-between items-center max-w-md`}
          >
            <p>{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 