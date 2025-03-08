import { useState, useEffect, useRef } from 'react';

interface ToolbarProps {
  elementType: 'text' | 'image' | 'container' | 'button';
  position: { x: number, y: number };
  onClose: () => void;
  onTextStyleChange?: (style: any) => void;
  onColorChange?: (color: string) => void;
  onImageChange?: (url: string) => void;
  onMoveLayer?: (direction: 'forward' | 'backward') => void;
  onDelete?: () => void;
  onAlignChange?: (align: 'left' | 'center' | 'right') => void;
  currentTextStyle?: any;
  currentColor?: string;
}

export default function FloatingToolbar({
  elementType,
  position,
  onClose,
  onTextStyleChange,
  onColorChange,
  onImageChange,
  onMoveLayer,
  onDelete,
  onAlignChange,
  currentTextStyle,
  currentColor
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'color' | 'layout'>('style');
  const [imageUrl, setImageUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Position the toolbar above the element
  const toolbarPosition = {
    left: `${position.x}px`,
    top: `${position.y - (toolbarRef.current?.offsetHeight || 50) - 10}px`
  };
  
  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle image URL submission
  const handleImageSubmit = () => {
    if (onImageChange) {
      onImageChange(imageUrl);
    }
  };
  
  // Font options for text elements
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Roboto, sans-serif', label: 'Roboto' }
  ];
  
  // Font size options
  const fontSizeOptions = [
    { value: '12px', label: '12' },
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' },
    { value: '28px', label: '28' },
    { value: '32px', label: '32' },
    { value: '36px', label: '36' },
    { value: '48px', label: '48' },
  ];
  
  return (
    <div 
      ref={toolbarRef}
      className="floating-toolbar"
      style={{
        position: 'absolute',
        ...toolbarPosition,
        backgroundColor: '#333333',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        padding: '8px',
        zIndex: 1000,
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        color: '#e0e0e0'
      }}
    >
      {/* Toolbar header with tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #555', marginBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('style')} 
          style={{ 
            padding: '6px 12px', 
            backgroundColor: activeTab === 'style' ? '#444444' : 'transparent',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'style' ? 'bold' : 'normal',
            color: activeTab === 'style' ? '#ffffff' : '#b0b0b0'
          }}
        >
          Style
        </button>
        <button 
          onClick={() => setActiveTab('color')} 
          style={{ 
            padding: '6px 12px', 
            backgroundColor: activeTab === 'color' ? '#444444' : 'transparent',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'color' ? 'bold' : 'normal',
            color: activeTab === 'color' ? '#ffffff' : '#b0b0b0'
          }}
        >
          Color
        </button>
        <button 
          onClick={() => setActiveTab('layout')} 
          style={{ 
            padding: '6px 12px', 
            backgroundColor: activeTab === 'layout' ? '#444444' : 'transparent',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'layout' ? 'bold' : 'normal',
            color: activeTab === 'layout' ? '#ffffff' : '#b0b0b0'
          }}
        >
          Layout
        </button>
        <button 
          onClick={onClose} 
          style={{ 
            marginLeft: 'auto',
            padding: '6px 12px', 
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#b0b0b0'
          }}
        >
          ×
        </button>
      </div>
      
      {/* Toolbar content based on active tab */}
      <div style={{ padding: '8px' }}>
        {/* Style tab */}
        {activeTab === 'style' && (
          <div className="style-options">
            {elementType === 'text' && onTextStyleChange && (
              <>
                {/* Font family selector */}
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Font</label>
                  <select 
                    onChange={(e) => onTextStyleChange({ ...currentTextStyle, fontFamily: e.target.value })}
                    value={currentTextStyle?.fontFamily || 'Arial, sans-serif'}
                    style={{ 
                      width: '100%', 
                      padding: '6px', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#444',
                      color: '#e0e0e0'
                    }}
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Font size selector */}
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Size</label>
                  <select 
                    onChange={(e) => onTextStyleChange({ ...currentTextStyle, fontSize: e.target.value })}
                    value={currentTextStyle?.fontSize || '16px'}
                    style={{ 
                      width: '100%', 
                      padding: '6px', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#444',
                      color: '#e0e0e0'
                    }}
                  >
                    {fontSizeOptions.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Text style buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button 
                    onClick={() => onTextStyleChange({ 
                      ...currentTextStyle, 
                      fontWeight: currentTextStyle?.fontWeight === 'bold' ? 'normal' : 'bold' 
                    })}
                    style={{ 
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: currentTextStyle?.fontWeight === 'bold' ? '#555' : '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    B
                  </button>
                  <button 
                    onClick={() => onTextStyleChange({ 
                      ...currentTextStyle, 
                      fontStyle: currentTextStyle?.fontStyle === 'italic' ? 'normal' : 'italic' 
                    })}
                    style={{ 
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: currentTextStyle?.fontStyle === 'italic' ? '#555' : '#333',
                      fontStyle: 'italic',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    I
                  </button>
                  <button 
                    onClick={() => onTextStyleChange({ 
                      ...currentTextStyle, 
                      textDecoration: currentTextStyle?.textDecoration === 'underline' ? 'none' : 'underline' 
                    })}
                    style={{ 
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: currentTextStyle?.textDecoration === 'underline' ? '#555' : '#333',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    U
                  </button>
                </div>
                
                {/* Text alignment buttons */}
                {onAlignChange && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button 
                      onClick={() => onAlignChange('left')}
                      style={{ 
                        flex: 1,
                        padding: '6px 12px',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        backgroundColor: currentTextStyle?.textAlign === 'left' ? '#555' : '#333',
                        cursor: 'pointer',
                        color: '#e0e0e0'
                      }}
                    >
                      Left
                    </button>
                    <button 
                      onClick={() => onAlignChange('center')}
                      style={{ 
                        flex: 1,
                        padding: '6px 12px',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        backgroundColor: currentTextStyle?.textAlign === 'center' ? '#555' : '#333',
                        cursor: 'pointer',
                        color: '#e0e0e0'
                      }}
                    >
                      Center
                    </button>
                    <button 
                      onClick={() => onAlignChange('right')}
                      style={{ 
                        flex: 1,
                        padding: '6px 12px',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        backgroundColor: currentTextStyle?.textAlign === 'right' ? '#555' : '#333',
                        cursor: 'pointer',
                        color: '#e0e0e0'
                      }}
                    >
                      Right
                    </button>
                  </div>
                )}
              </>
            )}
            
            {elementType === 'image' && onImageChange && (
              <div className="image-options">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Image URL</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    style={{ 
                      flex: 1,
                      padding: '6px', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#444',
                      color: '#e0e0e0'
                    }}
                  />
                  <button 
                    onClick={handleImageSubmit}
                    style={{ 
                      padding: '6px 12px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Color tab */}
        {activeTab === 'color' && onColorChange && (
          <div className="color-options">
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>
              {elementType === 'text' ? 'Text Color' : 'Background Color'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {['#ffffff', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#818cf8', '#c084fc', '#fb7185', '#000000'].map(color => (
                <button 
                  key={color}
                  onClick={() => onColorChange(color)}
                  style={{ 
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    backgroundColor: color,
                    border: currentColor === color ? '2px solid white' : '1px solid #666',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Custom Color</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="color" 
                value={currentColor || '#ffffff'}
                onChange={(e) => onColorChange(e.target.value)}
                style={{ 
                  flex: 1,
                  height: '30px',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  backgroundColor: '#444'
                }}
              />
              <input 
                type="text" 
                value={currentColor || ''}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#RRGGBB"
                style={{ 
                  flex: 2,
                  padding: '6px', 
                  border: '1px solid #555',
                  borderRadius: '4px',
                  backgroundColor: '#444',
                  color: '#e0e0e0'
                }}
              />
            </div>
          </div>
        )}
        
        {/* Layout tab */}
        {activeTab === 'layout' && (
          <div className="layout-options">
            {/* Alignment options */}
            {onAlignChange && (
              <div className="alignment-options" style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Alignment</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => onAlignChange('left')}
                    style={{ 
                      flex: 1,
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    Left
                  </button>
                  <button 
                    onClick={() => onAlignChange('center')}
                    style={{ 
                      flex: 1,
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    Center
                  </button>
                  <button 
                    onClick={() => onAlignChange('right')}
                    style={{ 
                      flex: 1,
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    Right
                  </button>
                </div>
              </div>
            )}
            
            {/* Layer movement buttons */}
            {onMoveLayer && (
              <div className="layer-options" style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#b0b0b0' }}>Layer</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => onMoveLayer('forward')}
                    style={{ 
                      flex: 1,
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    Bring Forward
                  </button>
                  <button 
                    onClick={() => onMoveLayer('backward')}
                    style={{ 
                      flex: 1,
                      padding: '6px 12px',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      cursor: 'pointer',
                      color: '#e0e0e0'
                    }}
                  >
                    Send Backward
                  </button>
                </div>
              </div>
            )}
            
            {/* Delete button */}
            {onDelete && (
              <button 
                onClick={onDelete}
                style={{ 
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Delete Element
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 