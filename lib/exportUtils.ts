import { Template } from './supabase';
import { generateFinalCode } from './codeGenerator';

type Customizations = {
  text: { [key: string]: string };
  colors: { [key: string]: string };
  images: { [key: string]: string };
};

/**
 * Copies the generated code to the clipboard
 */
export async function copyCodeToClipboard(
  template: Template,
  customizations: Customizations
): Promise<boolean> {
  try {
    const code = generateFinalCode(template, customizations);
    await navigator.clipboard.writeText(code);
    return true;
  } catch (error) {
    console.error('Failed to copy code to clipboard:', error);
    return false;
  }
}

/**
 * Downloads the generated code as a ZIP file
 * Note: This is a client-side only function that uses the JSZip library,
 * which would need to be installed with: npm install jszip file-saver
 */
export async function downloadCodeAsZip(
  template: Template,
  customizations: Customizations
): Promise<boolean> {
  try {
    // Dynamic import to avoid server-side issues
    const [JSZip, FileSaver] = await Promise.all([
      import('jszip').then(mod => mod.default || mod),
      import('file-saver').then(mod => mod.default || mod)
    ]);
    
    const zip = new JSZip();
    const code = generateFinalCode(template, customizations);
    
    // Split the CSS and HTML/JS for better organization
    const styleRegex = /<style>([\s\S]*?)<\/style>/i;
    const styleMatch = styleRegex.exec(code);
    
    const styles = styleMatch ? styleMatch[1] : '';
    const htmlAndJs = code.replace(styleRegex, '');
    
    // Add files to the zip - keeping the original structure
    zip.file('template.html', htmlAndJs); // HTML with embedded scripts
    zip.file('styles.css', styles);
    
    // For convenience, also add a standalone file with everything combined
    zip.file('combined.html', code);
    
    // Extract image URLs and add a README
    const imageUrls = Object.values(customizations.images);
    const readmeContent = `# ${template.name}

This template was customized using OnlyCodez.

## Images
The following image URLs are used in this template:
${imageUrls.map(url => `- ${url}`).join('\n')}

## Usage with Dubsado
1. Use the 'combined.html' file to copy the complete code
2. Make sure to keep the special script for padding control in Dubsado
3. Or use 'template.html' and 'styles.css' separately if your platform allows

`;
    
    zip.file('README.md', readmeContent);
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = template.name.toLowerCase().replace(/\s+/g, '-') + '.zip';
    
    // Save the zip file
    FileSaver.saveAs(content, filename);
    
    return true;
  } catch (error) {
    console.error('Failed to download code as ZIP:', error);
    return false;
  }
} 