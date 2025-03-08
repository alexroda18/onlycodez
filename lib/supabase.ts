import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CustomizableElement = {
  id: string;
  label: string;
  type: 'text' | 'image' | 'container' | 'button';
  target: string; // Path to the customization data (e.g., "text.mainTitle")
  properties: string[]; // Array of properties that can be customized
};

export type Template = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  html_structure: string;
  css_structure: string;
  customizable_fields: {
    text: { [key: string]: string };
    colors: { [key: string]: string };
    images: { [key: string]: string };
  };
  customization_map?: CustomizableElement[]; // Optional for backward compatibility
};

export type UserTemplate = {
  id: string;
  user_id: string;
  template_id: string;
  purchased_at: string;
  template?: Template;
};

export async function getUserTemplates(userId: string): Promise<UserTemplate[]> {
  const { data, error } = await supabase
    .from('user_templates')
    .select('*, template:templates(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user templates:', error);
    return [];
  }

  return data || [];
} 