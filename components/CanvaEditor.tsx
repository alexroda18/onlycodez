import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Template, CustomizableElement } from '@/lib/supabase';
import { generateFinalCode } from '@/lib/codeGenerator';
import { debounce } from 'lodash';

interface CanvaEditorProps {
  template: Template;
  customizations: {
    text: { [key: string]: string };
    colors: { [key: string]: string };
    images: { [key: string]: string };
  };
  onUpdateText: (key: string, value: string) => void;
  onUpdateColor: (key: string, value: string) => void;
  onUpdateImage: (key: string, value: string) => void;
  selectedElementId?: string; // ID from customization_map
}

export default function CanvaEditor({
  template,
  customizations,
  onUpdateText,
  onUpdateColor,
  onUpdateImage,
  selectedElementId
}: CanvaEditorProps) {
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalCodeState, setFinalCodeState] = useState<string>(''); 
  const [shouldUpdateIframe, setShouldUpdateIframe] = useState(false);
  
  // Generate customization map if not provided
  const [customizationMap, setCustomizationMap] = useState<CustomizableElement[]>([]);

  // Memoize the final code to prevent unnecessary regeneration
  const finalCode = useMemo(() => {
    try {
      if (!template) return '';
      return generateFinalCode(template, customizations);
    } catch (err) {
      console.error("Error generating code:", err);
      return '';
    }
  }, [template, customizations]);

  // Debounced update function to avoid rapid re-renders
  const debouncedUpdate = useCallback(
    debounce(() => {
      setFinalCodeState(finalCode);
      setShouldUpdateIframe(true);
    }, 300),
    [finalCode]
  );

  // Effect to update the preview when customizations change
  useEffect(() => {
    // Return early if template is not loaded yet
    if (!template) return;

    // Trigger debounced update
    debouncedUpdate();
    
    // Cleanup
    return () => {
      debouncedUpdate.cancel();
    };
  }, [template, customizations, debouncedUpdate]);

  // Update the iframe when finalCodeState changes
  useEffect(() => {
    if (!shouldUpdateIframe) return;
    
    const updateIframe = () => {
      try {
        if (!previewIframeRef.current) {
          console.error("Preview iframe reference is null");
          setError("Preview frame not available");
          setIsLoading(false);
          return;
        }
        
        const iframe = previewIframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (!iframeDoc) {
          console.error("Cannot access iframe document");
          setError("Cannot access preview document");
          setIsLoading(false);
          return;
        }
        
        // Prepare the complete document with our content
        const fullContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              /* Smooth transition styles */
              * {
                transition: all 0.2s ease-in-out;
              }
              body {
                opacity: 1;
                transition: opacity 0.25s ease-in-out;
                margin: 0;
                padding: 0;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100vh;
              }
              body.loading {
                opacity: 0.7;
              }
              /* Container for content scaling */
              .content-wrapper {
                transform: scale(0.9);
                transform-origin: center center;
                max-width: 100%;
                max-height: 100%;
              }
              /* Hide scrollbars but allow scrolling */
              ::-webkit-scrollbar {
                display: none;
              }
              * {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            </style>
          </head>
          <body class="loading">
            <div class="content-wrapper">
              ${finalCodeState}
            </div>
            <script>
              // Remove loading class when content is fully loaded
              window.addEventListener('load', function() {
                document.body.classList.remove('loading');
                
                // Adjust scale dynamically if content is too large
                const content = document.querySelector('.content-wrapper');
                const contentWidth = content.scrollWidth;
                const contentHeight = content.scrollHeight;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // Calculate scale to fit content properly
                if (contentWidth > windowWidth || contentHeight > windowHeight) {
                  const scaleWidth = windowWidth / contentWidth * 0.9;
                  const scaleHeight = windowHeight / contentHeight * 0.9;
                  const scale = Math.min(scaleWidth, scaleHeight);
                  
                  content.style.transform = 'scale(' + scale + ')';
                }
              });
            </script>
          </body>
          </html>
        `;
        
        // Write to iframe document
        iframeDoc.open();
        iframeDoc.write(fullContent);
        iframeDoc.close();
        console.log("Content written to iframe");
        
        // Reset the update flag
        setShouldUpdateIframe(false);
      } catch (err) {
        console.error("Error writing to iframe:", err);
        setError("Failed to update preview");
        setIsLoading(false);
        setShouldUpdateIframe(false);
      }
    };
    
    // We need to wait a bit to ensure the iframe is ready
    // Small timeout to ensure DOM is ready
    setTimeout(updateIframe, 50);
  }, [finalCodeState, shouldUpdateIframe]);

  useEffect(() => {
    if (!template) return;
    
    // If template has a customization map, use it
    if (template.customization_map) {
      setCustomizationMap(template.customization_map);
    } else {
      // Otherwise, generate one from customizable_fields
      const generatedMap: CustomizableElement[] = [];
      
      // Process text fields
      Object.keys(template.customizable_fields.text).forEach((key) => {
        generatedMap.push({
          id: `text-${key}`,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          type: 'text',
          target: `text.${key}`,
          properties: ['text', 'color', 'fontSize']
        });
      });
      
      // Process color fields
      Object.keys(template.customizable_fields.colors).forEach((key) => {
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
      Object.keys(template.customizable_fields.images).forEach((key) => {
        generatedMap.push({
          id: `image-${key}`,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          type: 'image',
          target: `images.${key}`,
          properties: ['imageUrl']
        });
      });
      
      setCustomizationMap(generatedMap);
    }
  }, [template]);

  // Handle iframe load events to ensure content is properly displayed
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    
    const handleLoad = () => {
      console.log("Iframe loaded");
      setIsLoading(false);
      
      try {
        // Access the iframe document and window
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframeDoc.defaultView) {
          console.error("Cannot access iframe document or window");
          return;
        }
        
        const iframeWindow = iframeDoc.defaultView as any;
        
        // Manually implement FAQ interaction for preview
        const setupFAQInteractions = () => {
          console.log("Setting up FAQ interactions manually");
          const containers = iframeDoc.querySelectorAll('.faq-question-container');
          
          if (containers.length === 0) {
            console.log("No FAQ containers found");
            return;
          }
          
          console.log(`Found ${containers.length} FAQ containers`);
          
          containers.forEach(container => {
            // Remove existing listeners first to prevent duplicates
            const newContainer = container.cloneNode(true) as HTMLElement;
            container.parentNode?.replaceChild(newContainer, container);
            
            newContainer.addEventListener('click', () => {
              const description = newContainer.querySelector('.faq-description') as HTMLElement;
              const icon = newContainer.querySelector('.toggle-icon');
              
              // Close other open FAQs
              iframeDoc.querySelectorAll('.faq-question-container.active').forEach(activeContainer => {
                if (activeContainer !== newContainer) {
                  activeContainer.classList.remove('active');
                  const activeDesc = activeContainer.querySelector('.faq-description') as HTMLElement;
                  if (activeDesc) {
                    activeDesc.style.maxHeight = "0";
                    activeDesc.style.opacity = "0";
                    activeDesc.style.padding = "0 10px";
                  }
                  
                  const activeIcon = activeContainer.querySelector('.toggle-icon');
                  if (activeIcon) {
                    activeIcon.textContent = "+";
                  }
                }
              });
              
              // Toggle current FAQ
              if (newContainer.classList.contains('active')) {
                newContainer.classList.remove('active');
                if (description) {
                  description.style.maxHeight = "0";
                  description.style.opacity = "0";
                  description.style.padding = "0 10px";
                }
                if (icon) {
                  icon.textContent = "+";
                }
              } else {
                newContainer.classList.add('active');
                if (description) {
                  description.style.maxHeight = "1000px";
                  description.style.opacity = "1";
                  description.style.padding = "10px";
                }
                if (icon) {
                  icon.textContent = "x";
                }
              }
            });
          });
          
          console.log("FAQ interactions set up successfully");
        };
        
        // Try running the built-in script first
        if (typeof iframeWindow.initializeFAQInteractions === 'function') {
          console.log("Running built-in FAQ initialization");
          try {
            iframeWindow.initializeFAQInteractions();
          } catch (scriptErr) {
            console.error("Error running built-in script:", scriptErr);
            // If built-in script fails, fall back to our manual implementation
            setupFAQInteractions();
          }
        } else {
          // No built-in script found, use our implementation
          console.log("No built-in FAQ script found, using manual setup");
          setupFAQInteractions();
        }
      } catch (err) {
        console.error("Error in iframe load handler:", err);
        setError(`Error loading preview: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    iframe.addEventListener('load', handleLoad);
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [previewIframeRef, finalCodeState]); // Use the state variable for the dependency

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 transition-opacity duration-300">
          <div className="text-white">Loading...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-red-500 text-white p-4 rounded">{error}</div>
        </div>
      )}
      <iframe 
        ref={previewIframeRef}
        className="w-full h-full border-0 transition-opacity duration-300 overflow-hidden"
        title="Template Preview"
        scrolling="no"
      />
    </div>
  );
} 