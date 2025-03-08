import { Template } from './supabase';

type Customizations = {
  text: { [key: string]: string };
  colors: { [key: string]: string };
  images: { [key: string]: string };
};

export function generateHTML(template: Template, customizations: Customizations): string {
  let html = template.html_structure;

  // Replace text placeholders
  Object.entries(customizations.text).forEach(([key, value]) => {
    const placeholder = `{{text.${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  // Replace image placeholders in HTML as well
  Object.entries(customizations.images).forEach(([key, value]) => {
    const placeholder = `{{image.${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  return html;
}

export function generateCSS(template: Template, customizations: Customizations): string {
  let css = template.css_structure;

  // Replace color placeholders
  Object.entries(customizations.colors).forEach(([key, value]) => {
    const placeholder = `{{color.${key}}}`;
    css = css.replace(new RegExp(placeholder, 'g'), value);
  });

  // Replace image placeholders in CSS
  Object.entries(customizations.images).forEach(([key, value]) => {
    const placeholder = `{{image.${key}}}`;
    css = css.replace(new RegExp(placeholder, 'g'), value);
  });

  return css;
}

// Helper function to extract scripts from HTML
function extractScripts(html: string): { strippedHTML: string, scripts: string[] } {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts: string[] = [];
  let match;
  let strippedHTML = html;
  
  // Extract all scripts
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[0]);
    // Remove the script from the HTML
    strippedHTML = strippedHTML.replace(match[0], '');
  }
  
  return { strippedHTML, scripts };
}

export function generateFinalCode(template: Template, customizations: Customizations): string {
  const html = generateHTML(template, customizations);
  const css = generateCSS(template, customizations);
  
  // For debugging
  console.log("Generated HTML length:", html.length);
  console.log("Generated CSS length:", css.length);
  
  // Include the exact FAQ interaction script that works in Dubsado
  const faqScript = `<script>function initializeFAQInteractions(){document.querySelectorAll('.faq-question-container').forEach(container=>{container.addEventListener('click',()=>{const description=container.querySelector('.faq-description');const icon=container.querySelector('.toggle-icon');document.querySelectorAll('.faq-question-container.active').forEach(activeContainer=>{if(activeContainer!==container){activeContainer.classList.remove('active');activeContainer.querySelector('.faq-description').style.maxHeight="0";activeContainer.querySelector('.faq-description').style.opacity="0";activeContainer.querySelector('.faq-description').style.padding="0 10px";activeContainer.querySelector('.toggle-icon').textContent="+";}});if(container.classList.contains('active')){container.classList.remove('active');description.style.maxHeight="0";description.style.opacity="0";description.style.padding="0 10px";icon.textContent="+";}else{container.classList.add('active');description.style.maxHeight="1000px";description.style.opacity="1";description.style.padding="10px";icon.textContent="x";}});});}initializeFAQInteractions();</script>`;
  
  // Include the required padding check script
  const paddingCheckScript = `<script> document.querySelectorAll('.form-element__content').forEach((element) => {if (element.textContent.includes("onlycodezpadingcheckcustomcodeapplied")) { element.style.setProperty("padding", "0", "important");}});</script>`;
  
  // Combine everything in the exact same format as the original working code
  return `<style>${css}</style>${html}${faqScript}${paddingCheckScript}`;
} 