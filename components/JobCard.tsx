import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, DollarSign, Building } from 'lucide-react';
import { Application } from '../types';

interface JobCardProps {
  app: Application;
}

const JobCard: React.FC<JobCardProps> = ({ app }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gh-card border border-gh-border rounded-md p-3 mb-3 shadow-sm hover:border-gh-muted cursor-grab active:cursor-grabbing group relative"
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-semibold text-gh-text text-sm leading-tight group-hover:text-gh-blue transition-colors">
          {app.title}
        </h4>
      </div>
      
      <div className="flex items-center gap-1.5 text-gh-muted text-xs mb-2">
        <Building size={12} />
        <span className="font-medium">{app.company}</span>
      </div>

      <div className="space-y-1">
        {app.location && (
          <div className="flex items-center gap-1.5 text-gh-muted text-xs">
            <MapPin size={12} />
            <span>{app.location}</span>
          </div>
        )}
        {app.rate && (
          <div className="flex items-center gap-1.5 text-gh-muted text-xs">
            <DollarSign size={12} />
            <span>{app.rate}</span>
          </div>
        )}
      </div>

      {app.notes && (
        <div className="mt-3 pt-2 border-t border-gh-border">
            <p className="text-xs text-gh-muted line-clamp-2">{app.notes}</p>
        </div>
      )}
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 rounded-full bg-gh-blue"></div>
      </div>
    </div>
  );
};

export default JobCard;
