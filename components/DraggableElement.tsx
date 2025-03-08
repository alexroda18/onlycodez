import { useState, useRef, useEffect, ReactNode } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DraggableElementProps {
  children: ReactNode;
  initialPosition?: Position;
  initialSize?: Size;
  onPositionChange?: (position: Position) => void;
  onSizeChange?: (size: Size) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  constrainToParent?: boolean;
  parentRef?: React.RefObject<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
}

export default function DraggableElement({
  children,
  initialPosition = { x: 0, y: 0 },
  initialSize,
  onPositionChange,
  onSizeChange,
  onSelect,
  isSelected = false,
  isDraggable = true,
  isResizable = true,
  snapToGrid = true,
  gridSize = 10,
  constrainToParent = true,
  parentRef,
  className = '',
  style = {}
}: DraggableElementProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size | undefined>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<Position>({ x: 0, y: 0 });
  const startSizeRef = useRef<Size>({ width: 0, height: 0 });
  
  // Initialize size from element if not provided
  useEffect(() => {
    if (!size && elementRef.current) {
      setSize({
        width: elementRef.current.offsetWidth,
        height: elementRef.current.offsetHeight
      });
    }
  }, [size]);
  
  // Handle mousedown for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable || isResizing) return;
    
    // Don't start drag if we clicked on a resize handle
    if ((e.target as HTMLElement).className.includes('resize-handle')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Call select callback
    if (onSelect) {
      onSelect();
    }
    
    setIsDragging(true);
    
    // Save start position
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mousemove for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    let newX = e.clientX - startPosRef.current.x;
    let newY = e.clientY - startPosRef.current.y;
    
    // Snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    // Constrain to parent if enabled
    if (constrainToParent && parentRef?.current && elementRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const elemRect = elementRef.current.getBoundingClientRect();
      
      // Constrain X position
      if (newX < 0) {
        newX = 0;
      } else if (newX + elemRect.width > parentRect.width) {
        newX = parentRect.width - elemRect.width;
      }
      
      // Constrain Y position
      if (newY < 0) {
        newY = 0;
      } else if (newY + elemRect.height > parentRect.height) {
        newY = parentRect.height - elemRect.height;
      }
    }
    
    // Update position
    setPosition({ x: newX, y: newY });
    
    // Call position change callback
    if (onPositionChange) {
      onPositionChange({ x: newX, y: newY });
    }
  };
  
  // Handle mouseup for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mousedown for resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!isResizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    // Call select callback
    if (onSelect) {
      onSelect();
    }
    
    // Save start position and size
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    startSizeRef.current = {
      width: size?.width || 0,
      height: size?.height || 0
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mousemove for resizing
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !size) return;
    
    // Calculate delta
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    // Calculate new size based on resize direction
    let newWidth = startSizeRef.current.width;
    let newHeight = startSizeRef.current.height;
    let newX = position.x;
    let newY = position.y;
    
    switch (resizeDirection) {
      case 'e': // East (right)
        newWidth = startSizeRef.current.width + deltaX;
        break;
      case 'w': // West (left)
        newWidth = startSizeRef.current.width - deltaX;
        newX = position.x + deltaX;
        break;
      case 's': // South (bottom)
        newHeight = startSizeRef.current.height + deltaY;
        break;
      case 'n': // North (top)
        newHeight = startSizeRef.current.height - deltaY;
        newY = position.y + deltaY;
        break;
      case 'se': // Southeast (bottom-right)
        newWidth = startSizeRef.current.width + deltaX;
        newHeight = startSizeRef.current.height + deltaY;
        break;
      case 'sw': // Southwest (bottom-left)
        newWidth = startSizeRef.current.width - deltaX;
        newX = position.x + deltaX;
        newHeight = startSizeRef.current.height + deltaY;
        break;
      case 'ne': // Northeast (top-right)
        newWidth = startSizeRef.current.width + deltaX;
        newHeight = startSizeRef.current.height - deltaY;
        newY = position.y + deltaY;
        break;
      case 'nw': // Northwest (top-left)
        newWidth = startSizeRef.current.width - deltaX;
        newX = position.x + deltaX;
        newHeight = startSizeRef.current.height - deltaY;
        newY = position.y + deltaY;
        break;
    }
    
    // Enforce minimum size
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);
    
    // Snap to grid if enabled
    if (snapToGrid) {
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      newHeight = Math.round(newHeight / gridSize) * gridSize;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    // Update size and position
    setSize({ width: newWidth, height: newHeight });
    
    // If resizing from an edge that affects position, update position too
    if (['w', 'n', 'nw', 'sw', 'ne'].includes(resizeDirection || '')) {
      setPosition({ x: newX, y: newY });
      
      // Call position change callback
      if (onPositionChange) {
        onPositionChange({ x: newX, y: newY });
      }
    }
    
    // Call size change callback
    if (onSizeChange) {
      onSizeChange({ width: newWidth, height: newHeight });
    }
  };
  
  return (
    <div
      ref={elementRef}
      className={`draggable-element ${isSelected ? 'selected' : ''} ${className}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size ? `${size.width}px` : 'auto',
        height: size ? `${size.height}px` : 'auto',
        cursor: isDragging ? 'grabbing' : isDraggable ? 'grab' : 'default',
        userSelect: 'none',
        boxSizing: 'border-box',
        ...(isSelected ? {
          border: '1px solid #3B82F6',
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)'
        } : {}),
        ...style
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Resize handles (only shown when selected) */}
      {isSelected && isResizable && (
        <>
          {/* Corner handles */}
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: 'white',
              border: '1px solid #3B82F6',
              top: '-5px',
              left: '-5px',
              cursor: 'nwse-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: 'white',
              border: '1px solid #3B82F6',
              top: '-5px',
              right: '-5px',
              cursor: 'nesw-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: 'white',
              border: '1px solid #3B82F6',
              bottom: '-5px',
              left: '-5px',
              cursor: 'nesw-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: 'white',
              border: '1px solid #3B82F6',
              bottom: '-5px',
              right: '-5px',
              cursor: 'nwse-resize'
            }}
          />
          
          {/* Edge handles */}
          <div
            className="resize-handle resize-handle-n"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '6px',
              background: 'transparent',
              top: '-3px',
              left: '0',
              cursor: 'ns-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-e"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{
              position: 'absolute',
              width: '6px',
              height: '100%',
              background: 'transparent',
              top: '0',
              right: '-3px',
              cursor: 'ew-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-s"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '6px',
              background: 'transparent',
              bottom: '-3px',
              left: '0',
              cursor: 'ns-resize'
            }}
          />
          <div
            className="resize-handle resize-handle-w"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            style={{
              position: 'absolute',
              width: '6px',
              height: '100%',
              background: 'transparent',
              top: '0',
              left: '-3px',
              cursor: 'ew-resize'
            }}
          />
        </>
      )}
    </div>
  );
} 