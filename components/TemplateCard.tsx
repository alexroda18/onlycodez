import Link from 'next/link';
import { Template } from '@/lib/supabase';

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="bg-[#333333] rounded-lg hover:bg-[#3a3a3a] overflow-hidden transition-colors shadow-md">
      <div className="aspect-video bg-gray-800 overflow-hidden">
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2 text-white">{template.name}</h3>
        <p className="text-gray-300 mb-4 line-clamp-2">{template.description}</p>
        <Link 
          href={`/customize/${template.id}`}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors inline-block"
        >
          Customize Template
        </Link>
      </div>
    </div>
  );
} 