import { CustomizableElement } from '@/lib/supabase';

interface ElementListProps {
  customizationMap: CustomizableElement[];
  selectedElementId: string | null | undefined;
  onSelectElement: (id: string) => void;
}

export default function ElementList({
  customizationMap,
  selectedElementId,
  onSelectElement
}: ElementListProps) {
  // Group elements by type
  const groupedElements = customizationMap.reduce<Record<string, CustomizableElement[]>>(
    (acc, element) => {
      const type = element.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(element);
      return acc;
    }, 
    {}
  );

  // Sort order for element types
  const typeOrder = ['text', 'container', 'image', 'button'];

  return (
    <div className="space-y-3">
      {/* Map through each element type in order */}
      {typeOrder.map(type => {
        const elements = groupedElements[type];
        if (!elements || elements.length === 0) return null;
        
        return (
          <div key={type} className="space-y-1">
            <h3 className="text-xs font-medium uppercase text-gray-400 mb-1">
              {type === 'text' ? 'Text Elements' : 
               type === 'container' ? 'Container Elements' :
               type === 'image' ? 'Image Elements' : 'Button Elements'}
            </h3>
            <div className="space-y-1">
              {elements.map(element => (
                <button
                  key={element.id}
                  className={`w-full py-1.5 px-2 rounded text-left text-sm ${
                    selectedElementId === element.id
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                  onClick={() => onSelectElement(element.id)}
                >
                  {element.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 