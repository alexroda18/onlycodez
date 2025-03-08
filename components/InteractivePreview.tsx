import { useState, useEffect, useRef } from 'react';
import { Template } from '@/lib/supabase';
import { generateHTML, generateCSS } from '@/lib/codeGenerator';

interface InteractivePreviewProps {
  template: Template;
  customizations: {
    text: { [key: string]: string };
    colors: { [key: string]: string };
    images: { [key: string]: string };
  };
  onUpdateText: (key: string, value: string) => void;
  onUpdateColor: (key: string, value: string) => void;
  onUpdateImage: (key: string, value: string) => void;
}

export default function InteractivePreview({
  template,
  customizations,
  onUpdateText,
  onUpdateColor,
  onUpdateImage
}: InteractivePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeElement, setActiveElement] = useState<{
    type: 'text' | 'color' | 'image';
    key: string;
    value: string;
  } | null>(null);
  
  // Generate the preview HTML and CSS
  const html = generateHTML(template, customizations);
  const css = generateCSS(template, customizations);
  
  useEffect(() => {
    // After rendering, add click handlers to all editable elements
    if (!previewRef.current) return;
    
    const container = previewRef.current;
    
    // Add data attributes to elements that match customization placeholders
    Object.entries(customizations.text).forEach(([key, value]) => {
      const placeholderRegex = new RegExp(`{{text.${key}}}`, 'g');
      // Find elements containing this text
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            return node.textContent?.includes(`{{text.${key}}}`) 
              ? NodeFilter.FILTER_ACCEPT 
              : NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      let textNode;
      while (textNode = walker.nextNode()) {
        const span = document.createElement('span');
        span.textContent = value;
        span.dataset.editType = 'text';
        span.dataset.editKey = key;
        span.className = 'interactive-text';
        
        // Replace the text node with our span
        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(span, textNode);
        }
      }
    });
    
    // Setup click handlers
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Handle text editing
      if (target.dataset.editType === 'text') {
        e.preventDefault();
        e.stopPropagation();
        
        setActiveElement({
          type: 'text',
          key: target.dataset.editKey || '',
          value: target.textContent || ''
        });
        
        // Create inline editor
        const input = document.createElement('input');
        input.type = 'text';
        input.value = target.textContent || '';
        input.style.width = `${Math.max(100, target.offsetWidth)}px`;
        input.className = 'inline-editor';
        
        input.onblur = () => {
          if (target.dataset.editKey) {
            onUpdateText(target.dataset.editKey, input.value);
          }
          target.textContent = input.value;
          input.remove();
          setActiveElement(null);
        };
        
        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            input.blur();
          }
        };
        
        // Replace the text with the input
        target.textContent = '';
        target.appendChild(input);
        input.focus();
        input.select();
      }
      
      // Handle color editing
      if (target.dataset.editType === 'color') {
        e.preventDefault();
        e.stopPropagation();
        
        const key = target.dataset.editKey || '';
        const currentValue = customizations.colors[key] || '#ffffff';
        
        setActiveElement({
          type: 'color',
          key,
          value: currentValue
        });
        
        // Create color picker
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = currentValue;
        colorPicker.className = 'color-picker';
        
        colorPicker.onchange = () => {
          onUpdateColor(key, colorPicker.value);
        };
        
        colorPicker.onblur = () => {
          colorPicker.remove();
          setActiveElement(null);
        };
        
        // Position the color picker near the element
        document.body.appendChild(colorPicker);
        colorPicker.style.position = 'absolute';
        colorPicker.style.left = `${e.pageX}px`;
        colorPicker.style.top = `${e.pageY}px`;
        
        colorPicker.click();
      }
      
      // Handle image editing
      if (target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the image key by searching for the URL in the customizations
        let imageKey = '';
        const imgElement = target as HTMLImageElement;
        Object.entries(customizations.images).forEach(([key, url]) => {
          if (imgElement.src.includes(url)) {
            imageKey = key;
          }
        });
        
        if (!imageKey) return;
        
        setActiveElement({
          type: 'image',
          key: imageKey,
          value: imgElement.src
        });
        
        // Create an overlay with image URL input
        const overlay = document.createElement('div');
        overlay.className = 'image-editor-overlay';
        overlay.style.position = 'absolute';
        overlay.style.left = `${target.getBoundingClientRect().left}px`;
        overlay.style.top = `${target.getBoundingClientRect().top + window.scrollY}px`;
        overlay.style.width = `${target.offsetWidth}px`;
        overlay.style.height = `${target.offsetHeight}px`;
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '20px';
        overlay.style.zIndex = '1000';
        
        const label = document.createElement('label');
        label.textContent = 'Image URL:';
        label.style.color = 'white';
        label.style.marginBottom = '10px';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = customizations.images[imageKey] || '';
        input.style.width = '90%';
        input.style.padding = '5px';
        input.style.marginBottom = '10px';
        
        const button = document.createElement('button');
        button.textContent = 'Update Image';
        button.style.padding = '5px 10px';
        button.style.background = '#3B82F6';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        
        button.onclick = () => {
          onUpdateImage(imageKey, input.value);
          overlay.remove();
          setActiveElement(null);
        };
        
        overlay.appendChild(label);
        overlay.appendChild(input);
        overlay.appendChild(button);
        
        document.body.appendChild(overlay);
        
        // Close overlay when clicking outside
        const closeOverlay = (e: MouseEvent) => {
          if (!overlay.contains(e.target as Node)) {
            overlay.remove();
            setActiveElement(null);
            document.removeEventListener('click', closeOverlay);
          }
        };
        
        // Delay adding the event listener to prevent immediate closure
        setTimeout(() => {
          document.addEventListener('click', closeOverlay);
        }, 100);
        
        input.focus();
      }
    });
    
    // Add highlighting to editable elements
    const style = document.createElement('style');
    style.textContent = `
      .interactive-text {
        cursor: text;
        border-bottom: 1px dashed transparent;
        transition: border-color 0.2s;
      }
      .interactive-text:hover {
        border-bottom-color: #3B82F6;
      }
      .inline-editor {
        border: 1px solid #3B82F6;
        padding: 2px 4px;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        background: white;
      }
      img {
        cursor: pointer;
        transition: filter 0.2s;
      }
      img:hover {
        filter: brightness(0.9);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [customizations, template, onUpdateText, onUpdateColor, onUpdateImage]);
  
  return (
    <div className="interactive-preview-wrapper">
      <div
        ref={previewRef}
        className="interactive-preview"
        dangerouslySetInnerHTML={{
          __html: `
            <style>${css}</style>
            ${html}
          `,
        }}
      />
      <style jsx>{`
        .interactive-preview-wrapper {
          position: relative;
          width: 100%;
          min-height: 500px;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: auto;
          background: white;
        }
        .interactive-preview {
          width: 100%;
          min-height: 100%;
        }
      `}</style>
    </div>
  );
} 