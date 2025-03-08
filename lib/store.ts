import { create } from 'zustand';
import { Template, UserTemplate } from './supabase';

interface TemplateState {
  templates: UserTemplate[];
  selectedTemplate: Template | null;
  customizations: {
    text: { [key: string]: string };
    colors: { [key: string]: string };
    images: { [key: string]: string };
  };
  setTemplates: (templates: UserTemplate[]) => void;
  setSelectedTemplate: (template: Template | null) => void;
  updateTextCustomization: (key: string, value: string) => void;
  updateColorCustomization: (key: string, value: string) => void;
  updateImageCustomization: (key: string, value: string) => void;
  resetCustomizations: () => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  selectedTemplate: null,
  customizations: {
    text: {},
    colors: {},
    images: {},
  },
  setTemplates: (templates) => set({ templates }),
  setSelectedTemplate: (template) => {
    if (template) {
      set({
        selectedTemplate: template,
        customizations: {
          text: { ...template.customizable_fields.text },
          colors: { ...template.customizable_fields.colors },
          images: { ...template.customizable_fields.images },
        },
      });
    } else {
      set({
        selectedTemplate: null,
        customizations: {
          text: {},
          colors: {},
          images: {},
        },
      });
    }
  },
  updateTextCustomization: (key, value) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        text: {
          ...state.customizations.text,
          [key]: value,
        },
      },
    })),
  updateColorCustomization: (key, value) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        colors: {
          ...state.customizations.colors,
          [key]: value,
        },
      },
    })),
  updateImageCustomization: (key, value) =>
    set((state) => ({
      customizations: {
        ...state.customizations,
        images: {
          ...state.customizations.images,
          [key]: value,
        },
      },
    })),
  resetCustomizations: () =>
    set((state) => {
      if (state.selectedTemplate) {
        return {
          customizations: {
            text: { ...state.selectedTemplate.customizable_fields.text },
            colors: { ...state.selectedTemplate.customizable_fields.colors },
            images: { ...state.selectedTemplate.customizable_fields.images },
          },
        };
      }
      return {
        customizations: {
          text: {},
          colors: {},
          images: {},
        },
      };
    }),
})); 